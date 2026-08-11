# StudySync

StudySync is a secure full-stack student productivity platform for planning work, capturing notes, running Pomodoro sessions, and measuring study consistency. It is designed as a portfolio project for a Java Full Stack Developer role.

## Highlights

- JWT authentication: registration, login, logout, BCrypt passwords, forgot/reset password, profile management, and role-based access (`USER`, `ADMIN`)
- Task lifecycle with priorities, due dates, categories, search, filtering, sorting, pagination, completion, and undo completion
- Notes with rich-text-ready content storage, category association, search, pinning, and archiving
- Personalized dashboard with greetings, daily progress, productivity score, streaks, due/overdue notifications, weekly/monthly focus totals
- Study planner grouped by date and subject/category; Pomodoro/deep-work/break modes with persisted focus-session history
- Chart.js weekly productivity analytics, OpenAPI/Swagger, Postman collection, JUnit/Mockito unit tests, Docker, and MySQL schema

## Screenshots

The responsive dashboard, planner, focus room, and analytics views use the original StudySync design and are in [`frontend/`](frontend/). Run the app with Docker and capture screenshots from `http://localhost:5173` for a deployed portfolio or README preview.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6), Chart.js, responsive CSS |
| Backend | Java 21, Spring Boot, Spring MVC, Spring Data JPA, Spring Security, JWT, Maven |
| Data | MySQL 8, JPA/Hibernate |
| Quality | JUnit 5, Mockito, Spring Boot Test, Postman, Swagger/OpenAPI |
| Delivery | Docker, Docker Compose, Render/Railway-ready API, Netlify/Vercel-ready static frontend |

## Quick start

### Docker

```bash
set JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
docker compose up --build
```

Open the frontend at `http://localhost:5173` and Swagger at `http://localhost:8080/api/v1/swagger-ui.html`.

### Run locally

1. Install Java 21, Maven 3.9+, and MySQL 8.
2. Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

3. Configure environment variables and start the API:

```bash
cd backend
set DB_USERNAME=studysync
set DB_PASSWORD=studysync
set JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
set FRONTEND_URL=http://localhost:5500
mvn spring-boot:run
```

4. Serve `frontend/` with a static server (for example VS Code Live Server) and keep `config.js` at its localhost setting.

## API and testing

- Interactive API documentation: `/api/v1/swagger-ui.html`
- OpenAPI JSON: `/api/v1/api-docs`
- Import [`postman/StudySync.postman_collection.json`](postman/StudySync.postman_collection.json) into Postman, run **Register** or **Login**, then exercise the protected requests.
- Run backend tests:

```bash
cd backend
mvn test
```

## Project structure

```text
studysync-fullstack/
├── frontend/                 # Existing responsive UI, API client, Chart.js views
├── backend/
│   ├── src/main/java/com/studysync/
│   │   ├── config/ security/ domain/ repository/
│   │   ├── dto/ service/ controller/ exception/
│   └── src/test/             # JUnit + Mockito unit tests
├── database/schema.sql       # Executable MySQL schema, keys, constraints, indexes
├── docs/                     # ERD, endpoint reference, deployment runbook
├── postman/                  # API collection
└── docker-compose.yml
```

## Security design

- Stateless `Bearer` JWT authentication and BCrypt password hashing
- Ownership checks for user resources; role restriction for `/admin/**`
- Request validation, consistent error responses, CORS allow-list, and API documentation security scheme
- Reset tokens expire and password-reset responses do not reveal whether an email exists
- Uploads restrict content type and size. For multi-instance production, place profile uploads in S3/Cloudinary rather than local disk.

## Documentation

- [ER diagram](docs/ERD.md)
- [API reference](docs/API.md)
- [Deployment guide](docs/DEPLOYMENT.md)

## Future improvements

- Refresh-token rotation and token deny-list for immediate server-side logout
- Cloud object storage and asynchronous email provider integration
- Calendar drag-and-drop, recurring tasks, and real-time WebSocket reminders
- CI/CD pipeline with Testcontainers integration tests and code-quality checks
