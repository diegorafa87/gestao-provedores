import API_URL from '../services/api';

import React, { useEffect, useState } from 'react';
import NovoRelatorioTVpA from './CadastroTVpAPage';
import MenuLateral from '../components/MenuLateral';
import { useLocation } from 'react-router-dom';

const PaginaCadastroTVpA = () => {
  const [cliente, setCliente] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cnpj = params.get('cnpj');
    if (cnpj) {
      fetch(`${API_URL}/api/clientes?cnpj=${cnpj}`)
        .then(async resp => {
          if (!resp.ok) return;
          const data = await resp.json();
          console.log('Cliente retornado do backend:', data);
          if (Array.isArray(data) && data.length > 0) setCliente(data[0]);
        });
    }
  }, [location.search]);

  // Fallback: tenta pegar dados do cliente do localStorage se não vier do backend

  // Sempre prioriza localStorage para manter consistência do cliente selecionado
  let razaoSocial = null;
  let cnpj = null;
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      razaoSocial = obj.razaoSocial;
      cnpj = obj.cnpj;
    }
  } catch {}

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
      <div style={{marginLeft:200, flex:1, minHeight:'100vh', background:'#f8f9fb', padding:'2rem'}}>
        <div style={{marginTop:'40px'}}>
          <NovoRelatorioTVpA />
        </div>
      </div>
    </div>
  );
};

export default PaginaCadastroTVpA;
