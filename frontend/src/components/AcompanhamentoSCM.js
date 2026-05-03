// Função para atualizar o link do PDF
const handlePdfLinkChange = (ano, mes, e) => {
  const novoValor = e.target.value;
  setDados(prev => ({
    ...prev,
    [ano]: {
      ...prev[ano],
      [mes]: {
        ...prev[ano][mes],
        pdfLink: novoValor
      }
    }
  }));
};
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
        pdfLink: '',
      };
    });
  });
  return data;
};

export default function AcompanhamentoSCM({ razaoSocial, cnpj }) {
  // Chave para persistir os checks por CNPJ
  const chaveChecks = cnpj ? `checks_SCM_${cnpj}` : 'checks_SCM';
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

  const chaveDesligados = cnpj ? `anosDesligados_SCM_${cnpj}` : 'anosDesligados_SCM';
  const chaveOcultos = cnpj ? `anosOcultos_SCM_${cnpj}` : 'anosOcultos_SCM';

  const [anosDesligados, setAnosDesligados] = useState(() => {
    const salvo = localStorage.getItem(chaveDesligados);
    return salvo ? JSON.parse(salvo) : {};
  });

  const [anosOcultos, setAnosOcultos] = useState(() => {
    const salvo = localStorage.getItem(chaveOcultos);
    return salvo ? JSON.parse(salvo) : {};
  });

  // 🔹 Salvar no backend ou fallback local
  useEffect(() => {
    if (!cnpj) return;

    fetch(`${API_URL}/api/acompanhamento-scm/${cnpj}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anosDesligados, anosOcultos })
    }).catch(() => {
      localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
      localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
    });
  }, [anosDesligados, anosOcultos, cnpj]);

  // 🔹 Carregar dados
  useEffect(() => {
    if (!cnpj) return;

    fetch(`${API_URL}/api/acompanhamento-scm/${cnpj}`)
      .then(res => res.json())
      .then(data => {
        if (data.anosDesligados) setAnosDesligados(data.anosDesligados);
        if (data.anosOcultos) setAnosOcultos(data.anosOcultos);
      })
      .catch(() => {
        const salvoDesligados = localStorage.getItem(chaveDesligados);
        if (salvoDesligados) setAnosDesligados(JSON.parse(salvoDesligados));

        const salvoOcultos = localStorage.getItem(chaveOcultos);
        if (salvoOcultos) setAnosOcultos(JSON.parse(salvoOcultos));
      });
  }, [cnpj]);

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

  // handleFileChange removido pois não é mais necessário para links

  const handleDownload = (ano, mes) => {
    const { file, fileUrl } = dados[ano][mes];
    if (!file || !fileUrl) return;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    link.click();

    fetch(`${API_URL}/api/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'DOWNLOAD_PDF_SCM',
        usuario: razaoSocial || 'desconhecido',
        detalhes: { nomeArquivo: file.name, ano, mes }
      })
    });
  };

  if (!razaoSocial) {
    return (
      <div style={{ padding: 24, color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
        Cliente não selecionado ou parâmetro razaoSocial ausente na URL.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Acompanhamento SCM</h2>

      {ANOS.map(ano => {
        const todosMesesMarcados = MESES.every(mes => dados[ano][mes].checked);
        const desligado = anosDesligados[ano];
        const oculto = anosOcultos[ano];

        if (oculto) {
          return (
            <div key={ano} style={{ marginBottom: 8 }}>
              <span>{ano} (oculto)</span>
              <button onClick={() => {
                const novo = { ...anosOcultos, [ano]: false };
                setAnosOcultos(novo);
                localStorage.setItem(chaveOcultos, JSON.stringify(novo));
              }}>
                <IconEyeOff />
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
              <strong style={{ fontSize: 22, color: desligado ? '#d32f2f' : (todosMesesMarcados ? '#388e3c' : '#1976d2') }}>{ano}</strong>
              <button onClick={() => {
                const novo = { ...anosDesligados, [ano]: !desligado };
                setAnosDesligados(novo);
                localStorage.setItem(chaveDesligados, JSON.stringify(novo));
              }} style={{ marginLeft: 16, background: 'none', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer' }} title={desligado ? 'Reativar ano' : 'Desligar ano'}>
                {desligado ? <IconPowerOn /> : <IconPower />}
              </button>
              <button onClick={() => {
                const novo = { ...anosOcultos, [ano]: true };
                setAnosOcultos(novo);
                localStorage.setItem(chaveOcultos, JSON.stringify(novo));
              }} style={{ marginLeft: 8, background: 'none', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer' }} title="Ocultar ano">
                <IconEye />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MESES.map(mes => (
                <div key={mes} style={{
                  minWidth: 220,
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px #0001',
                  padding: 12,
                  marginBottom: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  border: dados[ano][mes].checked ? '2px solid #388e3c' : '1px solid #ccc',
                  opacity: desligado ? 0.5 : 1
                }}>
                  <label style={{ fontWeight: 600, marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={dados[ano][mes].checked}
                      onChange={() => handleCheck(ano, mes)}
                      style={{ marginRight: 8 }}
                      disabled={desligado}
                    />
                    {mes}
                  </label>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <input
                      type="text"
                      placeholder="Cole o link do PDF aqui"
                      value={dados[ano][mes].pdfLink || ''}
                      onChange={e => handlePdfLinkChange(ano, mes, e)}
                      disabled={desligado}
                      style={{width:'100%'}}
                    />
                  </div>
                  {dados[ano][mes].pdfLink && (
                    <a
                      href={dados[ano][mes].pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
                    >
                      Baixar PDF
                    </a>
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