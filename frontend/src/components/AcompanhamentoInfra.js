
import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';
import { getAcompanhamento, saveAcompanhamento } from '../services/acompanhamento';

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];
const ITENS = ['Estações', 'Enlaces Próprios', 'Enlaces Contratados'];

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {};
    ITENS.forEach(item => {
      data[ano][item] = {
        checked: false,
        link: ''
      };
    });
  });
  return data;
}

function normalizarToken(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function prefixoComprovanteInfra(item) {
  if (item === 'Estações') return 'ESTACOES';
  if (item === 'Enlaces Próprios') return 'ENL_PROPRIOS';
  if (item === 'Enlaces Contratados') return 'ENL_CONTR';
  return 'INFRA';
}

function extrairAnoDoNomeCSV(nomeArquivo = '') {
  const nome = String(nomeArquivo || '');
  const todosAnos = nome.match(/(19|20)\d{2}/g);
  if (!todosAnos || todosAnos.length === 0) return null;
  return Number(todosAnos[todosAnos.length - 1]);
}

function inferirItemInfraPorNomeCSV(nomeArquivo = '') {
  const nome = String(nomeArquivo || '').toUpperCase();
  if (nome.includes('ESTAC') || nome.includes('ESTACOES')) return 'Estações';
  if (nome.includes('PROPRI') || nome.includes('ENL_PROPRIOS')) return 'Enlaces Próprios';
  if (nome.includes('CONTRAT') || nome.includes('ENL_CONTR')) return 'Enlaces Contratados';
  return 'Estações';
}

function ComprovanteInfraDownload({ ano, item, razaoSocial, link, onSaveLink, disabled }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const hasLink = Boolean(link && link.trim());
  const tokenRazaoSocial = normalizarToken(razaoSocial) || 'SEM_RAZAO_SOCIAL';
  const nomeComprovante = `${prefixoComprovanteInfra(item)}_${tokenRazaoSocial}_${ano}`;

  useEffect(() => {
    if (!hasLink) {
      setValor('');
    }
  }, [hasLink]);

  const baixarPdf = () => {
    try {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = `${nomeComprovante}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleArrowClick = () => {
    if (disabled) return;
    if (!hasLink) {
      setEditando(true);
      return;
    }
    baixarPdf();
  };

  const handleSalvar = () => {
    const url = valor.trim();
    if (!url) return;
    onSaveLink(url);
    setEditando(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={handleArrowClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center'
        }}
        title={hasLink ? 'Baixar comprovante PDF' : 'Inserir link do PDF'}
        disabled={disabled}
      >
        <IconDownload size={22} color={hasLink ? '#43a047' : '#1976d2'} title={hasLink ? 'Baixar comprovante PDF' : 'Inserir link do PDF'} />
      </button>

      <span style={{ fontSize: 15, color: '#1976d2', minWidth: 220 }}>
        {nomeComprovante}
      </span>

      {editando && !hasLink && (
        <>
          <input
            type="text"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Cole o link do PDF"
            style={{ width: 280, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSalvar();
            }}
            disabled={disabled}
          />
          <button
            onClick={handleSalvar}
            style={{ marginLeft: 4, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            disabled={disabled}
          >
            Salvar
          </button>
          <button
            onClick={() => {
              setEditando(false);
              setValor('');
            }}
            style={{ marginLeft: 2, background: '#eee', color: '#1976d2', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            disabled={disabled}
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}

export default function AcompanhamentoInfra({ cnpj, razaoSocial }) {
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const role = String(authUser?.role || localStorage.getItem('roleUsuario') || '').trim().toUpperCase();
  const email = String(authUser?.email || localStorage.getItem('emailUsuario') || '').trim().toLowerCase();
  const isAdmin = role !== 'NETO' || email === 'diegorafa87@gmail.com';

  const [dados, setDados] = useState(initialData());
  const [historicoArquivosInfra, setHistoricoArquivosInfra] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carregar histórico de CSV INFRA (Estações) salvo por cliente
  useEffect(() => {
    const cnpjLimpo = (cnpj || '').replace(/\D/g, '');
    const chaveHistorico = cnpjLimpo ? `historicoCsvEstacoes_${cnpjLimpo}` : 'historicoCsvEstacoes_semcnpj';

    const carregarHistorico = () => {
      try {
        const salvo = localStorage.getItem(chaveHistorico);
        setHistoricoArquivosInfra(salvo ? JSON.parse(salvo) : []);
      } catch {
        setHistoricoArquivosInfra([]);
      }
    };

    carregarHistorico();
    window.addEventListener('storage', carregarHistorico);
    return () => window.removeEventListener('storage', carregarHistorico);
  }, [cnpj]);

  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    setLoading(true);
    getAcompanhamento('INFRA', cnpj)
      .then(res => {
        const base = initialData();
        if (res.checks) {
          ANOS.forEach(ano => {
            if (res.checks[ano]) {
              ITENS.forEach(item => {
                if (res.checks[ano][item] !== undefined) base[ano][item].checked = res.checks[ano][item];
              });
            }
          });
        }
        if (res.links) {
          ANOS.forEach(ano => {
            if (res.links[ano]) {
              ITENS.forEach(item => {
                if (res.links[ano][item] !== undefined) base[ano][item].link = res.links[ano][item];
              });
            }
          });
        }
        setDados(prev => {
          const igual = JSON.stringify(prev) === JSON.stringify(base);
          if (!igual) {
            return base;
          }
          return prev;
        });
        setErro(null);
      })
      .catch(() => {
        setDados(initialData());
        setErro('Erro ao carregar dados do acompanhamento.');
      })
      .finally(() => setLoading(false));
  }, [cnpj]);

  // Estados para anos desligados e ocultos (mantém local, pois é preferência visual)
  const cnpjChave = (cnpj || '').replace(/\D/g, '');
  const chaveDesligados = cnpjChave ? `anosDesligados_INFRA_${cnpjChave}` : 'anosDesligados_INFRA';
  const chaveOcultos = cnpjChave ? `anosOcultos_INFRA_${cnpjChave}` : 'anosOcultos_INFRA';
  const [anosDesligados, setAnosDesligados] = useState(() => {
    const salvo = localStorage.getItem(chaveDesligados);
    return salvo ? JSON.parse(salvo) : {};
  });
  const [anosOcultos, setAnosOcultos] = useState(() => {
    const salvo = localStorage.getItem(chaveOcultos);
    return salvo ? JSON.parse(salvo) : {};
  });

  // Recarrega estados visuais quando o cliente/chave mudar
  useEffect(() => {
    const desligadosSalvos = localStorage.getItem(chaveDesligados);
    const ocultosSalvos = localStorage.getItem(chaveOcultos);
    setAnosDesligados(desligadosSalvos ? JSON.parse(desligadosSalvos) : {});
    setAnosOcultos(ocultosSalvos ? JSON.parse(ocultosSalvos) : {});
  }, [chaveDesligados, chaveOcultos]);

  useEffect(() => {
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosDesligados, anosOcultos, chaveDesligados, chaveOcultos]);

  // Checa se todos os itens do ano estão marcados
  const todosItensChecados = ano => ITENS.every(item => dados[ano][item].checked);

  // Marcar/desmarcar todos os itens de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosItensChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      ITENS.forEach(item => {
        novo[ano][item] = { ...novo[ano][item], checked: marcar };
      });
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Marcar/desmarcar item individual
  const handleCheck = (ano, item) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [item]: { ...novo[ano][item], checked: !novo[ano][item].checked } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  const handleLinkChange = (ano, item, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [item]: { ...novo[ano][item], link: value } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Função para salvar no backend
  function salvarChecksLinks(novoDados) {
    const checksToSave = {};
    const linksToSave = {};
    ANOS.forEach(ano => {
      checksToSave[ano] = {};
      linksToSave[ano] = {};
      ITENS.forEach(item => {
        checksToSave[ano][item] = novoDados[ano][item].checked;
        linksToSave[ano][item] = novoDados[ano][item].link;
      });
    });
    if (cnpj) {
      saveAcompanhamento('INFRA', cnpj, { checks: checksToSave, links: linksToSave });
    }
  }

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de Infra.</div>;
  }
  if (loading) {
    return <div>Carregando dados do acompanhamento...</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento Infra</h2>
      {todosOcultos && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <button
            onClick={() => setAnosOcultos({})}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 24px',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0001'
            }}
          >
            Desocultar todos os anos
          </button>
        </div>
      )}
      {[...ANOS].sort((a, b) => b - a).map(ano => (
        <div key={ano} style={{
          border: `2px solid ${todosItensChecados(ano) ? '#43a047' : '#1976d2'}`,
          borderRadius: 10,
          marginBottom: 32,
          background: anosDesligados[ano] ? '#f5f5f5' : '#f7faff',
          boxShadow: '0 2px 8px #0001',
          padding: 20,
          opacity: anosDesligados[ano] ? 0.5 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={todosItensChecados(ano)}
              onChange={() => handleCheckAno(ano)}
              style={{ marginRight: 10, width: 20, height: 20 }}
              disabled={anosDesligados[ano] || salvando}
            />
            <span style={{ fontWeight: 'bold', fontSize: 18, color: '#1976d2', flex: 1 }}>Ano: {ano}</span>
            <button
              onClick={() => setAnosDesligados(prev => ({ ...prev, [ano]: !prev[ano] }))}
              title={anosDesligados[ano] ? 'Ligar ano' : 'Desligar ano'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }}
            >
              {anosDesligados[ano] ? <IconPowerOn color="#1976d2" /> : <IconPower color="#1976d2" />}
            </button>
            <button
              onClick={() => setAnosOcultos(prev => ({ ...prev, [ano]: !prev[ano] }))}
              title={anosOcultos[ano] ? 'Exibir ano' : 'Ocultar ano'}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {anosOcultos[ano] ? <IconEyeOff color="#1976d2" /> : <IconEye color="#1976d2" />}
            </button>
          </div>
          {!anosOcultos[ano] && (
            <React.Fragment>
              {ITENS.map(item => (
                <div key={item} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][item].checked ? '#43a047' : undefined }}>{item}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][item].checked}
                      onChange={() => handleCheck(ano, item)}
                      disabled={anosDesligados[ano] || salvando}
                    />{' '}
                    Comprovante Infraestrutura ({item})
                  </label>
                  <ComprovanteInfraDownload
                    ano={ano}
                    item={item}
                    razaoSocial={razaoSocial}
                    link={dados[ano][item].link}
                    onSaveLink={url => handleLinkChange(ano, item, url)}
                    disabled={anosDesligados[ano] || salvando}
                  />
                </div>
              ))}
            </React.Fragment>
          )}
        </div>
      ))}

      {/* Histórico de arquivos CSV INFRA */}
      <div style={{ marginTop: 40 }}>
        <h3>Histórico de arquivos CSV INFRA</h3>
        {historicoArquivosInfra.length === 0 ? (
          <div style={{ color: '#888' }}>Nenhum arquivo CSV gerado ainda.</div>
        ) : (
          <table style={{ width: '100%', background: '#f4f4f4', borderRadius: 6, padding: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Nome do Arquivo</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Data</th>
                <th style={{ textAlign: 'center', padding: '4px 8px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historicoArquivosInfra.map((item, idx) => (
                <tr key={idx} style={{ background: idx % 2 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '4px 8px' }}>{item?.nome || 'infra.csv'}</td>
                  <td style={{ padding: '4px 8px' }}>{item?.data || '-'}</td>
                  <td style={{ textAlign: 'center', padding: '4px 8px', display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button
                      onClick={() => {
                        const BOM = '\uFEFF';
                        const conteudo = item?.conteudo || '';
                        const blob = new Blob([BOM + conteudo], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute('download', item?.nome || 'infra.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      title="Baixar arquivo"
                      aria-label="Baixar arquivo"
                    >
                      <span role="img" aria-label="download">⬇️</span>
                    </button>
                    {(() => {
                      const nomeArquivo = item?.nome || 'infra.csv';
                      const ano = extrairAnoDoNomeCSV(nomeArquivo);
                      const itemInfra = inferirItemInfraPorNomeCSV(nomeArquivo);
                      const linkPdf = (Number.isInteger(ano) && itemInfra) ? dados?.[ano]?.[itemInfra]?.link : '';
                      const temComprovante = Boolean(linkPdf && String(linkPdf).trim());
                      const podeVerSetaComprovante = isAdmin || temComprovante;

                      if (!podeVerSetaComprovante) return null;

                      return (
                        <button
                          onClick={() => {
                            if (!Number.isInteger(ano)) {
                              alert('Não foi possível identificar o ano no nome do CSV para localizar o comprovante PDF.');
                              return;
                            }

                            if (!linkPdf || !String(linkPdf).trim()) {
                              alert('Comprovante PDF não encontrado para este CSV.');
                              return;
                            }

                            try {
                              const anchor = document.createElement('a');
                              anchor.href = linkPdf;
                              anchor.target = '_blank';
                              anchor.rel = 'noopener noreferrer';
                              anchor.download = `COMP_${nomeArquivo.replace(/\.csv$/i, '')}.pdf`;
                              document.body.appendChild(anchor);
                              anchor.click();
                              document.body.removeChild(anchor);
                            } catch {
                              window.open(linkPdf, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                          title="Baixar comprovante PDF"
                          aria-label="Baixar comprovante PDF"
                        >
                          <IconDownload size={20} color={temComprovante ? '#43a047' : '#1976d2'} />
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {erro && <div style={{ color: 'red', marginTop: 16 }}>{erro}</div>}
      {salvando && <div style={{ color: '#1976d2', marginTop: 8 }}>Salvando alterações...</div>}
    </div>
  );
}

