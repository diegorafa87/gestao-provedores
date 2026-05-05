

import React, { useState, useEffect } from 'react';

const ANOS = [2021, 2022, 2023, 2024];
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



export default function AcompanhamentoTVpA({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_TVPA_${cnpj}` : 'checks_TVPA';
  const chaveLinks = cnpj ? `links_TVPA_${cnpj}` : 'links_TVPA';
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

  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], checked: !novo[ano][mes].checked } };
      // Salva no localStorage
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
      // Salva no localStorage
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
    return <div>Selecione um cliente para visualizar os dados de TVpA.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento de TVpA</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 6, width: 60 }}>Ano</th>
            <th style={{ border: '1px solid #ccc', padding: 6 }}>Meses</th>
          </tr>
        </thead>
        <tbody>
          {ANOS.map(ano => (
            <tr key={ano}>
              <td style={{ border: '1px solid #ccc', padding: 6, fontWeight: 'bold', verticalAlign: 'top' }}>{ano}</td>
              <td style={{ border: '1px solid #ccc', padding: 6 }}>
                {MESES.map(mes => (
                  <div key={mes} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{mes}</div>
                    <label style={{ display: 'block', marginBottom: 4 }}>
                      <input
                        type="checkbox"
                        checked={dados[ano][mes].checked}
                        onChange={() => handleCheck(ano, mes)}
                      />{' '}
                      Conformidade
                    </label>
                    <input
                      type="text"
                      value={dados[ano][mes].link}
                      onChange={e => handleLinkChange(ano, mes, e.target.value)}
                      placeholder="Comprovante (link Cloudflare)"
                      style={{ width: 220 }}
                    />
                    {dados[ano][mes].link && (
                      <a href={dados[ano][mes].link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>
                        Visualizar
                      </a>
                    )}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}