import API_URL from './services/api';

import React, { useState } from 'react';

import CadastroCliente from './components/CadastroCliente';
import ListaClientes from './components/ListaClientes';

function App() {
  const [atualizar, setAtualizar] = useState(0);
  const [pesquisa, setPesquisa] = useState('');
  const [pesquisaConfirmada, setPesquisaConfirmada] = useState('');
  const [consultorias, setConsultorias] = useState([]);
  const [consultoriaFiltro, setConsultoriaFiltro] = useState('');

  // Consultoria do usuário logado
  const consultoriaUsuario = localStorage.getItem('consultoriaUsuario') || '';
  const emailUsuario = localStorage.getItem('emailUsuario') || '';
  const isAdmin = emailUsuario === 'diegorafa87@gmail.com';

  // Buscar consultorias distintas dos clientes cadastrados (apenas para admin)
  React.useEffect(() => {
    if (isAdmin) {
      fetch(`${API_URL}/api/clientes`)
        .then(r => r.json())
        .then(clientes => {
          const unicos = [...new Set(clientes.map(c => c.consultoria).filter(Boolean))];
          setConsultorias(unicos);
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
  const filtroFinal = isAdmin ? consultoriaFiltro : consultoriaUsuario;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', color: '#153a6b' }}>DOC PROVEDOR</h1>
      <CadastroCliente onClienteCadastrado={() => setAtualizar(a => a + 1)} />

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

      <ListaClientes atualizar={atualizar} consultoriaFiltro={filtroFinal} pesquisa={pesquisaConfirmada} />
    </div>
  );
}

export default App;
