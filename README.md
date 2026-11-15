# Yardsign – Territory / Map Management Platform

Source-structure sample of a Django + React platform for managing sectors, maps and accounts.
This repo shows how the codebase is organised; it is **not** a runnable deployment (secrets, certificates, media and build output are stripped).

## Repository layout

```
backend/    Django (REST + Channels WebSockets)
  accounts/   models, serializers, views, consumers, routing, services
  project/    settings, urls, asgi/wsgi
  maps/, admin-maps/   map generation assets and logic
  templates/, static/
frontend/   React single-page app (Create React App)
  src/views, src/layouts, src/component, src/context, src/config, src/utils
```

## Technologies

| Layer | Stack |
|-------|-------|
| Frontend | React (CRA), React Router, Material UI, Formik, Axios, Google Maps / OpenLayers, react-google-recaptcha, Google OAuth, react-joyride onboarding, SCSS/CSS |
| Backend | Python, Django 4.2, Django REST Framework, SimpleJWT, Django Channels (+ Redis) and `websockets`, django-jazzmin admin |
| Data | PostgreSQL (`psycopg2`) |
| Integrations | Stripe (payments + webhooks), AWS S3 (`boto3`), Mapbox / geopy / polyline, OpenAI, Postmark email, ReportLab PDFs |
| DevOps | GitHub Actions workflows, shell install script |

## How the code flows

1. **Sign-up / login** – the React app (`views/auth`) posts to DRF endpoints in `accounts/urls.py`; SimpleJWT issues tokens that the frontend stores via `context` and sends on every Axios call.
2. **Pages** – `layouts/` provide the Home, Login, KYC and Dashboard shells; `views/pages` are the screens rendered inside them.
3. **API** – `accounts/views.py` handles accounts, sectors, uploads and Stripe webhooks; `serializers.py` validates payloads; `models.py` defines the Postgres schema; `services.py`/`utils.py` hold reusable logic.
4. **Maps** – uploaded CSV/sector data is processed (`process_csv_for_sector`) to generate map files under `maps/` and `admin-maps/`, with geocoding via Mapbox/geopy.
5. **Real-time** – `consumers.py` + `routing.py` (Channels) push progress updates; `websocket_handler.py` is a standalone worker that processes CSV jobs over WebSockets.
6. **Payments** – Stripe checkout + webhook handlers update subscription state.

## Running locally (reference)

Backend: `pip install -r requirements.txt` -> create `.env` -> `python manage.py migrate && python manage.py runserver`.
Frontend: `npm install && npm start`.
