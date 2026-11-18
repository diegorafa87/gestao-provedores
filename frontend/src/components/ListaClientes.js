
import API_URL from '../services/api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSCMHistoricoCSV } from '../services/scmHistorico';

const cores = {
  NOVO: '#1976d2',
  ATIVO: '#388e3c',
  CORRIGIR: '#fbc02d',
  SUSPENSO: '#d32f2f'
};

const nomes = {
  NOVO: 'Novos',
  ATIVO: 'Ativos',
  CORRIGIR: 'Corrigir',
  SUSPENSO: 'Suspensos'
};

function agruparPorStatus(clientes) {
  if (!Array.isArray(clientes)) {
    return {};
  }
  return clientes.reduce((acc, cliente) => {
    acc[cliente.status] = acc[cliente.status] || [];
    acc[cliente.status].push(cliente);
    return acc;
  }, {});
}

function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function obterCompetenciaReferenciaSCM() {
  const agora = new Date();
  const referencia = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  return `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}`;
}

function formatarMesCompetencia(competencia) {
  const [ano, mes] = competencia.split('-').map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
}

function obterCompetenciaSCM(item = {}) {
  const nomeArquivo = String(item?.nome || item?.detalhes?.nomeArquivo || '');
  const match = nomeArquivo.match(/_(\d{4})_(\d{1,2})\.csv$/i);
  const ano = Number(match?.[1] || item?.detalhes?.ano);
  const mes = Number(match?.[2] || item?.detalhes?.mes);

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return '';
  }

  return `${ano}-${String(mes).padStart(2, '0')}`;
}

function normalizarCnpj(valor = '') {
  return String(valor).replace(/\D/g, '');
}

