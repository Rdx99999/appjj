import {
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import KYC from './pages/KYC';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Sellers from './pages/Sellers';

// Components
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminToken') !== null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <header className="top-bar">
            <button 
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1>E-Commerce Admin Panel</h1>
          </header>
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/kyc" element={<KYC />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
