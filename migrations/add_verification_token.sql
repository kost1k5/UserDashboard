-- IMPORTANT: Добавляем колонку для токена подтверждения email
ALTER TABLE Users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL;

-- NOTA BENE: Индекс для быстрого поиска по токену
CREATE INDEX IF NOT EXISTS idx_verification_token ON Users(verification_token);
