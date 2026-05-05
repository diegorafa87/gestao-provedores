import API_URL from '../services/api';
import React, { useState, useEffect } from 'react';
import { IconEye, IconEyeOff, IconPower, IconPowerOn } from './IconsAcompanhamento';

const ANOS = [2026, 2025, 2024, 2023, 2022, 2021];
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

function AcompanhamentoSTFC({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_STFC_${cnpj}` : 'checks_STFC';
  const chaveLinks = cnpj ? `links_STFC_${cnpj}` : 'links_STFC';
  const chaveDesligados = cnpj ? `anosDesligados_STFC_${cnpj}` : 'anosDesligados_STFC';
  const chaveOcultos = cnpj ? `anosOcultos_STFC_${cnpj}` : 'anosOcultos_STFC';

  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    const salvoLinks = localStorage.getItem(chaveLinks);
    const base = initialData();
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      ANOS.forEach(ano => {
        if (checksSalvos[ano]) {
          MESES.forEach(mes => {
            if (checksSalvos[ano][mes] !== undefined) base[ano][mes].checked = checksSalvos[ano][mes];
          });
        }
      });
    }
    if (salvoLinks) {
      const linksSalvos = JSON.parse(salvoLinks);
      ANOS.forEach(ano => {
        if (linksSalvos[ano]) {
          MESES.forEach(mes => {
            if (linksSalvos[ano][mes] !== undefined) base[ano][mes].link = linksSalvos[ano][mes];
          });
        }
      });
    }
    return base;
  });

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

  const todosMesesChecados = ano => MESES.every(mes => dados[ano][mes].checked);

  const handleCheckAno = (ano) => {
    const marcar = !todosMesesChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      MESES.forEach(mes => {
        novo[ano][mes] = { ...novo[ano][mes], checked: marcar };
      });
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        MESES.forEach(m => { checksToSave[a][m] = novo[a][m].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], checked: !novo[ano][mes].checked } };
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        MESES.forEach(m => { checksToSave[a][m] = novo[a][m].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleLinkChange = (ano, mes, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], link: value } };
      const linksToSave = {};
      ANOS.forEach(a => {
        linksToSave[a] = {};
        MESES.forEach(m => { linksToSave[a][m] = novo[a][m].link; });
      });
      localStorage.setItem(chaveLinks, JSON.stringify(linksToSave));
      return novo;
    });
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de STFC.</div>;
  }

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
              {MESES.map(mes => (
                <div key={mes} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][mes].checked ? '#43a047' : undefined }}>{mes}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][mes].checked}
                      onChange={() => handleCheck(ano, mes)}
                      disabled={anosDesligados[ano]}
                    />{' '}
                    Comprovante Coleta STFC ({mes})
                  </label>
                  <input
                    type="text"
                    value={dados[ano][mes].link}
                    onChange={e => handleLinkChange(ano, mes, e.target.value)}
                    placeholder="Comprovante (link Cloudflare)"
                    style={{ width: 400, maxWidth: '100%' }}
                    disabled={anosDesligados[ano]}
                  />
                  {dados[ano][mes].link && (
                    <a href={dados[ano][mes].link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>
                      Visualizar
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

export default AcompanhamentoSTFC;
