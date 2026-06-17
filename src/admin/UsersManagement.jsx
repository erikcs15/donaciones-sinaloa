import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function UsersManagement() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'empresas'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`✅ Email de reset enviado a ${email}`);
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await updateDoc(doc(db, 'empresas', id), {
        estado: estadoActual === 'activo' ? 'inactivo' : 'activo'
      });
      alert('✅ Estado actualizado');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleDeleteUser = async (id, nombre) => {
    if (window.confirm(`¿Eliminar empresa ${nombre}?`)) {
      try {
        await deleteDoc(doc(db, 'empresas', id));
        alert('✅ Empresa eliminada');
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  };

  if (loading) return <div className="admin-loading">Cargando usuarios...</div>;

  return (
    <div className="admin-section">
      <h2>Gestión de Usuarios</h2>
      <p className="section-info">Total de empresas registradas: {usuarios.length}</p>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>
                  <strong>{user.nombreEmpresa}</strong>
                  <br />
                  <small>{user.sucursal}</small>
                </td>
                <td>{user.tipo}</td>
                <td>{user.email}</td>
                <td>{user.telefono}</td>
                <td>
                  <span className={`estado-badge ${user.estado === 'activo' ? 'activo' : 'inactivo'}`}>
                    {user.estado === 'activo' ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button 
                    className="btn-reset"
                    onClick={() => handleResetPassword(user.email)}
                    title="Enviar reset de contraseña"
                  >
                    🔑 Reset
                  </button>
                  <button 
                    className="btn-toggle"
                    onClick={() => handleToggleEstado(user.id, user.estado)}
                    title="Cambiar estado"
                  >
                    {user.estado === 'activo' ? '⛔ Desactivar' : '✓ Activar'}
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id, user.nombreEmpresa)}
                    title="Eliminar empresa"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarios.length === 0 && (
        <div className="empty-state">
          <p>No hay empresas registradas aún</p>
        </div>
      )}
    </div>
  );
}