
import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';

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

export default function AcompanhamentoInfra({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_INFRA_${cnpj}` : 'checks_INFRA';
  const chaveLinks = cnpj ? `links_INFRA_${cnpj}` : 'links_INFRA';
  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    const salvoLinks = localStorage.getItem(chaveLinks);
    const base = initialData();
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      ANOS.forEach(ano => {
        if (checksSalvos[ano]) {
          ITENS.forEach(item => {
            if (checksSalvos[ano][item] !== undefined) base[ano][item].checked = checksSalvos[ano][item];
          });
        }
      });
    }
    if (salvoLinks) {
      const linksSalvos = JSON.parse(salvoLinks);
      ANOS.forEach(ano => {
        if (linksSalvos[ano]) {
          ITENS.forEach(item => {
            if (linksSalvos[ano][item] !== undefined) base[ano][item].link = linksSalvos[ano][item];
          });
        }
      });
    }
    return base;
  });

  // Estados para anos desligados e ocultos
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

  // Atualiza localStorage ao mudar anosDesligados/anosOcultos
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
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        ITENS.forEach(i => { checksToSave[a][i] = novo[a][i].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  // Marcar/desmarcar item individual
  const handleCheck = (ano, item) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [item]: { ...novo[ano][item], checked: !novo[ano][item].checked } };
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        ITENS.forEach(i => { checksToSave[a][i] = novo[a][i].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleLinkChange = (ano, item, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [item]: { ...novo[ano][item], link: value } };
      // Salva no localStorage
      const linksToSave = {};
      ANOS.forEach(a => {
        linksToSave[a] = {};
        ITENS.forEach(i => { linksToSave[a][i] = novo[a][i].link; });
      });
      localStorage.setItem(chaveLinks, JSON.stringify(linksToSave));
      return novo;
    });
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de Infra.</div>;
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
              {ITENS.map(item => (
                <div key={item} style={{ marginBottom: 18, borderBottom: '1px solid #e3e3e3', paddingBottom: 10 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2, color: dados[ano][item].checked ? '#43a047' : undefined }}>{item}</div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][item].checked}
                      onChange={() => handleCheck(ano, item)}
                      disabled={anosDesligados[ano]}
                    />{' '}
                    Comprovante Infraestrutura ({item})
                  </label>
                  <input
                    type="text"
                    value={dados[ano][item].link}
                    onChange={e => handleLinkChange(ano, item, e.target.value)}
                    placeholder="Comprovante (link Cloudflare)"
                    style={{ width: 400, maxWidth: '100%' }}
                    disabled={anosDesligados[ano]}
                  />
                  {dados[ano][item].link && (
                    <a
                      href={dados[ano][item].link}
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

