import { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import UsersManagement from './UsersManagement';
import ProductsView from './ProductsView';
import Statistics from './Statistics';
import './admin.css';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('usuarios');

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🔐 Panel Administrador</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </div>

      <div className="admin-nav">
        <button 
          className={`admin-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuarios
        </button>
        <button 
          className={`admin-tab ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          📦 Productos
        </button>
        <button 
          className={`admin-tab ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          📊 Estadísticas
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'usuarios' && <UsersManagement />}
        {activeTab === 'productos' && <ProductsView />}
        {activeTab === 'estadisticas' && <Statistics />}
      </div>
    </div>
  );
}