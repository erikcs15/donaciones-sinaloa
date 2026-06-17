import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function ProductsView() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    const q = query(collection(db, 'donaciones'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'donaciones', id));
        alert('✅ Producto eliminado');
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  };

  const productosFiltrados = filtro === 'todas' 
    ? productos 
    : productos.filter(p => p.tipo === filtro);

  if (loading) return <div className="admin-loading">Cargando productos...</div>;

  return (
    <div className="admin-section">
      <h2>Gestión de Productos</h2>
      <p className="section-info">Total de donaciones: {productos.length}</p>

      <div className="filtros-admin">
        <button 
          className={`filter-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({productos.length})
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

      <div className="productos-grid">
        {productosFiltrados.map(producto => (
          <div key={producto.id} className="producto-card">
            <div className="producto-header">
              <h3>{producto.supermercado}</h3>
              <span className="tipo-badge">{producto.tipo}</span>
            </div>

            <div className="producto-info">
              <p><strong>Cantidad:</strong> {producto.cantidad} kg</p>
              <p><strong>Descripción:</strong> {producto.descripcion}</p>
              <p><strong>Horario:</strong> {producto.horario}</p>
              <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
              <p><strong>Teléfono:</strong> {producto.telefono}</p>
              <p><strong>Estado:</strong> {producto.estado}</p>
            </div>

            <button 
              className="btn-delete"
              onClick={() => handleDeleteProduct(producto.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div className="empty-state">
          <p>No hay productos en este filtro</p>
        </div>
      )}
    </div>
  );
}