


import React, { useState, useEffect } from 'react';
import { IconPower, IconPowerOn, IconEye, IconEyeOff } from './IconsAcompanhamento';
import { getAcompanhamento, saveAcompanhamento } from '../services/acompanhamento';

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];
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



  const [dados, setDados] = useState(initialData());
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Estados para anos desligados e ocultos (preferências locais)
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

  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    setLoading(true);
    getAcompanhamento('TVPA', cnpj)
      .then(res => {
        const base = initialData();
        if (res.checks) {
          ANOS.forEach(ano => {
            if (res.checks[ano]) {
              MESES.forEach(mes => {
                if (res.checks[ano][mes] !== undefined) base[ano][mes].checked = res.checks[ano][mes];
              });
            }
          });
        }
        if (res.links) {
          ANOS.forEach(ano => {
            if (res.links[ano]) {
              MESES.forEach(mes => {
                if (res.links[ano][mes] !== undefined) base[ano][mes].link = res.links[ano][mes];
              });
            }
          });
        }
        setDados(base);
        setErro(null);
      })
      .catch(() => {
        setDados(initialData());
        setErro('Erro ao carregar dados do acompanhamento.');
      })
      .finally(() => setLoading(false));
  }, [cnpj]);

  // Atualiza localStorage ao mudar anosDesligados/anosOcultos
  useEffect(() => {
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosDesligados, anosOcultos]);

  // Checa se todos os meses do ano estão marcados
  const todosMesesChecados = ano => MESES.every(mes => dados[ano][mes].checked);

  // Salvar dados no backend
  const salvarNoBackend = async (novoDados) => {
    setSalvando(true);
    try {
      // Monta objeto para API
      const checks = {};
      const links = {};
      ANOS.forEach(ano => {
        checks[ano] = {};
        links[ano] = {};
        MESES.forEach(mes => {
          checks[ano][mes] = novoDados[ano][mes].checked;
          links[ano][mes] = novoDados[ano][mes].link;
        });
      });
      await saveAcompanhamento('TVPA', cnpj, { checks, links });
      setErro(null);
    } catch (e) {
      setErro('Erro ao salvar dados do acompanhamento.');
    } finally {
      setSalvando(false);
    }
  };

  // Marcar/desmarcar todos os meses de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosMesesChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      MESES.forEach(mes => {
        novo[ano][mes] = { ...novo[ano][mes], checked: marcar };
      });
      salvarNoBackend(novo);
      return novo;
    });
  };

  // Marcar/desmarcar mês individual
  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], checked: !novo[ano][mes].checked } };
      salvarNoBackend(novo);
      return novo;
    });
  };

  // Alterar link
  const handleLinkChange = (ano, mes, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], link: value } };
      salvarNoBackend(novo);
      return novo;
    });
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de TVpA.</div>;
  }
  if (loading) {
    return <div>Carregando dados do acompanhamento TVpA...</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento de TVpA</h2>
      {erro && <div style={{ color: 'red', marginBottom: 12 }}>{erro}</div>}
      {salvando && <div style={{ color: '#1976d2', marginBottom: 12 }}>Salvando alterações...</div>}
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
                    Comprovante Coleta TVpA ({mes})
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