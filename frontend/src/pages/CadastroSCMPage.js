import API_URL from '../services/api';
import React, { useEffect, useState } from 'react';
import CadastroSCM from '../components/CadastroSCM';
import AcompanhamentoSCM from '../components/AcompanhamentoSCM';
import MenuLateral from '../components/MenuLateral';
import { useLocation } from 'react-router-dom';

const statusCores = {
  NOVO: '#1976d2',
  ATIVO: '#388e3c',
  CORRIGIR: '#fbc02d',
  SUSPENSO: '#d32f2f'
};
const statusNomes = {
  NOVO: 'Novo',
  ATIVO: 'Ativo',
  CORRIGIR: 'Corrigir',
  SUSPENSO: 'Suspenso'
};

const PaginaCadastroSCM = () => {
  const [cliente, setCliente] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Tenta obter o cliente do localStorage ou query param (exemplo: /scm/cadastro?id=123)
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      fetch(`${API_URL}/api/clientes/${id}`)
        .then(async resp => {
          if (!resp.ok) return;
          const data = await resp.json();
          console.log('Cliente retornado do backend:', data);
          setCliente(data);
        });
    }
  }, [location.search]);

  // Fallback: tenta pegar dados do cliente do localStorage se não vier do backend
  let razaoSocial = cliente?.razaoSocial;
  let cnpj = cliente?.cnpj;
  // Tenta pegar da URL primeiro
  const params2 = new URLSearchParams(location.search);
  if (!razaoSocial) razaoSocial = params2.get('razaoSocial') || '';
  if (!cnpj) cnpj = params2.get('cnpj') || '';
  if (!razaoSocial || !cnpj) {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        razaoSocial = razaoSocial || obj.razaoSocial;
        cnpj = cnpj || obj.cnpj;
      }
    } catch {}
  }

  // Exibição controlada por rota/submenu
  const params = new URLSearchParams(location.search);
  const aba = params.get('aba') === 'acompanhamento' ? 'acompanhamento' : 'relatorio';

  return (
    <div style={{display:'flex'}}>
      <MenuLateral
        voltarLink={<a href="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</a>}
        clienteInfo={razaoSocial && cnpj ? (
          <>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {cnpj}</div>
          </>
        ) : null}
      />
      <div style={{marginLeft:200, flex:1, minHeight:'100vh', background:'#f8f9fb'}}>
        {aba === 'acompanhamento' ? (
          <AcompanhamentoSCM razaoSocial={razaoSocial} cnpj={cnpj} />
        ) : (
          <CadastroSCM cnpj={cnpj} razaoSocial={razaoSocial} />
        )}
      </div>
    </div>
  );
};

export default PaginaCadastroSCM;
