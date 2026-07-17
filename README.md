# 🏥 PharmacyConnect AI Log

> AI-powered HCP (Healthcare Professional) Interaction Management System built with **React**, **FastAPI**, **PostgreSQL**, **LangGraph**, and **Groq LLM**.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![LangGraph](https://img.shields.io/badge/AI-LangGraph-blueviolet?style=for-the-badge)
![Groq](https://img.shields.io/badge/LLM-Groq-black?style=for-the-badge)
![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?style=for-the-badge)

---

## 📌 Overview

PharmacyConnect AI Log is an AI-powered CRM module designed for pharmaceutical sales representatives to efficiently record and manage interactions with Healthcare Professionals (HCPs).

Instead of manually writing lengthy meeting notes, representatives can enter structured meeting details, and the system automatically generates professional summaries using Large Language Models powered by LangGraph and Groq.

The application also provides a searchable HCP directory, allowing representatives to quickly find doctors and log interactions in an organized manner.

---

# ✨ Features

### 👨‍⚕️ HCP Directory

- View all Healthcare Professionals
- Search doctors by:
  - Name
  - Specialty
  - Hospital
- Beautiful responsive doctor cards
- Quick doctor selection

---

### 📝 Interaction Logging

Representatives can record:

- Meeting Type
- Interaction Date
- Discussion Notes
- Products Discussed
- Next Action
- Follow-up Date
- Priority

---

### 🤖 AI Summary Generation

Powered by:

- LangGraph
- Groq LLM

The AI automatically generates:

- Professional meeting summary
- Structured discussion overview
- Follow-up recommendations

---

### 💾 Database Storage

Stores:

- HCP Details
- Meeting Information
- AI Generated Summary
- Follow-up Schedule

using PostgreSQL.

---

# 🏗 Architecture

```
                React Frontend
                       │
                       │ REST API
                       ▼
                FastAPI Backend
                       │
      ┌────────────────┴───────────────┐
      │                                │
      ▼                                ▼
 LangGraph + Groq LLM            PostgreSQL
 AI Summary Generation          Data Storage
```

---

# 🛠 Tech Stack

## Frontend

- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Lucide Icons

---

## Backend

- FastAPI
- SQLAlchemy (Async)
- Alembic
- Pydantic
- AsyncPG

---

## AI

- LangGraph
- LangChain
- Groq API

---

## Database

- PostgreSQL
- Neon (Production)

---

## Deployment

- Frontend → Render Static Site
- Backend → Render Web Service (Docker)
- Database → Neon PostgreSQL

---

# 📂 Project Structure

```
PharmacyConnect-AILog
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   └── features
│
├── backend
│   ├── app
│   ├── api
│   ├── core
│   ├── models
│   ├── services
│   ├── alembic
│   └── Dockerfile
│
└── README.md
```

---

# 🚀 Live Demo

## Frontend

👉 **YOUR_FRONTEND_RENDER_URL**

Example:

```
https://pharmacyconnect-ailog-1.onrender.com
```

---

## Backend API

👉 **YOUR_BACKEND_RENDER_URL**

Example:

```
https://pharmacyconnect-ailog.onrender.com
```

---

# 📸 Screenshots

## Dashboard

_Add screenshot here_

---

## HCP Directory

_Add screenshot here_

---

## Doctor Search

_Add screenshot here_

---

## AI Summary Generation

_Add screenshot here_

---

## Interaction Form

_Add screenshot here_

---

# ⚙ Local Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/PharmacyConnect-AILog.git

cd PharmacyConnect-AILog
```

---

## Backend

### Install dependencies

```bash
cd backend

pip install -r requirements.txt
```

### Configure Environment

Create `.env`

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/hcp_crm

JWT_SECRET_KEY=your-secret

JWT_ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

GROQ_API_KEY=your_api_key
```

---

### Run Alembic

```bash
alembic upgrade head
```

---

### Start Backend

```bash
uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Environment Variables

## Backend

```env
DATABASE_URL=

GROQ_API_KEY=

JWT_SECRET_KEY=

JWT_ALGORITHM=

ACCESS_TOKEN_EXPIRE_MINUTES=

CORS_ORIGINS=
```

---

## Frontend

```env
VITE_API_BASE_URL=
```

---

# API Endpoints

## HCP

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /hcps | Get all HCPs |
| GET | /hcps/search | Search doctors |

---

## Interaction

| Method | Endpoint |
|---------|----------|
| POST | /interactions |
| GET | /interactions |

---

## AI

| Method | Endpoint |
|---------|----------|
| POST | /ai/generate-summary |

---

# Deployment

## Backend

- Docker
- Render Web Service

---

## Frontend

- Render Static Site

---

## Database

- Neon PostgreSQL

---

# Future Improvements

- Authentication & Authorization
- Role-Based Access Control
- Dashboard Analytics
- Email Notifications
- Calendar Integration
- AI Follow-up Suggestions
- File Upload Support
- Export Reports
- Advanced Search Filters
- Pagination & Sorting

---

# Challenges Faced

- Docker deployment configuration
- Neon PostgreSQL SSL configuration
- CORS setup across Render services
- Async SQLAlchemy database connection
- Render environment variable configuration
- HCP dropdown rendering and selection issues
- AI integration using LangGraph and Groq

---

# Learnings

During this project I gained practical experience in:

- Building production-ready FastAPI applications
- Deploying Dockerized applications on Render
- PostgreSQL database management with Neon
- Async SQLAlchemy ORM
- LangGraph workflows
- Prompt engineering for structured AI outputs
- React + Redux state management
- REST API design
- Production debugging
- Cloud deployment workflows

---

# Note

Authentication has been temporarily disabled in the deployed version to simplify evaluation and allow reviewers to directly explore the HCP interaction workflow without requiring user setup.

The authentication module remains part of the codebase and can be re-enabled in future iterations.

---

# Author

**Kartik Bhandare**

B.Tech Computer Science Engineering (Software Engineering)

Backend & Full Stack Developer

Java | Spring Boot | React | FastAPI | PostgreSQL | LangGraph | Docker

GitHub:
https://github.com/kartikbhandare7

LinkedIn:
(Add your LinkedIn URL)

---

⭐ If you found this project interesting, consider giving it a star!
