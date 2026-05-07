
import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';
import { getAcompanhamento, saveAcompanhamento } from '../services/acompanhamento';

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];
const SEMESTRES = ['Primeiro Semestre', 'Segundo Semestre'];

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {};
    SEMESTRES.forEach(semestre => {
      data[ano][semestre] = {
        checked: false,
        link: ''
      };
    });
  });
  return data;
}

export default function AcompanhamentoRelatorioEconomico({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    setLoading(true);
    getAcompanhamento('REL_ECON', cnpj)
      .then(res => {
        const base = initialData();
        if (res.checks) {
          ANOS.forEach(ano => {
            if (res.checks[ano]) {
              SEMESTRES.forEach(semestre => {
                if (res.checks[ano][semestre] !== undefined) base[ano][semestre].checked = res.checks[ano][semestre];
              });
            }
          });
        }
        if (res.links) {
          ANOS.forEach(ano => {
            if (res.links[ano]) {
              SEMESTRES.forEach(semestre => {
                if (res.links[ano][semestre] !== undefined) base[ano][semestre].link = res.links[ano][semestre];
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
  const chaveDesligados = cnpj ? `anosDesligados_REL_ECON_${cnpj}` : 'anosDesligados_REL_ECON';
  const chaveOcultos = cnpj ? `anosOcultos_REL_ECON_${cnpj}` : 'anosOcultos_REL_ECON';
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

  // Checa se todos os semestres do ano estão marcados
  const todosSemestresChecados = ano => SEMESTRES.every(semestre => dados[ano][semestre].checked);

  // Marcar/desmarcar todos os semestres de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosSemestresChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      SEMESTRES.forEach(semestre => {
        novo[ano][semestre] = { ...novo[ano][semestre], checked: marcar };
      });
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Marcar/desmarcar semestre individual
  const handleCheck = (ano, semestre) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [semestre]: { ...novo[ano][semestre], checked: !novo[ano][semestre].checked } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  const handleLinkChange = (ano, semestre, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [semestre]: { ...novo[ano][semestre], link: value } };
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
      SEMESTRES.forEach(semestre => {
        checksToSave[ano][semestre] = novoDados[ano][semestre].checked;
        linksToSave[ano][semestre] = novoDados[ano][semestre].link;
      });
    });
    if (cnpj) {
      saveAcompanhamento('REL_ECON', cnpj, { checks: checksToSave, links: linksToSave });
    }
  }

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados do Relatório Econômico.</div>;
  }
  if (loading) {
    return <div>Carregando dados do acompanhamento...</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento Relatório Econômico</h2>
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
          border: `2px solid ${todosSemestresChecados(ano) ? '#43a047' : '#1976d2'}`,
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
              checked={todosSemestresChecados(ano)}
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
              {SEMESTRES.map(semestre => (
                <div key={semestre} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][semestre].checked ? '#43a047' : undefined }}>{semestre}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][semestre].checked}
                      onChange={() => handleCheck(ano, semestre)}
                      disabled={anosDesligados[ano] || salvando}
                    />{' '}
                    Comprovante Relatório Econômico ({semestre})
                  </label>
                  <input
                    type="text"
                    value={dados[ano][semestre].link}
                    onChange={e => handleLinkChange(ano, semestre, e.target.value)}
                    placeholder="Comprovante (link Cloudflare)"
                    style={{ width: 400, maxWidth: '100%' }}
                    disabled={anosDesligados[ano] || salvando}
                  />
                  {dados[ano][semestre].link && (
                    <a
                      href={dados[ano][semestre].link}
                      download
                      style={{ marginLeft: 8, fontSize: 18, verticalAlign: 'middle', display: 'inline-block' }}
                      title="Baixar comprovante"
                    >
                      <IconDownload size={22} color="#1976d2" />
                    </a>
                  )}
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
