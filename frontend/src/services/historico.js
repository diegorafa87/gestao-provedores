import API_URL from './api';

// Busca o histórico global de arquivos gerados SCM
export async function getHistoricoSCM() {
  const res = await fetch(`${API_URL}/api/acompanhamentoSCM/historico/csv`);
  if (!res.ok) throw new Error('Erro ao buscar histórico global');
  return res.json();
}

// Adiciona uma nova entrada ao histórico global SCM
export async function addHistoricoSCM(entry) {
  const res = await fetch(`${API_URL}/api/acompanhamentoSCM/historico/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Erro ao adicionar ao histórico global');
  return res.json();
}
