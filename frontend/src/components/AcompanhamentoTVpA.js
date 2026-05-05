
import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '';
const ANOS = [2021, 2022, 2023, 2024];
const CHECKS = [
  'Contrato vigente',
  'Relatório anual enviado',
  'Comprovante de pagamento',
  'Projeto atualizado',
  'Licença ambiental',
];
const chaveChecks = 'checks_tvpa';
const chaveLinks = 'links_tvpa';

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {
      checks: CHECKS.map(() => false),
      link: '',
    };
  });
  return data;
}


export default function AcompanhamentoTVpA({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());

  useEffect(() => {
    const salvo = localStorage.getItem(chaveChecks);
    const salvoLinks = localStorage.getItem(chaveLinks);
    if (salvo || salvoLinks) {
      setDados(prev => {
        const base = initialData();
        if (salvo) {
          const checksSalvos = JSON.parse(salvo);
          ANOS.forEach(ano => {
            if (checksSalvos[ano]) base[ano].checks = checksSalvos[ano];
          });
        }
        if (salvoLinks) {
          const linksSalvos = JSON.parse(salvoLinks);
          ANOS.forEach(ano => {
            if (linksSalvos[ano]) base[ano].link = linksSalvos[ano];
          });
        }
        return base;
      });
    } else {
      setDados(initialData());
    }
  }, [cnpj]);

  const handleCheck = (ano, idx) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano].checks[idx] = !novo[ano].checks[idx];
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => { checksToSave[a] = novo[a].checks; });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return { ...novo };
    });
  };

  const handleLinkChange = (ano, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano].link = value;
      // Salva no localStorage
      const linksToSave = {};
      ANOS.forEach(a => { linksToSave[a] = novo[a].link; });
      localStorage.setItem(chaveLinks, JSON.stringify(linksToSave));
      return { ...novo };
    });
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de TVpA.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento de TVpA</h2>
      {ANOS.map(ano => (
        <div key={ano} style={{ marginBottom: 24, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{ano}</div>
          <div style={{ marginBottom: 8 }}>
            {CHECKS.map((label, idx) => (
              <label key={idx} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={dados[ano].checks[idx]}
                  onChange={() => handleCheck(ano, idx)}
                />{' '}
                {label}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Link do PDF (Cloudflare):{' '}
              <input
                type="text"
                value={dados[ano].link}
                onChange={e => handleLinkChange(ano, e.target.value)}
                placeholder="Cole aqui o link do PDF no Cloudflare"
                style={{ width: 320 }}
              />
            </label>
            {dados[ano].link && (
              <a href={dados[ano].link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12 }}>
                Visualizar PDF
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}