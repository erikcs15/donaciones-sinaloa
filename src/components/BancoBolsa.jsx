import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import '../styles/BancoBolsa.css';

export default function BancoBolsa({ user, empresaData }) {
  const [disponibles, setDisponibles] = useState([]);
  const [bolsa, setBolsa] = useState({});
  const [loading, setLoading] = useState(true);
  const [cantidades, setCantidades] = useState({});

  // Cargar productos disponibles
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
      setDisponibles(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    });

    return unsubscribe;
  }, [user.uid]);

  const handleAgregarABolsa = async (productoId, cantidad) => {
    if (!cantidad || cantidad <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    const producto = disponibles.find(p => p.id === productoId);
    
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

      const pedidoRef = await addDoc(collection(db, 'pickups'), {
        id_banco: user.uid,
        nombre_banco: empresaData?.nombreEmpresa || 'Banco de Alimentos',
        items_por_empresa: itemsPorEmpresa,
        estado: 'en_preparacion',
        fecha_creacion: new Date(),
        fecha_recogida: null,
        fecha_entrega: null,
        notas_admin: ''
      });

      alert(`✅ Pedido creado: ${pedidoRef.id}`);
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleContactarEmpresa = (empresa, telefono) => {
    const productos = bolsa[Object.keys(bolsa).find(key => 
      bolsa[key].empresa === empresa
    )];

    let mensaje = `Hola, soy del ${empresaData?.nombreEmpresa}. Necesito recoger los siguientes productos:\n\n`;
    
    productos.productos.forEach(p => {
      mensaje += `- ${p.tipo}: ${p.cantidad_solicitada} kg\n`;
    });
    
    mensaje += `\n¿Cuándo puedo pasar por ellos?`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="bolsa-container">
      <div className="bolsa-header">
        <h2>🛍️ Mi Bolsa</h2>
        <p>Total de empresas: {Object.keys(bolsa).length}</p>
      </div>

      {Object.keys(bolsa).length === 0 ? (
        <div className="empty-state">
          <p>Tu bolsa está vacía. Agrega productos disponibles.</p>
        </div>
      ) : (
        <>
          <div className="bolsa-items">
            {Object.entries(bolsa).map(([key, data]) => (
              <div key={key} className="empresa-grupo">
                <div className="empresa-header">
                  <h3>🏪 {data.empresa} - {data.sucursal}</h3>
                  <p>📱 {data.telefono}</p>
                </div>

                <div className="productos-grupo">
                  {data.productos.map(producto => (
                    <div key={producto.id} className="producto-bolsa">
                      <div className="producto-info">
                        <h4>{producto.tipo} - {producto.cantidad_solicitada} kg</h4>
                        <p>{producto.descripcion}</p>
                        <small>⏰ {producto.horario} | 📍 {producto.ubicacion}</small>
                      </div>
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleEliminarDeBolsa(producto.id)}
                      >
                        🗑️ Quitar
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn-contactar-empresa"
                  onClick={() => handleContactarEmpresa(data.empresa, data.telefono)}
                >
                  📱 Contactar {data.empresa}
                </button>
              </div>
            ))}
          </div>

          <button 
            className="btn-crear-pedido"
            onClick={handleCrearPedido}
          >
            ✅ Crear Pedido
          </button>
        </>
      )}

      <div className="disponibles-para-agregar">
        <h3>📦 Agregar más productos</h3>
        
        {disponibles.length === 0 ? (
          <p className="text-light">No hay productos disponibles</p>
        ) : (
          <div className="agregar-grid">
            {disponibles.map(producto => (
              <div key={producto.id} className="producto-agregar">
                <h4>{producto.supermercado}</h4>
                <p><strong>{producto.tipo}</strong></p>
                <p>Disponible: {producto.cantidad} kg</p>
                <p className="text-light">{producto.descripcion}</p>

                <div className="cantidad-selector">
                  <input
                    type="number"
                    min="1"
                    max={producto.cantidad}
                    placeholder="Cantidad (kg)"
                    value={cantidades[producto.id] || ''}
                    onChange={(e) => setCantidades(prev => ({
                      ...prev,
                      [producto.id]: e.target.value
                    }))}
                  />
                  <button 
                    className="btn-agregar"
                    onClick={() => handleAgregarABolsa(producto.id, cantidades[producto.id])}
                  >
                    ➕ Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}