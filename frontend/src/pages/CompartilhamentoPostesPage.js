import API_URL from '../services/api';
import React, { useEffect, useRef, useState } from 'react';
import { IconDownload } from '../components/IconsHistorico';
import { salvarHistoricoPostesNoStorage, carregarHistoricoPostesDoStorage } from '../utils/localStorageHistoricoPostes';
import MenuLateral from '../components/MenuLateral';
import { Link } from 'react-router-dom';

export default function CompartilhamentoPostesPage() {
  const inputContratoRef = useRef();
  const [camposContrato, setCamposContrato] = useState(null);

  // Upload e leitura automática do contrato de postes
  const handleContratoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('contrato', file);
    const resp = await fetch(`${API_URL}/api/contrato/postes/upload`, {
      method: 'POST',
      body: formData
    });
    if (resp.ok) {
      const data = await resp.json();
      setCamposContrato(data.campos);
      // Preencher automaticamente os campos do formulário se possível
      setForm(f => ({
        ...f,
        cnpjDetentoraInfra: data.campos.cnpj || f.cnpjDetentoraInfra,
        coDescritivoContratoInfra: data.campos.numeroContrato || f.coDescritivoContratoInfra,
        dtAssinaturaContratoInfra: data.campos.dataAssinatura || f.dtAssinaturaContratoInfra,
        dtValidadeFinalContratoInfra: (data.campos.vigencia ? (data.campos.vigencia.split('a')[1] || '').trim().replace(/\//g,'-') : f.dtValidadeFinalContratoInfra),
        qtPontosFixacaoInfra: data.campos.quantidadePostes || f.qtPontosFixacaoInfra,
        vrPontoFixacaoInfra: data.campos.valor || f.vrPontoFixacaoInfra,
        // Outros campos podem ser mapeados conforme necessário
      }));
      alert('Contrato lido com sucesso! Campos extraídos: ' + JSON.stringify(data.campos, null, 2));
    } else {
      alert('Falha ao ler contrato.');
    }
  };
  // Recupera info do cliente do localStorage
  const [form, setForm] = React.useState({
    cnpjOutorgada: '',
    cnpjOutorgadaOriginal: '',
    numProcessoHomologacao: '',
    cnpjDetentoraInfra: '',
    coDescritivoContratoInfra: '',
    dtAssinaturaContratoInfra: '',
    dtValidadeFinalContratoInfra: '',
    qtPontosFixacaoInfra: '',
    vrPontoFixacaoInfra: '',
    indiceReajusteContratoInfra: '',
    dtBaseReajusteContratoInfra: '',
    icControversiaJudAdm: '',
    observacoes: ''
  });
  const [linhaSalva, setLinhaSalva] = React.useState(null);
  const [historicoLinhas, setHistoricoLinhas] = React.useState([]);
  // Busca CNPJ do cliente selecionado
  let cnpjCliente = '';
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.cnpj) cnpjCliente = obj.cnpj;
    }
  } catch {}

  const [historicoArquivos, setHistoricoArquivos] = React.useState(() => carregarHistoricoPostesDoStorage(cnpjCliente));
  let clienteInfo = null;
  let razaoSocial = '';
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.razaoSocial && obj.cnpj) {
        razaoSocial = obj.razaoSocial;
        clienteInfo = (
          <>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{obj.razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {obj.cnpj}</div>
          </>
        );
        // Preencher CNPJ automaticamente
        if (!form.cnpjOutorgada) {
          setForm(f => ({ ...f, cnpjOutorgada: obj.cnpj, cnpjOutorgadaOriginal: obj.cnpj }));
        }
      }
    }
  } catch {}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={<Link to="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</Link>}
        clienteInfo={clienteInfo}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 500, width: '100%' }}>
                    {/* Botão de exportação CSV */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      <button
                        type="button"
                        style={{
                          background: '#388e3c',
                          color: '#fff',
                          fontWeight: 700,
                          border: 'none',
                          borderRadius: 4,
                          padding: '10px 28px',
                          fontSize: 16,
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px #0002',
                          marginRight: 12
                        }}
                        onClick={() => {
                          // Cabeçalho fixo
                          const header = [
                            'CNPJ OUTORGADA',
                            'CNPJ OUTORGADA ORIGINAL',
                            'NÚMERO PROCESSO HOMOLOGAÇÃO',
                            'CNPJ DETENTORA INFRA',
                            'DESCRITIVO CONTRATO',
                            'DATA ASSINATURA',
                            'DATA VALIDADE',
                            'QTD PONTOS',
                            'VALOR PONTO',
                            'ÍNDICE REAJUSTE',
                            'DATA BASE REAJUSTE',
                            'CONTROVÉRSIA JUDICIAL',
                            'OBSERVAÇÕES'
                          ];
                          const rows = historicoLinhas.map(linha => [
                            linha.cnpjOutorgada,
                            linha.cnpjOutorgadaOriginal,
                            linha.numProcessoHomologacao,
                            linha.cnpjDetentoraInfra,
                            linha.coDescritivoContratoInfra,
                            linha.dtAssinaturaContratoInfra,
                            linha.dtValidadeFinalContratoInfra,
                            linha.qtPontosFixacaoInfra,
                            linha.vrPontoFixacaoInfra,
                            linha.indiceReajusteContratoInfra,
                            linha.dtBaseReajusteContratoInfra,
                            linha.icControversiaJudAdm,
                            linha.observacoes
                          ].map(v => v == null ? '' : String(v)).join(';'));
                          // Gera CSV sem linha em branco final
                          const csvContent = [header.join(';'), ...rows].join('\r\n');
                          // Nome do arquivo
                          let razao = '';
                          try {
                            const salvo = localStorage.getItem('clienteSelecionado');
                            if (salvo) {
                              const obj = JSON.parse(salvo);
                              razao = (obj.razaoSocial || '').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
                            }
                          } catch {}
                          const data = new Date();
                          const nomeArquivo = `COMP_POSTES_${razao}_${data.getFullYear()}${String(data.getMonth()+1).padStart(2,'0')}${String(data.getDate()).padStart(2,'0')}.csv`;
                          // Salva no histórico
                          setHistoricoArquivos(prev => {
                            const novo = [
                              { nome: nomeArquivo, conteudo: csvContent, data: data.toLocaleString() },
                              ...prev
                            ];
                            salvarHistoricoPostesNoStorage(novo, cnpjCliente);
                            return novo;
                          });
                          // Download automático
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = nomeArquivo;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Exportar CSV
                      </button>
                    </div>
          <div style={{marginBottom:24, textAlign:'center'}}>
            <button onClick={() => inputContratoRef.current && inputContratoRef.current.click()} style={{background:'#1976d2',color:'#fff',padding:'10px 24px',border:'none',borderRadius:6,fontWeight:700,fontSize:16,cursor:'pointer',marginBottom:8}}>Upload Contrato de Postes (PDF)</button>
            <input type="file" accept="application/pdf" ref={inputContratoRef} style={{display:'none'}} onChange={handleContratoUpload} />
            {camposContrato && (
              <div style={{marginTop:12, background:'#f4f8ff', border:'1px solid #1976d2', borderRadius:8, padding:12, display:'inline-block', textAlign:'left'}}>
                <b>Campos extraídos:</b>
                <pre style={{fontSize:13, margin:0}}>{JSON.stringify(camposContrato, null, 2)}</pre>
              </div>
            )}
          </div>
          <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Compartilhamento de Postes</h2>
          {/* FORMULÁRIO COMPLETO */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Número de homologação</span>
              <input
                type="text"
                placeholder="Número do processo de homologação do contrato ou aditivo na Anatel, no SEI ou no SICAP"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                value={form.numProcessoHomologacao}
                onChange={e => setForm(f => ({ ...f, numProcessoHomologacao: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>CNPJ da detentora da infraestrutura</span>
              <input
                type="text"
                placeholder="CNPJ da distribuidora de energia elétrica detentora da infraestrutura"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                value={form.cnpjDetentoraInfra}
                onChange={e => setForm(f => ({ ...f, cnpjDetentoraInfra: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Descritivo do contrato</span>
              <input
                type="text"
                placeholder="Código interno da distribuidora para o seu contrato."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                value={form.coDescritivoContratoInfra}
                onChange={e => setForm(f => ({ ...f, coDescritivoContratoInfra: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Data de assinatura</span>
              <input
                type="date"
                placeholder="Data de assinatura do contrato"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                value={form.dtAssinaturaContratoInfra}
                onChange={e => setForm(f => ({ ...f, dtAssinaturaContratoInfra: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Data de validade</span>
              <input
                type="date"
                placeholder="Data de validade do contrato"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                value={form.dtValidadeFinalContratoInfra}
                onChange={e => setForm(f => ({ ...f, dtValidadeFinalContratoInfra: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Quantidade de pontos contratados</span>
              <input
                type="number"
                min="0"
                placeholder="Informe a quantidade de pontos contratados"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                value={form.qtPontosFixacaoInfra}
                onChange={e => setForm(f => ({ ...f, qtPontosFixacaoInfra: e.target.value }))}
                onFocus={e => e.target.style.fontStyle = 'normal'}
                onBlur={e => e.target.value === '' ? e.target.style.fontStyle = 'italic' : e.target.style.fontStyle = 'normal'}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Valor por ponto contratado</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Informe o valor por ponto contratado"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                value={form.vrPontoFixacaoInfra}
                onChange={e => setForm(f => ({ ...f, vrPontoFixacaoInfra: e.target.value }))}
                onFocus={e => e.target.style.fontStyle = 'normal'}
                onBlur={e => e.target.value === '' ? e.target.style.fontStyle = 'italic' : e.target.style.fontStyle = 'normal'}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Índice de reajuste</span>
              <select
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                value={form.indiceReajusteContratoInfra}
                onChange={e => setForm(f => ({ ...f, indiceReajusteContratoInfra: e.target.value }))}
              >
                <option value="" disabled>Selecione o índice</option>
                <option value="IGP-M">IGP-M</option>
                <option value="IPCA">IPCA</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Data base de reajuste</span>
              <input
                type="date"
                placeholder="Data base de reajuste"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                value={form.dtBaseReajusteContratoInfra}
                onChange={e => setForm(f => ({ ...f, dtBaseReajusteContratoInfra: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Há controvérsia judicial?</span>
              <select
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontWeight: 700 }}
                value={form.icControversiaJudAdm}
                onChange={e => setForm(f => ({ ...f, icControversiaJudAdm: e.target.value }))}
              >
                <option value="" disabled>Selecione</option>
                <option value="SIM">Sim</option>
                <option value="NÃO">Não</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Observações</span>
              <textarea
                placeholder="Digite observações adicionais aqui..."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 60, resize: 'vertical' }}
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{
                background: '#1976d2',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: 4,
                padding: '10px 28px',
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0002',
                marginTop: 8,
                marginRight: 12
              }}
              onClick={() => {
                setLinhaSalva({ ...form });
                setHistoricoLinhas(h => [...h, { ...form }]);
              }}
            >
              Salvar Linha
            </button>
          </div>
          {/* Histórico de linhas salvas (mantém dentro do card) */}
          {historicoLinhas.length > 0 && (
            <div style={{ background: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 8, padding: 16, margin: '32px 0 0 0' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Histórico de linhas salvas:</div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, whiteSpace: 'pre', overflowX: 'auto' }}>
                {historicoLinhas.map((linha, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    {[
                      linha.cnpjOutorgada,
                      linha.cnpjOutorgadaOriginal,
                      linha.numProcessoHomologacao,
                      linha.cnpjDetentoraInfra,
                      linha.coDescritivoContratoInfra,
                      linha.dtAssinaturaContratoInfra,
                      linha.dtValidadeFinalContratoInfra,
                      linha.qtPontosFixacaoInfra,
                      linha.vrPontoFixacaoInfra,
                      linha.indiceReajusteContratoInfra,
                      linha.dtBaseReajusteContratoInfra,
                      linha.icControversiaJudAdm,
                      linha.observacoes
                    ].join(';')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Histórico de arquivos gerados (fora do card, igual Estações) */}
        {historicoArquivos.length > 0 && (
          <div style={{margin:'32px auto 0', maxWidth:900, width:'100%'}}>
            <div style={{ background: '#e3f2fd', border: '2px solid #1976d2', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Histórico de arquivos gerados:</div>
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
                      onClick={() => {
                        setHistoricoArquivos(h => {
                          const novo = h.filter((_, i) => i !== idx);
                          salvarHistoricoPostesNoStorage(novo, cnpjCliente);
                          return novo;
                        });
                      }}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
