import API_URL from '../services/api';

import React, { useEffect, useState } from 'react';
import CadastroSTFC from '../components/CadastroSTFC';
import MenuLateral from '../components/MenuLateral';
import { useLocation } from 'react-router-dom';

const PaginaCadastroSTFC = () => {
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
          if (Array.isArray(data) && data.length > 0) {
            const clienteEncontrado = data.find(item => String(item?.cnpj || '').replace(/\D/g, '') === String(cnpj).replace(/\D/g, ''));
            setCliente(clienteEncontrado || data[0]);
          }
        });
    }
  }, [location.search]);

  // Fallback: tenta pegar dados do cliente do localStorage se não vier do backend
  let razaoSocial = cliente?.razaoSocial;
  let cnpj = cliente?.cnpj;
  const params2 = new URLSearchParams(location.search);
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
          <CadastroSTFC cnpj={cnpj || ''} />
        </div>
      </div>
    </div>
  );
};

export default PaginaCadastroSTFC;
