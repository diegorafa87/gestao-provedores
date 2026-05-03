import API_URL from './api';

export async function getUserConsultoria(email) {
  const res = await fetch(`${API_URL}/api/user/consultoria?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Erro ao buscar consultoria do usuário');
  const data = await res.json();
  return data.consultoria;
}
