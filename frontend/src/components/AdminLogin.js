import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginComSenha } from '../services/user';

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const user = await loginComSenha(login, senha);
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('consultoriaUsuario', user.consultoria || '');
      localStorage.setItem('emailUsuario', user.email || '');
      localStorage.setItem('roleUsuario', user.role || '');
      localStorage.setItem('clienteIdUsuario', user.clienteId || '');

      onLogin && onLogin(user);
      if (user.role === 'NETO' && user.clienteId) {
        navigate(`/cliente/${user.clienteId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErro(err?.message || 'Login ou senha inválidos.');
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'4rem auto',background:'#fff',borderRadius:12,padding:'2.5rem 2rem',boxShadow:'0 2px 12px #0002'}}>
      <h1 style={{textAlign:'center',color:'#153a6b',marginBottom:8,fontSize:'2rem'}}>Doc Provedor</h1>
      <h2 style={{textAlign:'center',color:'#1976d2',marginBottom:24}}>Login</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
        <input
          type="text"
          placeholder="Login ou e-mail"
          value={login}
          onChange={e => setLogin(e.target.value)}
          required
          style={{fontSize:'1.1rem',padding:'0.7rem',borderRadius:6,border:'1.5px solid #1976d2'}}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          style={{fontSize:'1.1rem',padding:'0.7rem',borderRadius:6,border:'1.5px solid #1976d2'}}
        />
        <div style={{color:'red',marginBottom:8,minHeight:24}}>{erro}</div>
        <button type="submit" disabled={loading} style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'0.8rem 0',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer',marginTop:8}}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
