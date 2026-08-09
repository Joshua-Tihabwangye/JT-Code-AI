# JT-Code web architecture

## Boundary

This repository contains only the React + TypeScript web client. It never stores Cloudinary API secrets, Clerk secret keys, Supabase database credentials, Kafka credentials, or AI provider keys.

## Authentication

`ClerkProvider` owns the browser session. `ApiClientProvider` asks Clerk for a session token and adds `Authorization: Bearer <token>` to protected Django API calls. Django independently verifies the JWT against Clerk's JWKS; the frontend session is not treated as backend authorization by itself.

## Data and files

All business records are requested from Django. File uploads use a two-step signed flow:

1. request short-lived upload parameters from Django;
2. upload bytes directly to Cloudinary;
3. register the returned Cloudinary metadata with Django.

The database stores metadata and Cloudinary identifiers, not raw file bytes.

## Monitoring

Sentry is initialized before React renders. API failures are captured with the backend trace identifier when available. Never include prompt content, uploaded file contents, secrets, or raw tokens in Sentry events.
