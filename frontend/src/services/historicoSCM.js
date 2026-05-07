import API_URL from './api';

export async function fetchHistoricoSCM() {
  const res = await fetch(`${API_URL}/acompanhamento-scm/historico/csv`);
  if (!res.ok) throw new Error('Erro ao buscar histórico SCM');
  return res.json();
}

export async function addHistoricoSCM(entry) {
  const res = await fetch(`${API_URL}/acompanhamento-scm/historico/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Erro ao salvar histórico SCM');
  return res.json();
}
