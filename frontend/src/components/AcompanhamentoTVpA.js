import API_URL from '../services/api';
import React, { useState, useEffect } from 'react';
import { IconEye, IconEyeOff, IconPower, IconPowerOn } from './IconsAcompanhamento';

const ANOS = [2026, 2025, 2024];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const initialData = () => {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {};
    MESES.forEach(mes => {
      data[ano][mes] = {
        checked: false,
        file: null,
        fileUrl: '',
      };
    });
  });
  return data;
};



export default function AcompanhamentoTVpA({ razaoSocial, cnpj }) {
  // Chave para persistir os checks por CNPJ
  const chaveChecks = cnpj ? `checks_TVPA_${cnpj}` : 'checks_TVPA';
  // Carrega os checks do localStorage, se houver
  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      const base = initialData();
      ANOS.forEach(ano => {
        MESES.forEach(mes => {
          base[ano][mes].checked = !!(checksSalvos[ano] && checksSalvos[ano][mes]);
        });
      });
      return base;
    }
    return initialData();
  });
  const chaveDesligados = cnpj ? `anosDesligados_TVPA_${cnpj}` : 'anosDesligados_TVPA';
  const chaveOcultos = cnpj ? `anosOcultos_TVPA_${cnpj}` : 'anosOcultos_TVPA';
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
  }, [anosDesligados, chaveDesligados]);
  useEffect(() => {
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosOcultos, chaveOcultos]);

  useEffect(() => {
    const salvoDesligados = localStorage.getItem(chaveDesligados);
    if (salvoDesligados) setAnosDesligados(JSON.parse(salvoDesligados));
    const salvoOcultos = localStorage.getItem(chaveOcultos);
    if (salvoOcultos) setAnosOcultos(JSON.parse(salvoOcultos));
  }, [chaveDesligados, chaveOcultos]);

  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = {
        ...prev,
        [ano]: {
          ...prev[ano],
          [mes]: {
            ...prev[ano][mes],
            checked: !prev[ano][mes].checked
          }
        }
      };
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

  // Garante que ao trocar de cliente/cnpj, recarrega os checks corretos
  React.useEffect(() => {
    const salvo = localStorage.getItem(chaveChecks);
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      setDados(prev => {
        const base = initialData();
        ANOS.forEach(ano => {
          MESES.forEach(mes => {
            base[ano][mes].checked = !!(checksSalvos[ano] && checksSalvos[ano][mes]);
            // Mantém arquivos já carregados, se houver
            if (prev[ano][mes].file) {
              base[ano][mes].file = prev[ano][mes].file;
              base[ano][mes].fileUrl = prev[ano][mes].fileUrl;
            }
          });
        });
        return base;
      });
    } else {
      setDados(initialData());
    }
    // eslint-disable-next-line
  }, [chaveChecks]);

  const handleFileChange = (ano, mes, e) => {
    const file = e.target.files[0];
    if (file) {
      // Monta o nome: COMP_TVPA_RAZAOSOCIAL_ANO_MES.pdf
      const nomeLimpo = (razaoSocial || "").normalize('NFD').replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toUpperCase();
      const nomeArquivo = `COMP_TVPA_${nomeLimpo}_${ano}_${mes.toUpperCase()}.pdf`;
      const novoFile = new File([file], nomeArquivo, { type: file.type });
      const url = URL.createObjectURL(novoFile);
      setDados(prev => {
        const novo = {
          ...prev,
          [ano]: {
            ...prev[ano],
            [mes]: {
              ...prev[ano][mes],
              file: novoFile,
              fileUrl: url
            }
          }
        };
        if (chaveStorage) {
          try { localStorage.setItem(chaveStorage, JSON.stringify(novo)); } catch {}
        }
        return novo;
      });
      // Log da ação de upload
        fetch(`${API_URL}/api/acao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'UPLOAD_PDF_TVPA',
          usuario: razaoSocial || 'desconhecido',
          detalhes: { nomeArquivo, ano, mes }
        })
      });
    }
  };

  const handleDownload = (ano, mes) => {
    const { file, fileUrl } = dados[ano][mes];
    if (file && fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      link.click();
      // Log da ação de download
        fetch(`${API_URL}/api/acao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'DOWNLOAD_PDF_TVPA',
          usuario: razaoSocial || 'desconhecido',
          detalhes: { nomeArquivo: file.name, ano, mes }
        })
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Acompanhamento TVpA</h2>
      {ANOS.map(ano => {
        const todosMesesMarcados = MESES.every(mes => dados[ano][mes].checked);
        const desligado = anosDesligados[ano];
        const oculto = anosOcultos[ano];
        if (oculto) {
          return (
            <div key={ano} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#888', fontWeight: 600, fontSize: 18 }}>{ano} (oculto)</span>
              <button
                onClick={() => setAnosOcultos(prev => ({ ...prev, [ano]: false }))}
                style={{ background: '#fff', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer' }}
                title="Exibir ano"
              >
                <IconEyeOff color="#1976d2" />
              </button>
            </div>
          );
        }
        return (
          <div key={ano} style={{
            marginBottom: 32,
            border: desligado ? '2.5px solid #d32f2f' : (todosMesesMarcados ? '2.5px solid #388e3c' : '1px solid #1976d2'),
            borderRadius: 12,
            background: desligado ? '#ffebee' : (todosMesesMarcados ? '#e8f5e9' : '#f4f8ff'),
            boxShadow: '0 2px 8px #0001',
            padding: 16,
            opacity: desligado ? 0.6 : 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={todosMesesMarcados} readOnly style={{ marginRight: 8, accentColor: '#388e3c', width: 20, height: 20 }} disabled={desligado} />
              <h3 style={{ color: desligado ? '#d32f2f' : (todosMesesMarcados ? '#388e3c' : '#1976d2'), margin: 0 }}>{ano}</h3>
              {todosMesesMarcados && !desligado && (
                <span style={{ marginLeft: 8, color: '#388e3c', fontWeight: 700, fontSize: 22 }}>✔</span>
              )}
              {desligado && (
                <span style={{ marginLeft: 8, color: '#d32f2f', fontWeight: 700, fontSize: 22 }}>⏻</span>
              )}
              <button
                onClick={() => setAnosDesligados(prev => ({ ...prev, [ano]: !prev[ano] }))}
                style={{ marginLeft: 16, background: 'none', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer' }}
                title={desligado ? 'Reativar ano' : 'Desligar ano'}
              >
                {desligado ? <IconPowerOn /> : <IconPower />}
              </button>
              <button
                onClick={() => setAnosOcultos(prev => ({ ...prev, [ano]: true }))}
                style={{ marginLeft: 8, background: 'none', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer' }}
                title="Ocultar ano"
              >
                <IconEye />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MESES.map(mes => (
                <div key={mes} style={{ minWidth: 220, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 12, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: dados[ano][mes].checked ? '2px solid #388e3c' : '1px solid #ccc', opacity: desligado ? 0.5 : 1 }}>
                  <label style={{ fontWeight: 600, marginBottom: 4 }}>
                    <input type="checkbox" checked={dados[ano][mes].checked} onChange={() => handleCheck(ano, mes)} style={{ marginRight: 8 }} disabled={desligado} />
                    {mes}
                  </label>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <input type="file" accept="application/pdf" onChange={e => handleFileChange(ano, mes, e)} disabled={desligado} />
                    {dados[ano][mes].file && (
                      <span style={{fontSize:13, color:'#1976d2', fontWeight:500}}>{dados[ano][mes].file.name}</span>
                    )}
                  </div>
                  {dados[ano][mes].file && (
                    <button onClick={() => handleDownload(ano, mes)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} disabled={desligado}>
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}