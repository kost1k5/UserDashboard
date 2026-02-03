
UNIQUE INDEX гарантирует уникальность email на уровне БД

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'unverified' CHECK (status IN ('unverified', 'active', 'blocked')),
    last_login_time TIMESTAMP DEFAULT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_token VARCHAR(255) DEFAULT NULL
);

-- CRITICAL REQUIREMENT: UNIQUE INDEX на email
-- Вызывает ошибку 23505 при попытке вставить дублирующийся email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON Users(email);


CREATE INDEX IF NOT EXISTS idx_verification_token ON Users(verification_token);


CREATE INDEX IF NOT EXISTS idx_last_login_time ON Users(last_login_time DESC NULLS LAST);
