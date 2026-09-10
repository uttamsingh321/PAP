# PAP — Production Analytics Platform

A full-stack production analytics platform for monitoring and managing assembly and SMT manufacturing lines.

## Tech Stack

### Backend
- **Django** — Python web framework
- **Django REST Framework** — API development
- **SQLite** — Database (default, can be swapped for PostgreSQL)

### Frontend
- **React 18** — UI library
- **React Router** — Client-side routing
- **Recharts** — Charting library
- **Vite** — Build tool

## Project Structure

```
PAP/
├── backend/          # Django backend
│   ├── config/       # Project configuration
│   ├── authentication/
│   ├── main_dashboard/
│   ├── assembly/
│   ├── smt/
│   ├── rbc/          # Role-Based Command
│   ├── reports/
│   └── settings_app/
├── frontend/         # React frontend
│   └── src/
│       ├── authentication/
│       ├── main_dashboard/
│       ├── assembly/
│       ├── smt/
│       ├── rbc/
│       ├── reports/
│       ├── settings/
│       └── components/
├── .env
├── .gitignore
└── README.md
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Features

- **Authentication** — User login, registration, role-based access
- **Main Dashboard** — Overview KPIs, charts, and trends
- **Assembly** — Production, efficiency, downtime, and defect tracking
- **SMT** — SMT line monitoring and analytics
- **Role-Based Command (RBC)** — User, role, and permission management
- **Reports** — Generate and download production reports
- **Settings** — System configuration and preferences

## License

Proprietary — All rights reserved.
