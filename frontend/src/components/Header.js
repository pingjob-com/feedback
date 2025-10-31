import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FiLogOut, FiMenu, FiX, FiHome, FiGrid } from 'react-icons/fi';
import '../styles/header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Determine if we're on homepage
  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isAdminPanel = location.pathname === '/admin';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img 
            src="https://www.happytweet.net/themes/happytweet/img/logo-header.svg" 
            alt="Happy Tweet Logo"
            className="logo-img"
          />
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <nav className={`header-nav ${menuOpen ? 'active' : ''}`}>
          {!isAuthenticated && (
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FiHome size={16} />
              Home
            </Link>
          )}

          {/* Show About and Help & Support only on homepage or when not authenticated */}
          {(isHomePage || !isAuthenticated) && (
            <>
              <a href="https://www.happytweet.net/about" target="_blank" rel="noopener noreferrer" className="nav-link">
                About
              </a>

              <a href="https://help.happytweet.net/en" target="_blank" rel="noopener noreferrer" className="nav-link">
                Help & Support
              </a>
            </>
          )}

          {isAuthenticated ? (
            <>
              {!isDashboard && (
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <FiGrid size={16} />
                  Dashboard
                </Link>
              )}
              
              {user?.role === 'admin' && !isAdminPanel && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>
                  <FiGrid size={16} />
                  Admin Panel
                </Link>
              )}

              <div className="header-user-info">
                <span className="user-name">{user?.fullName || user?.username}</span>
                <span className={`user-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
              </div>

              <button className="btn btn-logout" onClick={handleLogout}>
                <FiLogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-signup" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}