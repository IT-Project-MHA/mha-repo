// TEMPORARY FILE LOCATION 

import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabase('mhaLocal.db');

// reference: 
// https://docs.expo.dev/versions/latest/sdk/sqlite/#basic-crud-operations

await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS questionOption (
        id INTEGER PRIMARY KEY NOT NULL,
        app_section TEXT(30) NOT NULL,
        text TEXT(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questionOptionOrdered (
        id INTEGER PRIMARY KEY NOT NULL,
        app_section TEXT(30) NOT NULL,
        text TEXT(100) NOT NULL,
        question_number INT NOT NULL,
        option_number INT NOT NULL,
        score INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessment (
        id INTEGER PRIMARY KEY NOT NULL,
        date TEXT(10) NOT NULL,
        reflection TEXT(300)
        week_starting TEXT(10) NOT NULL,
        status TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS prescription (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT(50) NOT NULL,
        dosage INT NOT NULL,
        strength INT NOT NULL,
        started_on TEXT(10),
        stopped_on TEXT(10),
        notes TEXT,
        strength_unit TEXT(10) NOT NULL,
        form TEXT(20) NOT NULL,
        frequency INT NOT NULL,
        frequency_unit TEXT(10) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS myPain (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        current INTEGER NOT NULL,
        worst INTEGER NOT NULL,
        average INTEGER NOT NULL,
        mildest INTEGER NOT NULL,
        other_location TEXT(100),
        other_characteristic TEXT(100)
    );

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
        activeHours INTEGER NOT NULL,
        walking_id INTEGER REFERENCES questionOptionOrdered(id),
        sitting_id INTEGER REFERENCES questionOptionOrdered(id),
        lifting_id INTEGER REFERENCES questionOptionOrdered(id),
        standing_id INTEGER REFERENCES questionOptionOrdered(id),
        reflection TEXT(300),
        score INTEGER NOT NULL
    );

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
        score INTEGER NOT NULL
    );

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
        mood_id INTEGER REFERENCES questionOptionOrdered(id),
        relationships_id INTEGER REFERENCES questionOptionOrdered(id),
        enjoyment_of_life_id INTEGER REFERENCES questionOptionOrdered(id),
        overall_mood INT NOT NULL,
        reflection TEXT(300),
        score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS myManagement (
        id INTEGER PRIMARY KEY NOT NULL,
        assessment_id INTEGER REFERENCES assessment(id),
        otc_medication TEXT(300),
        exercise_id INTEGER REFERENCES questionOptionOrdered(id),
        emotion TEXT(300),
        score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS myManagement_medication (
        myManagement_id INTEGER REFERENCES myManagement(id),
        medication_id INTEGER REFERENCES prescription(id),
        PRIMARY KEY (myManagement_id, medication_id)
    );
`);
