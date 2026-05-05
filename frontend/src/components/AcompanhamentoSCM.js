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

export default function AcompanhamentoSCM({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_SCM_${cnpj}` : 'checks_SCM';
  const chaveLinks = cnpj ? `links_SCM_${cnpj}` : 'links_SCM';
  const chaveDesligados = cnpj ? `anosDesligados_SCM_${cnpj}` : 'anosDesligados_SCM';
  const chaveOcultos = cnpj ? `anosOcultos_SCM_${cnpj}` : 'anosOcultos_SCM';

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
    return <div>Selecione um cliente para visualizar os dados de SCM.</div>;
  }

  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento SCM</h2>
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
                    Comprovante Coleta SCM ({mes})
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
// ...existing code...
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

export default function AcompanhamentoSCM({ cnpj, razaoSocial }) {
  const chaveChecks = cnpj ? `checks_SCM_${cnpj}` : 'checks_SCM';
  const chaveLinks = cnpj ? `links_SCM_${cnpj}` : 'links_SCM';
  const chaveDesligados = cnpj ? `anosDesligados_SCM_${cnpj}` : 'anosDesligados_SCM';
  const chaveOcultos = cnpj ? `anosOcultos_SCM_${cnpj}` : 'anosOcultos_SCM';

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
    return <div>Selecione um cliente para visualizar os dados de SCM.</div>;
  }

  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento SCM</h2>
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
                    Comprovante Coleta SCM ({mes})
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

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de SCM.</div>;
  }

  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento SCM</h2>
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
                    Comprovante Coleta SCM ({mes})
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

  const handleFileChange = async (ano, mes, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const nomeLimpo = (razaoSocial || "")
      .normalize('NFD')
      .replace(/[^ -\u007F]/g, '')
      .replace(/[\s]/g, '_')
      .toUpperCase();

    const nomeArquivo = `COMP_SCM_${nomeLimpo}_${ano}_${mes.toUpperCase()}.pdf`;
    const novoFile = new File([file], nomeArquivo, { type: file.type });

    // Envia para o backend
    const formData = new FormData();
    formData.append('pdf', novoFile);
    let urlR2 = '';
    try {
      const resp = await fetch(`${API_URL}/api/acompanhamento-scm/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data && data.url) urlR2 = data.url;
    } catch (err) {
      alert('Falha ao enviar PDF para o servidor.');
    }

    setDados(prev => ({
      ...prev,
      [ano]: {
        ...prev[ano],
        [mes]: {
          ...prev[ano][mes],
          file: novoFile,
          fileUrl: urlR2 || URL.createObjectURL(novoFile)
        }
      }
    }));
  };

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
            <div key={ano} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#888', fontWeight: 600, fontSize: 18 }}>{ano} (oculto)</span>
              <button
                onClick={() => {
                  const novo = { ...anosOcultos, [ano]: false };
                  setAnosOcultos(novo);
                  localStorage.setItem(chaveOcultos, JSON.stringify(novo));
                }}
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
            border: `2px solid ${todosMesesMarcados ? '#43a047' : '#1976d2'}`,
            borderRadius: 10,
            marginBottom: 32,
            background: desligado ? '#f5f5f5' : '#f7faff',
            boxShadow: '0 2px 8px #0001',
            padding: 20,
            opacity: desligado ? 0.5 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={todosMesesMarcados}
                onChange={() => handleCheckAno(ano)}
                style={{ marginRight: 10, width: 20, height: 20 }}
                disabled={desligado}
              />
              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#1976d2', flex: 1 }}>Ano: {ano}</span>
              <button
                onClick={() => setAnosDesligados(prev => ({ ...prev, [ano]: !prev[ano] }))}
                title={desligado ? 'Ligar ano' : 'Desligar ano'}

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

                export default function AcompanhamentoSCM({ razaoSocial, cnpj }) {
                  const chaveChecks = cnpj ? `checks_SCM_${cnpj}` : 'checks_SCM';
                  const chaveLinks = cnpj ? `links_SCM_${cnpj}` : 'links_SCM';
                  const chaveDesligados = cnpj ? `anosDesligados_SCM_${cnpj}` : 'anosDesligados_SCM';
                  const chaveOcultos = cnpj ? `anosOcultos_SCM_${cnpj}` : 'anosOcultos_SCM';

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
                    return <div>Selecione um cliente para visualizar os dados de SCM.</div>;
                  }

                  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

                  return (
                    <div style={{ padding: 24 }}>
                      <h2>Acompanhamento SCM</h2>
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
                                    Comprovante Coleta SCM ({mes})
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