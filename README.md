# IT Project - MPowered

Joshua Hunter 1605336 - jrhunter@student.unimelb.edu.au



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