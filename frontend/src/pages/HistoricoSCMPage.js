import React, { useEffect, useState } from 'react';
import { fetchHistoricoSCM } from '../services/historicoSCM';
import { IconDownload } from '../components/IconsHistorico';
import MenuLateral from '../components/MenuLateral';
import { Link } from 'react-router-dom';

export default function HistoricoSCMPage() {
  const [clienteSelecionado, setClienteSelecionado] = useState({ cnpj: 'semcnpj', razaoSocial: '' });
  const [historicoArquivos, setHistoricoArquivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca cliente selecionado (apenas para exibir info)
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        setClienteSelecionado(obj);
      }
    } catch {}
    // Busca histórico do backend
    fetchHistoricoSCM()
      .then((data) => {
        // Ordena do mais recente para o mais antigo
        setHistoricoArquivos(
          data.sort((a, b) => new Date(b.data) - new Date(a.data))
        );
      })
      .catch(() => setHistoricoArquivos([]))
      .finally(() => setLoading(false));
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
            {loading ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: 14, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                Carregando histórico...
              </div>
            ) : historicoArquivos.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: 14, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                Nenhum arquivo gerado ainda.
              </div>
            ) : (
              <ul style={{ fontFamily: 'monospace', fontSize: 14, paddingLeft: 20 }}>
                {historicoArquivos.map((arq, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ flex: 1 }}>
                      {arq.detalhes?.nomeArquivo || arq.nomeArquivo || arq.nome} - <span style={{ color: '#1976d2' }}>{arq.data ? new Date(arq.data).toLocaleString('pt-BR') : ''}</span>
                    </span>
                    {/* Não é possível baixar o arquivo CSV diretamente, pois só temos o nome. */}
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
