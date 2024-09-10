import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const OverdueBooksList = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverdueBooks();
  }, []);

  const fetchOverdueBooks = () => {
    fetch('/transactions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        // Filter for overdue books (14 days)
        const overdueBooksList = data.filter(
          t => !t.return_date && new Date(t.issue_date) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        );
        setOverdueBooks(overdueBooksList);
      })
      .catch(error => console.error('Error fetching transactions:', error));
  };

  const generateReport = () => {
    const pdf = new jsPDF();

    // Add header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overdue Books Report', 20, 20);

    // Add report details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const details = [
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Overdue Books: ${overdueBooks.length}`,
    ];
    pdf.text(details, 20, 30);

    // Add overdue books table
    const tableColumn = ["#", "Title", "Author", "Issue Date", "Days Overdue"];
    const tableRows = overdueBooks.map((book, index) => [
      index + 1,
      book.book.title,
      book.book.author,
      new Date(book.issue_date).toLocaleDateString(),
      Math.floor((new Date() - new Date(book.issue_date)) / (1000 * 60 * 60 * 24)) - 14
    ]);

    pdf.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [66, 135, 245], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    pdf.save('Overdue_Books_Report.pdf');
    toast.success('Report generated successfully');
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Books Overdue</h2>
        <button style={styles.reportButton} onClick={generateReport}>
          <FaFileAlt />
        </button>
      </div>
      {overdueBooks.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Author</th>
              <th style={styles.th}>Issue Date</th>
              <th style={styles.th}>Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            {overdueBooks.map((transaction, index) => (
              <tr key={transaction.id}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{transaction.book.title}</td>
                <td style={styles.td}>{transaction.book.author}</td>
                <td style={styles.td}>{new Date(transaction.issue_date).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {Math.floor((new Date() - new Date(transaction.issue_date)) / (1000 * 60 * 60 * 24)) - 14}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No overdue books found.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
  reportButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
};

export default OverdueBooksList;