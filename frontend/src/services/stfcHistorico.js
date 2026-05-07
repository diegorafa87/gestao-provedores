import API_URL from './api';

export async function getSTFCHistoricoCSV() {
  const res = await fetch(`${API_URL}/api/acompanhamento-stfc/historico/csv`);
  if (!res.ok) throw new Error('Erro ao buscar histórico de CSV STFC');
  return res.json();
}

export async function addSTFCHistoricoCSV(entry) {
  const res = await fetch(`${API_URL}/api/acompanhamento-stfc/historico/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Erro ao salvar histórico de CSV STFC');
  return res.json();
}

export async function deleteSTFCHistoricoCSV({ nome, data, usuario }) {
  const res = await fetch(`${API_URL}/api/acompanhamento-stfc/historico/csv`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, data, usuario })
  });
  if (!res.ok) throw new Error('Erro ao excluir histórico de CSV STFC');
  return res.json();
}