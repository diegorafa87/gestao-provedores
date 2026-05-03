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
                    {/* Botão EXPORTAR CSV removido */}
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
                          {/* Botão EXPORTAR CSV removido */}
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
