import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ComprehensiveReports = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, membersRes, transactionsRes] = await Promise.all([
        fetch('/books', { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('/members', { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } })
      ]);

      const booksData = await booksRes.json();
      const membersData = await membersRes.json();
      const transactionsData = await transactionsRes.json();

      setBooks(booksData);
      setMembers(membersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again.');
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    
    // Add header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Comprehensive Library Report', 20, 20);

    // Books summary
    pdf.setFontSize(14);
    pdf.text('Books Summary', 20, 40);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text([
      `Total Books: ${books.length}`,
      `Total Quantity: ${books.reduce((sum, book) => sum + book.quantity, 0)}`,
      `Unique Authors: ${new Set(books.map(book => book.author)).size}`
    ], 30, 50);

    // Members summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Members Summary', 20, 80);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text([
      `Total Members: ${members.length}`,
      `Total Outstanding Debt: KES ${members.reduce((sum, member) => sum + (member.outstanding_debt || 0), 0).toFixed(2)}`,
      `Members with Debt: ${members.filter(member => member.outstanding_debt > 0).length}`
    ], 30, 90);

    // Transactions summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transactions Summary', 20, 120);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const overdueBooks = transactions.filter(t => !t.return_date && new Date(t.issue_date) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    const totalRentFee = transactions.reduce((sum, t) => sum + (t.rent_fee || 0), 0);
    pdf.text([
      `Total Transactions: ${transactions.length}`,
      `Currently Borrowed Books: ${transactions.filter(t => !t.return_date).length}`,
      `Overdue Books: ${overdueBooks.length}`,
      `Total Rent Fee Collected: KES ${totalRentFee.toFixed(2)}`
    ], 30, 130);

    pdf.save('Comprehensive_Library_Report.pdf');
    toast.success('Comprehensive report generated successfully');
  };

  // Data for book categories pie chart
  const bookCategories = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});
  const bookCategoriesData = Object.entries(bookCategories).map(([name, value]) => ({ name, value }));

  // Data for members' outstanding debt
  const membersOutstandingDebtData = members
    .filter(member => member.outstanding_debt > 0)
    .sort((a, b) => b.outstanding_debt - a.outstanding_debt)
    .slice(0, 10)
    .map(member => ({
      name: member.name,
      debt: member.outstanding_debt
    }));

  // Data for transactions over time
  const transactionsByMonth = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.issue_date);
    const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});

  const transactionsData = Object.entries(transactionsByMonth)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Reports</h2>
        <button style={styles.reportButton} onClick={generatePDF}>
          <FaFileAlt /> PDF
        </button>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.chartTitleContainer}>
          <h3 style={styles.chartTitle}>Book Inventory</h3>
        </div>
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

      <div style={styles.chartContainer}>
        <div style={styles.chartTitleContainer}>
          <h3 style={styles.chartTitle}>Book Categories</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bookCategoriesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {bookCategoriesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.chartTitleContainer}>
          <h3 style={styles.chartTitle}>Top 10 Members with Outstanding Debt</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={membersOutstandingDebtData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="debt" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.chartTitleContainer}>
          <h3 style={styles.chartTitle}>Transactions Over Time</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
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
  },
  reportButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#17a2b8',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  chartContainer: {
    marginBottom: '40px',
    borderRadius: '8px',
    backgroundColor: "white",
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',

  },
  chartTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '20px',
  },
  chartTitle: {
    margin: 0,
    padding: 0,
  },
};
export default ComprehensiveReports;