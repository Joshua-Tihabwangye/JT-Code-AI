# JT-Code backend architecture

## Source-of-truth boundary

Django and Supabase-hosted PostgreSQL own users' local application profile mappings, conversations, job state, asset metadata, usage and audit references. Supabase Auth owns authentication sessions and primary identity. Cloudinary owns asset bytes and transformations. Redis provides caching and Celery transport; it is not durable business state. Kafka carries integration/domain events; events are emitted through the PostgreSQL transactional outbox.

## Request path

1. React or React Native gets a Supabase session JWT.
2. Django verifies the JWT signature, expiry, audience when configured, and authorized party.
3. Django enforces ownership and policy against PostgreSQL.
4. A mutating request writes canonical state and an outbox row in one transaction.
5. Celery handles background execution through Redis.
6. The outbox publisher sends committed events to Kafka.
7. Sentry receives sanitized errors and traces from Django, Celery, Kafka consumers and the n8n error relay.

## Cloudinary boundary

The browser never receives the Cloudinary API secret. Django signs short-lived upload parameters scoped to the user's folder. The completion endpoint verifies the asset against Cloudinary before saving metadata. Add malware scanning/quarantine before allowing generated or uploaded files to become downloadable in regulated deployments.

## Supabase PostgreSQL

Use a direct or session-pooler connection for long-running Django services. Require TLS in hosted environments. Supabase Auth owns user identity and session management; Cloudinary owns asset bytes and transformations.
