import API_URL from './api';

export async function getAcompanhamento(tipo, cnpj) {
  const res = await fetch(`${API_URL}/api/acompanhamento/${tipo}/${cnpj}`);
  if (!res.ok) throw new Error('Erro ao buscar acompanhamento');
  return res.json();
}

export async function saveAcompanhamento(tipo, cnpj, data, atualizadoPor) {
  const res = await fetch(`${API_URL}/api/acompanhamento/${tipo}/${cnpj}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, atualizadoPor })
    }
  );
  if (!res.ok) throw new Error('Erro ao salvar acompanhamento');
  return res.json();
}
