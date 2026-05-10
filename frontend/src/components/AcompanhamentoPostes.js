

import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';
import { getAcompanhamento, saveAcompanhamento } from '../services/acompanhamento';

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];
const CAMPOS = ['Contrato processado na Coleta Anatel'];

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {};
    CAMPOS.forEach(campo => {
      data[ano][campo] = {
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

function ComprovantePostesDownload({ ano, razaoSocial, link, onSaveLink, disabled }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const hasLink = Boolean(link && link.trim());
  const tokenRazaoSocial = normalizarToken(razaoSocial) || 'SEM_RAZAO_SOCIAL';
  const nomeComprovante = `POSTES_${tokenRazaoSocial}_${ano}`;

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

      <span style={{ fontSize: 15, color: '#1976d2', minWidth: 240 }}>
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

export default function AcompanhamentoPostes({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());
  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    getAcompanhamento('POSTES', cnpj)
      .then(res => {
        const base = initialData();
        if (res.checks) {
          ANOS.forEach(ano => {
            if (res.checks[ano]) {
              CAMPOS.forEach(campo => {
                if (res.checks[ano][campo] !== undefined) base[ano][campo].checked = res.checks[ano][campo];
              });
            }
          });
        }
        if (res.links) {
          ANOS.forEach(ano => {
            if (res.links[ano]) {
              CAMPOS.forEach(campo => {
                if (res.links[ano][campo] !== undefined) base[ano][campo].link = res.links[ano][campo];
              });
            }
          });
        }
        // Só atualiza se for diferente do estado atual
        setDados(prev => {
          const igual = JSON.stringify(prev) === JSON.stringify(base);
          if (!igual) {
            // Log para depuração
            console.log('Atualizando dados do backend POSTES', base);
            return base;
          }
          return prev;
        });
      })
      .catch(() => setDados(initialData()));
  }, [cnpj]);

  // Estados para anos desligados e ocultos
  const chaveDesligados = cnpj ? `anosDesligados_POSTES_${cnpj}` : 'anosDesligados_POSTES';
  const chaveOcultos = cnpj ? `anosOcultos_POSTES_${cnpj}` : 'anosOcultos_POSTES';
  const [anosDesligados, setAnosDesligados] = useState(() => {
    const salvo = localStorage.getItem(chaveDesligados);
    return salvo ? JSON.parse(salvo) : {};
  });

  // Sempre recarrega anosDesligados do localStorage ao montar
  useEffect(() => {
    const salvo = localStorage.getItem(chaveDesligados);
    if (salvo) setAnosDesligados(JSON.parse(salvo));
  }, [chaveDesligados]);
  const [anosOcultos, setAnosOcultos] = useState(() => {
    const salvo = localStorage.getItem(chaveOcultos);
    return salvo ? JSON.parse(salvo) : {};
  });

  useEffect(() => {
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
  }, [anosDesligados, chaveDesligados]);

  useEffect(() => {
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosOcultos, chaveOcultos]);

  // Checa se todos os campos do ano estão marcados
  const todosCamposChecados = ano => CAMPOS.every(campo => dados[ano][campo].checked);

  // Marcar/desmarcar todos os campos de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosCamposChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      CAMPOS.forEach(campo => {
        novo[ano][campo] = { ...novo[ano][campo], checked: marcar };
      });
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Marcar/desmarcar campo individual
  const handleCheck = (ano, campo) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [campo]: { ...novo[ano][campo], checked: !novo[ano][campo].checked } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  const handleLinkChange = (ano, campo, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [campo]: { ...novo[ano][campo], link: value } };
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
      CAMPOS.forEach(campo => {
        checksToSave[ano][campo] = novoDados[ano][campo].checked;
        linksToSave[ano][campo] = novoDados[ano][campo].link;
      });
    });
    if (cnpj) {
      // Log para depuração
      console.log('Salvando no backend POSTES', { checks: checksToSave, links: linksToSave });
      saveAcompanhamento('POSTES', cnpj, { checks: checksToSave, links: linksToSave });
    }
  }

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de Postes.</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento de Postes</h2>
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
          border: `2px solid ${todosCamposChecados(ano) ? '#43a047' : '#1976d2'}`,
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
              checked={todosCamposChecados(ano)}
              onChange={() => handleCheckAno(ano)}
              style={{ marginRight: 10, width: 20, height: 20 }}
              disabled={anosDesligados[ano]}
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
            <>
              {CAMPOS.map(campo => (
                <div key={campo} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][campo].checked ? '#43a047' : undefined }}>{campo}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][campo].checked}
                      onChange={() => handleCheck(ano, campo)}
                      disabled={anosDesligados[ano]}
                    />{' '}
                    {campo}
                  </label>
                  <ComprovantePostesDownload
                    ano={ano}
                    razaoSocial={razaoSocial}
                    link={dados[ano][campo].link}
                    onSaveLink={url => handleLinkChange(ano, campo, url)}
                    disabled={anosDesligados[ano]}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
