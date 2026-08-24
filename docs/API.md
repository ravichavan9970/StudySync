# API reference

Base URL: `http://localhost:8080/api/v1`. Protected endpoints require `Authorization: Bearer <JWT>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password` |
| User/profile | `GET /users/me`, `POST /users/change-password`, `GET/PUT /profile`, `POST /profile/picture` |
| Tasks | `GET/POST /tasks`, `PUT/DELETE /tasks/{id}`, `PATCH /tasks/{id}/complete` |
| Notes | `GET/POST /notes`, `PUT/DELETE /notes/{id}`, `PATCH /notes/{id}/archive` |
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/{id}` |
| Productivity | `GET /dashboard`, `GET /statistics?range=weekly`, `GET /study-planner`, `GET/POST /study-sessions` |
| Alerts | `GET /notifications` |
| Admin | `GET /admin/users`, `DELETE /admin/users/{id}`, `GET /admin/dashboard` |

OpenAPI is served by the backend at `/api/v1/swagger-ui.html`; its machine-readable definition is `/api/v1/api-docs`.

Pagination uses Spring's `page`, `size`, and `sort` query parameters. Task search supports `q`, `status`, and `categoryId`; notes support `q` and `archived`.
