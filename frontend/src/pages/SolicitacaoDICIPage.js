import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral';
import { getGerenciadorAcessosPendentes } from '../services/gerenciadorAcesso';

function obterCompetenciaDICI() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
}

function obterNumeroWhatsapp(telefone) {
  const numero = String(telefone || '').replace(/\D/g, '');
  if (numero.startsWith('55') && (numero.length === 12 || numero.length === 13)) {
    return numero;
  }
  if (numero.length === 10 || numero.length === 11) {
    return `55${numero}`;
  }
  return '';
}

export default function SolicitacaoDICIPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const competencia = obterCompetenciaDICI();
  const mes = competencia.toLocaleDateString('pt-BR', { month: 'long' });
  const ano = competencia.getFullYear();
  const competenciaLabel = `${mes} de ${ano}`;
  const mensagem = `Olá! O arquivo DICI da competência ${mes}/${ano} já pode ser enviado. Por favor, encaminhe o arquivo por este WhatsApp. Obrigado!`;

  useEffect(() => {
    let ativo = true;
    getGerenciadorAcessosPendentes()
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('A lista de clientes retornou um formato inválido.');
        }
        if (ativo) setClientes(data);
      })
      .catch(err => {
        console.error('Erro ao carregar clientes sem acesso completo ao GERENCIADOR:', err);
        if (ativo) setErro('Não foi possível carregar a lista de clientes. Tente novamente.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => { ativo = false; };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={
          <Link to="/gerenciador/acesso" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold', fontSize: '1.1rem', display: 'block', marginBottom: '1.5rem', marginTop: '1rem' }}>
            &larr; Voltar
          </Link>
        }
      />
      <main style={{ flex: 1, marginLeft: 200, padding: '32px', maxWidth: 1000 }}>
        <h1 style={{ color: '#153a6b', marginTop: 0 }}>Solicitar arquivos DICI</h1>
        <p>
          Clientes sem link, login ou senha completos no GERENCIADOR. Competência solicitada: <strong>{competenciaLabel}</strong>.
        </p>
        <p style={{ color: '#475569' }}>
          Cada botão abre uma conversa do WhatsApp com a mensagem pronta. Revise e envie a mensagem pelo WhatsApp.
        </p>

        {carregando && <p>Carregando clientes...</p>}
        {erro && <p role="alert" style={{ color: '#b91c1c' }}>{erro}</p>}
        {!carregando && !erro && clientes.length === 0 && (
          <p style={{ background: '#ecfdf5', color: '#166534', padding: 16, borderRadius: 8 }}>
            Todos os clientes têm link, login e senha preenchidos no GERENCIADOR.
          </p>
        )}

        {!carregando && !erro && clientes.map(cliente => {
          const telefone = cliente.telefoneResponsavel || cliente.telefone || '';
          const numeroWhatsapp = obterNumeroWhatsapp(telefone);
          const urlWhatsapp = numeroWhatsapp
            ? `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`
            : '';

          return (
            <section key={cliente.cnpj} style={{ background: '#fff', border: '1px solid #dbe3ee', borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px #0000000d' }}>
              <strong style={{ color: '#153a6b' }}>{cliente.razaoSocial}</strong>
              <div style={{ marginTop: 4, color: '#475569' }}>CNPJ: {cliente.cnpj}</div>
              <div style={{ marginTop: 4, color: '#475569' }}>
                WhatsApp: {telefone || 'Telefone não cadastrado'}
                {cliente.telefoneResponsavel && cliente.responsavel ? ` (${cliente.responsavel})` : ''}
              </div>
              {urlWhatsapp ? (
                <a
                  href={urlWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 12, padding: '8px 14px', borderRadius: 6, background: '#15803d', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
                >
                  Abrir WhatsApp
                </a>
              ) : (
                <span style={{ display: 'inline-block', marginTop: 12, color: '#b91c1c', fontWeight: 600 }}>
                  Não há telefone válido para WhatsApp
                </span>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
