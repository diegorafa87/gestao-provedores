import API_URL from './api';

export async function getTVPAHistoricoCSV() {
  const res = await fetch(`${API_URL}/api/acompanhamento-tvpa/historico/csv`);
  if (!res.ok) throw new Error('Erro ao buscar histórico de CSV TVpA');
  return res.json();
}

export async function addTVPAHistoricoCSV(entry) {
  const res = await fetch(`${API_URL}/api/acompanhamento-tvpa/historico/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Erro ao salvar histórico de CSV TVpA');
  return res.json();
}

export async function deleteTVPAHistoricoCSV({ nome, data, usuario }) {
  const res = await fetch(`${API_URL}/api/acompanhamento-tvpa/historico/csv`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, data, usuario })
  });
  if (!res.ok) throw new Error('Erro ao excluir histórico de CSV TVpA');
  return res.json();
}