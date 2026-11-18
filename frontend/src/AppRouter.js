import HistoricoSCMPage from './pages/HistoricoSCMPage';
import CadastroRapidoCliente from './components/CadastroRapidoCliente';
import CompartilhamentoPostesPage from './pages/CompartilhamentoPostesPage';
import CertidoesPage from './pages/CertidoesPage';
import ContratosPage from './pages/ContratosPage';
import EstacoesPage from './pages/EstacoesPage';
import SubmenuAcessoCampos from './pages/SubmenuAcessoCampos';
import EnlacesPropriosPage from './pages/EnlacesPropriosPage';
import EnlacesContratadosPage from './pages/EnlacesContratadosPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import App from './App';
import DetalheCliente from './pages/DetalheCliente';
import EditarPerfil from './pages/EditarPerfil';
import PaginaCadastroSCM from './pages/CadastroSCMPage';

import PaginaCadastroTVpA from './pages/PaginaCadastroTVpA';

import PaginaCadastroSTFC from './pages/CadastroSTFCPage';
import RelatorioPrimeiroSemestre from './pages/RelatorioPrimeiroSemestre';
import RelatorioSegundoSemestre from './pages/RelatorioSegundoSemestre';
import AdminLogin from './components/AdminLogin';
import AdminUsuariosPage from './pages/AdminUsuariosPage';

const RequireAuth = ({ children }) => {
  let user = null;
  const location = window.location.pathname;
  try {
    const raw = localStorage.getItem('authUser');
    if (raw) user = JSON.parse(raw);
  } catch {}

  if (!user?.email) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'NETO' && user.clienteId) {
    const clienteRoute = `/cliente/${user.clienteId}`;
    const editarPerfilRoute = `/editar-perfil/${user.clienteId}`;
    const rotasPermitidasNeto = new Set([
      clienteRoute,
      '/scm/cadastro',
      '/tvpa/cadastro',
      '/stfc/cadastro',
      '/relatorio-economico/primeiro-semestre',
      '/relatorio-economico/segundo-semestre',
      '/infra/estacoes',
      '/infra/enlaces-proprios',
      '/infra/enlaces-contratados',
      '/postes/compartilhamento',
      '/gerenciador/acesso',
      editarPerfilRoute,
    ]);

    const rotaBloqueada =
      location === '/' ||
      location.startsWith('/admin') ||
      location === '/cadastro-cliente';

    if (rotaBloqueada || !rotasPermitidasNeto.has(location)) {
      return <Navigate to={clienteRoute} replace />;
    }
  }

  return children;
};

const AppRouter = () => {
  // Removido o estado admin, pois a autenticação é controlada pelo Firebase
  // Busca clienteSelecionado do localStorage
  let clienteInfo = null;
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.razaoSocial && obj.cnpj) {
        clienteInfo = (
          <>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{obj.razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {obj.cnpj}</div>
          </>
        );
      }
    }
  } catch {}
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />

        <Route path="/cadastro-cliente" element={<RequireAuth><CadastroRapidoCliente /></RequireAuth>} />
        <Route path="*" element={<RequireAuth><App /></RequireAuth>} />

        <Route path="/admin-area" element={<RequireAuth><div style={{padding:40}}><h2>Bem-vindo, Admin!</h2><p>Você está autenticado como administrador.</p></div></RequireAuth>} />
        <Route path="/admin/usuarios" element={<RequireAuth><AdminUsuariosPage /></RequireAuth>} />
        <Route path="/historico-scm" element={<RequireAuth><HistoricoSCMPage /></RequireAuth>} />
        <Route path="/" element={<RequireAuth><App /></RequireAuth>} />
        <Route path="/cliente/:id" element={<RequireAuth><DetalheCliente /></RequireAuth>} />
        <Route path="/scm/cadastro" element={<RequireAuth><PaginaCadastroSCM /></RequireAuth>} />
        <Route path="/editar-perfil/:id" element={<RequireAuth><EditarPerfil /></RequireAuth>} />
        <Route path="/tvpa/cadastro" element={<RequireAuth><PaginaCadastroTVpA /></RequireAuth>} />
        <Route path="/stfc/cadastro" element={<RequireAuth><PaginaCadastroSTFC /></RequireAuth>} />
        <Route path="/relatorio-economico/primeiro-semestre" element={<RequireAuth><RelatorioPrimeiroSemestre /></RequireAuth>} />
        <Route path="/relatorio-economico/segundo-semestre" element={<RequireAuth><RelatorioSegundoSemestre /></RequireAuth>} />
        <Route path="/infra/estacoes" element={<RequireAuth><EstacoesPage clienteInfo={clienteInfo} /></RequireAuth>} />
        <Route path="/infra/enlaces-proprios" element={<RequireAuth><EnlacesPropriosPage /></RequireAuth>} />
        <Route path="/infra/enlaces-contratados" element={<RequireAuth><EnlacesContratadosPage /></RequireAuth>} />
        <Route path="/gerenciador/acesso" element={<RequireAuth><SubmenuAcessoCampos /></RequireAuth>} />
        <Route path="/contratos-e-certidoes/contratos" element={<RequireAuth><ContratosPage /></RequireAuth>} />
        <Route path="/contratos-e-certidoes/certidoes" element={<RequireAuth><CertidoesPage /></RequireAuth>} />
        <Route path="/postes/compartilhamento" element={<RequireAuth><CompartilhamentoPostesPage /></RequireAuth>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
