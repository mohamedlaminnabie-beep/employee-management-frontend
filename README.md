# PeopleDesk Employee Management

React, Vite, and Tailwind CSS frontend for the Spring Boot employee API.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Copy `.env.example` to `.env.local` if you need to
change the API proxy target. For a direct API connection, set `VITE_API_BASE_URL`
to the Spring Boot origin; the backend must allow the frontend origin through CORS.

## Features

- Session-cookie authentication with registration, login, and logout.
- A protected employee directory with search, profile view, and role-aware actions.
- Admin-only employee creation and editing modals, plus confirmed deletion.
- USER and ADMIN roles can view employees; ADMIN-only controls match the Spring
  security rules. The backend remains authoritative and rejects unauthorized API
  requests independently of the frontend controls.
- CSRF token retrieval before every state-changing API request.
- Inline validation for username, password, employee names, and email.
- Confirmation-password validation and immediate reset to the full employee list
  when the search field is cleared.

The API client uses the Spring session cookie and requests a fresh CSRF token before
each state-changing request. The employee search API parameter is `keyword`, matching
the current Spring controller.

New registrations receive the `USER` role from the backend and cannot mutate
employees. To provision an administrator, configure the backend's
`APP_SECURITY_ADMIN_USERNAME` and `APP_SECURITY_ADMIN_PASSWORD` environment variables
before Spring Boot starts. The React app only reflects returned roles; it cannot grant
permissions, and Spring Security remains authoritative for every API request. Sign
out and back in after a role change so `/api/auth/me` refreshes the session view.

Run `npm run build` to create a production build and `npm run lint` to check the source.
