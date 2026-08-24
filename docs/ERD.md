# Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o{ CATEGORIES : owns
    USERS ||--o{ TASKS : owns
    USERS ||--o{ NOTES : owns
    USERS ||--o{ STUDY_SESSIONS : records
    USERS ||--o{ STATISTICS : aggregates
    USERS ||--o| PASSWORD_RESET_TOKENS : resets
    CATEGORIES o|--o{ TASKS : classifies
    CATEGORIES o|--o{ NOTES : classifies
    TASKS o|--o{ STUDY_SESSIONS : measured_by
    USERS {
      uuid id PK
      string email UK
      string password
      string role
      int streak_count
      int productivity_score
    }
    TASKS {
      uuid id PK
      uuid user_id FK
      uuid category_id FK
      string title
      string priority
      string status
      date due_date
    }
    NOTES {
      uuid id PK
      uuid user_id FK
      uuid category_id FK
      string title
      text content
      boolean pinned
      boolean archived
    }
    STUDY_SESSIONS {
      uuid id PK
      uuid user_id FK
      uuid task_id FK
      int planned_minutes
      int completed_minutes
    }
```

`database/schema.sql` is the executable MySQL 8 schema. UUIDs are stored as `BINARY(16)`, relationships are protected by foreign keys, and high-use dashboard queries have composite indexes.
