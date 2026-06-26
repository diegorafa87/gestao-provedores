import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import GerenciarUsuarios from '../components/GerenciarUsuarios';

export default function AdminUsuariosPage() {
  const navigate = useNavigate();
  let authUser = null;

  try {
    const raw = localStorage.getItem('authUser');
    if (raw) authUser = JSON.parse(raw);
  } catch {}

  const role = authUser?.role || localStorage.getItem('roleUsuario') || '';
  const email = authUser?.email || localStorage.getItem('emailUsuario') || '';
  const isAdmin = role === 'ADMIN' || email === 'diegorafa87@gmail.com';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: '#153a6b' }}>Admin • Gerenciar Usuários</h1>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Voltar para início
        </button>
      </div>

      <GerenciarUsuarios actorEmail={email} />
    </div>
  );
}
