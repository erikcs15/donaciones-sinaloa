import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import BancoBolsa from '../components/BancoBolsa';
import '../styles/Dashboard.css';

export default function BancoDashboard({ user, empresaData }) {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [activeView, setActiveView] = useState('disponibles');

  useEffect(() => {
    const q = query(
      collection(db, 'donaciones'),
      where('estado', '==', 'disponible')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonaciones(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const donacionesFiltradas = filtro === 'todas' 
    ? donaciones 
    : donaciones.filter(d => d.tipo === filtro);

  const handleContacto = (supermercado, telefono) => {
    const mensaje = `Hola, soy del banco de alimentos. Vi que tienen donación disponible. ¿Podemos coordinar recogida?`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="dashboard">
      <section className="section-header">
        <h2>Donaciones Disponibles</h2>
        <p>Estos son los alimentos que puedes recoger</p>
      </section>

      <div className="banco-views">
        <button 
          className={`view-tab ${activeView === 'disponibles' ? 'active' : ''}`}
          onClick={() => setActiveView('disponibles')}
        >
          📦 Donaciones Disponibles
        </button>
        <button 
          className={`view-tab ${activeView === 'bolsa' ? 'active' : ''}`}
          onClick={() => setActiveView('bolsa')}
        >
          🛍️ Mi Bolsa
        </button>
      </div>

      {activeView === 'disponibles' && (
        <>
          <div className="filtros">
            <button 
              className={`filter-btn ${filtro === 'todas' ? 'active' : ''}`}
              onClick={() => setFiltro('todas')}
            >
              Todas ({donaciones.length})
            </button>
            <button 
              className={`filter-btn ${filtro === 'pan' ? 'active' : ''}`}
              onClick={() => setFiltro('pan')}
            >
              Pan
            </button>
            <button 
              className={`filter-btn ${filtro === 'lacteos' ? 'active' : ''}`}
              onClick={() => setFiltro('lacteos')}
            >
              Lácteos
            </button>
            <button 
              className={`filter-btn ${filtro === 'conservas' ? 'active' : ''}`}
              onClick={() => setFiltro('conservas')}
            >
              Conservas
            </button>
            <button 
              className={`filter-btn ${filtro === 'otros' ? 'active' : ''}`}
              onClick={() => setFiltro('otros')}
            >
              Otros
            </button>
          </div>

          {loading ? (
            <div className="loading">Cargando donaciones...</div>
          ) : donacionesFiltradas.length === 0 ? (
            <div className="empty-state">
              <p>No hay donaciones disponibles en este momento</p>
            </div>
          ) : (
            <div className="donaciones-grid">
              {donacionesFiltradas.map(donacion => (
                <div key={donacion.id} className="donacion-card">
                  <div className="card-header">
                    <h3>{donacion.supermercado}</h3>
                    <span className="badge">{donacion.tipo}</span>
                  </div>

                  <div className="card-content">
                    <p><strong>Cantidad:</strong> {donacion.cantidad} kg</p>
                    <p><strong>Descripción:</strong> {donacion.descripcion}</p>
                    <p><strong>Disponible:</strong> {donacion.horario}</p>
                    <p><strong>Ubicación:</strong> {donacion.ubicacion}</p>
                  </div>

                  <div className="card-footer">
                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #D1D5DB' }}>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <strong>📱 Teléfono:</strong> {donacion.telefono}
                      </p>
                    </div>
                    <button 
                      className="contact-btn"
                      onClick={() => handleContacto(donacion.supermercado, donacion.telefono)}
                    >
                      📱 Contactar por WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'bolsa' && (
        <BancoBolsa user={user} empresaData={empresaData} />
      )}
    </div>
  );
}