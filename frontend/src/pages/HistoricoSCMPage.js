import React, { useEffect, useState } from 'react';
import { getSCMHistoricoCSV, deleteSCMHistoricoCSV } from '../services/scmHistorico';
import { IconDownload } from '../components/IconsHistorico';
import MenuLateral from '../components/MenuLateral';
import { Link } from 'react-router-dom';

export default function HistoricoSCMPage() {
  const [clienteSelecionado, setClienteSelecionado] = useState({ cnpj: 'semcnpj', razaoSocial: '' });
  const [historicoArquivos, setHistoricoArquivos] = useState([]);

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
        return;
      }
    } catch {}
    setClienteSelecionado({ cnpj: 'semcnpj', razaoSocial: '' });
    setHistoricoArquivos([]);
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
                      {arq.nome} - <span style={{ color: '#1976d2' }}>{arq.data}</span>
                    </span>
                    <button
                      style={{ marginLeft: 12, background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
                      title="Baixar arquivo"
                      aria-label="Baixar arquivo"
                      onClick={() => {
                        const blob = new Blob([arq.conteudo], { type: 'text/csv' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = arq.nome;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <IconDownload />
                    </button>
                    <button
                      style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 4, border: 'none', background: '#e53935', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                      onClick={async () => {
                        if (window.confirm('Tem certeza que deseja excluir este arquivo do histórico?')) {
                          try {
                            await deleteSCMHistoricoCSV({ nome: arq.nome, data: arq.data, usuario: arq.usuario });
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
