import * as SQLite from 'expo-sqlite';

let db = null;

/* Calls once at startup and opens local database and creates missing tables */
export async function initDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mhaLocal.db');
  await db.execAsync(SCHEMA);
  return db;
}

/* Returns the open database */
export function getDb() {
  if (!db) throw new Error('initDb() must be called before getDb()');
  return db;
}


// reference: 
// https://docs.expo.dev/versions/latest/sdk/sqlite/#basic-crud-operations

const SCHEMA = `
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS QuestionOption (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        app_section TEXT(30) NOT NULL,
        question_key TEXT(40) NOT NULL,
        text TEXT(50) NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS QuestionOptionOrdered (
        id TEXT PRIMARY KEY NOT NULL,
        app_section TEXT(30) NOT NULL,
        server_id TEXT UNIQUE,
        text TEXT(100) NOT NULL,
        question_number INT NOT NULL,
        question_key TEXT(40) NOT NULL,
        option_number INT NOT NULL,
        score INT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        deleted_at INTEGER,
        phone_number TEXT(20) NOT NULL,
        display_name TEXT(120) NOT NULL,
        email TEXT(254),        
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS UserSettings (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        user TEXT NOT NULL REFERENCES user(id),
        high_contrast INTEGER NOT NULL DEFAULT 0,
        offline_backup INTEGER NOT NULL DEFAULT 1,
        microphone_access INTEGER NOT NULL DEFAULT 0,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        text_size_percent INTEGER NOT NULL DEFAULT 100,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS PatientProfile (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        user TEXT NOT NULL REFERENCES User(id),
        has_diagnosis INTEGER NOT NULL,
        other_conditions TEXT,
        assigned_gender_at_birth TEXT(40),
        birth_year INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS PatientProfile_PainTypes (
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        pain_type TEXT NOT NULL REFERENCES QuestionOption(id),
        PRIMARY KEY (patient_profile, pain_type)
    );

    CREATE TABLE IF NOT EXISTS SupportLink (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        patient_user TEXT NOT NULL REFERENCES User(id),
        supporter_user TEXT REFERENCES User(id),
        invited_phone_number TEXT(20),
        status TEXT(10) NOT NULL,
        invited_at INTEGER NOT NULL,
        accepted_at INTEGER,
        revoked_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Assessment (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT(30),
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        submitted_at INT,
        reflection TEXT(300),
        week_starting TEXT(10) NOT NULL,
        status TEXT(10) NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS assessment_by_date_idx ON Assessment(week_starting);
    CREATE INDEX IF NOT EXISTS assessment_synced_idx ON Assessment(is_synced);
    
    CREATE TABLE IF NOT EXISTS Prescription (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        name TEXT(50) NOT NULL,
        dosage INTEGER NOT NULL,
        strength INTEGER NOT NULL,
        started_on TEXT(10),
        stopped_on TEXT(10),
        notes TEXT,
        strength_unit TEXT(10) NOT NULL,
        form TEXT(20) NOT NULL,
        frequency INTEGER NOT NULL,
        frequency_unit TEXT(10) NOT NULL,
        deleted_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS prescription_synced_idx ON Prescription(is_synced);

    CREATE TABLE IF NOT EXISTS MyPain (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        assessment TEXT NOT NULL REFERENCES Assessment(id),
        current INTEGER NOT NULL,
        worst INTEGER NOT NULL,
        average INTEGER NOT NULL,
        mildest INTEGER NOT NULL,
        other_location TEXT(100),
        other_characteristic TEXT(100),
        completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_pain_synced_idx ON MyPain(is_synced);

    CREATE TABLE IF NOT EXISTS MyPain_PainLocation (
        my_pain TEXT NOT NULL REFERENCES MyPain(id),
        pain_location TEXT NOT NULL REFERENCES QuestionOption(id),
        PRIMARY KEY (my_pain, pain_location)
    );

    CREATE TABLE IF NOT EXISTS MyPain_PainCharacteristic (
        my_pain TEXT NOT NULL REFERENCES MyPain(id),
        pain_characteristic TEXT NOT NULL REFERENCES QuestionOption(id),
        PRIMARY KEY (my_pain, pain_characteristic)
    );

    CREATE TABLE IF NOT EXISTS MyMovement (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        assessment TEXT NOT NULL REFERENCES Assessment(id),
        active_hours INTEGER NOT NULL,
        walking TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        sitting TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        lifting TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        standing TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER NOT NULL,
        completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_movement_synced_idx ON MyMovement(is_synced);

    CREATE TABLE IF NOT EXISTS MyMovement_GeneralImpact (
        my_movement TEXT NOT NULL REFERENCES MyMovement(id),
        general_impact TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        PRIMARY KEY (my_movement, general_impact)
    );

    CREATE TABLE IF NOT EXISTS MyPersonalCare (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        assessment TEXT NOT NULL REFERENCES Assessment(id),
        personal_care TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        sleeping TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER NOT NULL,
        completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_personal_care_synced_idx ON MyPersonalCare(is_synced);

    CREATE TABLE IF NOT EXISTS MyPersonalCare_GeneralActivitiesImpact (
        my_personal_care TEXT NOT NULL REFERENCES MyPersonalCare(id),
        general_activities_impact TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        PRIMARY KEY (my_personal_care, general_activities_impact)
    );

    CREATE TABLE IF NOT EXISTS MySocialHealth (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        assessment TEXT NOT NULL REFERENCES Assessment(id),
        social_life TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        travelling TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        mood INTEGER NOT NULL,
        relationships INTEGER NOT NULL,
        enjoyment_of_life INTEGER NOT NULL,
        overall_mood TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER NOT NULL,
        completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_social_health_synced_idx ON MySocialHealth(is_synced);

    CREATE TABLE IF NOT EXISTS MyManagement (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        assessment TEXT NOT NULL REFERENCES assessment(id),
        otc_medication TEXT(300),
        exercise TEXT NOT NULL REFERENCES QuestionOptionOrdered(id),
        emotion TEXT(300),
        score INTEGER NOT NULL,
        completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_management_synced_idx ON MyManagement(is_synced);

    CREATE TABLE IF NOT EXISTS MyManagement_Medication (
        my_management TEXT NOT NULL REFERENCES MyManagement(id),
        medication TEXT NOT NULL REFERENCES Prescription(id),
        PRIMARY KEY (my_management, medication)
    );

    CREATE TABLE IF NOT EXISTS Appointment (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        deleted_at INTEGER,
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        scheduled_date TEXT(10) NOT NULL,
        doctor TEXT(100),
        status TEXT(20) NOT NULL,
        created_by TEXT NOT NULL REFERENCES User(id),
        health_service TEXT(50) NOT NULL,
        notes TEXT(100),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_synced_idx ON Appointment(is_synced);

    CREATE TABLE IF NOT EXISTS AppointmentQuestion (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        deleted_at INTEGER,
        appointment TEXT NOT NULL REFERENCES Appointment(id),
        text TEXT(200) NOT NULL,
        source TEXT(30) NOT NULL,
        created_by TEXT NOT NULL REFERENCES User(id),
        order_index INTEGER NOT NULL,
        is_selected INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_question_synced_idx ON AppointmentQuestion(is_synced);

    CREATE TABLE IF NOT EXISTS AppointmentAnswer (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        deleted_at INTEGER,
        question TEXT NOT NULL REFERENCES AppointmentQuestion(id),
        text TEXT,
        recording_file TEXT(200),
        transcript TEXT,
        recorded_by TEXT NOT NULL REFERENCES User(id),
        recorded_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_answer_synced_idx ON AppointmentAnswer(is_synced);

    CREATE TABLE IF NOT EXISTS AppointmentAccess (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        appointment TEXT NOT NULL REFERENCES Appointment(id),
        support_link TEXT NOT NULL REFERENCES SupportLink(id),
        can_add_questions INTEGER NOT NULL DEFAULT 0,
        can_record_answers INTEGER NOT NULL DEFAULT 0,
        granted_at INTEGER NOT NULL,
        revoked_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS AuditEntry (
        id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        audit_user TEXT NOT NULL REFERENCES User(id),
        patient_profile TEXT NOT NULL REFERENCES PatientProfile(id),
        action TEXT(20) NOT NULL, 
        target_type TEXT(40) NOT NULL,
        target_local_id TEXT,
        target_server_id TEXT,
        occurred_at INT NOT NULL,          
        context TEXT,            
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,         
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS audit_synced_idx ON AuditEntry(is_synced);
    CREATE INDEX IF NOT EXISTS audit_by_patient_idx ON AuditEntry(patient_profile, occurred_at DESC);

    CREATE TABLE IF NOT EXISTS Outbox (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS outbox_status_created_at_idx ON Outbox(is_synced, created_at);
`;