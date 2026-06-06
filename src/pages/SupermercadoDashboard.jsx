import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase';
import '../styles/Dashboard.css';

export default function SupermercadoDashboard({ user }) {
  const [donaciones, setDonaciones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'pan',
    cantidad: '',
    descripcion: '',
    horario: '',
    ubicacion: ''
  });

  const nombredSupermercado = user.email.split('@')[0];
  const telefonoDemo = '+5746123456'; // Para demo

  useEffect(() => {
    const q = query(
      collection(db, 'donaciones'),
      where('email', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonaciones(data);
    });

    return unsubscribe;
  }, [user.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'donaciones'), {
        ...formData,
        supermercado: nombredSupermercado,
        email: user.email,
        telefono: telefonoDemo,
        estado: 'disponible',
        fechaCreacion: new Date(),
        cantidad: parseInt(formData.cantidad)
      });

      setFormData({
        tipo: 'pan',
        cantidad: '',
        descripcion: '',
        horario: '',
        ubicacion: ''
      });
      setShowForm(false);
      alert('✅ Donación registrada exitosamente');
    } catch (error) {
      alert('❌ Error al registrar: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta donación?')) {
      try {
        await deleteDoc(doc(db, 'donaciones', id));
        alert('✅ Donación eliminada');
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  };

  return (
    <div className="dashboard">
      <section className="section-header">
        <h2>Mis Donaciones</h2>
        <p>Registra y gestiona las donaciones de {nombredSupermercado}</p>
      </section>

      <button 
        className={`add-btn ${showForm ? 'active' : ''}`}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '❌ Cancelar' : '➕ Agregar Donación'}
      </button>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="donation-form">
            <h3>Nueva Donación</h3>

            <div className="form-group">
              <label>Tipo de Producto</label>
              <select 
                name="tipo" 
                value={formData.tipo}
                onChange={handleInputChange}
                required
              >
                <option value="pan">🥖 Pan</option>
                <option value="lacteos">🧀 Lácteos</option>
                <option value="conservas">🥫 Conservas</option>
                <option value="otros">📦 Otros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad (kg)</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                placeholder="50"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Pan integral vence mañana"
                required
              />
            </div>

            <div className="form-group">
              <label>Horario Disponible</label>
              <input
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                placeholder="Ej: 4:00 PM - 6:00 PM"
                required
              />
            </div>

            <div className="form-group">
              <label>Ubicación/Sucursal</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ej: Calle Principal 123, Culiacán"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Guardando...' : '✅ Registrar Donación'}
            </button>
          </form>
        </div>
      )}

      <div className="donaciones-list">
        <h3>Mis Donaciones Registradas</h3>
        {donaciones.length === 0 ? (
          <div className="empty-state">
            <p>No hay donaciones registradas aún</p>
          </div>
        ) : (
          donaciones.map(donacion => (
            <div key={donacion.id} className="list-item">
              <div className="item-info">
                <h4>{donacion.tipo.charAt(0).toUpperCase() + donacion.tipo.slice(1)} - {donacion.cantidad} kg</h4>
                <p>{donacion.descripcion}</p>
                <p className="meta">📍 {donacion.ubicacion} | ⏰ {donacion.horario}</p>
              </div>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(donacion.id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}