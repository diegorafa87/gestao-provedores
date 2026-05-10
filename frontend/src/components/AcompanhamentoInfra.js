
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

function ComprovanteInfraDownload({ item, link, onSaveLink, disabled }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const hasLink = Boolean(link && link.trim());

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
      anchor.download = `comprovante-infra-${item.toLowerCase().replace(/\s+/g, '-')}.pdf`;
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
        Comprovante Infraestrutura ({item})
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
  const [dados, setDados] = useState(initialData());
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

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
  const chaveDesligados = cnpj ? `anosDesligados_INFRA_${cnpj}` : 'anosDesligados_INFRA';
  const chaveOcultos = cnpj ? `anosOcultos_INFRA_${cnpj}` : 'anosOcultos_INFRA';
  const [anosDesligados, setAnosDesligados] = useState(() => {
    const salvo = localStorage.getItem(chaveDesligados);
    return salvo ? JSON.parse(salvo) : {};
  });
  const [anosOcultos, setAnosOcultos] = useState(() => {
    const salvo = localStorage.getItem(chaveOcultos);
    return salvo ? JSON.parse(salvo) : {};
  });
  useEffect(() => {
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosDesligados, anosOcultos]);

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
                    item={item}
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
      {erro && <div style={{ color: 'red', marginTop: 16 }}>{erro}</div>}
      {salvando && <div style={{ color: '#1976d2', marginTop: 8 }}>Salvando alterações...</div>}
    </div>
  );
}

