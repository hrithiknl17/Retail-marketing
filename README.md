# FreshSync Grocery Management

This repository is now split into two app directories:

- `frontend/`: Vite + React client
- `backend/`: FastAPI + Supabase API

## Project Structure

Frontend:
- `frontend/src`
- `frontend/public`
- `frontend/index.html`
- `frontend/package.json`

Backend:
- `backend/main.py`
- `backend/requirements.txt`
- `backend/seed_supabase.py`
- `backend/seed_more_supabase.py`

## Run Locally

Open two terminals from the repo root.

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`.

## Environment Variables

Backend needs:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY` (optional, for AI Assistant)
- `APP_TIMEZONE` (optional, defaults to `Asia/Kolkata`)

Frontend can use:
- `VITE_API_URL`

For local development, the frontend already defaults to `http://localhost:8000/api` if `VITE_API_URL` is not set.

## Deployment

Vercel:
- deploy `frontend/`
- build command: `npm run build`
- output directory: `dist`
- set `VITE_API_URL` to your deployed backend URL plus `/api`

Render:
- deploy `backend/`
- build command: `pip install -r requirements.txt`
- start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- set backend environment variables in Render
