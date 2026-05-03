import API_URL from '../services/api';
import React, { useState } from 'react';

function formatCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function formatTelefone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

const CadastroCliente = ({ onClienteCadastrado }) => {
  const [form, setForm] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    consultoria: ''
  });
  const [mensagem, setMensagem] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensagem('');
    try {
          const resp = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (resp.ok) {
        setMensagem('Cliente cadastrado com sucesso!');
        setForm({ razaoSocial: '', cnpj: '', email: '', telefone: '', consultoria: '' });
        if (onClienteCadastrado) onClienteCadastrado();
      } else {
        const data = await resp.json();
        setMensagem(data.error || 'Erro ao cadastrar.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div style={{background:'#f8fafc',padding:'2rem',borderRadius:'8px',marginBottom:'2rem'}}>
      <h2 style={{color:'#153a6b'}}>Cadastrar Novo Cliente</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
        <input name="razaoSocial" placeholder="Razão Social" value={form.razaoSocial} onChange={handleChange} required style={{flex:'1 1 200px'}} />
        <input
          name="cnpj"
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={e => setForm(f => ({ ...f, cnpj: formatCNPJ(e.target.value) }))}
          maxLength={18}
          required
          style={{flex:'1 1 150px'}}
        />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{flex:'1 1 200px'}} />
        <input
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={e => setForm(f => ({ ...f, telefone: formatTelefone(e.target.value) }))}
          maxLength={15}
          required
          style={{flex:'1 1 150px'}}
        />
        <input name="consultoria" placeholder="Consultoria" value={form.consultoria} onChange={handleChange} required style={{flex:'1 1 150px'}} />
        <button type="submit" style={{background:'#153a6b',color:'#fff',border:'none',padding:'0 2rem',borderRadius:'4px',height:'40px'}}>Cadastrar</button>
      </form>
      {mensagem && <p style={{marginTop:'1rem',color:mensagem.includes('sucesso')?'green':'red'}}>{mensagem}</p>}
    </div>
  );
};

export default CadastroCliente;
