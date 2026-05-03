
import API_URL from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { IconEye, IconEyeOff, IconPower, IconPowerOn } from './IconsAcompanhamento';
import { IconDownload } from './IconsHistorico';

const ANOS = [2026, 2025, 2024];

const initialData = () => {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {
      checked: false,
      file: null,
      fileUrl: '',
    };
  });
  return data;
};





export default function AcompanhamentoPostes({ razaoSocial, cnpj }) {
  // Chave para persistir os checks por CNPJ
  const chaveChecks = cnpj ? `checks_POSTES_${cnpj}` : 'checks_POSTES';
  // Carrega os checks do localStorage, se houver
  const [dados, setDados] = useState(() => {
    const salvo = localStorage.getItem(chaveChecks);
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      // Garante que todos os anos existem
      const base = initialData();
      ANOS.forEach(ano => {
        base[ano].checked = !!checksSalvos[ano];
      });
      return base;
    }
    return initialData();
  });
  const inputContratoRef = useRef();
  const [camposContrato, setCamposContrato] = useState(null);

  // As chaves e estados precisam ser declarados antes de qualquer uso
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

  // Salva no backend sempre que muda
  useEffect(() => {
    if (!cnpj) return;
    fetch(`${API_URL}/api/acompanhamento-postes/${cnpj}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anosDesligados, anosOcultos })
    }).catch(() => {
      // fallback localStorage
      localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
      localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
    });
    // eslint-disable-next-line
  }, [anosDesligados, anosOcultos, cnpj]);

  // Carrega do backend ao montar
  useEffect(() => {
    if (!cnpj) return;
    fetch(`${API_URL}/api/acompanhamento-postes/${cnpj}`)
      .then(res => res.json())
      .then(data => {
        if (data.anosDesligados) setAnosDesligados(data.anosDesligados);
        if (data.anosOcultos) setAnosOcultos(data.anosOcultos);
      })
      .catch(() => {
        // fallback localStorage
        const salvoDesligados = localStorage.getItem(chaveDesligados);
        if (salvoDesligados) setAnosDesligados(JSON.parse(salvoDesligados));
        const salvoOcultos = localStorage.getItem(chaveOcultos);
        if (salvoOcultos) setAnosOcultos(JSON.parse(salvoOcultos));
      });
    // eslint-disable-next-line
  }, [cnpj]);

  // Função placeholder para upload do contrato
  const handleContratoUpload = (e) => {
    // Implemente a lógica de upload se necessário
    // Por enquanto, apenas evita erro de referência
  };


  const handleCheck = (ano) => {
    setDados(prev => {
      const novo = {
        ...prev,
        [ano]: {
          ...prev[ano],
          checked: !prev[ano].checked
        }
      };
      // Salva no localStorage
      const checksToSave = {};
      ANOS.forEach(a => { checksToSave[a] = novo[a].checked; });
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
          base[ano].checked = !!checksSalvos[ano];
        });
        // Mantém arquivos já carregados, se houver
        ANOS.forEach(ano => {
          if (prev[ano].file) {
            base[ano].file = prev[ano].file;
            base[ano].fileUrl = prev[ano].fileUrl;
          }
        });
        return base;
      });
    } else {
      setDados(initialData());
    }
    // eslint-disable-next-line
  }, [chaveChecks]);

  const handleFileChange = (ano, e) => {
    const file = e.target.files[0];
    if (file) {
      const nomeLimpo = (razaoSocial || "").normalize('NFD').replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toUpperCase();
      const nomeArquivo = `COMP_POSTES_${nomeLimpo}_${ano}_COMPARTILHAMENTO.pdf`;
      const novoFile = new File([file], nomeArquivo, { type: file.type });
      const url = URL.createObjectURL(novoFile);
      setDados(prev => ({
        ...prev,
        [ano]: {
          ...prev[ano],
          file: novoFile,
          fileUrl: url
        }
      }));
        fetch(`${API_URL}/api/acao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'UPLOAD_PDF_POSTES',
          usuario: razaoSocial || 'desconhecido',
          detalhes: { nomeArquivo, ano }
        })
      });
    }
  };

  const handleDownload = (ano) => {
    const { file, fileUrl } = dados[ano];
    if (file && fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      link.click();
        fetch(`${API_URL}/api/acao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'DOWNLOAD_PDF_POSTES',
          usuario: razaoSocial || 'desconhecido',
          detalhes: { nomeArquivo: file.name, ano }
        })
      });
    }
  };

  if (!razaoSocial) {
    return <div style={{ padding: 24, color: 'red', fontWeight: 'bold', textAlign: 'center' }}>Cliente não selecionado ou parâmetro razaoSocial ausente na URL.</div>;
  }
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Acompanhamento de Postes</h2>
      {/* Upload de contrato removido conforme solicitado */}
      {ANOS.map(ano => {
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
            border: desligado ? '2.5px solid #d32f2f' : '1px solid #1976d2',
            borderRadius: 12,
            background: desligado ? '#ffebee' : '#f4f8ff',
            boxShadow: '0 2px 8px #0001',
            padding: 16,
            opacity: desligado ? 0.6 : 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <input type="checkbox" checked={dados[ano].checked} onChange={() => handleCheck(ano)} style={{ marginRight: 8, accentColor: '#388e3c', width: 20, height: 20 }} disabled={desligado} />
              <h3 style={{ color: desligado ? '#d32f2f' : '#1976d2', margin: 0 }}>Compartilhamento de postes ({ano})</h3>
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
              <div style={{ minWidth: 220, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 12, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: dados[ano].checked ? '2px solid #388e3c' : '1px solid #ccc', opacity: desligado ? 0.5 : 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 4 }}>
                  <input type="checkbox" checked={dados[ano].checked} onChange={() => handleCheck(ano)} style={{ marginRight: 8 }} disabled={desligado} />
                  Compartilhamento de postes
                </label>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                  <input type="file" accept="application/pdf" onChange={e => handleFileChange(ano, e)} disabled={desligado} />
                  {dados[ano].file && (
                    <>
                      <span style={{fontSize:13, color:'#1976d2', fontWeight:500}}>{dados[ano].file.name}</span>
                      <button onClick={() => handleDownload(ano)} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }} title="Baixar arquivo" aria-label="Baixar arquivo" disabled={desligado}>
                        <IconDownload />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
