import { getDb } from './schema';
import { randomUUID } from 'expo-crypto';

/* Instructions:
Call the function for the relevant table in the format operateSync`TableName`(2) with operation
values from {'create', 'update', 'delete'}, followed by an object of attribute values. The 
exception is AuditEntry table which cannot have records edited or deleted, so it's function is
insertSyncAuditEntry(1). For 'create' operations, do not add a value for id attribute, as it 
will be automatically generated. 

For tables that have a many-to-many relationship, their attribute value must be entered as an array
of integer ids, and the attribute in the description will be followed by a [], e.g. pain_types[] 
NN in operateSyncPainType(2).

Use the functions inside a try {...} catch (error) {...} to reapply operation if it failed.

For each table the required (NN: not null) & optional object attributes for each operation 
are listed. */

/* User (soft delete):
- create: phone_number NN, display_name NN, email
- update: id NN, server_id, phone_number NN, display_name NN, email
- delete: id NN */
export async function operateSyncUser(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO User (id, phone_number, display_name, email, 
                created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.phone_number, values.display_name, values.email ?? null, 
                    now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE User SET server_id = ?, phone_number = ?, display_name = ?, 
                email = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.phone_number, values.display_name, 
                    values.email ?? null, now, values.id]
            );
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE User SET deleted_at = ?, updated_at = ?, is_synced = 0
                WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'User', values.id, operation, values, now);
    })
}

/* UserSettings:
- create: user NN
    - can only create UserSettings with default settings
- update: id NN, server_id, high_contrast NN, offline_backup NN, microphone_access NN, 
          notifications_enabled NN, text_size_percent NN
- delete: id NN */
export async function operateSyncUserSettings(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO UserSettings (id, user, created_at, updated_at, 
                is_synced) VALUES (?, ?, ?, ?, 0)`, 
                [values.id, values.user, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE UserSettings SET server_id = ?, high_contrast = ?, 
                offline_backup = ?, microphone_access = ?, notifications_enabled = ?, 
                text_size_percent = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.high_contrast, values.offline_backup,
                    values.microphone_access, values.notifications_enabled, 
                    values.text_size_percent, now, values.id]
            );
        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM UserSettings WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'UserSettings', values.id, operation, values, now);
    })
}

/* Patient Profile (soft delete):
- create: user NN, has_diagnosis NN, other_conditions, assigned_gender_at_birth NN,
          birth_year NN, pain_types[] NN
- update: id NN, server_id, has_diagnosis NN, other_conditions, assigned_gender_at_birth NN,
          birth_year NN, pain_types[] NN
- delete: id NN */
export async function operateSyncPatientProfile(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO PatientProfile (id, user, has_diagnosis, 
                other_conditions, assigned_gender_at_birth, birth_year, created_at, updated_at, 
                is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.user, values.has_diagnosis, values.other_conditions ?? null, 
                    values.assigned_gender_at_birth, values.birth_year, now, now]
            );
            for (const pain_type of values.pain_types) {
                await db.runAsync(`INSERT OR IGNORE INTO PatientProfile_PainType (
                    patient_profile, pain_type) VALUES (?, ?)`, 
                    [values.id, pain_type]);
            }

        } else if (operation == 'update') {
            await db.runAsync(`UPDATE PatientProfile SET server_id = ?, has_diagnosis = ?, 
                other_conditions = ?, assigned_gender_at_birth = ?, birth_year = ?, updated_at = ?,
                is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.has_diagnosis, values.other_conditions ?? null, 
                    values.assigned_gender_at_birth, values.birth_year, now, values.id]
            );
                for (const pain_type of values.pain_types) {
                await db.runAsync(`DELETE FROM PatientProfile_PainType WHERE patient_profile = ?`, 
                    [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO PatientProfile_PainType (
                    patient_profile, pain_type) VALUES (?, ?)`, 
                    [values.id, pain_type]);
            }

        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`DELETE FROM PatientProfile_PainType WHERE patient_profile = ?`, 
                [values.id]);
            await db.runAsync(`UPDATE PatientProfile SET deleted_at = ?, updated_at = ?, is_synced = 0
                WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'PatientProfile', values.id, operation, values, now);
    })
}

