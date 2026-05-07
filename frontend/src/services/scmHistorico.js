export async function deleteSCMHistoricoCSV({ nome, data, usuario }) {
  const res = await fetch(`${API_URL}/api/acompanhamento-scm/historico/csv`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, data, usuario })
  });
  if (!res.ok) throw new Error('Erro ao excluir histórico de CSV');
  return res.json();
}
import API_URL from './api';

export async function getSCMHistoricoCSV() {
  const res = await fetch(`${API_URL}/api/acompanhamento-scm/historico/csv`);
  if (!res.ok) throw new Error('Erro ao buscar histórico de CSV');
  return res.json();
}

export async function addSCMHistoricoCSV(entry) {
  const res = await fetch(`${API_URL}/api/acompanhamento-scm/historico/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Erro ao salvar histórico de CSV');
  return res.json();
}
