import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import '../styles/BancoBolsa.css';

export default function BancoBolsa({ user, empresaData, onVolver }) {
  const [bolsa, setBolsa] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar bolsa del banco (productos apartados)
  useEffect(() => {
    const q = query(
      collection(db, 'donaciones'),
      where('estado', '==', 'apartado'),
      where('apartado_por', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Agrupar por empresa/sucursal
      const agrupado = {};
      data.forEach(producto => {
        const key = `${producto.supermercado}-${producto.empresaSucursal}`;
        if (!agrupado[key]) {
          agrupado[key] = {
            empresa: producto.supermercado,
            sucursal: producto.empresaSucursal,
            telefono: producto.telefono,
            productos: []
          };
        }
        agrupado[key].productos.push(producto);
      });
      
      setBolsa(agrupado);
      setLoading(false);
    });

    return unsubscribe;
  }, [user.uid]);

  const handleEliminarDeBolsa = async (productoId) => {
    if (window.confirm('¿Eliminar de la bolsa?')) {
      try {
        await updateDoc(doc(db, 'donaciones', productoId), {
          estado: 'disponible',
          apartado_por: null,
          cantidad_solicitada: null
        });
        alert('✅ Eliminado de la bolsa');
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  };

  const handleCrearPedido = async () => {
    if (Object.keys(bolsa).length === 0) {
      alert('Tu bolsa está vacía');
      return;
    }

    try {
      const itemsPorEmpresa = {};
      
      Object.entries(bolsa).forEach(([key, data]) => {
        itemsPorEmpresa[key] = {
          empresa: data.empresa,
          sucursal: data.sucursal,
          telefono: data.telefono,
          productos: data.productos.map(p => ({
            id_producto: p.id,
            tipo: p.tipo,
            cantidad_solicitada: p.cantidad_solicitada,
            descripcion: p.descripcion,
            ubicacion: p.ubicacion,
            horario: p.horario
          }))
        };
      });

      await addDoc(collection(db, 'pickups'), {
        id_banco: user.uid,
        nombre_banco: empresaData?.nombreEmpresa || 'Banco de Alimentos',
        items_por_empresa: itemsPorEmpresa,
        estado: 'en_preparacion',
        fecha_creacion: new Date(),
        fecha_recogida: null,
        fecha_entrega: null,
        notas_admin: ''
      });

      alert('✅ Pedido creado exitosamente');
      onVolver();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleContactarEmpresa = (empresa, telefono, productos) => {
    let mensaje = `Hola, soy del ${empresaData?.nombreEmpresa}. Necesito recoger los siguientes productos:\n\n`;
    
    productos.forEach(p => {
      mensaje += `• ${p.tipo}: ${p.cantidad_solicitada} kg\n`;
    });
    
    mensaje += `\n¿Cuándo puedo pasar por ellos?`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Cargando bolsa...</div>;

  const totalProductos = Object.values(bolsa).reduce((sum, grupo) => sum + grupo.productos.length, 0);

  return (
    <div className="bolsa-panel">
      <div className="bolsa-header-panel">
        <h2>🛍️ Mi Bolsa</h2>
        <p>Total de empresas: {Object.keys(bolsa).length} | Total de productos: {totalProductos}</p>
      </div>

      {Object.keys(bolsa).length === 0 ? (
        <div className="empty-state">
          <p>Tu bolsa está vacía. Agrega productos desde Donaciones Disponibles.</p>
        </div>
      ) : (
        <>
          <div className="bolsa-items-panel">
            {Object.entries(bolsa).map(([key, data]) => (
              <div key={key} className="empresa-grupo-panel">
                <div className="empresa-header-panel">
                  <h3>🏪 {data.empresa}</h3>
                  <p>{data.sucursal}</p>
                  <p className="telefono">📱 {data.telefono}</p>
                </div>

                <div className="productos-grupo-panel">
                  {data.productos.map(producto => (
                    <div key={producto.id} className="producto-bolsa-panel">
                      <div className="producto-info-panel">
                        <h4>{producto.tipo}</h4>
                        <p><strong>{producto.cantidad_solicitada} kg</strong></p>
                        <small>{producto.descripcion}</small>
                        <small className="meta">⏰ {producto.horario} | 📍 {producto.ubicacion}</small>
                      </div>
                      <button 
                        className="btn-eliminar-panel"
                        onClick={() => handleEliminarDeBolsa(producto.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn-contactar-empresa-panel"
                  onClick={() => handleContactarEmpresa(data.empresa, data.telefono, data.productos)}
                >
                  📱 Contactar {data.empresa}
                </button>
              </div>
            ))}
          </div>

          <button 
            className="btn-crear-pedido-panel"
            onClick={handleCrearPedido}
          >
            ✅ Crear Pedido
          </button>
        </>
      )}
    </div>
  );
}