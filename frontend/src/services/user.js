import API_URL from './api';

export async function getUserConsultoria(email) {
  const res = await fetch(`${API_URL}/api/user/consultoria?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Erro ao buscar consultoria do usuário');
  const data = await res.json();
  return data.consultoria;
}

export async function loginComSenha(login, senha) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, senha }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Falha no login');
  }

  return data.user;
}

export async function criarUsuarioFilho(payload) {
  const res = await fetch(`${API_URL}/api/user/create-child`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao criar usuário filho');
  }

  return data.user;
}

export async function criarUsuarioNeto(payload) {
  const res = await fetch(`${API_URL}/api/user/create-grandchild`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao criar usuário neto');
  }

  return data.user;
}

export async function listarUsuariosGerenciaveis(actorEmail) {
  const res = await fetch(`${API_URL}/api/user/managed?actorEmail=${encodeURIComponent(actorEmail)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao listar usuários');
  }
  return data;
}

export async function editarUsuarioGerenciavel(id, payload) {
  const res = await fetch(`${API_URL}/api/user/managed/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao editar usuário');
  }
  return data.user;
}

export async function inativarOuAtivarUsuario(id, actorEmail, ativo) {
  const res = await fetch(`${API_URL}/api/user/managed/${id}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorEmail, ativo }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao alterar status do usuário');
  }
  return data.user;
}
