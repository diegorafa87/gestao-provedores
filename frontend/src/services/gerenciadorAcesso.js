import API_URL from './api';

export async function getGerenciadorAcesso(cnpj) {
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpj}`);
  if (!res.ok) throw new Error('Erro ao buscar acesso do gerenciador');
  return res.json();
}

export async function saveGerenciadorAcesso(cnpj, data, atualizadoPor) {
  const res = await fetch(`${API_URL}/api/gerenciador-acesso/${cnpj}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, atualizadoPor })
    }
  );
  if (!res.ok) throw new Error('Erro ao salvar acesso do gerenciador');
  return res.json();
}
