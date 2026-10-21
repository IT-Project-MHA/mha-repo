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

    CREATE TABLE IF NOT EXISTS questionOption (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        app_section TEXT(30) NOT NULL,
        question_key TEXT(40) NOT NULL,
        text TEXT(50) NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patientProfile (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES user(id),
        display_name TEXT(120) NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questionOptionOrdered (
        id INTEGER PRIMARY KEY NOT NULL,
        app_section TEXT(30) NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        text TEXT(100) NOT NULL,
        question_number INT NOT NULL,
        question_key TEXT(40) NOT NULL,
        option_number INT NOT NULL,
        score INT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessment (
        id INTEGER PRIMARY KEY NOT NULL,
        patient_profile_id INTEGER NOT NULL REFERENCES patientProfile(id),
        reflection TEXT(300),
        week_starting TEXT(10) NOT NULL,
        status TEXT NOT NULL,
        server_id TEXT(30),
        submitted_at TEXT(3),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS assessment_synced_idx ON assessment(is_synced);
    
    CREATE TABLE IF NOT EXISTS prescription (
        id INTEGER PRIMARY KEY NOT NULL,
        patient_profile_id INTEGER NOT NULL REFERENCES patientProfile(id),
        server_id TEXT UNIQUE,
        name TEXT(50) NOT NULL,
        dosage INTEGER,
        strength INTEGER,
        strength_unit TEXT(10),
        form TEXT(20),
        frequency INTEGER,
        frequency_unit TEXT(10),
        started_on TEXT(10),
        stopped_on TEXT(10),
        notes TEXT,
        deleted_at TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS prescription_synced_idx ON prescription(is_synced);

    CREATE TABLE IF NOT EXISTS myPain (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        current INTEGER,
        worst INTEGER,
        average INTEGER,
        mildest INTEGER,
        other_location TEXT(100),
        other_characteristic TEXT(100),
        completed_at TEXT(30),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_pain_synced_idx ON myPain(is_synced);

    CREATE TABLE IF NOT EXISTS myPain_painLocation (
        myPain_id INTEGER REFERENCES myPain(id),
        painLocation_id INTEGER REFERENCES questionOption(id),
        PRIMARY KEY (myPain_id, painLocation_id)
    );

    CREATE TABLE IF NOT EXISTS myPain_painCharacteristic (
        myPain_id INTEGER REFERENCES myPain(id),
        painCharacteristic_id INTEGER REFERENCES questionOption(id),
        PRIMARY KEY (myPain_id, painCharacteristic_id)
    );

    CREATE TABLE IF NOT EXISTS myMovement (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        active_hours INTEGER,
        walking_id INTEGER REFERENCES questionOptionOrdered(id),
        sitting_id INTEGER REFERENCES questionOptionOrdered(id),
        lifting_id INTEGER REFERENCES questionOptionOrdered(id),
        standing_id INTEGER REFERENCES questionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER,
        completed_at TEXT(30),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_movement_synced_idx ON myMovement(is_synced);

    CREATE TABLE IF NOT EXISTS myMovement_generalImpact (
        myMovement_id INTEGER REFERENCES myMovement(id),
        generalImpact_id INTEGER REFERENCES questionOptionOrdered(id),
        PRIMARY KEY (myMovement_id, generalImpact_id)
    );

    CREATE TABLE IF NOT EXISTS myPersonalCare (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        personal_care_id INTEGER REFERENCES questionOptionOrdered(id),
        sleeping_id INTEGER REFERENCES questionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER,
        completed_at TEXT(30),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_personal_care_synced_idx ON myPersonalCare(is_synced);

    CREATE TABLE IF NOT EXISTS myPersonalCare_generalActivitiesImpact (
        myPersonalCare_id INTEGER REFERENCES myPersonalCare(id),
        generalActivitiesImpact_id INTEGER REFERENCES questionOptionOrdered(id),
        PRIMARY KEY (myPersonalCare_id, generalActivitiesImpact_id)
    );

    CREATE TABLE IF NOT EXISTS mySocialHealth (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        social_life_id INTEGER REFERENCES questionOptionOrdered(id),
        travelling_id INTEGER REFERENCES questionOptionOrdered(id),
        mood INTEGER,
        relationships INTEGER,
        enjoyment_of_life INTEGER,
        overall_mood_id INTEGER REFERENCES questionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER,
        completed_at TEXT(30),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_social_health_synced_idx ON mySocialHealth(is_synced);

    CREATE TABLE IF NOT EXISTS myManagement (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        otc_medication TEXT(300),
        exercise_id INTEGER REFERENCES questionOptionOrdered(id),
        emotion TEXT(300),
        score INTEGER,
        completed_at TEXT(30),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS my_management_synced_idx ON myManagement(is_synced);

    CREATE TABLE IF NOT EXISTS myManagement_medication (
        myManagement_id INTEGER REFERENCES myManagement(id),
        medication_id INTEGER REFERENCES prescription(id),
        PRIMARY KEY (myManagement_id, medication_id)
    );

    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        display_name TEXT(120) NOT NULL,
        phone_number TEXT(20) NOT NULL,
        email TEXT(254)
    );

    CREATE TABLE IF NOT EXISTS userSettings (
        id INTEGER PRIMARY KEY NOT NULL,
        user_id INTEGER NOT NULL REFERENCES user(id),
        server_id TEXT UNIQUE,
        high_contrast INTEGER NOT NULL DEFAULT 0,
        offline_backup INTEGER NOT NULL DEFAULT 1,
        microphone_access INTEGER NOT NULL DEFAULT 0,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        text_size_percent INTEGER NOT NULL DEFAULT 100,
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS appointment (
        id INTEGER PRIMARY KEY NOT NULL,
        patient_profile_id INTEGER NOT NULL REFERENCES patientProfile(id),
        scheduled_date TEXT(10) NOT NULL,
        doctor TEXT(100) NOT NULL,
        status TEXT(20) NOT NULL,
        created_by INTEGER REFERENCES user(id),
        health_service TEXT(50) NOT NULL,
        notes TEXT(100),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_synced_idx ON appointment(is_synced);

    CREATE TABLE IF NOT EXISTS appointmentQuestion (
        id INTEGER PRIMARY KEY NOT NULL,
        appointment_id REFERENCES appointment(id),
        created_by INTEGER REFERENCES user(id),
        text TEXT(100) NOT NULL,
        source TEXT(20) NOT NULL,
        order_index INTEGER NOT NULL,
        is_selected INTEGER NOT NULL,
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_question_synced_idx ON appointmentQuestion(is_synced);

    CREATE TABLE IF NOT EXISTS appointmentAnswer (
        id INTEGER PRIMARY KEY NOT NULL,
        question_id REFERENCES appointmentQuestion(id),
        text TEXT(200),
        recording_file TEXT(200),
        transcript TEXT(500),
        recorded_by_id REFERENCES user(id),
        recorded_at TEXT(10),
        server_id TEXT(30),
        updated_at TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS appointment_answer_synced_idx ON appointmentAnswer(is_synced);

    CREATE TABLE IF NOT EXISTS supportLink (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        patient_profile_id INTEGER NOT NULL REFERENCES patientProfile(id),
        supporter_user_id INTEGER REFERENCES user(id),
        status TEXT(10) NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointmentAccess (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE NOT NULL,
        appointment_id INTEGER NOT NULL REFERENCES appointment(id),
        support_link_id INTEGER NOT NULL REFERENCES supportLink(id),
        can_add_questions INTEGER NOT NULL DEFAULT 0,
        can_record_answers INTEGER NOT NULL DEFAULT 0,
        granted_at TEXT(30) NOT NULL,
        revoked_at TEXT(30),
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auditEntry (
        id INTEGER PRIMARY KEY NOT NULL,
        server_id TEXT UNIQUE,
        audit_user_id INTEGER REFERENCES user(id),
        patient_profile_id INTEGER REFERENCES patientProfile(id),
        action TEXT(10) NOT NULL, 
        target_type TEXT(40) NOT NULL,
        target_local_id INTEGER,
        target_server_id TEXT,
        occurred_at TEXT(30) NOT NULL,          
        context TEXT,                     
        is_synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS audit_synced_idx ON auditEntry(is_synced);
    CREATE INDEX IF NOT EXISTS audit_by_patient_idx ON auditEntry(patient_profile_id, occurred_at DESC);
`;