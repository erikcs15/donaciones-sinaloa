import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, query, collection, where, onSnapshot } from 'firebase/firestore';
import Login from './pages/Login';
import BancoDashboard from './pages/BancoDashboard';
import SupermercadoDashboard from './pages/SupermercadoDashboard';
import Header from './components/Header';
import './App.css';
import AdminDashboard from './admin/AdminDashboard';
import BancoPedidos from './components/BancoPedidos';

export default function App() {
  const [user, setUser] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankViewMode, setBankViewMode] = useState('donaciones'); // 'donaciones', 'bolsa' o 'pedidos'
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const isAdmin = currentUser.email === 'admin@donacionessinaloa.com';

          if (isAdmin) {
            setUserType('admin');
          } else {
            setUserType(currentUser.displayName?.split('|')[0] || 'supermercado');
          }
        

        // Obtener datos de la empresa desde Firestore
        try {
          const docRef = doc(db, 'empresas', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEmpresaData(docSnap.data());
          }
        } catch (error) {
          console.error('Error obteniendo datos de empresa:', error);
        }
      } else {
        setUser(null);
        setEmpresaData(null);
        setUserType(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Contar productos en bolsa del banco
    useEffect(() => {
      if (userType !== 'banco') return;
      
      const q = query(
        collection(db, 'donaciones'),
        where('estado', '==', 'apartado'),
        where('apartado_por', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setCartCount(snapshot.docs.length);
      });

      return unsubscribe;
    }, [user.uid, userType]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      {userType === 'admin' ? (
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">🔐 Panel Administrador</h1>
          </div>
          <button 
            className="logout-btn"
            onClick={() => signOut(auth)}
          >
            Salir
          </button>
        </header>
      ) : (
        <Header 
          empresaData={empresaData} 
          onLogout={handleLogout}
          onBolsaClick={() => setBankViewMode('bolsa')}
          onPedidosClick={() => setBankViewMode('pedidos')}
          cartCount={cartCount}
        />
      )}
      <main className="app-content">
        {userType === 'admin' ? (
          <AdminDashboard user={user} />
        ) : userType === 'banco' ? (
          <BancoDashboard user={user} empresaData={empresaData} viewMode={bankViewMode} setViewMode={setBankViewMode} />
        ) : (
          <SupermercadoDashboard user={user} empresaData={empresaData} />
        )}
      </main>
    </div>
  );
}