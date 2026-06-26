import React, { useEffect, useMemo, useState } from 'react';
import API_URL from '../services/api';
import {
  criarUsuarioFilho,
  criarUsuarioNeto,
  criarLoginClienteExistente,
  listarUsuariosGerenciaveis,
  listarTodosUsuarios,
  editarUsuarioGerenciavel,
  inativarOuAtivarUsuario,
  excluirUsuarioGerenciavel,
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
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [editId, setEditId] = useState('');
  const [editForm, setEditForm] = useState({ nome: '', login: '', email: '', consultoria: '', clienteId: '' });

  const [filho, setFilho] = useState({ nome: '', login: '', email: '', senha: '', consultoria: '' });
  const [neto, setNeto] = useState({ nome: '', login: '', email: '', senha: '', consultoria: '', clienteId: '' });
  const [loginCliente, setLoginCliente] = useState({ clienteId: '', login: '', email: '', senha: '', confirmaSenha: '' });
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

    try {
      const all = await listarTodosUsuarios();
      setTodosUsuarios(all);
    } catch {
      setTodosUsuarios([]);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [actorEmail]);

  const clientesDaConsultoria = useMemo(() => {
    return clientes.filter(c => c.consultoria === neto.consultoria);
  }, [clientes, neto.consultoria]);

  const clientesSemLogin = useMemo(() => {
    const clienteIdsComNeto = new Set(
      usuarios
        .filter(u => u.role === 'NETO' && u.cliente?.id)
        .map(u => String(u.cliente.id))
    );

    return clientes.filter(c => !clienteIdsComNeto.has(String(c._id)));
  }, [clientes, usuarios]);

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

  const onCriarLoginCliente = async (e) => {
    e.preventDefault();
    setMsg('');

    if (loginCliente.senha !== loginCliente.confirmaSenha) {
      setMsg('❌ As senhas do novo login não conferem.');
      return;
    }

    if (!loginCliente.senha || loginCliente.senha.length < 6) {
      setMsg('❌ A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await criarLoginClienteExistente({
        actorEmail,
        clienteId: loginCliente.clienteId,
        login: loginCliente.login,
        email: loginCliente.email,
        senha: loginCliente.senha,
      });
      setMsg('✅ Login de cliente criado com sucesso.');
      setLoginCliente({ clienteId: '', login: '', email: '', senha: '', confirmaSenha: '' });
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

  const excluirUsuario = async (u) => {
    const nomeRef = u?.nome || u?.login || u?.email || 'usuário';
    const confirmado = window.confirm(`Tem certeza que deseja excluir ${nomeRef}?`);
    if (!confirmado) return;

    try {
      await excluirUsuarioGerenciavel(u.id || u._id, actorEmail);
      setMsg('✅ Usuário excluído com sucesso.');
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
        <form onSubmit={onCriarLoginCliente} style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Criar Login para Cliente já Cadastrado</h3>
          <p style={{ marginTop: 0, fontSize: '0.9rem', color: '#666' }}>
            Selecione um cliente existente sem login e crie o primeiro acesso NETO dele.
          </p>
          <select
            style={baseStyle()}
            required
            value={loginCliente.clienteId}
            onChange={e => setLoginCliente(v => ({ ...v, clienteId: e.target.value }))}
            disabled={clientesSemLogin.length === 0}
          >
            <option value="">{clientesSemLogin.length === 0 ? 'Todos os clientes já possuem login' : 'Selecione o cliente'}</option>
            {clientesSemLogin.map(c => <option key={c._id} value={c._id}>{c.razaoSocial} ({c.cnpj})</option>)}
          </select>
          <input
            style={baseStyle()}
            placeholder="Login (opcional, sistema gera se vazio)"
            value={loginCliente.login}
            onChange={e => setLoginCliente(v => ({ ...v, login: e.target.value }))}
          />
          <input
            style={baseStyle()}
            placeholder="E-mail (opcional, usa o e-mail do cliente se vazio)"
            type="email"
            value={loginCliente.email}
            onChange={e => setLoginCliente(v => ({ ...v, email: e.target.value }))}
          />
          <input
            style={baseStyle()}
            placeholder="Senha"
            required
            type="password"
            value={loginCliente.senha}
            onChange={e => setLoginCliente(v => ({ ...v, senha: e.target.value }))}
          />
          <input
            style={baseStyle()}
            placeholder="Confirmar senha"
            required
            type="password"
            value={loginCliente.confirmaSenha}
            onChange={e => setLoginCliente(v => ({ ...v, confirmaSenha: e.target.value }))}
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem', fontWeight: 'bold' }}>
            Criar Login do Cliente
          </button>
        </form>
      </div>

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
        <form onSubmit={onResetarSenha} style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Resetar Senha de Cliente NETO</h3>
          <p style={{ marginTop: 0, fontSize: '0.9rem', color: '#666' }}>
            Use este formulário para resetar a senha. Se o cliente ainda não tiver login, o acesso NETO será criado automaticamente.
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
                  <button onClick={() => excluirUsuario(u)} style={{ background: '#991b1b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.9rem', fontWeight: 'bold' }}>
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0 }}>Todos os usuários existentes</h3>
        {todosUsuarios.length === 0 && <p>Nenhum usuário encontrado.</p>}
        {todosUsuarios.map((u) => (
          <div
            key={`all-${u.id || u._id || u.email}`}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
              background: u.ativo === false ? '#fef2f2' : '#f8fafc',
            }}
          >
            <div><b>{u.role || '-'}</b> • {u.nome || '(sem nome)'}</div>
            <div>Login: <b>{u.login || '-'}</b> • E-mail: {u.email || '-'}</div>
            <div>Consultoria: <b>{u.consultoria || '-'}</b> • ClienteId: {u.clienteId || '-'}</div>
            <div>Status: <b style={{ color: u.ativo === false ? '#b91c1c' : '#166534' }}>{u.ativo === false ? 'Inativo' : 'Ativo'}</b></div>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => excluirUsuario(u)}
                disabled={(u.role || '').toUpperCase() === 'ADMIN'}
                style={{
                  background: (u.role || '').toUpperCase() === 'ADMIN' ? '#94a3b8' : '#991b1b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.45rem 0.75rem',
                  fontWeight: 'bold',
                  cursor: (u.role || '').toUpperCase() === 'ADMIN' ? 'not-allowed' : 'pointer',
                }}
                title={(u.role || '').toUpperCase() === 'ADMIN' ? 'Usuários ADMIN não podem ser excluídos por esta tela' : 'Excluir usuário'}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
