import React, { useEffect, useMemo, useState } from 'react';
import API_URL from '../services/api';
import {
  criarUsuarioFilho,
  criarUsuarioNeto,
  listarUsuariosGerenciaveis,
  editarUsuarioGerenciavel,
  inativarOuAtivarUsuario,
  resetarSenhaNetoExistente,
} from '../services/user';

function baseStyle() {
  return { padding: '0.55rem 0.7rem', borderRadius: 6, border: '1px solid #cbd5e1' };
}

export default function GerenciarUsuarios({ actorEmail }) {
  const [consultorias, setConsultorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [msg, setMsg] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [editId, setEditId] = useState('');
  const [editForm, setEditForm] = useState({ nome: '', login: '', email: '', consultoria: '', clienteId: '' });

  const [filho, setFilho] = useState({ nome: '', login: '', email: '', senha: '', consultoria: '' });
  const [neto, setNeto] = useState({ nome: '', login: '', email: '', senha: '', consultoria: '', clienteId: '' });
  const [resetSenha, setResetSenha] = useState({ clienteId: '', novaSenha: '', confirmaSenha: '' });

  useEffect(() => {
    const emailHeader = localStorage.getItem('emailUsuario') || '';
    fetch(`${API_URL}/api/clientes`, {
      headers: emailHeader ? { 'x-user-email': emailHeader } : {},
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setClientes(list);
        setConsultorias([...new Set(list.map(c => c.consultoria).filter(Boolean))]);
      })
      .catch(() => {
        setClientes([]);
        setConsultorias([]);
      });
  }, []);

  const carregarUsuarios = async () => {
    if (!actorEmail) return;
    try {
      const data = await listarUsuariosGerenciaveis(actorEmail);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [actorEmail]);

  const clientesDaConsultoria = useMemo(() => {
    return clientes.filter(c => c.consultoria === neto.consultoria);
  }, [clientes, neto.consultoria]);

  const onCriarFilho = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await criarUsuarioFilho({ ...filho, actorEmail });
      setMsg('✅ Usuário filho criado com sucesso.');
      setFilho({ nome: '', login: '', email: '', senha: '', consultoria: '' });
      carregarUsuarios();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const onCriarNeto = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await criarUsuarioNeto({ ...neto, actorEmail });
      setMsg('✅ Usuário neto criado com sucesso.');
      setNeto({ nome: '', login: '', email: '', senha: '', consultoria: '', clienteId: '' });
      carregarUsuarios();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const onResetarSenha = async (e) => {
    e.preventDefault();
    setMsg('');
    
    if (resetSenha.novaSenha !== resetSenha.confirmaSenha) {
      setMsg('❌ As senhas não conferem.');
      return;
    }
    
    if (!resetSenha.novaSenha || resetSenha.novaSenha.length < 6) {
      setMsg('❌ A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await resetarSenhaNetoExistente(actorEmail, resetSenha.clienteId, resetSenha.novaSenha);
      setMsg('✅ Senha resetada com sucesso!');
      setResetSenha({ clienteId: '', novaSenha: '', confirmaSenha: '' });
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const clientesEditConsultoria = useMemo(() => {
    return clientes.filter(c => c.consultoria === editForm.consultoria);
  }, [clientes, editForm.consultoria]);

  const iniciarEdicao = (u) => {
    setEditId(u.id);
    setEditForm({
      nome: u.nome || '',
      login: u.login || '',
      email: u.email || '',
      consultoria: u.consultoria || '',
      clienteId: u.cliente?.id || '',
    });
  };

  const salvarEdicao = async (u) => {
    try {
      const payload = {
        actorEmail,
        nome: editForm.nome,
        login: editForm.login,
        email: editForm.email,
        consultoria: editForm.consultoria,
      };
      if (u.role === 'NETO') payload.clienteId = editForm.clienteId;
      await editarUsuarioGerenciavel(u.id, payload);
      setMsg('✅ Usuário atualizado com sucesso.');
      setEditId('');
      carregarUsuarios();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const alternarAtivo = async (u) => {
    try {
      await inativarOuAtivarUsuario(u.id, actorEmail, !u.ativo);
      setMsg(`✅ Usuário ${!u.ativo ? 'ativado' : 'inativado'} com sucesso.`);
      carregarUsuarios();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#153a6b' }}>Gerenciamento de Acessos (Admin)</h2>
      <p style={{ marginTop: 0, color: '#475569' }}>
        Crie <b>Filho</b> (acesso por consultoria) e <b>Neto</b> (acesso a um cliente específico).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <form onSubmit={onCriarFilho} style={{ display: 'grid', gap: 8, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0 }}>Criar Usuário Filho (Consultoria)</h3>
          <input style={baseStyle()} placeholder="Nome" value={filho.nome} onChange={e => setFilho(v => ({ ...v, nome: e.target.value }))} />
          <input style={baseStyle()} placeholder="Login" required value={filho.login} onChange={e => setFilho(v => ({ ...v, login: e.target.value }))} />
          <input style={baseStyle()} placeholder="E-mail" required type="email" value={filho.email} onChange={e => setFilho(v => ({ ...v, email: e.target.value }))} />
          <input style={baseStyle()} placeholder="Senha" required type="password" value={filho.senha} onChange={e => setFilho(v => ({ ...v, senha: e.target.value }))} />
          <select style={baseStyle()} required value={filho.consultoria} onChange={e => setFilho(v => ({ ...v, consultoria: e.target.value }))}>
            <option value="">Selecione a consultoria</option>
            {consultorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={{ background: '#153a6b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem', fontWeight: 'bold' }}>Criar Consultoria</button>
        </form>

        <form onSubmit={onCriarNeto} style={{ display: 'grid', gap: 8, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0 }}>Criar Usuário Neto (Cliente)</h3>
          <input style={baseStyle()} placeholder="Nome" value={neto.nome} onChange={e => setNeto(v => ({ ...v, nome: e.target.value }))} />
          <input style={baseStyle()} placeholder="Login" required value={neto.login} onChange={e => setNeto(v => ({ ...v, login: e.target.value }))} />
          <input style={baseStyle()} placeholder="E-mail" required type="email" value={neto.email} onChange={e => setNeto(v => ({ ...v, email: e.target.value }))} />
          <input style={baseStyle()} placeholder="Senha" required type="password" value={neto.senha} onChange={e => setNeto(v => ({ ...v, senha: e.target.value }))} />
          <select style={baseStyle()} required value={neto.consultoria} onChange={e => setNeto(v => ({ ...v, consultoria: e.target.value, clienteId: '' }))}>
            <option value="">Selecione a consultoria</option>
            {consultorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={baseStyle()} required value={neto.clienteId} onChange={e => setNeto(v => ({ ...v, clienteId: e.target.value }))}>
            <option value="">Selecione o cliente</option>
            {clientesDaConsultoria.map(c => <option key={c._id} value={c._id}>{c.razaoSocial} ({c.cnpj})</option>)}
          </select>
          <button type="submit" style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem', fontWeight: 'bold' }}>Criar Cliente</button>
        </form>
      </div>

      {msg && <p style={{ marginTop: 10, fontWeight: 600 }}>{msg}</p>}

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
        <form onSubmit={onResetarSenha} style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Resetar Senha de Cliente NETO</h3>
          <p style={{ marginTop: 0, fontSize: '0.9rem', color: '#666' }}>
            Use este formulário para resetar a senha de um cliente que já possui acesso cadastrado.
          </p>
          <select 
            style={baseStyle()} 
            required 
            value={resetSenha.clienteId} 
            onChange={e => setResetSenha(v => ({ ...v, clienteId: e.target.value }))}
          >
            <option value="">Selecione o cliente</option>
            {clientes.map(c => <option key={c._id} value={c._id}>{c.razaoSocial} ({c.cnpj})</option>)}
          </select>
          <input 
            style={baseStyle()} 
            placeholder="Nova Senha" 
            required 
            type="password" 
            value={resetSenha.novaSenha} 
            onChange={e => setResetSenha(v => ({ ...v, novaSenha: e.target.value }))} 
          />
          <input 
            style={baseStyle()} 
            placeholder="Confirmar Senha" 
            required 
            type="password" 
            value={resetSenha.confirmaSenha} 
            onChange={e => setResetSenha(v => ({ ...v, confirmaSenha: e.target.value }))} 
          />
          <button type="submit" style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem', fontWeight: 'bold' }}>Resetar Senha</button>
        </form>
      </div>

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0 }}>Usuários Filho/Neto cadastrados</h3>
        {usuarios.length === 0 && <p>Nenhum usuário cadastrado.</p>}
        {usuarios.map(u => (
          <div key={u.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, background: u.ativo ? '#f8fafc' : '#fef2f2' }}>
            {editId === u.id ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <input style={baseStyle()} value={editForm.nome} onChange={e => setEditForm(v => ({ ...v, nome: e.target.value }))} placeholder="Nome" />
                  <input style={baseStyle()} value={editForm.login} onChange={e => setEditForm(v => ({ ...v, login: e.target.value }))} placeholder="Login" />
                  <input style={baseStyle()} type="email" value={editForm.email} onChange={e => setEditForm(v => ({ ...v, email: e.target.value }))} placeholder="Email" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: u.role === 'NETO' ? '1fr 1fr' : '1fr', gap: 8 }}>
                  <select style={baseStyle()} value={editForm.consultoria} onChange={e => setEditForm(v => ({ ...v, consultoria: e.target.value, clienteId: '' }))}>
                    <option value="">Selecione a consultoria</option>
                    {consultorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {u.role === 'NETO' && (
                    <select style={baseStyle()} value={editForm.clienteId} onChange={e => setEditForm(v => ({ ...v, clienteId: e.target.value }))}>
                      <option value="">Selecione o cliente</option>
                      {clientesEditConsultoria.map(c => <option key={c._id} value={c._id}>{c.razaoSocial} ({c.cnpj})</option>)}
                    </select>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => salvarEdicao(u)} style={{ background: '#0369a1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.9rem', fontWeight: 'bold' }}>Salvar</button>
                  <button onClick={() => setEditId('')} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.9rem' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <div>
                  <div><b>{u.role}</b> • {u.nome || '(sem nome)'} • <b>{u.login}</b> • {u.email}</div>
                  <div>Consultoria: <b>{u.consultoria || '-'}</b>{u.role === 'NETO' && u.cliente ? ` • Cliente: ${u.cliente.razaoSocial} (${u.cliente.cnpj})` : ''}</div>
                  <div>Status: <b style={{ color: u.ativo ? '#166534' : '#b91c1c' }}>{u.ativo ? 'Ativo' : 'Inativo'}</b></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => iniciarEdicao(u)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.9rem' }}>Editar</button>
                  <button onClick={() => alternarAtivo(u)} style={{ background: u.ativo ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.9rem', fontWeight: 'bold' }}>
                    {u.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
