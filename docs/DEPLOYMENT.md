# Deployment guide

## Docker (recommended local run)

1. Copy the root environment values into your shell and use a strong JWT secret (32+ characters).
2. Run `docker compose up --build` from the project root.
3. Open `http://localhost:5173`; the API docs are at `http://localhost:8080/api/v1/swagger-ui.html`.

## Render or Railway backend

1. Provision MySQL 8 and run `database/schema.sql` once.
2. Deploy the `backend/` folder with build command `mvn -DskipTests package` and start command `java -jar target/studysync-api-1.0.0.jar`.
3. Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `MAIL_*`, and optionally `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
4. Set `FRONTEND_URL` to the final Netlify/Vercel URL. Use durable object storage instead of the local upload volume for multi-instance production deployments.

## Vercel or Netlify frontend

1. Deploy `frontend/` as a static site (no build command required).
2. Edit `frontend/config.js`, replacing the localhost API URL with `https://<your-api-host>/api/v1` before deployment.
3. Add that frontend URL to the backend's `FRONTEND_URL` environment variable and redeploy the API.

TLS is supplied by the hosting provider. Do not commit `.env` files, database credentials, or a real JWT secret.