/* SupportLink:
- create: patient_profile NN, patient_user NN, supporter_user, invited_phone_number, status NN,
          invited_at NN
- update: id NN, server_id, status NN
- delete: id NN */
export async function operateSyncSupportLink(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO SupportLink (id, patient_profile, patient_user,
                supporter_user, invited_phone_number, status, invited_at, created_at, updated_at, 
                is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.patient_profile, values.patient_user, values.supporter_user
                    ?? null, values.invited_phone_number ?? null, values.status, values.invited_at,
                    now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE SupportLink SET server_id = ?, status = ?, 
                updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.status, now, values.id]
            );
        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM SupportLink WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'SupportLink', values.id, operation, values, now);
    })
}

/* Assessment:
- create: patient_profile NN, submitted_at, reflection, week_starting NN, status NN
- update: id NN, server_id, submitted_at, reflection, status NN
    - patient_profile & week_starting cannot be changed
- delete: id NN */
export async function operateSyncAssessment(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO Assessment (id, patient_profile, submitted_at,
                reflection, week_starting, status, created_at, updated_at, is_synced) VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.patient_profile, values.submitted_at ?? null, 
                    values.reflection ?? null, values.week_starting, values.status, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE Assessment SET server_id = ?, submitted_at = ?, 
                reflection = ?, status = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.submitted_at ?? null, 
                    values.reflection ?? null, values.status, now, values.id]
            );
        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM Assessment WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'Assessment', values.id, operation, values, now);
    })
}

/* Prescription (soft delete):
- create: patient_profile NN, name NN, dosage NN, strength NN, started_on, stopped_on, notes,
          strength_unit NN, form NN, frequency NN, frequency_unit NN
- update: id NN, server_id, name NN, dosage NN, strength NN, started_on, stopped_on, notes,
          strength_unit NN, form NN, frequency NN, frequency_unit NN
    - patient_profile cannot be changed
- delete: id NN */
export async function operateSyncPrescription(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO Prescription (id, patient_profile, name, dosage, 
                strength, started_on, stopped_on, notes, strength_unit, form, frequency,
                frequency_unit, created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.patient_profile, values.name, values.dosage, values.strength,
                    values.started_on ?? null, values.stopped_on ?? null, values.notes ?? null,  
                    values.strength_unit, values.form, values.frequency, values.frequency_unit,
                    now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE Prescription SET server_id = ?, name = ?, dosage = ?, 
                strength = ?, started_on = ?, stopped_on = ?, notes = ?, strength_unit = ?, 
                form = ?, frequency = ?, frequency_unit = ?, updated_at = ?, is_synced = 0 
                WHERE id = ?`,
                [values.server_id ?? null, values.name, values.dosage, values.strength,
                    values.started_on ?? null, values.stopped_on ?? null, values.notes ?? null,  
                    values.strength_unit, values.form, values.frequency, values.frequency_unit, 
                    now, values.id]
            );
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE Prescription SET deleted_at = ?, updated_at = ?, is_synced = 0
                WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'Prescription', values.id, operation, values, now);
    })
}

/* MyPain:
- create: assessment NN, current NN, worst NN, average NN, mildest NN, other_location, 
          other_characteristic, completed_at, locations[] NN, characteristics[] NN
- update: id NN, server_id, current NN, worst NN, average NN, mildest NN, other_location, 
          other_characteristic, completed_at, locations[] NN, characteristics[] NN
    - assessment cannot be changed
- delete: id NN */
export async function operateSyncMyPain(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO MyPain (id, assessment, current, worst, average, 
                mildest, other_location, other_characteristic, completed_at, created_at, 
                updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.assessment, values.current, values.worst, values.average, 
                    values.mildest, values.other_location ?? null, values.other_characteristic
                    ?? null, values.completed_at ?? null, now, now]
            );
            for (const location of values.locations) {
                await db.runAsync(`INSERT OR IGNORE INTO MyPain_Location (my_pain, location) VALUES
                     (?, ?)`, [values.id, location]);
            }
            for (const characteristic of values.characteristics) {
                await db.runAsync(`INSERT OR IGNORE INTO MyPain_Characteristic (my_pain, 
                    characteristic) VALUES (?, ?)`, [values.id, characteristic]);
            }

        } else if (operation == 'update') {
            await db.runAsync(`UPDATE MyPain SET server_id = ?, current = ?, worst = ?, 
                average = ?, mildest = ?, other_location = ?, other_characteristic = ?, 
                completed_at = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.current, values.worst, values.average, 
                    values.mildest, values.other_location ?? null, values.other_characteristic
                    ?? null, values.completed_at ?? null, now, values.id]
            );
            for (const location of values.locations) {
                await db.runAsync(`DELETE FROM MyPain_Location WHERE my_pain = ?`, [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO MyPain_Location (my_pain, location) VALUES
                     (?, ?)`, [values.id, location]);
            }
            for (const characteristic of values.characteristics) {
                await db.runAsync(`DELETE FROM MyPain_Characteristic WHERE my_pain = ?`, 
                    [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO MyPain_Characteristic (my_pain, 
                    characteristic) VALUES (?, ?)`, [values.id, characteristic]);
            }

        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM MyPain_Location WHERE my_pain = ?`, [values.id]);
            await db.runAsync(`DELETE FROM MyPain_Characteristic WHERE my_pain = ?`, [values.id]);
            await db.runAsync(`DELETE FROM MyPain WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'MyPain', values.id, operation, values, now);
    })
}

