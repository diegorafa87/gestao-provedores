import React, { useState, useEffect } from 'react';
import { getMesesComDados } from '../services/clienteMeses';

/**
 * Componente que exibe quais meses têm dados preenchidos para um cliente
 * Mostra apenas um grid visual dos meses (1-12) com cores indicando se há dados
 * 
 * Props:
 * - clienteCNPJ: CNPJ do cliente para buscar dados
 */
export default function MesesComDadosIndicador({ clienteCNPJ }) {
  const [meses, setMeses] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const mesesNomes = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  useEffect(() => {
    const buscarMeses = async () => {
      setCarregando(true);
      const dados = await getMesesComDados(clienteCNPJ);
      setMeses(dados);
      setCarregando(false);
    };
    
    if (clienteCNPJ) {
      buscarMeses();
    }
  }, [clienteCNPJ]);

  if (carregando) {
    return <div style={{ fontSize: '12px', color: '#999' }}>↻</div>;
  }

  if (!meses) {
    return <div style={{ fontSize: '12px', color: '#999' }}>-</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '4px'
    }}>
      {mesesNomes.map((mes, idx) => {
        const mesNum = idx + 1;
        // Verifica se qualquer módulo tem esse mês
        const temDados = Object.values(meses).some(mesesModulo => 
          mesesModulo.includes(mesNum)
        );

        return (
          <div
            key={mesNum}
            style={{
              width: '20px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px',
              background: temDados ? '#388e3c' : '#e0e0e0',
              color: temDados ? '#fff' : '#999',
              fontWeight: temDados ? 'bold' : 'normal',
              border: temDados ? '1px solid #2e7d32' : '1px solid #bbb',
              fontSize: '11px',
              cursor: 'default'
            }}
            title={`Mês ${mesNum}${Object.keys(meses)
              .filter(mod => meses[mod].includes(mesNum)).length > 0 
              ? ' - com dados' 
              : ' - sem dados'}`}
          >
            {mes}
          </div>
        );
      })}
    </div>
  );
}
