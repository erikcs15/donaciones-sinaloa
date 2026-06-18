import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function Statistics() {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Obtener usuarios
  const qUsuarios = query(collection(db, 'empresas'));
  const unsubscribeUsuarios = onSnapshot(qUsuarios, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    setUsuarios(data);
  });

  // Obtener productos
  const qProductos = query(collection(db, 'donaciones'));
  const unsubscribeProductos = onSnapshot(qProductos, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    setProductos(data);
    setLoading(false);
  });

  return () => {
    unsubscribeUsuarios();
    unsubscribeProductos();
  };
}, []);

  if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;

  // Cálculos
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length;
  const supermercados = usuarios.filter(u => u.tipo === 'supermercado').length;
  const agricolas = usuarios.filter(u => u.tipo === 'agricola').length;
  const bancos = usuarios.filter(u => u.tipo === 'banco').length;

  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.estado === 'disponible').length;
  const totalKg = productos.reduce((sum, p) => sum + parseInt(p.cantidad || 0), 0);

  const productosPorTipo = {
    pan: productos.filter(p => p.tipo === 'pan').length,
    lacteos: productos.filter(p => p.tipo === 'lacteos').length,
    conservas: productos.filter(p => p.tipo === 'conservas').length,
    otros: productos.filter(p => p.tipo === 'otros').length
  };

  return (
    <div className="admin-section">
      <h2>Estadísticas del Sistema</h2>

      <div className="stats-grid">
        {/* Usuarios */}
        <div className="stat-card">
          <h3>👥 Total Usuarios</h3>
          <p className="stat-number">{totalUsuarios}</p>
          <p className="stat-detail">✓ Activos: {usuariosActivos}</p>
        </div>

        <div className="stat-card">
          <h3>🏪 Supermercados</h3>
          <p className="stat-number">{supermercados}</p>
        </div>

        <div className="stat-card">
          <h3>🌾 Agrícolas</h3>
          <p className="stat-number">{agricolas}</p>
        </div>

        <div className="stat-card">
          <h3>🏦 Bancos de Alimentos</h3>
          <p className="stat-number">{bancos}</p>
        </div>

        {/* Productos */}
        <div className="stat-card">
          <h3>📦 Total Donaciones</h3>
          <p className="stat-number">{totalProductos}</p>
          <p className="stat-detail">✓ Disponibles: {productosActivos}</p>
        </div>

        <div className="stat-card">
          <h3>⚖️ Kg Totales</h3>
          <p className="stat-number">{totalKg}</p>
          <p className="stat-detail">de alimentos</p>
        </div>

        {/* Por tipo */}
        <div className="stat-card">
          <h3>🥖 Pan</h3>
          <p className="stat-number">{productosPorTipo.pan}</p>
        </div>

        <div className="stat-card">
          <h3>🧀 Lácteos</h3>
          <p className="stat-number">{productosPorTipo.lacteos}</p>
        </div>

        <div className="stat-card">
          <h3>🥫 Conservas</h3>
          <p className="stat-number">{productosPorTipo.conservas}</p>
        </div>

        <div className="stat-card">
          <h3>📦 Otros</h3>
          <p className="stat-number">{productosPorTipo.otros}</p>
        </div>
      </div>

      <div className="stats-summary">
        <h3>Resumen</h3>
        <p>
          El sistema tiene <strong>{totalUsuarios}</strong> empresas registradas 
          ({supermercados} supermercados, {agricolas} agrícolas, {bancos} bancos) 
          con un total de <strong>{totalProductos}</strong> donaciones registradas 
          que suman <strong>{totalKg} kg</strong> de alimentos.
        </p>
      </div>
    </div>
  );
}