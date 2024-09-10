import React, { useEffect, useState, useCallback } from 'react';
import { FaPlus, FaTimes, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState({ member_id: '', book_id: '' });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  
  const fetchTransactions = useCallback(() => {
    fetch('/transactions', {
      method: 'GET',
      headers: {
         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
      .then(data => {
        setTransactions(data);
      })
      .catch(err => {
        setError(err.message);

      });
  }, []);

  useEffect(() => {
    fetch('/transactions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const fetchBooksAndMembers = async () => {
      try {
        const [booksRes, membersRes] = await Promise.all([
          fetch('/books', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/members', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        const booksData = await booksRes.json();
        const membersData = await membersRes.json();
        setBooks(booksData);
        setMembers(membersData);
      } catch (err) {
        setError('Failed to load books or members');
      }
    };

    fetchBooksAndMembers();
  }, [token]);

  const handleAddTransaction = () => {
    fetch('/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTransaction),
    })
      .then((response) => response.json())
      .then((addedTransaction) => {
        setTransactions([...transactions, addedTransaction]);
        setNewTransaction({ member_id: '', book_id: '' });
        setShowAddForm(false);
        toast.success('Book issued successfully');
        fetchTransactions();
      })
      .catch((error) => {
        toast.error('Failed to add transaction: ' + error.message);
      });
  };

  const handleEditClick = (transaction) => {
    if (!transaction.return_date) {
      setEditingTransaction({...transaction, return_date: new Date().toISOString().split('T')[0]});
      setShowReturnModal(true);
    } else {
      toast.warn('This book has already been returned');
    }
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction) return;

    const updatedTransaction = { return_date: editingTransaction.return_date };

    fetch(`/transactions/${editingTransaction.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedTransaction)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Cannot return book. Total debt would exceed KES 500');
        }
        return response.json();
      })
      .then(updatedTransaction => {
        setTransactions(transactions.map(transaction =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        ));
        setEditingTransaction(null);
        toast.success('Book returned successfully');
        fetchTransactions();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleCloseModal = () => {
    setEditingTransaction(false);
    setShowReturnModal(null);
  };

  const generateReport = () => {
    const pdf = new jsPDF();

    // Add header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transaction Report', 20, 20);

    // Add report details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const totalTransactions = transactions.length;
    const activeTransactions = transactions.filter(t => !t.return_date).length;
    const completedTransactions = totalTransactions - activeTransactions;
    const totalRentFee = transactions.reduce((sum, t) => sum + (t.rent_fee || 0), 0);

    const details = [
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Transactions: ${totalTransactions}`,
      `Active Transactions: ${activeTransactions}`,
      `Completed Transactions: ${completedTransactions}`,
      `Total Rent Fee: KES ${totalRentFee.toFixed(2)}`,
    ];
    pdf.text(details, 20, 30);

    // Add transactions table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transaction List', 20, 80);

    const tableColumn = ["ID", "Book", "Borrower", "Issue Date", "Return Date", "Rent Fee"];
    const tableRows = transactions.map(transaction => [
      transaction.id,
      transaction.book ? transaction.book.title : 'N/A',
      transaction.member ? transaction.member.name : 'N/A',
      new Date(transaction.issue_date).toLocaleDateString(),
      transaction.return_date ? new Date(transaction.return_date).toLocaleDateString() : 'N/A',
      transaction.rent_fee ? `KES ${transaction.rent_fee.toFixed(2)}` : 'N/A'
    ]);

    pdf.autoTable({
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [66, 135, 245], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    pdf.save('Transaction_Report.pdf');
    toast.success("Report generated successfully")
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Transactions</h2>
        <div>
          <button style={styles.reportButton} onClick={generateReport}>
            <FaFileAlt /> PDF
          </button>
          <button style={styles.addButton} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <FaTimes/> : <FaPlus/>}
          </button>
        </div>
      </div>

      {/* New Transaction Form */}
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3>Issue Book</h3>
          <div style={styles.form}>
            <select
              value={newTransaction.member_id}
              onChange={(e) => setNewTransaction({ ...newTransaction, member_id: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              value={newTransaction.book_id}
              onChange={(e) => setNewTransaction({ ...newTransaction, book_id: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Book</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>

            <button style={styles.submitButton} onClick={handleAddTransaction}>Issue Book</button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showReturnModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
          <span style={styles.close} onClick={handleCloseModal}>&times;</span>
            <h3>Choose Return Date</h3>
            <div style={styles.form}>
              <input
                type="date"
                value={editingTransaction?.return_date || ''}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, return_date: e.target.value })}
                style={styles.input}
              />
              <button style={styles.submitButton} onClick={handleUpdateTransaction}>Return Book</button>
              <button style={styles.cancelButton} onClick={() => setShowReturnModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Book</th>
            <th style={styles.th}>Borrower</th>
            <th style={styles.th}>Issue Date</th>
            <th style={styles.th}>Return Date</th>
            <th style={styles.th}>Rent Fee</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td style={styles.td}>{transaction.id}</td>
              <td style={styles.td}>{transaction.book ? transaction.book.title : 'N/A'}</td>
              <td style={styles.td}>{transaction.member ? transaction.member.name : 'N/A'}</td>
              <td style={styles.td}>{new Date(transaction.issue_date).toLocaleDateString()}</td>
              <td style={styles.td}>{transaction.return_date ? new Date(transaction.return_date).toLocaleDateString() : 'N/A'}</td>
              <td style={styles.td}>{transaction.rent_fee ? `KES ${transaction.rent_fee.toFixed(2)}` : 'N/A'}</td>
              <td style={styles.td}>
                <button 
                  style={transaction.return_date ? styles.disabledButton : styles.editButton}
                  onClick={() => handleEditClick(transaction)}
                  disabled={!!transaction.return_date}
                >
                  {transaction.return_date ? 'Returned' : 'Return Book'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: "15px",
    cursor: 'pointer',
  },
  reportButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  formContainer: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: "auto",
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    width: "auto",
    
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: "white"
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#ffc107',
    color: 'black',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    marginLeft: '10px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
  },
  td: {
    padding: '10px',
    textAlign: 'center',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  backButtonHover: {
    backgroundColor: '#0056b3', // Darker blue on hover
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
  },
  close: {
    color: '#aaa',
    float: 'right',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  closeHover: {
    color: 'black',
  },
};

export default Transactions;