import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../utils/AuthContext';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetch('/books', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => setBooks(data))
      .catch(error => console.error('Error fetching books:', error));

    fetch('/members', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => setMembers(data))
      .catch(error => console.error('Error fetching members:', error));

    fetch('/transactions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Error fetching transactions:', error));
  }, []);

  const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
  const borrowedBooks = transactions.filter(t => t.issue_date).length;
  const overdueBooksCount = transactions.filter(t => !t.return_date && new Date(t.issue_date) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)).length;
  
  const handleTotalBooksClick = () => {
    navigate('/books-management');
  };

  const handleBorrowedBooksClick = () => {
    navigate('/transactions');
  };

  const handleOverdueBooksClick = () => {
    navigate('/overdue-books');
  };

  const handleMembersClick = () => {
    navigate('/members-management');
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <h1 style={styles.welcomeText}>{user ? `Welcome, ${user.username}` : 'Librarian Dashboard'}</h1>
          {user && (
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          )}
        </div>
      </nav>
      <div style={styles.centeredContainer}>
        <Link to='/reports' style={styles.centeredLink}>View Reports</Link>
      </div>
      <p style={styles.centeredText}>(Click on a card to navigate to page)</p>

      <div style={styles.grid}>
        <div style={styles.card} onClick={handleTotalBooksClick}>
          <h2>Total Books</h2>
          <p style={styles.cardContent}>{totalBooks}</p>
        </div>
        <div style={styles.card} onClick={handleBorrowedBooksClick}>
          <h2>Transactions</h2>
          <p style={styles.cardContent}>{borrowedBooks}</p>
        </div>
        <div style={styles.card} onClick={handleOverdueBooksClick}>
          <h2>Books Overdue</h2>
          <p style={styles.cardContent}>{overdueBooksCount}</p>
        </div>
        <div style={styles.card} onClick={handleMembersClick}>
          <h2>Total Members</h2>
          <p style={styles.cardContent}>{members.length}</p>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Book Inventory</h2>
        <div style={styles.chart}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={books.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerTitle: {
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  cardContent: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  chart: {
    marginTop: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  tableHeader: {
    textAlign: 'left',
  },
  logoutButton: {
    background: 'white',
    color: '#007bff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  centeredText: {
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  centeredContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  centeredLink: {
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  navbar: {
    backgroundColor: 'white',
    padding: '10px 20px',
    marginBottom: '20px',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  navbarContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    margin: '0 auto',
  },
  welcomeText: {
    color: 'black',
    margin: 0,
    fontSize: '1.5rem',
  },
  
};

export default Dashboard;