import React, { useEffect, useState } from 'react';
import { getSCMHistoricoCSV, deleteSCMHistoricoCSV } from '../services/scmHistorico';
import { IconDownload } from '../components/IconsHistorico';
import MenuLateral from '../components/MenuLateral';
import { Link } from 'react-router-dom';
import { getAcompanhamento } from '../services/acompanhamento';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function obterNomeArquivoHistorico(item) {
  return item?.nome || item?.detalhes?.nomeArquivo || 'scm.csv';
}

function extrairAnoMesDoNomeCSV(nomeArquivo = '') {
  const nome = String(nomeArquivo || '');
  const match = nome.match(/_(\d{4})_(\d{1,2})\.csv$/i);
  if (!match) return null;

  const ano = Number(match[1]);
  const mesNumero = Number(match[2]);
  if (!Number.isInteger(ano) || !Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
    return null;
  }

  return { ano, mesNumero };
}

export default function HistoricoSCMPage() {
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const role = String(authUser?.role || localStorage.getItem('roleUsuario') || '').trim().toUpperCase();
  const email = String(authUser?.email || localStorage.getItem('emailUsuario') || '').trim().toLowerCase();
  const isAdmin = role !== 'NETO' || email === 'diegorafa87@gmail.com';

  const [clienteSelecionado, setClienteSelecionado] = useState({ cnpj: 'semcnpj', razaoSocial: '' });
  const [historicoArquivos, setHistoricoArquivos] = useState([]);
  const [linksSCM, setLinksSCM] = useState({});

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        setClienteSelecionado(obj);
        // Busca histórico global do backend filtrado pelo CNPJ
        getSCMHistoricoCSV().then(data => {
          const cnpjLimpo = (obj.cnpj || '').replace(/\D/g, '');
          setHistoricoArquivos(data.filter(item => (item.usuario || '').replace(/\D/g, '') === cnpjLimpo));
        });

        const cnpjLimpo = (obj.cnpj || '').replace(/\D/g, '');
        if (cnpjLimpo) {
          getAcompanhamento('SCM', cnpjLimpo)
            .then(res => setLinksSCM(res?.links || {}))
            .catch(() => setLinksSCM({}));
        }
        return;
      }
    } catch {}
    setClienteSelecionado({ cnpj: 'semcnpj', razaoSocial: '' });
    setHistoricoArquivos([]);
    setLinksSCM({});
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={<Link to="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</Link>}
        clienteInfo={clienteSelecionado.razaoSocial ? (
          <>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{clienteSelecionado.razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {clienteSelecionado.cnpj}</div>
          </>
        ) : null}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 700, width: '100%' }}>
          <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Histórico de Arquivos SCM</h2>
          <div style={{ background: '#e3f2fd', border: '2px solid #1976d2', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Arquivos gerados:</div>
            {historicoArquivos.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: 14, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                Nenhum arquivo gerado ainda.
              </div>
            ) : (
              <ul style={{ fontFamily: 'monospace', fontSize: 14, paddingLeft: 20 }}>
                {historicoArquivos.map((arq, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ flex: 1 }}>
                      {obterNomeArquivoHistorico(arq)} - <span style={{ color: '#1976d2' }}>{arq.data}</span>
                    </span>
                    <button
                      style={{ marginLeft: 12, background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
                      title="Baixar arquivo"
                      aria-label="Baixar arquivo"
                      onClick={() => {
                        const blob = new Blob([arq.conteudo], { type: 'text/csv' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = obterNomeArquivoHistorico(arq);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <IconDownload />
                    </button>
                    {(() => {
                      const nomeArquivo = obterNomeArquivoHistorico(arq);
                      const info = extrairAnoMesDoNomeCSV(nomeArquivo);
                      const mesNome = info ? MESES[info.mesNumero - 1] : '';
                      const linkPdf = info ? linksSCM?.[info.ano]?.[mesNome] : '';
                      const temComprovante = Boolean(linkPdf && String(linkPdf).trim());
                      const podeVerSetaComprovante = isAdmin || temComprovante;

                      if (!podeVerSetaComprovante) return null;

                      return (
                        <button
                          style={{ marginLeft: 8, background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
                          title="Baixar comprovante PDF"
                          aria-label="Baixar comprovante PDF"
                          onClick={() => {
                            if (!info) {
                              alert('Não foi possível identificar ano e mês no nome do CSV para localizar o comprovante PDF.');
                              return;
                            }

                            if (!linkPdf || !String(linkPdf).trim()) {
                              alert('Comprovante PDF não encontrado para este CSV.');
                              return;
                            }

                            try {
                              const anchor = document.createElement('a');
                              anchor.href = linkPdf;
                              anchor.target = '_blank';
                              anchor.rel = 'noopener noreferrer';
                              anchor.download = `COMP_${nomeArquivo.replace(/\.csv$/i, '')}.pdf`;
                              document.body.appendChild(anchor);
                              anchor.click();
                              document.body.removeChild(anchor);
                            } catch {
                              window.open(linkPdf, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <IconDownload color={temComprovante ? '#43a047' : '#1976d2'} />
                        </button>
                      );
                    })()}
                    <button
                      style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 4, border: 'none', background: '#e53935', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                      onClick={async () => {
                        if (window.confirm('Tem certeza que deseja excluir este arquivo do histórico?')) {
                          try {
                            await deleteSCMHistoricoCSV({
                              nome: arq?.nome,
                              nomeDetalhes: arq?.detalhes?.nomeArquivo,
                              data: arq?.data,
                              usuario: arq?.usuario
                            });
                            // Atualiza histórico após exclusão
                            const data = await getSCMHistoricoCSV();
                            const cnpjLimpo = (clienteSelecionado.cnpj || '').replace(/\D/g, '');
                            setHistoricoArquivos(data.filter(item => (item.usuario || '').replace(/\D/g, '') === cnpjLimpo));
                          } catch {
                            alert('Erro ao excluir arquivo do histórico.');
                          }
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
