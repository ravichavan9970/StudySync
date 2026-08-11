CREATE DATABASE IF NOT EXISTS studysync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studysync;

CREATE TABLE users (
  id BINARY(16) NOT NULL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(15) NOT NULL DEFAULT 'USER',
  profile_picture_url VARCHAR(500),
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  theme VARCHAR(30) NOT NULL DEFAULT 'violet',
  streak_count INT NOT NULL DEFAULT 0,
  productivity_score INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT chk_users_role CHECK (role IN ('USER','ADMIN')),
  UNIQUE KEY idx_users_email (email)
);

CREATE TABLE categories (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#7259ef',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_category_user_name UNIQUE (user_id,name),
  CONSTRAINT fk_category_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  category_id BINARY(16) NULL,
  title VARCHAR(160) NOT NULL,
  description VARCHAR(2000),
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(12) NOT NULL DEFAULT 'PENDING',
  due_date DATE,
  completed_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW','MEDIUM','HIGH')),
  CONSTRAINT chk_tasks_status CHECK (status IN ('PENDING','COMPLETED')),
  CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_tasks_user_due (user_id,due_date),
  KEY idx_tasks_user_status (user_id,status)
);

CREATE TABLE notes (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  category_id BINARY(16) NULL,
  title VARCHAR(160) NOT NULL,
  content TEXT,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_note_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_notes_user_state (user_id,archived,pinned)
);

CREATE TABLE study_sessions (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  task_id BINARY(16) NULL,
  subject VARCHAR(100),
  planned_minutes INT NOT NULL,
  completed_minutes INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMP(6) NOT NULL,
  ended_at TIMESTAMP(6) NULL,
  CONSTRAINT chk_session_planned CHECK (planned_minutes BETWEEN 1 AND 240),
  CONSTRAINT chk_session_completed CHECK (completed_minutes BETWEEN 0 AND 1440),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_session_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  KEY idx_sessions_user_started (user_id,started_at)
);

CREATE TABLE statistics (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  stat_date DATE NOT NULL,
  completed_tasks INT NOT NULL DEFAULT 0,
  focus_minutes INT NOT NULL DEFAULT 0,
  productivity_score INT NOT NULL DEFAULT 0,
  CONSTRAINT uk_statistic_user_day UNIQUE (user_id,stat_date),
  CONSTRAINT fk_statistic_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id BINARY(16) NOT NULL PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  token VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT uk_reset_user UNIQUE (user_id),
  CONSTRAINT idx_reset_token UNIQUE (token),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
