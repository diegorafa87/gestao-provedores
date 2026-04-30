import React, { useState } from 'react';
import axios from 'axios';

function AdminSetup({ onSuccess }) {
  const [username] = useState('Diego');
  const [password] = useState('D13gor4f487');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/auth/register', { username, password, type: 'admin' });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar admin');
    }
  };

  if (success) {
    return <div style={{maxWidth:350,margin:'60px auto',padding:24,border:'1px solid #ccc',borderRadius:8}}>
      <h2>Administrador criado!</h2>
      <p>Login: <b>Diego</b></p>
      <p>Senha: <b>D13gor4f487</b></p>
      <p>Agora você pode acessar o sistema normalmente.</p>
    </div>;
  }

  return (
    <div style={{ maxWidth: 350, margin: '60px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Configuração Inicial</h2>
      <p>Crie o usuário administrador para acessar o sistema:</p>
      <form onSubmit={handleCreateAdmin}>
        <div>
          <label>Usuário:</label>
          <input type="text" value={username} disabled />
        </div>
        <div>
          <label>Senha:</label>
          <input type="text" value={password} disabled />
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button type="submit" style={{ marginTop: 16, width: '100%' }}>Criar Administrador</button>
      </form>
    </div>
  );
}

export default AdminSetup;
