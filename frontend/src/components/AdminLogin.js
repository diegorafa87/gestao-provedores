import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      // Aqui você pode checar se o usuário é admin (exemplo: email fixo ou claim)
        if (userCredential.user.email === 'diegorafa87@gmail.com') {
        onLogin && onLogin(userCredential.user);
      } else {
        setErro('Acesso restrito ao administrador.');
      }
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
      if (err && err.message) {
        setErro(prev => prev + ' [' + err.message + ']');
        // Também loga no console para debug
        // eslint-disable-next-line no-console
        console.error('Erro Firebase:', err);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'4rem auto',background:'#fff',borderRadius:12,padding:'2.5rem 2rem',boxShadow:'0 2px 12px #0002'}}>
      <h2 style={{textAlign:'center',color:'#1976d2',marginBottom:24}}>Login Administrador</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
        <input
          type="email"
          placeholder="E-mail do administrador"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
