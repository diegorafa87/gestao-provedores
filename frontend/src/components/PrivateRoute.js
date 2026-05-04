import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [acessoNegado, setAcessoNegado] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const email = localStorage.getItem('emailUsuario');
        const consultoria = localStorage.getItem('consultoriaUsuario');
        // Se for o usuário específico, só pode acessar se for CAINARA
        if (email === 'dijanjogador123@gmail.com') {
          if (consultoria !== 'CAINARA') {
            setAcessoNegado(true);
            await signOut(auth);
            localStorage.removeItem('consultoriaUsuario');
            localStorage.removeItem('emailUsuario');
            setLoading(false);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{textAlign:'center',marginTop:80}}>Carregando...</div>;
  if (acessoNegado) return <Navigate to="/admin-login" replace state={{ erro: 'Acesso restrito à consultoria CAINARA.' }} />;
  if (!user) return <Navigate to="/admin-login" replace />;
  return children;
}
