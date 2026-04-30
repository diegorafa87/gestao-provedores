

import React, { useState, useEffect } from 'react';
import { submenus } from './submenus';
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

const MenuLateral = ({ voltarLink, clienteInfo }) => {
  // Estado do submenu aberto, persistido no localStorage
  const location = useLocation();
  const [submenuAberto, setSubmenuAberto] = useState(() => {
    try {
      const salvo = localStorage.getItem('submenuAberto');
      return salvo || null;
    } catch {
      return null;
    }
  });
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


  const handleMouseEnter = (label) => {
    if (submenus[label]) {
      setSubmenuAberto(label);
      try {
        localStorage.setItem('submenuAberto', label);
      } catch {}
    }
  };
  // Só fecha o submenu se não for STFC
  const handleMouseLeave = () => {
    if (submenuAberto !== 'STFC') {
      setSubmenuAberto(null);
      try {
        localStorage.removeItem('submenuAberto');
      } catch {}
    }
  };

  // Busca id do cliente selecionado na URL (query ou rota)
  const search = location.search;
  const params = new URLSearchParams(search);
  let idCliente = params.get('id');
  if (!idCliente) {
    // Tenta extrair da rota tipo /cliente/:id
    const match = location.pathname.match(/cliente\/(\d+)/);
    if (match) idCliente = match[1];
  }

  const handleSubmenuClick = (itemLabel, subLabel) => {
    if (itemLabel === 'GERENCIADOR' && subLabel === 'Acesso') {
      navigate('/gerenciador/acesso');
    } else if (itemLabel === 'SCM' && subLabel === 'Novo Relatório') {
      // Sempre tenta obter o idCliente da URL
      let id = idCliente;
      if (!id) {
        const match = location.pathname.match(/cliente\/(\d+)/);
        if (match && match[1]) id = match[1];
      }
      navigate(`/scm/cadastro${id ? `?id=${id}` : ''}`);
    } else if (itemLabel === 'SCM' && subLabel.toUpperCase() === 'ACOMPANHAMENTO SCM') {
      // Sempre tenta obter o idCliente da URL
      let id = idCliente;
      if (!id) {
        const match = location.pathname.match(/cliente\/(\d+)/);
        if (match && match[1]) id = match[1];
      }
      // Busca razaoSocial e cnpj do localStorage
      let razaoSocial = '';
      let cnpj = '';
      try {
        const salvo = localStorage.getItem('clienteSelecionado');
        if (salvo) {
          const obj = JSON.parse(salvo);
          razaoSocial = obj.razaoSocial || '';
          cnpj = obj.cnpj || '';
        }
      } catch {}
      let url = `/scm/cadastro${id ? `?id=${id}&aba=acompanhamento` : '?aba=acompanhamento'}`;
      if (razaoSocial && cnpj) {
        url += `&razaoSocial=${encodeURIComponent(razaoSocial)}&cnpj=${encodeURIComponent(cnpj)}`;
      }
      navigate(url);
    } else if (itemLabel === 'TVpA' && subLabel === 'Novo Relatório') {
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
    } else if (itemLabel === 'TVpA' && subLabel.toUpperCase() === 'ACOMPANHAMENTO TVPA') {
      navigate('/tvpa/acompanhamento');
    } else if (itemLabel === 'STFC' && subLabel === 'Novo Relatório STFC') {
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
    } else if (itemLabel === 'STFC' && subLabel.toUpperCase() === 'ACOMPANHAMENTO STFC') {
      navigate('/stfc/acompanhamento');
    } else if (itemLabel === 'RELATÓRIO ECONÔMICO' && subLabel === 'Primeiro Semestre') {
      navigate('/relatorio-economico/primeiro-semestre');
    } else if (itemLabel === 'RELATÓRIO ECONÔMICO' && subLabel === 'Segundo Semestre') {
      navigate('/relatorio-economico/segundo-semestre');
    } else if (itemLabel === 'RELATÓRIO ECONÔMICO' && subLabel === 'Acompanhamento Rel. Econômico') {
      navigate('/relatorio-economico/acompanhamento');
    } else if (itemLabel === 'INFRA' && subLabel === 'Estações') {
      navigate('/infra/estacoes');
    } else if (itemLabel === 'INFRA' && subLabel === 'Enlaces Próprios') {
      navigate('/infra/enlaces-proprios');
    } else if (itemLabel === 'INFRA' && subLabel === 'Enlaces Contratados') {
      navigate('/infra/enlaces-contratados');
    } else if (itemLabel === 'INFRA' && subLabel === 'Acompanhamento Infra') {
      navigate('/infra/acompanhamento');
    } else if (itemLabel === 'CONTRATOS E CERTIDÕES' && subLabel === 'Contratos') {
      navigate('/contratos-e-certidoes/contratos');
    } else if (itemLabel === 'CONTRATOS E CERTIDÕES' && subLabel === 'Certidões') {
      navigate('/contratos-e-certidoes/certidoes');
    } else if (itemLabel === 'POSTES' && subLabel === 'Compartilhamento') {
      navigate('/postes/compartilhamento');
    } else if (itemLabel === 'POSTES' && subLabel === 'Acompanhamento') {
      navigate('/postes/acompanhamento');
    } else {
      alert(`Clicou em ${subLabel}`);
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
        <div style={{width:'100%', display:'flex', justifyContent:'flex-start', alignItems:'center', padding:'8px 0 0 12px'}}>
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
        {itens.map(item => (
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
              background: submenuAberto === item.label ? '#222' : 'none',
            }}
            onMouseEnter={() => handleMouseEnter(item.label)}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (item.label === 'STFC') {
                setSubmenuAberto('STFC');
                try {
                  localStorage.setItem('submenuAberto', 'STFC');
                } catch {}
              }
              else if (item.label === 'EDITAR PERFIL') {
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
              }
            }}
          >
            <span style={{fontSize: 20}}>{item.icon}</span>
            <span style={item.label === 'EDITAR PERFIL' && !clienteInfoPersistente?.id ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}>{item.label}</span>
            {/* Submenu */}
            {submenuAberto === item.label && submenus[item.label] && (
              <div
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: 0,
                  background: '#222',
                  color: '#fff',
                  minWidth: 180,
                  borderRadius: 8,
                  boxShadow: '2px 2px 8px #0003',
                  padding: '8px 0',
                  zIndex: 50,
                }}
                onMouseEnter={() => setSubmenuAberto(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {submenus[item.label].map(sub => (
                  <div
                    key={sub.label}
                    style={{
                      padding: '8px 20px',
                      cursor: 'pointer',
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      transition: 'background 0.2s',
                      color: '#fff',
                    }}
                    onClick={() => handleSubmenuClick(item.label, sub.label)}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default MenuLateral;
