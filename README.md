# IT Project - MPowered

Joshua Hunter - jrhunter@student.unimelb.edu.au 

Josh Farinski - jfarinski@student.unimelb.edu.au

Amelia Coccia - acoccia@student.unimelb.edu.au

Xavier Murphy - xqmurphy@student.unimelb.edu.au

Victoria Liu - victoria.liu2@student.unimelb.edu.au 



# Contents

- Project overview
- Demo
- Features by sprint
- System requirements
- Installation guide
- Startup and shutdown
- Repo structure
- Documentation
- Changelog
- Traceability matrix
- Licence



# Project overview

MPOWERED is a mobile app built for Musculoskeletal Health Australia (MHA), a national not-for-profit supporting people with rheumatological and musculoskeletal conditions. It was built by team T5-2 for COMP30022 IT Project at the University of Melbourne (Semester 2, 2026).

The app helps patients self-manage their pain between health care appointments:

- **Pain Tracker** - a weekly self-assessment with five sections (pain, movement, personal care, social health, management) and an optional reflection
- **My Health** - pain profile, pain graphs over time, assessment history and prescriptions
- **Care Planner** - appointments, questions to ask the doctor, and recorded answers
- **Support people** - a patient can invite support people and choose what each one can see or do
- **Settings** - account, notifications and display themes (light, dark and high contrast)

MHA staff use the Django Admin site to manage the questionnaire options and read the audit log

The app does not diagnose, recommend or adjust treatment, and does not replace clinical advice.



# Demo

*Coming soon* - link to the hosted demo.

<!-- TODO: add the Render URL once the test deployment is up, plus test login details (test accounts only, never real ones). -->



# Features by sprint

**Sprint 1 (10 Aug - 17 Aug)** - practice sprint
- Team roles, tools (Jira, Confluence, Slack, GitHub) and tech stack decided

**Sprint 2 (17 Aug - 7 Sep)** - requirements and design
- Requirements spec, user stories, personas, motivational model and acceptance criteria, confirmed with MHA
- Class diagrams, sequence diagrams, architecture, attack tree and database schema
- Low-fidelity designs, and repo set up with Expo and Django

**Sprint 3 (7 Sep - 21 Sep)** - databases and foundational UI
- Cloud database - user, support, health, assessment and audit tables
- Local database
- Frontend set up, with the first reusable buttons, sliders and templates

**Sprint 4 (21 Sep - 12 Oct)** - core functionality
- Sign up, log in with phone number and PIN, one-time codes, trusted devices, reset PIN, log out and delete accounts
- Inviting and accepting support people, with per-person permissions
- CRUD APIs for accounts, health, appointments, reference options and audit
- Care Planner: create, edit and cancel appointments, add questions
- Navigation bar, Settings section and reusable answer components
- Automated testing set up

**Sprint 5 (12 Oct - 26 Oct)** - finishing and integration
- Onboarding screens and My Health screens
- Weekly assessment, section scores and pain insights
- Push reminders for assessments and appointments
- SMS one-time codes through Twilio
- Doctor's answers recorded as audio and stored in cloud storage
- Audit log of who viewed or changed health data
- Four themes, including high contrast, confirmed with MHA
- Backend test suite in CI (80% coverage minimum)



# System requirements

| Tool | Version |
|---|---|
| Python | 3.12 (used in CI) |
| Django | 5.2 |
| Django REST Framework | 3.18 |
| Node.js | 24 (tested with 24.14) |
| Expo SDK | 57 |
| React Native | 0.86 |
| TypeScript | 6.0 |
| Database | SQLite (local), PostgreSQL 16 (deployed) |
| Phone | Expo Go app, or an iOS Simulator / Android emulator |



# Installation guide
```bash
git clone https://github.com/IT-Project-MHA/mha-repo.git
cd mha-repo
```
### Frontend 
```bash
npm install
```
Create `apps/mobile/.env` with the address of the backend:
```bash
EXPO_PUBLIC_SERVER_URL=http://<"laptop's Wi-Fi IP">:8000
```
### Backend 
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate     #If Windows .venv\Scripts\activate.bat
pip install -r requirements.txt
```
Create `apps/api/.env`:
```bash
DEBUG=True
```
Set up the database and load the question options:
```bash
python manage.py migrate
python manage.py seed_options
```
Create an admin account for the Django Admin site:
```bash
python manage.py createsuperuser
```
### Running the tests
```bash
cd apps/api
python manage.py test
```



# Startup and shutdown

### Startup

**Terminal 1 — backend:**
```bash
cd apps/api
source .venv/bin/activate # Windows .venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — frontend:**
```bash
npm run mobile
```

- Scan the QR code with Expo Go, with the phone on the same Wi-Fi as laptop
- On the Android emulator use `http://10.0.2.2:8000` as the server URL, and on the iOS Simulator use `http://localhost:8000`.
- One time codes print in the backend terminal while `DEBUG=True`.
- The Django Admin site is at `http://localhost:8000/admin/`.

To send reminders by hand:
```bash
python manage.py send_reminders --assessments
python manage.py send_reminders --appointments
```

### Shutdown

1. Press `Ctrl + C` in both terminals.
2. Leave the Python virtual environment:
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