/* MyMovement:
- create: assessment NN, active_hours NN, walking NN, sitting NN, lifting NN, standing NN,
          reflection, score NN, completed_at, general_impacts[] NN
- update: id NN, server_id, active_hours NN, walking NN, sitting NN, lifting NN, standing NN,
          reflection, score NN, completed_at, general_impacts[] NN
    - assessment cannot be changed
- delete: id NN */
export async function operateSyncMyMovement(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO MyMovement (id, assessment, active_hours, walking, 
                sitting, lifting, standing, reflection, score, completed_at, created_at, 
                updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.assessment, values.active_hours, values.walking, values.sitting,
                    values.lifting, values.standing, values.reflection ?? null, values.score,
                    values.completed_at ?? null, now, now]
            );
            for (const general_impact of values.general_impacts) {
                await db.runAsync(`INSERT OR IGNORE INTO MyMovement_GeneralImpact (my_movement,
                    general_impact) VALUES (?, ?)`, [values.id, general_impact]);
            }

        } else if (operation == 'update') {
            await db.runAsync(`UPDATE MyMovement SET server_id = ?, active_hours = ?, walking = ?, 
                sitting = ?, lifting = ?, standing = ?, reflection = ?, score = ?, 
                completed_at = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.active_hours, values.walking, values.sitting,
                    values.lifting, values.standing, values.reflection ?? null, values.score,
                    values.completed_at ?? null, now, values.id]
            );
            for (const general_impact of values.general_impacts) {
                await db.runAsync(`DELETE FROM MyMovement_GeneralImpact WHERE my_movement = ?`,
                    [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO MyMovement_GeneralImpact (my_movement,
                    general_impact) VALUES (?, ?)`, [values.id, general_impact]);
            }

        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM MyMovement_GeneralImpact WHERE my_movement = ?`,
                [values.id]);
            await db.runAsync(`DELETE FROM MyMovement WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'MyMovement', values.id, operation, values, now);
    })
}

/* MyPersonalCare:
- create: assessment NN, personal_care NN, sleeping NN, reflection, score NN, completed_at, 
          general_activities_impact[] NN
- update: id NN, server_id, personal_care NN, sleeping NN, reflection, score NN, completed_at,
          general_activities_impact[] NN
    - assessment cannot be changed
- delete: id NN */
export async function operateSyncMyPersonalCare(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO MyPersonalCare (id, assessment, personal_care, sleeping,
                reflection, score, completed_at, created_at, updated_at, is_synced) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.assessment, values.personal_care, values.sleeping, 
                    values.reflection ?? null, values.score, values.completed_at ?? null, now, now]
            );
            for (const general_activities_impact of values.general_activities_impact) {
                await db.runAsync(`INSERT OR IGNORE INTO MyPersonalCare_GeneralActivitiesImpacts (
                    my_personal_care, general_activities_impact) VALUES (?, ?)`, 
                    [values.id, general_activities_impact]);
            }

        } else if (operation == 'update') {
            await db.runAsync(`UPDATE MyPersonalCare SET server_id = ?, personal_care = ?, 
                sleeping = ?, reflection = ?, score = ?, completed_at = ?, updated_at = ?, 
                is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.personal_care, values.sleeping, values.reflection
                    ?? null, values.score, values.completed_at ?? null, now, values.id]
            );
            for (const general_activities_impact of values.general_activities_impact) {
                await db.runAsync(`DELETE FROM MyPersonalCare_GeneralActivitiesImpact WHERE
                    my_personal_care = ?`, [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO MyPersonalCare_GeneralActivitiesImpact (
                    my_personal_care, general_activities_impact) VALUES (?, ?)`, 
                    [values.id, general_activities_impact]);
            }

        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM MyPersonalCare_GeneralActivitiesImpact WHERE 
                my_personal_care = ?`, [values.id]);
            await db.runAsync(`DELETE FROM MyPersonalCare WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'MyPersonalCare', values.id, operation, values, now);
    })
}

