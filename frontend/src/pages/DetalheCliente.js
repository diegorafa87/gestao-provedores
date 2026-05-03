import API_URL from '../services/api';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral';

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

const DetalheCliente = () => {
  console.log('Renderizando DetalheCliente');
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ razaoSocial: '', cnpj: '', email: '', telefone: '', consultoria: '' });

  useEffect(() => {
    setLoading(true);
    setErro(null);
    console.log('Buscando cliente para id:', id);
    fetch(`${API_URL}/api/clientes/${id}`)
      .then(async resp => {
        console.log('Status da resposta:', resp.status);
        let data = null;
        try {
          data = await resp.json();
        } catch (e) {
          console.log('Erro ao fazer parse do JSON:', e);
        }
        console.log('Corpo da resposta:', data);
        if (!resp.ok) {
          setErro('Cliente não encontrado.');
          setCliente(null);
          setLoading(false);
          return;
        }
        setCliente(data);
        // Salva cliente no localStorage para persistência entre rotas
        try {
          // Garante que o campo id está presente (pode ser _id do MongoDB)
          const id = data.id || data._id;
          localStorage.setItem('clienteSelecionado', JSON.stringify({
            id,
            razaoSocial: data.razaoSocial,
            cnpj: data.cnpj
          }));
        } catch {}
        setForm({
          razaoSocial: data.razaoSocial,
          cnpj: data.cnpj,
          email: data.email,
          telefone: data.telefone,
          consultoria: data.consultoria
        });
        setLoading(false);
      })
      .catch((err) => {
        console.log('Erro ao buscar cliente:', err);
        setErro('Erro ao buscar cliente.');
        setLoading(false);
      });
  }, [id, editando]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSalvar = async e => {
    e.preventDefault();
    const resp = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      setEditando(false);
      // Atualiza cliente após edição
      const data = await resp.json();
      setCliente(data);
    }
  };

  if (loading) return <p>Carregando detalhes...</p>;
  if (erro) return <p style={{color:'red'}}>{erro}</p>;
  if (!cliente) return null;

  return (
    <div style={{display:'flex'}}>
      <MenuLateral
        voltarLink={<Link to="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</Link>}
        clienteInfo={
          <div style={{marginBottom: 16, textAlign: 'center'}}>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{cliente.razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {cliente.cnpj}</div>
          </div>
        }
      />
      <div style={{maxWidth:'1100px',margin:'2rem auto',marginLeft:200,flex:1}}>
        {/* Painel centralizado com informações do cliente */}
        <div style={{
          background:'#fff',
          borderRadius:'16px',
          minHeight:'220px',
          boxShadow:'0 2px 8px #0001',
          padding:'2.5rem 2rem 2rem 2rem',
          margin:'2rem auto',
          maxWidth:600,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
        }}>
          <div style={{fontSize:'1.2rem',color:'#1976d2',fontWeight:700,marginBottom:8}}>Painel Cliente</div>
          <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:2}}>Razão Social</div>
          <div style={{fontSize:'1.25rem',fontWeight:700,marginBottom:8}}>{cliente.razaoSocial}</div>
          <div style={{display:'flex',gap:'2.5rem',marginBottom:8}}>
            <div style={{fontSize:'1.05rem'}}><b>CNPJ</b><br/>{cliente.cnpj}</div>
            <div style={{fontSize:'1.05rem'}}><b>Status</b><br/><span style={{background:statusCores[cliente.status],color:'#fff',borderRadius:'12px',padding:'0.2rem 1rem',fontWeight:600,fontSize:'0.95rem'}}>{statusNomes[cliente.status]}</span></div>
          </div>
          {/* Link e-mail */}
          <div style={{fontSize:'1.05rem',marginBottom:4}}>
            <b>E-mail:</b> <a href={`mailto:${cliente.email}`} style={{color:'#1976d2',textDecoration:'underline'}}>{cliente.email}</a>
          </div>
          {/* Link WhatsApp */}
          <div style={{fontSize:'1.05rem',marginBottom:4}}>
            <b>Telefone:</b> <a
              href={`https://wa.me/55${(cliente.telefone||'').replace(/\D/g,'')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{color:'#388e3c',textDecoration:'underline'}}
            >
              {cliente.telefone}
            </a>
          </div>
          <div style={{fontSize:'1.05rem',marginBottom:4}}><b>Consultoria:</b> {cliente.consultoria}</div>
          <button onClick={()=>setEditando(true)} style={{marginTop:16,background:'#1976d2',color:'#fff',border:'2px solid #1976d2',borderRadius:'6px',padding:'0.5rem 2rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer',transition:'background 0.2s'}}>Editar</button>
        </div>
        {/* Formulário de edição */}
        {editando && (
          <div style={{margin:'2rem auto',maxWidth:600}}>
            <form onSubmit={handleSalvar} style={{display:'flex',flexDirection:'column',gap:'1rem',maxWidth:400,margin:'0 auto'}}>
              <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} placeholder="Razão Social" required />
              <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="CNPJ" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" required />
              <input name="consultoria" value={form.consultoria} onChange={handleChange} placeholder="Consultoria" required />
              <div style={{display:'flex',gap:'1rem'}}>
                <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 2rem',fontWeight:'bold'}}>Salvar</button>
                <button type="button" onClick={()=>setEditando(false)} style={{background:'#888',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 2rem'}}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalheCliente;
