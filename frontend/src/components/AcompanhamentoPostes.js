

import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';

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

export default function AcompanhamentoPostes({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_POSTES_${cnpj}` : 'checks_POSTES';
  const chaveLinks = cnpj ? `links_POSTES_${cnpj}` : 'links_POSTES';
  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    const salvoLinks = localStorage.getItem(chaveLinks);
    const base = initialData();
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      ANOS.forEach(ano => {
        if (checksSalvos[ano]) {
          CAMPOS.forEach(campo => {
            if (checksSalvos[ano][campo] !== undefined) base[ano][campo].checked = checksSalvos[ano][campo];
          });
        }
      });
    }
    if (salvoLinks) {
      const linksSalvos = JSON.parse(salvoLinks);
      ANOS.forEach(ano => {
        if (linksSalvos[ano]) {
          CAMPOS.forEach(campo => {
            if (linksSalvos[ano][campo] !== undefined) base[ano][campo].link = linksSalvos[ano][campo];
          });
        }
      });
    }
    return base;
  });

  // Estados para anos desligados e ocultos
  const chaveDesligados = cnpj ? `anosDesligados_POSTES_${cnpj}` : 'anosDesligados_POSTES';
  const chaveOcultos = cnpj ? `anosOcultos_POSTES_${cnpj}` : 'anosOcultos_POSTES';
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
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        CAMPOS.forEach(c => { checksToSave[a][c] = novo[a][c].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  // Marcar/desmarcar campo individual
  const handleCheck = (ano, campo) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [campo]: { ...novo[ano][campo], checked: !novo[ano][campo].checked } };
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => {
        checksToSave[a] = {};
        CAMPOS.forEach(c => { checksToSave[a][c] = novo[a][c].checked; });
      });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleLinkChange = (ano, campo, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [campo]: { ...novo[ano][campo], link: value } };
      // Salva no localStorage
      const linksToSave = {};
      ANOS.forEach(a => {
        linksToSave[a] = {};
        CAMPOS.forEach(c => { linksToSave[a][c] = novo[a][c].link; });
      });
      localStorage.setItem(chaveLinks, JSON.stringify(linksToSave));
      return novo;
    });
  };

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
                  <input
                    type="text"
                    value={dados[ano][campo].link}
                    onChange={e => handleLinkChange(ano, campo, e.target.value)}
                    placeholder="Comprovante (link Cloudflare)"
                    style={{ width: 400, maxWidth: '100%' }}
                    disabled={anosDesligados[ano]}
                  />
                  {dados[ano][campo].link && (
                    <a
                      href={dados[ano][campo].link}
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