/* MySocialHealth:
- create: assessment NN, social_life NN, travelling NN, mood NN, relationships NN, 
          enjoyment_of_life NN, overall_mood NN, reflection, score NN, completed_at
- update: id NN, server_id, social_life NN, travelling NN, mood NN, relationships NN, 
          enjoyment_of_life NN, overall_mood NN, reflection, score NN, completed_at
    - assessment cannot be changed
- delete: id NN */
export async function operateSyncMySocialHealth(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO MySocialHealth (id, assessment, social_life, travelling,
                mood, relationships, enjoyment_of_life, overall_mood, reflection, score, 
                completed_at, created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.assessment, values.social_life, values.travelling, 
                    values.mood, values.relationships, values.enjoyment_of_life, 
                    values.overall_mood, values.reflection ?? null, values.score, 
                    values.completed_at ?? null, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE MySocialHealth SET server_id = ?, social_life = ?, 
                travelling = ?, mood = ?, relationships = ?, enjoyment_of_life = ?, 
                overall_mood = ?, reflection = ?, score = ?, completed_at = ?, updated_at = ?, 
                is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.social_life, values.travelling, values.mood, 
                    values.relationships, values.enjoyment_of_life, values.overall_mood, 
                    values.reflection ?? null, values.score, values.completed_at ?? null, now, 
                    values.id]
            );
        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM MySocialHealth WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'MySocialHealth', values.id, operation, values, now);
    })
}

/* MyManagement:
- create: assessment NN, otc_medication, exercise NN, emotion, score NN, completed_at, 
          medication[] NN
- update: id NN, server_id, otc_medication, exercise NN, emotion, score NN, completed_at,
          medication[] NN
    - assessment cannot be changed
- delete: id NN */
export async function operateSyncMyManagement(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO MyManagement (id, assessment, otc_medication, 
                exercise, emotion, score, completed_at, created_at, updated_at, is_synced) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.assessment, values.otc_medication ?? null, values.exercise, 
                    values.emotion ?? null, values.score, values.completed_at ?? null, now, now]
            );
            for (const medication of values.medication){
                await db.runAsync(`INSERT OR IGNORE INTO MyManagement_Medication (my_management,
                    medication) VALUES (?,?)`, [values.id, medication]);
            }

        } else if (operation == 'update') {
            await db.runAsync(`UPDATE MyManagement SET server_id = ?, otc_medication = ?, 
                exercise = ?, emotion = ?, score = ?, completed_at = ?, updated_at = ?, 
                is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.otc_medication ?? null, values.exercise, 
                    values.emotion ?? null, values.score, values.completed_at ?? null, now, 
                    values.id]
            );
            for (const medication of values.medication){
                await db.runAsync(`DELETE FROM MyManagement_Medication WHERE my_management = ?`,
                    [values.id]);
                await db.runAsync(`INSERT OR IGNORE INTO MyManagement_Medication (my_management,
                    medication) VALUES (?,?)`, [values.id, medication]);
            }

        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM MyManagement_Medication WHERE my_management = ?`,
                [values.id]);
            await db.runAsync(`DELETE FROM MyManagement WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'MyManagement', values.id, operation, values, now);
    })
}

/* Appointment (soft delete):
- create: patient_profile NN, scheduled_date NN, doctor, status NN, created_by NN, 
          health_service NN, notes
- update: id NN, server_id, scheduled_date NN, doctor, status NN, health_service NN, notes
    - patient_profile & created_by cannot be changed
- delete: id NN */
export async function operateSyncAppointment(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO Appointment (id, patient_profile, scheduled_date,
                doctor, status, created_by, health_service, notes, created_at, updated_at, 
                is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.patient_profile, values.scheduled_date, values.doctor ?? null, 
                    values.status, values.created_by, values.health_service, values.notes ??
                    null, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE Appointment SET server_id = ?, scheduled_date = ?,
                doctor = ?, status = ?, health_service = ?, notes = ?, 
                updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.scheduled_date, values.doctor ?? null, 
                    values.status, values.health_service, values.notes ?? null, now, values.id]
            );
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE Appointment SET deleted_at = ?, updated_at = ?, is_synced = 0
                WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'Appointment', values.id, operation, values, now);
    })
}

/* AppointmentQuestion (soft delete):
- create: appointment NN, text NN, source NN, created_by NN, order_index NN, is_selected NN
- update: id NN, server_id, text NN, order_index NN, is_selected NN
    - appointment, created_by & source cannot be changed
- delete: id NN */
export async function operateSyncAppointmentQuestion(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO AppointmentQuestion (id, appointment, text, source, 
                created_by, order_index, is_selected, created_at, updated_at, is_synced) VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.appointment, values.text, values.source, values.created_by, 
                    values.order_index, values.is_selected, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE AppointmentQuestion SET server_id = ?, text = ?, 
                order_index = ?, is_selected = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.text, values.order_index, values.is_selected, 
                    now, values.id]
            );  
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE AppointmentQuestion SET deleted_at = ?, updated_at = ?, 
                is_synced = 0 WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'AppointmentQuestion', values.id, operation, values, now);
    })
}

/* AppointmentAnswer (soft delete):
- create: question NN, text NN, recording_file, transcript, recorded_by NN, recorded_at NN
- update: id NN, server_id, text NN, recording_file, transcript, recorded_by NN, recorded_at NN
    - question cannot be changed
- delete: id NN */
export async function operateSyncAppointmentAnswer(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO AppointmentAnswer (id, question, text, 
                recording_file, transcript, recorded_by, recorded_at, created_at, updated_at,
                is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.question, values.text, values.recording_file ?? null, 
                    values.transcript ?? null, values.recorded_by, values.recorded_at, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE AppointmentAnswer SET server_id = ?, text = ?, 
                recording_file = ?, transcript = ?, recorded_by = ?, recorded_at = ?, 
                updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.text, values.recording_file, values.transcript,
                    values.recorded_by, values.recorded_at, now, values.id]
            );  
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE AppointmentAnswer SET deleted_at = ?, updated_at = ?, 
                is_synced = 0 WHERE id = ?`, [now, now, values.id]
            );
        }

        // queue operation to remote
        await enqueueOutbox(db, 'AppointmentAnswer', values.id, operation, values, now);
    })
}

