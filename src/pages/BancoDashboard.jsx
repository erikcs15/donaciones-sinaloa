import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import BancoBolsa from '../components/BancoBolsa';
import BancoPedidos from '../components/BancoPedidos';
import '../styles/Dashboard.css';

export default function BancoDashboard({ user, empresaData, viewMode = 'donaciones', setViewMode }) {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [cantidades, setCantidades] = useState({});

  // Cargar donaciones disponibles
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

  const handleAgregarABolsa = async (productoId, cantidad) => {
    if (!cantidad || cantidad <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    const producto = donaciones.find(p => p.id === productoId);
    
    if (parseInt(cantidad) > producto.cantidad) {
      alert('No puedes solicitar más de lo disponible');
      return;
    }

    try {
      await updateDoc(doc(db, 'donaciones', productoId), {
        estado: 'apartado',
        apartado_por: user.uid,
        cantidad_solicitada: parseInt(cantidad)
      });

      setCantidades(prev => ({
        ...prev,
        [productoId]: ''
      }));
      alert('✅ Agregado a tu bolsa');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Mostrar bolsa
  if (viewMode === 'bolsa') {
    return (
      <div className="dashboard">
        <button 
          className="btn-volver"
          onClick={() => setViewMode('donaciones')}
        >
          ← Volver a Donaciones
        </button>
        <BancoBolsa user={user} empresaData={empresaData} />
      </div>
    );
  }

  // Mostrar pedidos
  if (viewMode === 'pedidos') {
    return (
      <div className="dashboard">
        <button 
          className="btn-volver"
          onClick={() => setViewMode('donaciones')}
        >
          ← Volver a Donaciones
        </button>
        <BancoPedidos user={user} empresaData={empresaData} />
      </div>
    );
  }

  // Mostrar donaciones disponibles
  return (
    <div className="dashboard">
      <section className="section-header">
        <h2>📦 Donaciones Disponibles</h2>
        <p>Selecciona los productos que deseas recoger</p>
      </section>

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
                <p><strong>Cantidad disponible:</strong> {donacion.cantidad} kg</p>
                <p><strong>Descripción:</strong> {donacion.descripcion}</p>
                <p><strong>Horario:</strong> {donacion.horario}</p>
                <p><strong>Ubicación:</strong> {donacion.ubicacion}</p>
              </div>

              <div className="card-footer">
                <div className="cantidad-selector-card">
                  <input
                    type="number"
                    min="1"
                    max={donacion.cantidad}
                    placeholder="kg"
                    value={cantidades[donacion.id] || ''}
                    onChange={(e) => setCantidades(prev => ({
                      ...prev,
                      [donacion.id]: e.target.value
                    }))}
                  />
                  <button 
                    className="contact-btn"
                    onClick={() => handleAgregarABolsa(donacion.id, cantidades[donacion.id])}
                  >
                    ➕ Agregar a Bolsa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}