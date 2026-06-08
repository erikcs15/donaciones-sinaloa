import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/SignUp.css';

export default function SignUp({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    tipo: 'supermercado',
    sucursal: '',
    telefono: '',
    contacto: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatearTelefono = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) return numeros;
    return '+52 ' + numeros.slice(-10);
  };

  const validarForm = () => {
    if (!formData.nombreEmpresa.trim()) {
      setError('El nombre de empresa es requerido');
      return false;
    }
    if (!formData.sucursal.trim()) {
      setError('La sucursal es requerida');
      return false;
    }
    if (!formData.telefono || formData.telefono.replace(/\D/g, '').length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos');
      return false;
    }
    if (!formData.contacto.trim()) {
      setError('El nombre del contacto es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarForm()) return;

    setLoading(true);

    try {
      // Crear usuario en Firebase Auth
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Actualizar perfil
      await updateProfile(result.user, {
        displayName: `${formData.tipo}|${formData.nombreEmpresa}`
      });

      // Guardar datos en Firestore
      await setDoc(doc(db, 'empresas', result.user.uid), {
        nombreEmpresa: formData.nombreEmpresa,
        tipo: formData.tipo,
        sucursal: formData.sucursal,
        telefono: formData.telefono,
        contacto: formData.contacto,
        email: formData.email,
        uid: result.user.uid,
        fechaRegistro: new Date(),
        estado: 'activo'
      });

      setSuccess('✅ Empresa registrada exitosamente');
      setTimeout(() => onBackToLogin(), 2000);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else {
        setError('Error: ' + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <button className="back-btn" onClick={onBackToLogin}>
          ← Volver
        </button>

        <div className="signup-header">
          <h1>Registrar Empresa</h1>
          <p>Conecta tu empresa con bancos de alimentos</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Nombre de Empresa */}
          <div className="form-group">
            <label>Nombre de Empresa *</label>
            <input
              type="text"
              name="nombreEmpresa"
              value={formData.nombreEmpresa}
              onChange={handleInputChange}
              placeholder="Ej: MercaAhorro"
              required
            />
          </div>

          {/* Grid: Tipo y Sucursal */}
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de Empresa *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
              >
                <option value="supermercado">🏪 Supermercado</option>
                <option value="agricola">🌾 Agrícola</option>
                <option value="banco">🏦 Banco de Alimentos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sucursal *</label>
              <input
                type="text"
                name="sucursal"
                value={formData.sucursal}
                onChange={handleInputChange}
                placeholder="Ej: Centro, Norte, Sur"
                required
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => {
                const formateado = formatearTelefono(e.target.value);
                handleInputChange({ target: { name: 'telefono', value: formateado } });
              }}
              placeholder="+52 667 123 4567"
              required
            />
          </div>

          {/* Nombre Contacto */}
          <div className="form-group">
            <label>Nombre del Contacto *</label>
            <input
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contacto@empresa.com"
              required
            />
          </div>

          {/* Grid: Contraseña */}
          <div className="form-grid">
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Registrando...' : '✅ Registrar Empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}