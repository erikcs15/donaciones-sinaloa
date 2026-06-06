import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('banco');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Donaciones Sinaloa</h1>
          <p>Conecta supermercados con bancos de alimentos</p>
        </div>

        <div className="user-type-selector">
          <button 
            className={`type-btn ${userType === 'banco' ? 'active' : ''}`}
            onClick={() => setUserType('banco')}
          >
            🏦 Banco de Alimentos
          </button>
          <button 
            className={`type-btn ${userType === 'supermercado' ? 'active' : ''}`}
            onClick={() => setUserType('supermercado')}
          >
            🏪 Supermercado
          </button>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

       
      </div>
    </div>
  );
}
