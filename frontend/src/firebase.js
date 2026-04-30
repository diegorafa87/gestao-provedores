// Configuração e inicialização do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgj9_T6zqc26z9XQcr-o-_M22x-QmBxqU",
  authDomain: "doc-provedor-1300e.firebaseapp.com",
  projectId: "doc-provedor-1300e",
  storageBucket: "doc-provedor-1300e.firebasestorage.app",
  messagingSenderId: "604407762658",
  appId: "1:604407762658:web:edc1cdbce8d7191555d8bb"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
