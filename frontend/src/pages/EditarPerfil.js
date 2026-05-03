import API_URL from '../services/api';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const EditarPerfil = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [form, setForm] = useState({ razaoSocial: '', cnpj: '', email: '', telefone: '', consultoria: '' });

  useEffect(() => {
    setLoading(true);
    setErro(null);
    fetch(`${API_URL}/api/clientes/${id}`)
      .then(async resp => {
        let data = null;
        try {
          data = await resp.json();
        } catch (e) {}
        if (!resp.ok) {
          setErro('Cliente não encontrado.');
          setCliente(null);
          setLoading(false);
          return;
        }
        setCliente(data);
        setForm({
          razaoSocial: data.razaoSocial,
          cnpj: data.cnpj,
          email: data.email,
          telefone: data.telefone,
          consultoria: data.consultoria
        });
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao buscar cliente.');
        setLoading(false);
      });
  }, [id]);

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
      // Atualiza cliente após edição
      const data = await resp.json();
      setCliente(data);
      alert('Perfil atualizado com sucesso!');
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
        <div style={{
          background:'#fff',
          borderRadius:'18px',
          minHeight:'260px',
          boxShadow:'0 4px 24px #0002',
          padding:'2.5rem 2.5rem 2rem 2.5rem',
          margin:'2.5rem auto',
          maxWidth:520,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
        }}>
          <div style={{fontSize:'1.5rem',color:'#1976d2',fontWeight:800,marginBottom:18, letterSpacing:1}}>Editar Perfil do Cliente</div>
          <form onSubmit={handleSalvar} style={{width:'100%', display:'flex', flexDirection:'column', gap:18}}>
            <div style={{display:'flex', gap:18}}>
              <div style={{flex:2}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>Razão Social</label>
                <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} style={{fontSize:'1.1rem',fontWeight:600,marginTop:4, textAlign:'left', width:'100%', border:'1.5px solid #1976d2', borderRadius:6, padding:'8px 12px', background:'#f8f9fb'}} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>CNPJ</label>
                <input name="cnpj" value={form.cnpj} onChange={handleChange} style={{fontSize:'1.1rem',fontWeight:600,marginTop:4, textAlign:'left', width:'100%', border:'1.5px solid #1976d2', borderRadius:6, padding:'8px 12px', background:'#f8f9fb'}} />
              </div>
            </div>
            <div style={{display:'flex', gap:18}}>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>E-mail</label>
                <input name="email" value={form.email} onChange={handleChange} style={{fontSize:'1.1rem',marginTop:4, textAlign:'left', width:'100%', border:'1.5px solid #1976d2', borderRadius:6, padding:'8px 12px', background:'#f8f9fb'}} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} style={{fontSize:'1.1rem',marginTop:4, textAlign:'left', width:'100%', border:'1.5px solid #1976d2', borderRadius:6, padding:'8px 12px', background:'#f8f9fb'}} />
              </div>
            </div>
            <div style={{display:'flex', gap:18}}>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>Consultoria</label>
                <input name="consultoria" value={form.consultoria} onChange={handleChange} style={{fontSize:'1.1rem',marginTop:4, textAlign:'left', width:'100%', border:'1.5px solid #1976d2', borderRadius:6, padding:'8px 12px', background:'#f8f9fb'}} />
              </div>
              <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                <label style={{fontWeight:600, color:'#153a6b', fontSize:15}}>Status</label>
                <span style={{background:statusCores[cliente.status],color:'#fff',borderRadius:'12px',padding:'0.4rem 1.2rem',fontWeight:700,fontSize:'1rem',marginTop:4, textAlign:'center', letterSpacing:1}}>{statusNomes[cliente.status]}</span>
              </div>
            </div>
            <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:'8px',padding:'0.8rem 0',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer',transition:'background 0.2s', marginTop:10, letterSpacing:1}}>Salvar Alterações</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
