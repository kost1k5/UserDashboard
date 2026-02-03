import crypto from 'crypto';

/**
 * Генерирует уникальное значение (UUID v4).
 * Используется для ID пользователей или токенов подтверждения.
 * @returns {string} Например: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
 */
export function getUniqIdValue() {
  return crypto.randomUUID();
}

/**
 * Форматирует дату для отображения в таблице
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('ru-RU');
}