const ListaClientes = ({ atualizar, consultoriaFiltro, pesquisa, userEmail, clienteIdUsuario }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historicoSCM, setHistoricoSCM] = useState([]);
  const [historicoSCMCarregado, setHistoricoSCMCarregado] = useState(false);
  const [erroHistoricoSCM, setErroHistoricoSCM] = useState(false);
  const [competenciaEsperada, setCompetenciaEsperada] = useState(obterCompetenciaReferenciaSCM);
  const [statusVisiveis, setStatusVisiveis] = useState(() => {
    const saved = localStorage.getItem('statusVisiveis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { NOVO: true, ATIVO: true, CORRIGIR: true, SUSPENSO: true };
      }
    }
    return { NOVO: true, ATIVO: true, CORRIGIR: true, SUSPENSO: true };
  });

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/api/clientes`;
    if (consultoriaFiltro) {
      url += `?consultoria=${encodeURIComponent(consultoriaFiltro)}`;
    }
    fetch(url, {
      headers: userEmail ? { 'x-user-email': userEmail } : {},
    })
      .then(async resp => {
        const data = await resp.json();
        if (!resp.ok || !Array.isArray(data)) {
          console.error('Erro ao carregar clientes:', data);
          setClientes([]);
        } else {
          setClientes(data);
        }
      })
      .catch(err => {
        console.error('Erro de rede ao carregar clientes:', err);
        setClientes([]);
      })
      .finally(() => setLoading(false));
  }, [atualizar, consultoriaFiltro]);

  useEffect(() => {
    let ativo = true;
    let competenciaVerificada = obterCompetenciaReferenciaSCM();
    setCompetenciaEsperada(competenciaVerificada);

    const carregarHistoricoSCM = async () => {
      try {
        const historico = await getSCMHistoricoCSV();
        if (!Array.isArray(historico)) {
          throw new Error('O histórico SCM retornou um formato inválido.');
        }
        if (ativo) {
          setHistoricoSCM(historico);
          setHistoricoSCMCarregado(true);
          setErroHistoricoSCM(false);
        }
      } catch (erro) {
        console.error('Erro ao carregar histórico SCM dos clientes:', erro);
        if (ativo) {
          setErroHistoricoSCM(true);
        }
      }
    };

    const verificarCompetencia = () => {
      const competencia = obterCompetenciaReferenciaSCM();
      if (competencia !== competenciaVerificada) {
        competenciaVerificada = competencia;
        setCompetenciaEsperada(competencia);
        carregarHistoricoSCM();
      }
    };

    carregarHistoricoSCM();
    window.addEventListener('focus', carregarHistoricoSCM);
    const intervalo = window.setInterval(verificarCompetencia, 60000);

    return () => {
      ativo = false;
      window.removeEventListener('focus', carregarHistoricoSCM);
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('statusVisiveis', JSON.stringify(statusVisiveis));
  }, [statusVisiveis]);

  const handleStatus = async (id, status) => {
    await fetch(`${API_URL}/api/clientes/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(userEmail ? { 'x-user-email': userEmail } : {}),
      },
      body: JSON.stringify({ status })
    });
    setLoading(true);
    try {
      let url = `${API_URL}/api/clientes`;
      if (consultoriaFiltro) {
        url += `?consultoria=${encodeURIComponent(consultoriaFiltro)}`;
      }
      const resp = await fetch(url, {
        headers: userEmail ? { 'x-user-email': userEmail } : {},
      });
      const data = await resp.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await fetch(`${API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: userEmail ? { 'x-user-email': userEmail } : {},
      });
      setLoading(true);
      try {
        let url = `${API_URL}/api/clientes`;
        if (consultoriaFiltro) {
          url += `?consultoria=${encodeURIComponent(consultoriaFiltro)}`;
        }
        const resp = await fetch(url, {
          headers: userEmail ? { 'x-user-email': userEmail } : {},
        });
        const data = await resp.json();
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Carregando clientes...</p>;

  let clientesFiltrados = consultoriaFiltro
    ? clientes.filter(c => c.consultoria === consultoriaFiltro)
    : clientes;

  if (clienteIdUsuario) {
    clientesFiltrados = clientesFiltrados.filter(c => String(c._id) === String(clienteIdUsuario));
  }

  if (pesquisa && pesquisa.trim() !== '') {
    const termo = pesquisa.trim();
    const termoNumeros = termo.replace(/\D/g, '');
    const termoTexto = removerAcentos(termo.toLowerCase());
    clientesFiltrados = clientesFiltrados.filter(c => {
      const cnpjNumeros = (c.cnpj || '').replace(/\D/g, '');
      const razao = removerAcentos((c.razaoSocial || '').toLowerCase());
      return (termoNumeros && cnpjNumeros.includes(termoNumeros)) || (termoTexto && razao.includes(termoTexto));
    });
  }

  const agrupados = agruparPorStatus(clientesFiltrados);
  Object.keys(agrupados).forEach(status => {
    agrupados[status].sort((a, b) => {
      const razA = (a.razaoSocial || '').toLowerCase();
      const razB = (b.razaoSocial || '').toLowerCase();
      return razA.localeCompare(razB, 'pt-BR');
    });
  });

  const alternarStatus = (status) => {
    setStatusVisiveis(v => ({ ...v, [status]: !v[status] }));
  };

  const possuiSCMAtual = (cliente) => {
    const cnpjCliente = normalizarCnpj(cliente.cnpj);
    if (!cnpjCliente) return false;

    return historicoSCM.some(item =>
      normalizarCnpj(item?.usuario || item?.cnpj) === cnpjCliente &&
      obterCompetenciaSCM(item) === competenciaEsperada
    );
  };

  const mesReferenciaSCM = formatarMesCompetencia(competenciaEsperada);

  return (
    <div>
      {erroHistoricoSCM && (
        <p role="alert" style={{ color: '#8a5a00', background: '#fff8e1', padding: '0.75rem', borderRadius: 6 }}>
          Não foi possível verificar os arquivos SCM do mês de referência. Atualize a página ou tente novamente.
        </p>
      )}
      {['NOVO', 'ATIVO', 'CORRIGIR', 'SUSPENSO'].map(status => (
        <div key={status} style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              color: cores[status],
              cursor: 'pointer',
              userSelect: 'none',
              display: 'inline',
            }}
            onClick={() => alternarStatus(status)}
            title={statusVisiveis[status] ? 'Clique para ocultar' : 'Clique para exibir'}
          >
            {nomes[status]}
          </h3>
          {statusVisiveis[status] && (
            <>
              {(agrupados[status] || []).length === 0 && <p style={{ color: '#888' }}>Nenhum cliente.</p>}
              {(agrupados[status] || []).map(cliente => {
                const scmPendente = status === 'ATIVO' && historicoSCMCarregado && !possuiSCMAtual(cliente);
                return (
                <div key={cliente._id} style={{ background: cores[status], color: '#fff', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: scmPendente ? '2px solid #d4af37' : '2px solid transparent' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{cliente.cnpj} - {cliente.razaoSocial}</strong>
                      </div>
                      {(status === 'CORRIGIR' || status === 'SUSPENSO') && (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fffbe6', borderRadius: 6, padding: '0.2rem 0.7rem', boxShadow: '0 1px 4px #0001', minWidth: 180 }}>
                          <label style={{ fontWeight: 600, fontSize: '0.98em', color: '#333', marginRight: 6 }}>Obs.:</label>
                          <input
                            type="text"
                            value={cliente.observacao || ''}
                            placeholder="Ex: Falta documentação, pediu cancelamento..."
                            style={{
                              minWidth: 80,
                              maxWidth: 320,
                              width: `${Math.max(150, (cliente.observacao ? cliente.observacao.length * 9 : 0))}px`,
                              padding: '0.2rem 0.5rem',
                              border: '1px solid #ccc',
                              borderRadius: 4,
                              fontSize: '0.85em',
                              background: '#fff',
                              color: '#222',
                              outline: 'none',
                              transition: 'width 0.2s',
                            }}
                            onChange={async e => {
                              const valor = e.target.value;
                              cliente.observacao = valor;
                              setClientes([...clientes]);
                              try {
                                await fetch(`${API_URL}/api/clientes/${cliente._id}/observacao`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(userEmail ? { 'x-user-email': userEmail } : {}),
                                  },
                                  body: JSON.stringify({ observacao: valor })
                                });
                              } catch (err) {
                                // Silencioso, mas pode exibir toast/alert se quiser
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <span>Consultoria: {cliente.consultoria}</span>
                    {scmPendente && (
                      <div>
                        <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.2rem 0.55rem', borderRadius: 12, background: '#fff4cc', color: '#684d00', fontSize: '0.82rem', fontWeight: 700 }}>
                          SCM referente a {mesReferenciaSCM} pendente
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <select value={cliente.status} onChange={e => {
                        if (e.target.value === 'EXCLUIR') {
                          handleExcluir(cliente._id);
                        } else {
                          handleStatus(cliente._id, e.target.value);
                        }
                      }} style={{ marginRight: '0.3rem', borderRadius: '4px', border: 'none', padding: '0.3rem 1rem', background: '#fff', color: cores[status], fontWeight: 'bold' }}>
                        <option value="NOVO">Novo</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="CORRIGIR">Corrigir</option>
                        <option value="SUSPENSO">Suspenso</option>
                        <option value="EXCLUIR">Excluir</option>
                      </select>
                    </div>
                    <Link
                      to={`/cliente/${cliente._id}`}
                      style={{ background: 'none', color: '#fff', padding: '0.3rem 1rem', border: 'none', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Ver detalhes"
                      onClick={() => {
                        // Salva cliente selecionado no localStorage ao clicar
                        localStorage.setItem('clienteSelecionado', JSON.stringify({
                          id: cliente.id || cliente._id,
                          razaoSocial: cliente.razaoSocial,
                          cnpj: cliente.cnpj
                        }));
                      }}
                    >
                      →
                    </Link>
                  </div>
                </div>
                );
              })}
            </>
          )}
        </div>
      ))}
    </div>
  );
};
export default ListaClientes;
