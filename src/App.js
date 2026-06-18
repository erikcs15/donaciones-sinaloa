import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './pages/Login';
import BancoDashboard from './pages/BancoDashboard';
import SupermercadoDashboard from './pages/SupermercadoDashboard';
import Header from './components/Header';
import './App.css';
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <Header empresaData={userType === 'admin' ? { nombreEmpresa: 'ADMIN', tipo: 'admin' } : empresaData} onLogout={handleLogout} />
      <main className="app-content">
        {userType === 'admin' ? (
          <AdminDashboard user={user} />
        ) : userType === 'banco' ? (
          <BancoDashboard user={user} empresaData={empresaData} />
        ) : (
          <SupermercadoDashboard user={user} empresaData={empresaData} />
        )}
      </main>
    </div>
  );
}