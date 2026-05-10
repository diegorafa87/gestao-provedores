import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';
import { getAcompanhamento, saveAcompanhamento } from '../services/acompanhamento';

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {};
    MESES.forEach(mes => {
      data[ano][mes] = {
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

function ComprovanteSTFCDownload({ ano, mes, mesNumero, razaoSocial, link, onSaveLink, disabled }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const hasLink = Boolean(link && link.trim());
  const tokenRazaoSocial = normalizarToken(razaoSocial) || 'SEM_RAZAO_SOCIAL';
  const tokenMes = normalizarToken(mes) || 'MES';
  const nomeComprovante = `STFC_${tokenRazaoSocial}_${ano}_${tokenMes}(${mesNumero})`;

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
        <IconDownload color={hasLink ? '#43a047' : '#1976d2'} title={hasLink ? 'Baixar comprovante PDF' : 'Inserir link do PDF'} />
      </button>

      <span style={{ fontSize: 15, color: '#1976d2', minWidth: 140 }}>
        {nomeComprovante}
      </span>

      {editando && !hasLink && (
        <>
          <input
            type="text"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Cole o link do PDF"
            style={{ width: 260, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
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

export default function AcompanhamentoSTFC({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    setLoading(true);
    getAcompanhamento('STFC', cnpj)
      .then(res => {
        const base = initialData();
        if (res.checks) {
          ANOS.forEach(ano => {
            if (res.checks[ano]) {
              MESES.forEach(mes => {
                if (res.checks[ano][mes] !== undefined) base[ano][mes].checked = res.checks[ano][mes];
              });
            }
          });
        }
        if (res.links) {
          ANOS.forEach(ano => {
            if (res.links[ano]) {
              MESES.forEach(mes => {
                if (res.links[ano][mes] !== undefined) base[ano][mes].link = res.links[ano][mes];
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
  const chaveDesligados = cnpj ? `anosDesligados_STFC_${cnpj}` : 'anosDesligados_STFC';
  const chaveOcultos = cnpj ? `anosOcultos_STFC_${cnpj}` : 'anosOcultos_STFC';
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

  // Checa se todos os meses do ano estão marcados
  const todosMesesChecados = ano => MESES.every(mes => dados[ano][mes].checked);

  // Marcar/desmarcar todos os meses de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosMesesChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      MESES.forEach(mes => {
        novo[ano][mes] = { ...novo[ano][mes], checked: marcar };
      });
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Marcar/desmarcar mês individual
  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], checked: !novo[ano][mes].checked } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  const handleLinkChange = (ano, mes, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], link: value } };
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
      MESES.forEach(mes => {
        checksToSave[ano][mes] = novoDados[ano][mes].checked;
        linksToSave[ano][mes] = novoDados[ano][mes].link;
      });
    });
    if (cnpj) {
      saveAcompanhamento('STFC', cnpj, { checks: checksToSave, links: linksToSave });
    }
  }

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de STFC.</div>;
  }
  if (loading) {
    return <div>Carregando dados do acompanhamento...</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento STFC</h2>
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
          border: `2px solid ${todosMesesChecados(ano) ? '#43a047' : '#1976d2'}`,
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
              checked={todosMesesChecados(ano)}
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
              {MESES.map((mes, idx) => (
                <div key={mes} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][mes].checked ? '#43a047' : undefined }}>{mes}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][mes].checked}
                      onChange={() => handleCheck(ano, mes)}
                      disabled={anosDesligados[ano] || salvando}
                    />{' '}
                           <span style={{ color: dados[ano][mes].checked ? '#43a047' : undefined }}>Comprovante</span>
                  </label>
                  <ComprovanteSTFCDownload
                    ano={ano}
                    mes={mes}
                    mesNumero={idx + 1}
                    razaoSocial={razaoSocial}
                    link={dados[ano][mes].link}
                    onSaveLink={url => handleLinkChange(ano, mes, url)}
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
