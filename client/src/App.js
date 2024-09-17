import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaExchangeAlt, FaClock, FaUsers, FaChartBar, FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BooksManagement from './pages/BooksManagement';
import Transactions from './pages/Transactions';
import OverdueBooksList from './pages/OverdueBooksList';
import MembersManagement from './pages/MembersManagement';
import ComprehensiveReports from './pages/Reports';
import { useAuth } from './utils/AuthContext';
import "./index.css";

const Sidebar = ({ isOpen, toggle, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      ...styles.sidebar,
      left: isMobile ? (isOpen ? 0 : '-250px') : 0,
    }}>
      {isMobile && (
        <button onClick={toggle} style={styles.closeBtn}>&times;</button>
      )}
      <div style={styles.userInfo}>
        <FaUser style={styles.userIcon} />
        <span>{user ? user.username : 'Guest'}</span>
      </div>
      <nav style={styles.nav}>
        <ul style={styles.sidebarList}>
          <li>
            <Link to="/dashboard" style={{
              ...styles.sidebarLink,
              ...(isActive('/dashboard') ? styles.activeLink : {})
            }}>
              <FaHome style={styles.icon} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/books-management" style={{
              ...styles.sidebarLink,
              ...(isActive('/books-management') ? styles.activeLink : {})
            }}>
              <FaBook style={styles.icon} /> Books Management
            </Link>
          </li>
          <li>
            <Link to="/transactions" style={{
              ...styles.sidebarLink,
              ...(isActive('/transactions') ? styles.activeLink : {})
            }}>
              <FaExchangeAlt style={styles.icon} /> Transactions
            </Link>
          </li>
          <li>
            <Link to="/overdue-books" style={{
              ...styles.sidebarLink,
              ...(isActive('/overdue-books') ? styles.activeLink : {})
            }}>
              <FaClock style={styles.icon} /> Overdue Books
            </Link>
          </li>
          <li>
            <Link to="/members-management" style={{
              ...styles.sidebarLink,
              ...(isActive('/members-management') ? styles.activeLink : {})
            }}>
              <FaUsers style={styles.icon} /> Members Management
            </Link>
          </li>
          <li>
            <Link to="/reports" style={{
              ...styles.sidebarLink,
              ...(isActive('/reports') ? styles.activeLink : {})
            }}>
              <FaChartBar style={styles.icon} /> Reports
            </Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogout} style={styles.logoutButton}>
        <FaSignOutAlt style={styles.icon} /> Logout
      </button>
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div style={styles.appContainer}>
        {user && <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} isMobile={isMobile} />}
        <div style={{
          ...styles.content,
          marginLeft: user && !isMobile ? '250px' : 0,
        }}>
          {user && isMobile && (
            <button onClick={toggleSidebar} style={styles.menuBtn}>
              <FaBars />
            </button>
          )}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books-management" element={<BooksManagement />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/overdue-books" element={<OverdueBooksList />} />
            <Route path="/members-management" element={<MembersManagement />} />
            <Route path="/reports" element={<ComprehensiveReports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
  },
  content: {
    flexGrow: 1,
    padding: 0,
    transition: 'margin-left 0.3s ease-in-out',
    overflow: 'auto',
  },
  sidebar: {
    backgroundColor: '#333',
    color: 'white',
    width: '250px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    transition: 'left 0.3s ease-in-out',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  },
  nav: {
    flexGrow: 1,
  },
  sidebarList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  sidebarLink: {
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: '#555',
    borderLeft: '4px solid #fff',
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    position: 'absolute',
    right: '10px',
    top: '10px',
    cursor: 'pointer',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    position: 'fixed',
    top: '10px',
    left: '10px',
    zIndex: 1001,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #444',
  },
  userIcon: {
    fontSize: '24px',
    marginRight: '10px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: 'white',
    padding: '15px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    borderTop: '1px solid #444',
  },
};

export default App;