import React, { useState } from 'react';
import API_URL from '../services/api';

const CadastroRapidoCliente = () => {
  const [form, setForm] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: ''
  });
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (resp.ok) {
        setSucesso('Cliente cadastrado com sucesso!');
        setForm({ razaoSocial: '', cnpj: '', email: '', telefone: '' });
      } else {
        setErro('Erro ao cadastrar cliente. Verifique os dados.');
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    }
    setLoading(false);
  };

  // Número do WhatsApp do destinatário
  const numeroWhatsapp = '5584994145028';

  const handleSubmitAndWhatsapp = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (resp.ok) {
        setSucesso('Cliente cadastrado com sucesso!');
        // Monta mensagem para WhatsApp
        const msg = `Novo cadastro de cliente:%0A%0ARazão Social: ${encodeURIComponent(form.razaoSocial)}%0ACNPJ: ${encodeURIComponent(form.cnpj)}%0AE-mail: ${encodeURIComponent(form.email)}%0ATelefone: ${encodeURIComponent(form.telefone)}`;
        window.open(`https://wa.me/${numeroWhatsapp}?text=${msg}`, '_blank');
        setForm({ razaoSocial: '', cnpj: '', email: '', telefone: '' });
      } else {
        setErro('Erro ao cadastrar cliente. Verifique os dados.');
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'3rem auto',background:'#fff',borderRadius:12,padding:'2.5rem 2rem',boxShadow:'0 2px 12px #0002'}}>
      <h2 style={{textAlign:'center',color:'#153a6b',marginBottom:24}}>Cadastro Rápido de Cliente</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
        <input name="razaoSocial" placeholder="Razão Social" value={form.razaoSocial} onChange={handleChange} required style={{padding:10,fontSize:16,borderRadius:6,border:'1.5px solid #153a6b'}} />
        <input name="cnpj" placeholder="CNPJ" value={form.cnpj} onChange={handleChange} required style={{padding:10,fontSize:16,borderRadius:6,border:'1.5px solid #153a6b'}} />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required style={{padding:10,fontSize:16,borderRadius:6,border:'1.5px solid #153a6b'}} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required style={{padding:10,fontSize:16,borderRadius:6,border:'1.5px solid #153a6b'}} />
        <button type="submit" disabled={loading} style={{background:'#153a6b',color:'#fff',border:'none',borderRadius:8,padding:'0.8rem 0',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer',marginTop:8}}>Cadastrar</button>
        <button type="button" disabled={loading} onClick={handleSubmitAndWhatsapp} style={{background:'#25d366',color:'#fff',border:'none',borderRadius:8,padding:'0.8rem 0',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer',marginTop:0}}>Cadastrar e Enviar para WhatsApp</button>
        {sucesso && <div style={{color:'green',textAlign:'center'}}>{sucesso}</div>}
        {erro && <div style={{color:'red',textAlign:'center'}}>{erro}</div>}
      </form>
    </div>
  );
};

export default CadastroRapidoCliente;
