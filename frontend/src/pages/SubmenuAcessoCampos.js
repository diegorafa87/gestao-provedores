
import React, { useState, useMemo, useEffect } from 'react';
import MenuLateral from '../components/MenuLateral';
import { Link } from 'react-router-dom';
import {
  getGerenciadorAcesso,
  getGerenciadorAcessoStatus,
  marcarDiciSolicitado,
  saveGerenciadorAcesso
} from '../services/gerenciadorAcesso';

function obterCompetenciaAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

function obterNumeroWhatsapp(telefone) {
  const numero = String(telefone || '').replace(/\D/g, '');
  if (numero.startsWith('55') && (numero.length === 12 || numero.length === 13)) {
    return numero;
  }
  if (numero.length === 10 || numero.length === 11) {
    return `55${numero}`;
  }
  return '';
}

function obterCompetenciaDICI() {
  const agora = new Date();
  const competencia = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  return {
    mes: competencia.toLocaleDateString('pt-BR', { month: 'long' }),
    ano: competencia.getFullYear()
  };
}

export default function SubmenuAcessoCampos() {
  // Recupera info do cliente do localStorage
  const clienteSelecionado = useMemo(() => {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        if (obj.razaoSocial && obj.cnpj) {
          return obj;
        }
      }
    } catch {}
    return null;
  }, []);


  // Estado dos campos
  const [valores, setValores] = useState({ campo1: '', campo2: '', campo3: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [erroDICI, setErroDICI] = useState('');
  const [acessoCompleto, setAcessoCompleto] = useState(false);
  const [statusDICIVerificado, setStatusDICIVerificado] = useState(false);
  const [solicitadoNesteMes, setSolicitadoNesteMes] = useState(false);
  const [solicitandoDICI, setSolicitandoDICI] = useState(false);
  const [competenciaMes, setCompetenciaMes] = useState(obterCompetenciaAtual);
  const [contatoCliente, setContatoCliente] = useState({ telefone: '', telefoneResponsavel: '' });

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      const competencia = obterCompetenciaAtual();
      setCompetenciaMes(atual => atual === competencia ? atual : competencia);
    }, 60000);

    return () => window.clearInterval(intervalo);
  }, []);

  // Carrega do backend ao abrir ou mudar cliente
  useEffect(() => {
    if (!clienteSelecionado || !clienteSelecionado.cnpj) return;
    setCarregando(true);
    getGerenciadorAcesso(clienteSelecionado.cnpj)
      .then(res => {
        setValores({
          campo1: res.link || '',
          campo2: res.login || '',
          campo3: res.senha || ''
        });
        setErro(null);
      })
      .catch(async (err) => {
        setValores({ campo1: '', campo2: '', campo3: '' });
        let msg = 'Erro ao carregar dados do gerenciador.';
        if (err && err.response) {
          try {
            const data = await err.response.json();
            if (data && data.error) msg += ' ' + data.error;
            if (data && data.details) msg += ' ' + data.details;
          } catch {}
        } else if (err && err.message) {
          msg += ' ' + err.message;
        }
        setErro(msg);
      })
      .finally(() => setCarregando(false));
  }, [clienteSelecionado]);

  useEffect(() => {
    if (!clienteSelecionado?.cnpj) return undefined;
    let ativo = true;
    setStatusDICIVerificado(false);

    getGerenciadorAcessoStatus(clienteSelecionado.cnpj, competenciaMes)
      .then(status => {
        if (!ativo) return;
        setAcessoCompleto(status?.completo === true);
        setSolicitadoNesteMes(status?.solicitadoNesteMes === true);
        setContatoCliente({
          telefone: status?.telefone || '',
          telefoneResponsavel: status?.telefoneResponsavel || ''
        });
        setErroDICI('');
        setStatusDICIVerificado(true);
      })
      .catch(err => {
        console.error('Erro ao verificar a solicitação de DICI do cliente:', err);
        if (ativo) {
          setErroDICI('Não foi possível verificar o status da solicitação de DICI.');
          setStatusDICIVerificado(false);
        }
      });

    return () => { ativo = false; };
  }, [clienteSelecionado, competenciaMes]);

  const competenciaDICI = obterCompetenciaDICI();
  const telefoneParaWhatsapp = contatoCliente.telefoneResponsavel || contatoCliente.telefone;
  const numeroWhatsapp = obterNumeroWhatsapp(telefoneParaWhatsapp);
  const mensagemDICI = `Olá! O arquivo DICI da competência ${competenciaDICI.mes}/${competenciaDICI.ano} já pode ser enviado. Por favor, encaminhe o arquivo por este WhatsApp. Obrigado!`;
  const urlWhatsappDICI = numeroWhatsapp
    ? `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagemDICI)}`
    : '';
  const mesAtualNome = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const abrirWhatsAppDICI = async () => {
    if (!urlWhatsappDICI || solicitadoNesteMes || solicitandoDICI) return;

    const janela = window.open(urlWhatsappDICI, '_blank');
    if (!janela) {
      setErroDICI('O navegador bloqueou a abertura do WhatsApp. Permita pop-ups e tente novamente.');
      return;
    }
    janela.opener = null;
    setSolicitandoDICI(true);
    setErroDICI('');
    try {
      await marcarDiciSolicitado(clienteSelecionado.cnpj, competenciaMes);
      setSolicitadoNesteMes(true);
    } catch (err) {
      console.error('Erro ao registrar a solicitação de DICI:', err);
      setErroDICI('A conversa foi aberta, mas não foi possível registrar a solicitação.');
    } finally {
      setSolicitandoDICI(false);
    }
  };

  // Exibe info do cliente
  const clienteInfo = clienteSelecionado ? (
    <div style={{marginBottom: 16, textAlign: 'center'}}>
      <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{clienteSelecionado.razaoSocial}</div>
      <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {clienteSelecionado.cnpj}</div>
    </div>
  ) : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={<Link to="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</Link>}
        clienteInfo={clienteInfo}
      />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 400, width: '100%' }}>
          <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Acesso - Preencha os campos</h2>
          {clienteSelecionado && statusDICIVerificado && !acessoCompleto && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                type="button"
                onClick={abrirWhatsAppDICI}
                disabled={solicitadoNesteMes || solicitandoDICI || !urlWhatsappDICI}
                style={{
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontWeight: 700,
                  cursor: solicitadoNesteMes || solicitandoDICI || !urlWhatsappDICI ? 'not-allowed' : 'pointer',
                  opacity: solicitadoNesteMes || solicitandoDICI || !urlWhatsappDICI ? 0.65 : 1
                }}
              >
                {solicitandoDICI ? 'Abrindo WhatsApp...' : 'SOLICITAR DICI'}
              </button>
              {solicitadoNesteMes && (
                <span role="status" style={{ color: '#166534', fontWeight: 700 }}>
                  Solicitado em {mesAtualNome}
                </span>
              )}
              {!urlWhatsappDICI && (
                <span style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                  Telefone inválido ou não cadastrado
                </span>
              )}
            </div>
          )}
          {erroDICI && <div role="alert" style={{ color: '#b91c1c', marginBottom: 16 }}>{erroDICI}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>Link
              <input type="text" value={valores.campo1} onChange={e => setValores(v => ({ ...v, campo1: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
            {valores.campo1 && (
              <button
                style={{ marginTop: 8, marginLeft: 4, background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  let url = valores.campo1;
                  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                  window.open(url, '_blank');
                }}
              >
                Acessar Link
              </button>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>login
              <input type="text" value={valores.campo2} onChange={e => setValores(v => ({ ...v, campo2: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600 }}>senha
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={valores.campo3}
                onChange={e => setValores(v => ({ ...v, campo3: e.target.value }))}
                onClick={() => setMostrarSenha(true)}
                onBlur={() => setMostrarSenha(false)}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>
          <button
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            disabled={salvando || carregando}
            onClick={async () => {
              if (!clienteSelecionado || !clienteSelecionado.cnpj) return;
              setSalvando(true);
              try {
                await saveGerenciadorAcesso(clienteSelecionado.cnpj, {
                  link: valores.campo1,
                  login: valores.campo2,
                  senha: valores.campo3
                });
                setErro(null);
                setAcessoCompleto(Boolean(valores.campo1.trim() && valores.campo2.trim() && valores.campo3.trim()));
                window.dispatchEvent(new Event('gerenciador-acesso-atualizado'));
              } catch (err) {
                let msg = 'Erro ao salvar dados do gerenciador.';
                if (err && err.response) {
                  try {
                    const data = await err.response.json();
                    if (data && data.error) msg += ' ' + data.error;
                    if (data && data.details) msg += ' ' + data.details;
                  } catch {}
                } else if (err && err.message) {
                  msg += ' ' + err.message;
                }
                setErro(msg);
              }
              setSalvando(false);
            }}
          >{salvando ? 'Salvando...' : 'Salvar'}</button>
          {erro && <div style={{ color: 'red', marginTop: 16 }}>{erro}</div>}
          {carregando && <div style={{ color: '#1976d2', marginTop: 8 }}>Carregando dados...</div>}
        </div>
      </div>
    </div>
  );
}
