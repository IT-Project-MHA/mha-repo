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
source .venv/bin/activate #If Windows .venv\Scripts\activate.bat
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
source .venv/bin/activate     
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
git checkout new-feature    //check you're in the right branch
git fetch origin            //fetch the latest updates from repo, to ensure your                                  local main is up to date

// update main 
git checkout main           //switch to main
git pull origin main        //pull any changes in main

//merge branch to main
git merge new-feature
```

# Pull requests

All code should be reviewed by the team before being pushed to main. Merge branches via pull requests to run changes by the team and keep a record of which code has been reviewed and who by.

- Keep pull requests short for quick review and to simplify version history.

- Provide a clear, specific title.

- Include an explanation of what it is and why, including what issues it resolves/what tasks are completed.

- Pass tests before submitting a PR. 
