import API_URL from './services/api';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CadastroCliente from './components/CadastroCliente';
import ListaClientes from './components/ListaClientes';

function App() {
  const navigate = useNavigate();
  const [atualizar, setAtualizar] = useState(0);
  const [pesquisa, setPesquisa] = useState('');
  const [pesquisaConfirmada, setPesquisaConfirmada] = useState('');
  const [consultorias, setConsultorias] = useState([]);
  const [consultoriaFiltro, setConsultoriaFiltro] = useState('');
  const [menuAdminAberto, setMenuAdminAberto] = useState(false);

  // Contexto do usuário logado
  let authUser = null;
  try {
    const raw = localStorage.getItem('authUser');
    if (raw) authUser = JSON.parse(raw);
  } catch {}

  const consultoriaUsuario = authUser?.consultoria || localStorage.getItem('consultoriaUsuario') || '';
  const emailUsuario = authUser?.email || localStorage.getItem('emailUsuario') || '';
  const roleUsuario = authUser?.role || localStorage.getItem('roleUsuario') || '';
  const clienteIdUsuario = authUser?.clienteId || localStorage.getItem('clienteIdUsuario') || '';
  const isAdmin = roleUsuario === 'ADMIN' || emailUsuario === 'diegorafa87@gmail.com';
  const isNeto = roleUsuario === 'NETO';

  // Buscar consultorias distintas dos clientes cadastrados (apenas para admin)
  React.useEffect(() => {
    if (isAdmin) {
      fetch(`${API_URL}/api/clientes`, {
        headers: emailUsuario ? { 'x-user-email': emailUsuario } : {},
      })
        .then(async r => {
          const data = await r.json();
          if (!r.ok || !Array.isArray(data)) {
            console.error('Erro ao carregar consultorias:', data);
            setConsultorias([]);
            return;
          }
          const unicos = [...new Set(data.map(c => c.consultoria).filter(Boolean))];
          setConsultorias(unicos);
        })
        .catch(err => {
          console.error('Erro de rede ao carregar consultorias:', err);
          setConsultorias([]);
        });
    }
  }, [atualizar, isAdmin]);

  // Função para confirmar pesquisa
  const confirmarPesquisa = () => {
    setPesquisaConfirmada(pesquisa);
  };

  // Função para limpar pesquisa ao trocar filtro
  const handleFiltroConsultoria = (filtro) => {
    setConsultoriaFiltro(filtro);
    setPesquisa('');
    setPesquisaConfirmada('');
  };

  // Filtro a ser passado para ListaClientes
  let filtroFinal = isAdmin ? consultoriaFiltro : consultoriaUsuario;

  const handleSair = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('consultoriaUsuario');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('roleUsuario');
    localStorage.removeItem('clienteIdUsuario');
    localStorage.removeItem('clienteSelecionado');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', right: 0, top: 10, display: 'flex', gap: 8 }}>
        {isAdmin && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuAdminAberto(v => !v)}
              style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Menu Admin ▾
            </button>
            {menuAdminAberto && (
              <div style={{ position: 'absolute', right: 0, marginTop: 6, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, minWidth: 190, boxShadow: '0 8px 24px #0000001a', zIndex: 20 }}>
                <button
                  onClick={() => {
                    setMenuAdminAberto(false);
                    navigate('/admin/usuarios');
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.65rem 0.8rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  Gerenciar usuários
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setAtualizar(a => a + 1)}
          style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45rem 0.8rem', cursor: 'pointer' }}
        >
          Atualizar
        </button>
        <button
          onClick={handleSair}
          style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45rem 0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>
      <h1 style={{ textAlign: 'center', color: '#153a6b' }}>DOC PROVEDOR</h1>

      {!isNeto && <CadastroCliente onClienteCadastrado={() => setAtualizar(a => a + 1)} />}

      {/* Campo de pesquisa por CNPJ ou Razão Social */}
      <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Pesquisar por CNPJ ou Razão Social..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
          style={{ width: 350, padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
          onKeyDown={e => { if (e.key === 'Enter') confirmarPesquisa(); }}
        />
        <button
          onClick={confirmarPesquisa}
          style={{ padding: '0.5rem 1.5rem', borderRadius: 4, border: 'none', background: '#153a6b', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
        >
          Pesquisar
        </button>
      </div>

      {/* Botões de filtro de consultoria - apenas para admin */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleFiltroConsultoria('')}
            style={{ background: consultoriaFiltro === '' ? '#153a6b' : '#eee', color: consultoriaFiltro === '' ? '#fff' : '#153a6b', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Todas
          </button>
          {consultorias.map(c => (
            <button
              key={c}
              onClick={() => handleFiltroConsultoria(c)}
              style={{ background: consultoriaFiltro === c ? '#153a6b' : '#eee', color: consultoriaFiltro === c ? '#fff' : '#153a6b', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ListaClientes
        atualizar={atualizar}
        consultoriaFiltro={filtroFinal}
        pesquisa={pesquisaConfirmada}
        userEmail={emailUsuario}
        clienteIdUsuario={clienteIdUsuario}
      />
    </div>
  );
}

export default App;
