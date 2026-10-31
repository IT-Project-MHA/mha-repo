# IT Project - MPowered

Joshua Hunter - jrhuner@student.unimelb.edu.au 

Josh Farinski - jfarinski@student.unimelb.edu.au

Amelia Coccia - acoccia@student.unimelb.edu.au

Xavier Murphy - xqmurphy@student.unimelb.edu.au

Victoria Liu - victoria.liu2@student.unimelb.edu.au 



# Tech stack

- **Frontend:** React Native with Expo (SDK 54), (TypeScript)
- **Backend:** Django 5.2 and Django REST Framework (Python)
- **Database:** SQLite and PostgreSQL



# First-time setup
```bash
git clone ____
cd mha-repo
```
### Frontend 
```bash
npm install
```
### Backend 
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate #If Windows source .venv/Scripts/activate.bat
pip install -r requirements.txt
```


# Running the app 

**Terminal 1 — frontend:**
```bash
npm run mobile
```

**Terminal 2 — backend:**
```bash
cd apps/api
source .venv/bin/activate # Windows .venv/Scripts/activate
```

SQLite
```bash
python manage.py migrate
python manage.py runserver
```


# Purpose

The goal of this document is to act as a guide on basic notation standards and git practices, to ensure that all code is readable by team members and others.

Should be altered as the project progresses

# Principle

Code should be readable, reviewed and well-tested.

Comment use does not justify 

# Languages

Frontend: React Native -> Javascript

Backend: Django5.2 w/ REST → Python

Database: PostgreSQL → SQL

# Code Style

Prettier + ESLint, run on save and in a pre-commit hook

Line length <= 100.

2 space indentation.

Constants marked in UPPER_SNAKE_CASE

JavaScript – React Native 

- Components: PascalCase

- Functions and variables: camelCase

- One component per file, filename matches component name (PascalCase.js)

- Use functional components with hooks only (avoid class components)

Python – Django REST

- Modules, functions variables: snake_case

- Classes: PascalCase

- Declare permission_classes on every view

SQL

- Tables: lowercase, plural, snake_case (e.g. pain_entries)

- Columns: lowercase snake_case

# Commenting

Each function should have a clear description of what it does in JSDOC (JS) or a docString (python)

- Comments should be clear and frequent.

- Comments should explain why as opposed to what – the code should be readable on its own.

# Committing

Every commit should include a brief summary message of what has been implemented.

Reference Jira ticket number if it exists.

```bash 
git add.
git commit -m "Implemented calculation function for streaks (SCRUM-14)"
git push
```

# Branching

Epics (and all side tasks) should be completed on branches, passing all test cases before being merged to main.

- Pull changes from main before merging.

- Use comments to document the purpose of the merge.

- Branches should be relatively small & focused.

# Creating a branch

```bash
git branch new-feature    //create new branch
git checkout new-feature    //switch to new branch

git checkout -b newer-feature    //create another branch and switch to it!

git push -u origin new-feature    //push new branch to repo
```

# Merging a branch to main

```bash
deactivate
```

To reset the local database - delete `apps/api/db.sqlite3`, then run `migrate` and `seed_options` again.



# Repo structure
```
mha-repo/
├── .github/workflows/tests.yml   # CI - runs the Django tests on every PR and push to main
├── package.json                  # npm
└── apps/
    ├── api/                      # Django backend
    │   ├── mpowered_api/         # Settings, urls and shared base models 
    │   ├── accounts/             # Users, sign up, login, one-time codes, PINs, devices, support links, SMS and notifications
    │   ├── health/               # Weekly assessments, the five sections, prescriptions and pain trends
    │   ├── appointment/          # Appointments, questions, answers, recordings and supporter grants
    │   ├── audit/                # Audit log of who viewed or changed health data
    │   ├── reference/            # Questionnaire options, seeded by seed_options from seed/options.json
    │   └── requirements.txt
    └── mobile/                   # React Native (Expo) app
        ├── src/app/              # Screens (Expo Router), one folder per tab
        │   └── (tabs)/           # painTracker, myHealth, carePlanner, sharedWithMe and settings
        ├── src/api/              # Calls to the Django API
        ├── src/db/               # local device database
        ├── components/           # answer fields, base components and buttons
        ├── context/              # Login, theme and appointment state
        └── constants/            # Themes, colours, layout, and dropdown options
```

Each Django app follows the same layout: 
`models.py` - tables) 
`serializer.py` - JSON input and outputs
`views.py` - endpoints
`urls.py` - routes
`admin.py` - Django Admin
`tests.py` - tests



# Documentation

**Requirements**
- [Requirements Specification](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/6356995/Requirements+Specification)
- [User Stories](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/10321921/User+Stories)
- [Personas](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/14712833/Personas)
- [Motivational Model](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/14745601/Motivational+Model)
- [Acceptance Criteria](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/40665096/Acceptance+Criteria)

**Design and architecture**
- [Software Models & Design](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/12976129/Software+Models+Design)
- [Technical Stack](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/7634945/Technical+Stack)
- [Architecture Goals and Constraints](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/19333138/Architecture+Goals+and+Constraints)
- [System Architecture Diagram](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/20021258/System+Architecture+Diagram)
- [Attack Tree + mitigations](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/31031346/Attack+Tree+mititgations)
- [Design Doc](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/88965123/Design+Doc)

**Development**
- [Coding Standards](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/19333122/Coding+Standards)
- [API Document](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/108396545/API+Document)
- [Test Plan](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/100433921/Test+Plan)
- [Deployment](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/104726540/Deployment)

**Handover documents (docs/ folder)**



# Changelog

**Sprint 5**
- feature development: onboarding screens
- feature development: My Health screens 
- feature development: push reminders, SMS codes, audit log, recordings in cloud storage
- feature development: Django tests in CI with 80% coverage

**Sprint 4**
- feature development: login, one-time codes and permissions
- feature development: CRUD APIs for accounts, health, appointments, reference and audit
- feature development: Care Planner screens
- feature development: navigation bar 
- feature development: Settings section
- feature development: reusable answer components 
- feature development: Jest test setup 
- bugfix: database schema fixes from the 22 Sep review 

**Sprint 3**
- feature development: cloud database tables
- feature development: local database tables 
- feature development: frontend set up 
- feature development: foundational UI buttons and sliders 

**Sprint 2**
- Repo set up with React Native (Expo) and Django

**Sprint 1**
- No code 



- Pass tests before submitting a PR. 

# Testing the app
npm test

# Traceability matrix

Each user story is linked to its acceptance criteria and test cases in the [Test Plan](https://student-team-vpdzm0ea.atlassian.net/wiki/spaces/IP/pages/100433921/Test+Plan) (section "User Stories to Test Cases").


# Licence
