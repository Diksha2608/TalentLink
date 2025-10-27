TalentLink — Local Development Setup

TalentLink is a full-stack freelancing platform built with React (Vite) and Django REST Framework.
Follow the steps below to set up and run the project locally.

⚙️ Prerequisites

Before starting, make sure you have:

Python 3.12
Django ≥ 4.2.11, <5.0 (already listed in requirements.txt)
Node.js 18+ and npm

🧩 Step 1: Clone the Repository
git clone https://github.com/<your-username>/TalentLink.git
cd TalentLink

🐍 Step 2: Backend Setup
cd backend
python -m venv venv
# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

🔑 Step 3: Environment Variables

Generate a Django secret key:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

Create a .env file in the backend/ folder and add:

SECRET_KEY=<paste-generated-key-here>
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

🗃️ Step 4: Database Setup

Since this is a fresh local setup, each teammate must create their own local database:
python manage.py makemigrations
python manage.py migrate


(Optional but recommended)
Load sample data into the database:
python manage.py seed_data


Create a superuser for Django admin access:
python manage.py createsuperuser

💻 Step 5: Frontend Setup
cd ../frontend
npm install

Create a .env file in the frontend/ directory:
VITE_API_URL=http://127.0.0.1:8000

▶️ Running the Application
Option 1: Manual (Development)
🖥️ Terminal 1 — Backend
cd backend
venv\Scripts\activate 
python manage.py runserver

💻 Terminal 2 — Frontend
cd frontend
npm run dev

Access:
Frontend → http://localhost:5173
Backend API → http://localhost:8000/api
Django Admin → http://localhost:8000/admin