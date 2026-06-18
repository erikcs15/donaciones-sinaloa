import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import '../styles/BancoPedidos.css';

export default function BancoPedidos({ user, empresaData }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const q = query(
      collection(db, 'pickups'),
      where('id_banco', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user.uid]);

  const pedidosFiltrados = filtro === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtro);

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'en_preparacion': return '#FF9800';
      case 'recogido': return '#2196F3';
      case 'entregado': return '#2E7D32';
      default: return '#999';
    }
  };

  const getEstadoEmoji = (estado) => {
    switch(estado) {
      case 'en_preparacion': return '⏳';
      case 'recogido': return '✓';
      case 'entregado': return '✅';
      default: return '•';
    }
  };

  if (loading) return <div className="loading">Cargando pedidos...</div>;

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h2>📦 Mis Pedidos</h2>
        <p>Total: {pedidos.length}</p>
      </div>

      <div className="filtros-pedidos">
        <button 
          className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({pedidos.length})
        </button>
        <button 
          className={`filter-btn ${filtro === 'en_preparacion' ? 'active' : ''}`}
          onClick={() => setFiltro('en_preparacion')}
        >
          En Preparación
        </button>
        <button 
          className={`filter-btn ${filtro === 'recogido' ? 'active' : ''}`}
          onClick={() => setFiltro('recogido')}
        >
          Recogido
        </button>
        <button 
          className={`filter-btn ${filtro === 'entregado' ? 'active' : ''}`}
          onClick={() => setFiltro('entregado')}
        >
          Entregado
        </button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>No hay pedidos en este estado</p>
        </div>
      ) : (
        <div className="pedidos-list">
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <h3>Pedido: {pedido.id.slice(0, 8).toUpperCase()}</h3>
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: getEstadoColor(pedido.estado) }}
                >
                  {getEstadoEmoji(pedido.estado)} {pedido.estado.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="pedido-info">
                <p><strong>Banco:</strong> {pedido.nombre_banco}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha_creacion.seconds * 1000).toLocaleDateString('es-ES')}</p>
              </div>

              <div className="empresas-en-pedido">
                <h4>Empresas en este pedido:</h4>
                {Object.entries(pedido.items_por_empresa || {}).map(([key, empresa]) => (
                  <div key={key} className="empresa-pedido">
                    <h5>{empresa.empresa} - {empresa.sucursal}</h5>
                    <p><strong>Teléfono:</strong> {empresa.telefono}</p>
                    <div className="productos-pedido">
                      {empresa.productos.map((prod, idx) => (
                        <p key={idx} className="producto-item">
                          • {prod.tipo}: {prod.cantidad_solicitada} kg
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pedido-footer">
                <small>
                  {pedido.fecha_recogida && (
                    <p>Recogido: {new Date(pedido.fecha_recogida.seconds * 1000).toLocaleDateString('es-ES')}</p>
                  )}
                  {pedido.notas_admin && (
                    <p><strong>Notas:</strong> {pedido.notas_admin}</p>
                  )}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}