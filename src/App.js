import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './pages/Login';
import BancoDashboard from './pages/BancoDashboard';
import SupermercadoDashboard from './pages/SupermercadoDashboard';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Obtenemos tipo de usuario del displayName (lo guardamos en login)
        setUserType(currentUser.displayName?.split('|')[0] || 'banco');
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">🤝 Donaciones Sinaloa</h1>
          <p className="user-badge">{userType === 'banco' ? '🏦 Banco de Alimentos' : '🏪 Supermercado'}</p>
        </div>
        <button 
          className="logout-btn"
          onClick={() => signOut(auth)}
        >
          Salir
        </button>
      </header>

      <main className="app-content">
        {userType === 'banco' ? <BancoDashboard user={user} /> : <SupermercadoDashboard user={user} />}
      </main>
    </div>
  );
}