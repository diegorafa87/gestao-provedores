import API_URL from './api';

// Busca todos os logs do backend
export async function getLogs() {
  const res = await fetch(`${API_URL}/api/logs`);
  if (!res.ok) throw new Error('Erro ao buscar logs');
  return res.json();
}
