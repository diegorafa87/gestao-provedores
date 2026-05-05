
import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';

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
  const chaveChecks = cnpj ? `checks_REL_ECON_${cnpj}` : 'checks_REL_ECON';
  const chaveLinks = cnpj ? `links_REL_ECON_${cnpj}` : 'links_REL_ECON';
  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    const salvoLinks = localStorage.getItem(chaveLinks);
    const base = initialData();
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      ANOS.forEach(ano => {
        if (checksSalvos[ano]) {
          SEMESTRES.forEach(semestre => {
            if (checksSalvos[ano][semestre] !== undefined) base[ano][semestre].checked = checksSalvos[ano][semestre];
          });
        }
      });
    }
    if (salvoLinks) {
      const linksSalvos = JSON.parse(salvoLinks);
      ANOS.forEach(ano => {
        if (linksSalvos[ano]) {
          SEMESTRES.forEach(semestre => {
            if (linksSalvos[ano][semestre] !== undefined) base[ano][semestre].link = linksSalvos[ano][semestre];
          });
        }
      });
    }
    return base;
  });

  // Estados para anos desligados e ocultos
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

  // Atualiza localStorage ao mudar anosDesligados/anosOcultos
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
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        SEMESTRES.forEach(s => { checksToSave[a][s] = novo[a][s].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  // Marcar/desmarcar semestre individual
  const handleCheck = (ano, semestre) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [semestre]: { ...novo[ano][semestre], checked: !novo[ano][semestre].checked } };
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        SEMESTRES.forEach(s => { checksToSave[a][s] = novo[a][s].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleLinkChange = (ano, semestre, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [semestre]: { ...novo[ano][semestre], link: value } };
      // Salva no localStorage
      const linksToSave = {};
      ANOS.forEach(a => {
        linksToSave[a] = {};
        SEMESTRES.forEach(s => { linksToSave[a][s] = novo[a][s].link; });
      });
      localStorage.setItem(chaveLinks, JSON.stringify(linksToSave));
      return novo;
    });
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados do Relatório Econômico.</div>;
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
              {SEMESTRES.map(semestre => (
                <div key={semestre} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][semestre].checked ? '#43a047' : undefined }}>{semestre}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][semestre].checked}
                      onChange={() => handleCheck(ano, semestre)}
                      disabled={anosDesligados[ano]}
                    />{' '}
                    Comprovante Relatório Econômico ({semestre})
                  </label>
                  <input
                    type="text"
                    value={dados[ano][semestre].link}
                    onChange={e => handleLinkChange(ano, semestre, e.target.value)}
                    placeholder="Comprovante (link Cloudflare)"
                    style={{ width: 400, maxWidth: '100%' }}
                    disabled={anosDesligados[ano]}
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
            </>
          )}
        </div>
      ))}
    </div>
  );
}
