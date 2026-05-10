import React, { useState, useEffect } from 'react';
import { getSCMHistoricoCSV, deleteSCMHistoricoCSV } from '../services/scmHistorico';
import { IconPower, IconPowerOn, IconEye, IconEyeOff, IconDownload } from './IconsAcompanhamento';
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

function normalizarToken(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function ComprovanteSCMDownload({ ano, mes, mesNumero, razaoSocial, link, onSaveLink, disabled }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const hasLink = Boolean(link && link.trim());
  const tokenRazaoSocial = normalizarToken(razaoSocial) || 'SEM_RAZAO_SOCIAL';
  const tokenMes = normalizarToken(mes) || 'MES';
  const nomeComprovante = `SCM_${tokenRazaoSocial}_${ano}_${tokenMes}(${mesNumero})`;

  useEffect(() => {
    if (!link) {
      setValor('');
    }
  }, [link]);

  const baixarPdf = () => {
    try {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = `${nomeComprovante}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleArrowClick = () => {
    if (disabled) return;
    if (!hasLink) {
      setEditando(true);
      return;
    }
    baixarPdf();
  };

  const handleSalvar = () => {
    const url = valor.trim();
    if (!url) return;
    onSaveLink(url);
    setEditando(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={handleArrowClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center'
        }}
        title={hasLink ? 'Baixar comprovante PDF' : 'Inserir link do PDF'}
        disabled={disabled}
      >
        <IconDownload color={hasLink ? '#43a047' : '#1976d2'} title={hasLink ? 'Baixar comprovante PDF' : 'Inserir link do PDF'} />
      </button>

      <span style={{ fontSize: 15, color: '#1976d2', minWidth: 140 }}>
        {nomeComprovante}
      </span>

      {editando && !hasLink && (
        <>
          <input
            type="text"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Cole o link do PDF"
            style={{ width: 260, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSalvar();
            }}
            disabled={disabled}
          />
          <button
            onClick={handleSalvar}
            style={{ marginLeft: 4, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            disabled={disabled}
          >
            Salvar
          </button>
          <button
            onClick={() => {
              setEditando(false);
              setValor('');
            }}
            style={{ marginLeft: 2, background: '#eee', color: '#1976d2', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            disabled={disabled}
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}

export default function AcompanhamentoSCM({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const obterNomeArquivoHistorico = (item) => item?.nome || item?.detalhes?.nomeArquivo || 'scm.csv';

  // Histórico de arquivos CSV gerados (global, backend)
  const [historicoArquivos, setHistoricoArquivos] = useState([]);
  useEffect(() => {
    getSCMHistoricoCSV()
      .then(data => {
        // Filtra para exibir apenas arquivos do CNPJ atual
        const cnpjLimpo = (cnpj || '').replace(/\D/g, '');
        setHistoricoArquivos(
          data.filter(item => (item.usuario || '').replace(/\D/g, '') === cnpjLimpo)
        );
      })
      .catch(() => setHistoricoArquivos([]));
  }, [cnpj]);

  // Carregar dados do backend ao montar ou mudar cnpj
  useEffect(() => {
    if (!cnpj) return;
    setLoading(true);
    getAcompanhamento('SCM', cnpj)
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
        // Só atualiza se for diferente do estado atual
        setDados(prev => {
          const igual = JSON.stringify(prev) === JSON.stringify(base);
          if (!igual) {
            // Log para depuração
            console.log('Atualizando dados do backend', base);
            return base;
          }
          return prev;
        });
        setErro(null);
      })
      .catch(() => {
        setDados(initialData());
        setErro('Erro ao carregar dados do acompanhamento.');
      })
      .finally(() => setLoading(false));
  }, [cnpj]);

  // Estados para anos desligados e ocultos
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

  // Atualiza localStorage ao mudar anosDesligados/anosOcultos
  useEffect(() => {
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosDesligados, anosOcultos]);

  // Checa se todos os meses do ano estão marcados
  const todosMesesChecados = ano => MESES.every(mes => dados[ano][mes].checked);


  // Marcar/desmarcar todos os meses de um ano
  const handleCheckAno = (ano) => {
    const marcar = !todosMesesChecados(ano);
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano] };
      MESES.forEach(mes => {
        novo[ano][mes] = { ...novo[ano][mes], checked: marcar };
      });
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Marcar/desmarcar mês individual
  const handleCheck = (ano, mes) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], checked: !novo[ano][mes].checked } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  const handleLinkChange = (ano, mes, value) => {
    setDados(prev => {
      const novo = { ...prev };
      novo[ano] = { ...novo[ano], [mes]: { ...novo[ano][mes], link: value } };
      salvarChecksLinks(novo);
      return novo;
    });
  };

  // Função para salvar no backend (igual ao Postes)
  function salvarChecksLinks(novoDados) {
    const checksToSave = {};
    const linksToSave = {};
    ANOS.forEach(ano => {
      checksToSave[ano] = {};
      linksToSave[ano] = {};
      MESES.forEach(mes => {
        checksToSave[ano][mes] = novoDados[ano][mes].checked;
        linksToSave[ano][mes] = novoDados[ano][mes].link;
      });
    });
    if (cnpj) {
      // Log para depuração
      console.log('Salvando no backend', { checks: checksToSave, links: linksToSave });
      saveAcompanhamento('SCM', cnpj, { checks: checksToSave, links: linksToSave });
    }
  }

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de SCM.</div>;
  }
  if (loading) {
    return <div>Carregando dados do acompanhamento...</div>;
  }

  // Verifica se todos os anos estão ocultos
  const todosOcultos = ANOS.every(ano => anosOcultos[ano]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>Acompanhamento SCM</h2>
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
              boxShadow: '0 2px 8px #0001',
              width: '100%',
              maxWidth: 350
            }}
          >
            Desocultar todos os anos
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[...ANOS].sort((a, b) => b - a).map(ano => (
          <div key={ano} style={{
            border: `2px solid ${todosMesesChecados(ano) ? '#43a047' : '#1976d2'}`,
            borderRadius: 10,
            marginBottom: 0,
            background: anosDesligados[ano] ? '#f5f5f5' : '#f7faff',
            boxShadow: '0 2px 8px #0001',
            padding: 20,
            opacity: anosDesligados[ano] ? 0.5 : 1,
            width: '100%',
            minWidth: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <input
                type="checkbox"
                checked={todosMesesChecados(ano)}
                onChange={() => handleCheckAno(ano)}
                style={{ marginRight: 10, width: 20, height: 20 }}
                disabled={anosDesligados[ano] || salvando}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {MESES.map((mes, idx) => (
                  <div key={mes} style={{
                    width: '100%',
                    marginBottom: 18,
                    borderBottom: '1px solid #e3e3e3',
                    paddingBottom: 10
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 2, color: dados[ano][mes].checked ? '#43a047' : '#222' }}>{mes}</div>
                    <label style={{ display: 'block', marginBottom: 4 }} htmlFor={`scm-check-${ano}-${mes}`}>
                      <input
                        type="checkbox"
                        id={`scm-check-${ano}-${mes}`}
                        name={`scm-check-${ano}-${mes}`}
                        checked={dados[ano][mes].checked}
                        onChange={() => handleCheck(ano, mes)}
                        disabled={anosDesligados[ano] || salvando}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ color: dados[ano][mes].checked ? '#43a047' : undefined }}>Comprovante</span>
                    </label>


                    <ComprovanteSCMDownload
                      ano={ano}
                      mes={mes}
                      mesNumero={idx + 1}
                      razaoSocial={razaoSocial}
                      link={dados[ano][mes].link}
                      onSaveLink={url => handleLinkChange(ano, mes, url)}
                      disabled={anosDesligados[ano] || salvando}
                    />

                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Histórico global de arquivos CSV SCM */}
      <div style={{marginTop:40}}>
        <h3>Histórico global de arquivos CSV SCM</h3>
        {historicoArquivos.length === 0 ? (
          <div style={{color:'#888'}}>Nenhum arquivo CSV gerado ainda.</div>
        ) : (
          <table style={{width:'100%',background:'#f4f4f4',borderRadius:6,padding:8}}>
            <thead>
              <tr>
                <th style={{textAlign:'left',padding:'4px 8px'}}>Nome do Arquivo</th>
                <th style={{textAlign:'left',padding:'4px 8px'}}>Data</th>
                <th style={{textAlign:'left',padding:'4px 8px'}}>Usuário/CNPJ</th>
                <th style={{textAlign:'center',padding:'4px 8px'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historicoArquivos.map((item, idx) => (
                <tr key={idx} style={{background: idx%2?'#fafafa':'#fff'}}>
                  <td style={{padding:'4px 8px'}}>{obterNomeArquivoHistorico(item)}</td>
                  <td style={{padding:'4px 8px'}}>{item.data}</td>
                  <td style={{padding:'4px 8px'}}>{item.usuario}</td>
                  <td style={{textAlign:'center',padding:'4px 8px', display:'flex', gap:8, justifyContent:'center'}}>
                    <button onClick={() => {
                      // Força BOM UTF-8, separador vírgula, CRLF e sem linha em branco final
                      const BOM = '\uFEFF';
                      let conteudo = item.conteudo.replace(/^\s+/, '');
                      // Garante que a primeira linha é o cabeçalho correto e com vírgula
                      const header = 'CNPJ;ANO;MES;COD_IBGE;TIPO_CLIENTE;TIPO_ATENDIMENTO;TIPO_MEIO;TIPO_PRODUTO;TIPO_TECNOLOGIA;VELOCIDADE;ACESSOS';
                      let linhas = conteudo.split(/\r?\n/);
                      linhas[0] = header;
                      conteudo = linhas.join('\r\n') + '\r\n'; // Garante CRLF ao final
                      // Força CRLF em todas as linhas (caso haja algum \n isolado)
                      conteudo = conteudo.replace(/([^\r])\n/g, '$1\r\n');
                      const blob = new Blob([BOM + conteudo], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.setAttribute('download', obterNomeArquivoHistorico(item));
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }} style={{background:'none',border:'none',cursor:'pointer',padding:2}} title="Baixar arquivo" aria-label="Baixar arquivo">
                      <span role="img" aria-label="download">⬇️</span>
                    </button>
                    {/* Só exibe o botão excluir se o arquivo for do CNPJ atual */}
                    {((item.usuario || '').replace(/\D/g, '') === (cnpj || '').replace(/\D/g, '')) && (
                      <button onClick={async () => {
                        if(window.confirm('Tem certeza que deseja excluir este arquivo do histórico?')) {
                          try {
                            await deleteSCMHistoricoCSV({
                              nome: item?.nome,
                              nomeDetalhes: item?.detalhes?.nomeArquivo,
                              data: item?.data,
                              usuario: item?.usuario
                            });
                            const data = await getSCMHistoricoCSV();
                            const cnpjLimpo = (cnpj || '').replace(/\D/g, '');
                            setHistoricoArquivos(
                              data.filter(item => (item.usuario || '').replace(/\D/g, '') === cnpjLimpo)
                            );
                          } catch {
                            alert('Erro ao excluir arquivo do histórico.');
                          }
                        }
                      }} style={{background:'none',border:'none',cursor:'pointer',padding:2, color:'#d32f2f'}} title="Excluir arquivo" aria-label="Excluir arquivo">
                        <span role="img" aria-label="excluir">🗑️</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {erro && <div style={{ color: 'red', marginTop: 16 }}>{erro}</div>}
      {salvando && <div style={{ color: '#1976d2', marginTop: 8 }}>Salvando alterações...</div>}
    </div>
  );
}