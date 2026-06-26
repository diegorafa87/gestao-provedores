

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const itens = [
  { label: 'SCM', icon: '📡' },
  { label: 'TVpA', icon: '📺' },
  { label: 'STFC', icon: '☎️' },
  { label: 'RELATÓRIO ECONÔMICO', icon: '📊' },
  { label: 'INFRA', icon: '🏗️' },
  { label: 'POSTES', icon: '🪵' },
  { label: 'GERENCIADOR', icon: '👤' },
  { label: 'FINANCEIRO', icon: '💲' },
  { label: 'CONTRATOS E CERTIDÕES', icon: '📄' },
  { label: 'EDITAR PERFIL', icon: '✏️' },
];

const MenuLateral = ({ voltarLink, clienteInfo, hiddenLabels = [] }) => {
  const location = useLocation();
  const [clienteInfoPersistente, setClienteInfoPersistente] = useState(() => {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return null;
  });
  useEffect(() => {
    // Sempre que a rota mudar, recarrega o cliente selecionado do localStorage
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) setClienteInfoPersistente(JSON.parse(salvo));
    } catch {}
  }, [location]);
  const navigate = useNavigate();
  const itensVisiveis = itens.filter(item => !hiddenLabels.includes(item.label));

  // Busca id do cliente selecionado na URL (query ou rota)
  const search = location.search;
  const params = new URLSearchParams(search);
  let idCliente = params.get('id');
  if (!idCliente) {
    // Tenta extrair da rota tipo /cliente/:id
    const match = location.pathname.match(/cliente\/(\d+)/);
    if (match) idCliente = match[1];
  }

  const handleItemClick = (itemLabel) => {
    if (itemLabel === 'GERENCIADOR') {
      navigate('/gerenciador/acesso');
    } else if (itemLabel === 'SCM') {
      // Sempre tenta obter o idCliente da URL
      let id = idCliente;
      if (!id) {
        const match = location.pathname.match(/cliente\/(\d+)/);
        if (match && match[1]) id = match[1];
      }
      navigate(`/scm/cadastro${id ? `?id=${id}` : ''}`);
    } else if (itemLabel === 'TVpA') {
      // Busca o CNPJ do cliente do localStorage
      let cnpj = '';
      try {
        const salvo = localStorage.getItem('clienteSelecionado');
        if (salvo) {
          const obj = JSON.parse(salvo);
          cnpj = obj.cnpj || '';
        }
      } catch {}
      if (cnpj) {
        cnpj = cnpj.replace(/[\.\/\-]/g, '');
        navigate(`/tvpa/cadastro?cnpj=${cnpj}`);
      } else {
        navigate('/tvpa/cadastro');
      }
    } else if (itemLabel === 'STFC') {
      let cnpj = params.get('cnpj');
      if (!cnpj && window.location.pathname.match(/cliente\/(\d+)/)) {
        const cnpjInput = document.querySelector('input[name="cnpj"]');
        if (cnpjInput && cnpjInput.value) {
          cnpj = cnpjInput.value;
        }
      }
      if (cnpj) {
        cnpj = cnpj.replace(/[\.\/\-]/g, '');
        navigate(`/stfc/cadastro?cnpj=${cnpj}`);
      } else {
        navigate('/stfc/cadastro');
      }
    } else if (itemLabel === 'RELATÓRIO ECONÔMICO') {
      navigate('/relatorio-economico/primeiro-semestre');
    } else if (itemLabel === 'INFRA') {
      navigate('/infra/estacoes');
    } else if (itemLabel === 'CONTRATOS E CERTIDÕES') {
      navigate('/contratos-e-certidoes/contratos');
    } else if (itemLabel === 'POSTES') {
      navigate('/postes/compartilhamento');
    } else if (itemLabel === 'EDITAR PERFIL') {
      // Busca idCliente da URL ou do localStorage
      let id = params.get('id');
      if (!id) {
        const match = location.pathname.match(/cliente\/(\w+)/);
        if (match && match[1]) id = match[1];
      }
      if (!id) {
        try {
          const salvo = localStorage.getItem('clienteSelecionado');
          if (salvo) {
            const obj = JSON.parse(salvo);
            if (obj && obj.id) id = obj.id;
          }
        } catch {}
      }
      if (id) navigate(`/editar-perfil/${id}`);
      else alert('Selecione um cliente na lista antes de editar o perfil.');
    } else {
      alert(`Clicou em ${itemLabel}`);
    }
  };

  return (
    <aside style={{
      width: 200,
      background: '#111',
      color: '#fff',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 12,
      zIndex: 10
    }}>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 200,
        minHeight: 120,
        background: '#111',
        zIndex: 200,
        paddingTop: 0,
        textAlign: 'center',
        boxShadow: '0 2px 8px #0002',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8
      }}>
        {/* Usuário logado acima do botão voltar */}
        <div style={{width:'100%', color:'#fff', fontWeight:'bold', fontSize:13, textAlign:'left', padding:'6px 0 0 16px', letterSpacing:0.2}}>
          Usuário: {localStorage.getItem('emailUsuario') || '-'}
        </div>
        <div style={{width:'100%', display:'flex', justifyContent:'flex-start', alignItems:'center', padding:'2px 0 0 12px'}}>
          {voltarLink}
        </div>
        <div style={{marginTop: 4, fontWeight: 600, fontSize: 15}}>Bem vindo!</div>
        {clienteInfoPersistente && clienteInfoPersistente.razaoSocial && clienteInfoPersistente.cnpj ? (
          <div style={{marginTop: 2, fontSize: 14, maxWidth: 176, width: '100%', overflow: 'hidden'}}>
            <div style={{
              fontWeight:700,
              whiteSpace:'nowrap',
              overflow:'hidden',
              textOverflow:'ellipsis',
              maxWidth: '100%',
              fontSize: 14
            }} title={clienteInfoPersistente.razaoSocial}>{clienteInfoPersistente.razaoSocial}</div>
            <div style={{
              fontWeight:500,
              whiteSpace:'nowrap',
              overflow:'hidden',
              textOverflow:'ellipsis',
              maxWidth: '100%',
              fontSize: 13
            }} title={clienteInfoPersistente.cnpj}>CNPJ: {clienteInfoPersistente.cnpj}</div>
          </div>
        ) : (
          <div style={{marginTop: 2, fontSize: 14}}>-</div>
        )}
      </div>
      <div style={{marginBottom: 32, textAlign: 'center', marginTop: 110}}>
      </div>
      <nav style={{width: '100%'}}>
        {itensVisiveis.map(item => (
          <div
            key={item.label}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              cursor: 'pointer',
              color: '#fff',
              fontWeight: 'normal',
              fontSize: 16,
              transition: 'background 0.2s',
              background: 'none',
            }}
              onClick={() => handleItemClick(item.label)}
          >
            <span style={{fontSize: 20}}>{item.icon}</span>
            <span style={item.label === 'EDITAR PERFIL' && !clienteInfoPersistente?.id ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default MenuLateral;
