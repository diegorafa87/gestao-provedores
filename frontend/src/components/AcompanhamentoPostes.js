import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '';
const ANOS = [2021, 2022, 2023, 2024];
const chaveChecks = 'checks_postes';
const chaveDesligados = 'anos_desligados_postes';
const chaveOcultos = 'anos_ocultos_postes';

function initialData() {
  const data = {};
  ANOS.forEach(ano => {
    data[ano] = {
      checked: false,
      file: null,
      fileUrl: '',
    };
  });
  return data;
}

export default function AcompanhamentoPostes({ cnpj, razaoSocial }) {
  const [dados, setDados] = useState(initialData());
  const [anosDesligados, setAnosDesligados] = useState([]);
  const [anosOcultos, setAnosOcultos] = useState([]);

  useEffect(() => {
    if (!cnpj) return;
    fetch(`${API_URL}/api/acompanhamento-postes/${cnpj}`)
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

  useEffect(() => {
    if (!cnpj) return;
    fetch(`${API_URL}/api/acompanhamento-postes/${cnpj}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anosDesligados, anosOcultos })
    });
    localStorage.setItem(chaveDesligados, JSON.stringify(anosDesligados));
    localStorage.setItem(chaveOcultos, JSON.stringify(anosOcultos));
  }, [anosDesligados, anosOcultos, cnpj]);

  useEffect(() => {
    const salvo = localStorage.getItem(chaveChecks);
    if (salvo) {
      const checksSalvos = JSON.parse(salvo);
      setDados(prev => {
        const base = initialData();
        ANOS.forEach(ano => {
          base[ano].checked = !!checksSalvos[ano];
        });
        ANOS.forEach(ano => {
          if (prev[ano].file) {
            base[ano].file = prev[ano].file;
            base[ano].fileUrl = prev[ano].fileUrl;
          }
        });
        return base;
      });
    } else {
      setDados(initialData());
    }
  }, [cnpj]);

  const handleCheck = (ano) => {
    setDados(prev => {
      const novo = {
        ...prev,
        [ano]: {
          ...prev[ano],
          checked: !prev[ano].checked
        }
      };
      const checksToSave = {};
      ANOS.forEach(a => { checksToSave[a] = novo[a].checked; });
      localStorage.setItem(chaveChecks, JSON.stringify(checksToSave));
      return novo;
    });
  };

  const handleFileChange = (ano, file) => {
    if (!file) return;
    setDados(prev => ({
      ...prev,
      [ano]: {
        ...prev[ano],
        file: file,
        fileUrl: URL.createObjectURL(file)
      }
    }));
    fetch(`${API_URL}/api/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'UPLOAD_PDF_POSTES',
        usuario: razaoSocial || 'desconhecido',
        detalhes: { nomeArquivo: file.name, ano }
      })
    });
  };

  const handleDownload = (ano) => {
    const fileUrl = dados[ano].fileUrl;
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `Postes_${ano}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!razaoSocial) {
    return <div>Selecione um cliente para visualizar os dados de postes.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Acompanhamento de Postes</h2>
      {ANOS.map(ano => (
        <div key={ano} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={dados[ano].checked}
              onChange={() => handleCheck(ano)}
            />{' '}
            {ano} - PDF:{' '}
            <input
              type="file"
              accept="application/pdf"
              onChange={e => handleFileChange(ano, e.target.files[0])}
            />
            {dados[ano].fileUrl && (
              <button type="button" onClick={() => handleDownload(ano)} style={{ marginLeft: 8 }}>
                Baixar PDF
              </button>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}