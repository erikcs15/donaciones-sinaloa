import { useState } from 'react';
import '../styles/Header.css';

export default function Header({ empresaData, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!empresaData) {
    return <header className="app-header"><p>Cargando...</p></header>;
  }

  const inicial = empresaData.nombreEmpresa.charAt(0).toUpperCase();
  const tipoEmoji = empresaData.tipo === 'supermercado' ? '🏪' : '🌾';

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">🤝 Donaciones Sinaloa</h1>
        <p className="user-badge">
          {tipoEmoji} {empresaData.nombreEmpresa} - {empresaData.sucursal}
        </p>
      </div>

      <div className="header-right">
        <div className="profile-section">
          <button 
            className="profile-circle"
            onClick={() => setShowDropdown(!showDropdown)}
            title={empresaData.nombreEmpresa}
          >
            {inicial}
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <h3>{empresaData.nombreEmpresa}</h3>
                <p className="tipo-badge">{empresaData.tipo.toUpperCase()}</p>
              </div>

              <div className="dropdown-divider"></div>

              <div className="info-item">
                <span className="label">📍 Sucursal:</span>
                <span className="value">{empresaData.sucursal}</span>
              </div>

              <div className="info-item">
                <span className="label">👤 Contacto:</span>
                <span className="value">{empresaData.contacto}</span>
              </div>

              <div className="info-item">
                <span className="label">📱 Teléfono:</span>
                <span className="value">{empresaData.telefono}</span>
              </div>

              <div className="info-item">
                <span className="label">📧 Email:</span>
                <span className="value email-text">{empresaData.email}</span>
              </div>

              <div className="dropdown-divider"></div>

              <button 
                className="logout-btn"
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
              >
                🚪 Salir
              </button>
            </div>
          )}
        </div>
      </div>

      {showDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </header>
  );
}