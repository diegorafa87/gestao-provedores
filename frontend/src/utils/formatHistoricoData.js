function parseHistoricoData(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = String(value).trim();
  const isoDate = new Date(text);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const ptBrMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!ptBrMatch) return null;

  const [, day, month, year, hour = '0', minute = '0', second = '0'] = ptBrMatch;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export default function formatHistoricoData(value) {
  if (!value) return '-';

  const parsed = parseHistoricoData(value);
  if (!parsed) return String(value);

  const day = pad(parsed.getDate());
  const month = pad(parsed.getMonth() + 1);
  const year = parsed.getFullYear();
  const hour = pad(parsed.getHours());
  const minute = pad(parsed.getMinutes());
  const second = pad(parsed.getSeconds());

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}
