# JT-Code Auth UI

Three custom Clerk-secured React/TypeScript authentication screens matching the generated JT-Code designs:

- `/sign-in`
- `/sign-up`
- `/forgot-password`

The visual UI is owned by JT-Code. Clerk still owns the authentication/session system through its custom-flow APIs.

## Install

```bash
npm install
cp .env.example .env.local
```

Set your real Clerk frontend key in `.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key
```

Then:

```bash
npm run dev
```

## Clerk Dashboard settings

For the code as written, enable:

- Email sign-up and sign-in
- Password authentication
- Email verification code at sign-up
- Google social connection
- GitHub social connection
- First and last name if you want the Full name field stored by Clerk
- Legal acceptance if you want Clerk to record `legalAccepted`

Add these development redirect URLs to Clerk where applicable:

- `http://localhost:5173/sso-callback`
- `http://localhost:5173/app`

The sign-up flow includes `<div id="clerk-captcha" />` because Clerk bot protection may require it.

## Copy into your existing JT-Code repo

Copy:

```text
public/auth-illustration.png
src/auth/
```

Then add the routes from `src/App.tsx` and ensure your app is wrapped in the `ClerkProvider` pattern shown in `src/main.tsx`.

## Important

The initial three screens are designed to match the generated mockups. The files also include the functional follow-up states needed by Clerk for email verification and password reset.

If you enable TOTP, SMS MFA, passkeys, or additional Clerk session tasks, add those custom-flow states too, or route those cases to an appropriate Clerk-hosted/prebuilt flow.