/* AppointmentAccess:
- create: appointment NN, support_link NN, can_add_questions NN, can_record_answers NN, granted_at 
          NN
- update: id NN, server_id, can_add_questions NN, can_record_answers NN, 
          revoked_at
    - appointment, support_link, granted_at cannot be changed
- delete: id NN */
export async function operateSyncAppointmentAccess(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            values.id = randomUUID();
            await db.runAsync(`INSERT INTO AppointmentAccess (id, appointment, support_link,
                can_add_questions, can_record_answers, granted_at, created_at, updated_at, 
                is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.appointment, values.support_link, values.can_add_questions, 
                    values.can_record_answers, values.granted_at, now, now]
            );
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE AppointmentAccess SET server_id = ?, can_add_questions = ?, 
                can_record_answers = ?, revoked_at = ?, updated_at = ?, is_synced = 0 
                WHERE id = ?`,
                [values.server_id ?? null, values.can_add_questions, values.can_record_answers, 
                    values.revoked_at ?? null, now, values.id]
            );
        } else if (operation == 'delete') { 
            await db.runAsync(`DELETE FROM AppointmentAccess WHERE id = ?`, [values.id]);
        }

        // queue operation to remote
        await enqueueOutbox(db, 'AppointmentAccess', values.id, operation, values, now);
    })
}

/* AuditEntry:
- create: audit_user NN, patient_profile NN, action NN, target_type NN, target_local_id, 
          target_server_id, occurred_at NN, context
- update: N/A
- delete: N/A
*/
export async function insertSyncAuditEntry(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

    // apply operation to local
        values.id = randomUUID();
        await db.runAsync(`INSERT INTO AuditEntry (id, audit_user, patient_profile, action,
            target_type, target_local_id, target_server_id, occurred_at, context, 
            created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
            [values.id, values.audit_user, values.patient_profile, values.action, 
                values.target_type, values.target_local_id ?? null, 
                values.target_server_id ?? null, values.occurred_at, values.context ?? null,
                now, now]
        );

        // queue operation to remote
        await enqueueOutbox(db, 'AuditEntry', values.id, operation, values, now);
    })
}

/* Every table operation function adds a record to Outbox. The Outbox table exists locally and is 
a queue of operations to be synced. The status attribute takes Boolean values: 1 for synced, 
0 for not synced. */
async function enqueueOutbox(db, table, id, operation, values, now) {
    await db.runAsync(`INSERT INTO Outbox (id, entity_type, entity_id, operation, payload, 
        created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [randomUUID(), table, id, operation, JSON.stringify(values), now, now]
    )
}