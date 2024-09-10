import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaSearch, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', quantity: 1, category: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const navigate = useNavigate();

  const fetchBooks = useCallback((search = '') => {
    let url = '/books';
    if (search) {
      url += `?${searchBy}=${encodeURIComponent(search)}`;
    }
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        return response.json();
      })
      .then((data) => setBooks(data))
      .catch((error) => {
        console.error('Error fetching books:', error);
        toast.error('Failed to fetch books. Please try again.');
      });
  }, [searchBy]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = (bookId) => {
    fetch(`/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete book');
        }
        setBooks(books.filter((book) => book.id !== bookId));
        toast.success('Book deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book. Please try again.');
      });
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    fetch('/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(newBook),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add book');
        }
        return response.json();
      })
      .then((book) => {
        setBooks([...books, book]);
        setShowAddForm(false);
        setNewBook({ title: '', author: '', isbn: '', quantity: 1, category: '' });
        toast.success('Book added successfully');
        fetchBooks()
      })
      .catch((error) => {
        console.error('Error adding book:', error);
        toast.error('Failed to add book. Please try again.');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editBook) {
      setEditBook({ ...editBook, [name]: value });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  const handleEditClick = (book) => {
    setEditBook(book);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditBook(null);
  };

  const handleEditBook = (e) => {
    e.preventDefault();
    fetch(`/books/${editBook.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(editBook),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update book');
        }
        return response.json();
      })
      .then((updatedBook) => {
        setBooks(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
        setEditBook(null);
        setShowEditModal(false);
        toast.success('Book updated successfully');
        fetchBooks()
      })
      .catch((error) => {
        console.error('Error editing book:', error);
        toast.error('Failed to update book. Please try again.');
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  const generateReport = () => {
    try {
      const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
      const uniqueTitles = new Set(books.map(book => book.title)).size;
      const uniqueAuthors = new Set(books.map(book => book.author)).size;
      const uniqueCategories = new Set(books.map(book => book.category)).size;
      const averageQuantity = (totalBooks / books.length).toFixed(2);
      const mostStockedBook = books.reduce((prev, current) => (prev.quantity > current.quantity) ? prev : current);
      const leastStockedBook = books.reduce((prev, current) => (prev.quantity < current.quantity) ? prev : current);

      const pdf = new jsPDF();

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Book Inventory Report', 20, 20);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const details = [
        `Date: ${new Date().toLocaleDateString()}`,
        `Total Books: ${totalBooks}`,
        `Unique Titles: ${uniqueTitles}`,
        `Unique Authors: ${uniqueAuthors}`,
        `Unique Categories: ${uniqueCategories}`,
        `Average Quantity per Book: ${averageQuantity}`,
        `Most Stocked Book: ${mostStockedBook.title} (${mostStockedBook.quantity} copies)`,
        `Least Stocked Book: ${leastStockedBook.title} (${leastStockedBook.quantity} copies)`
      ];
      pdf.text(details, 20, 30);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Book List', 20, 80);

      const tableColumn = ["ID", "Title", "Author", "ISBN", "Category", "Quantity"];
      const tableRows = books.map(book => [book.id, book.title, book.author, book.isbn, book.category, book.quantity]);

      pdf.autoTable({
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [66, 135, 245], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      pdf.save('Book_Report.pdf');
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Books Management</h2>
        <div>
          <button style={styles.reportButton} onClick={generateReport}>
            <FaFileAlt /> PDF
          </button>
          <button style={styles.addButton} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <FaTimes /> : <FaPlus /> }
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          style={styles.select}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchBy}`}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          <FaSearch />
        </button>
      </form>

      {showAddForm && (
        <div style={styles.formContainer}>
          <h3>Add New Book</h3>
          <form onSubmit={handleAddBook} style={styles.form}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newBook.title}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={newBook.author}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={newBook.isbn}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={newBook.category}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={newBook.quantity}
              onChange={handleInputChange}
              style={styles.input}
              required
              min="1"
            />
            <button type="submit" style={styles.submitButton}>Add Book</button>
          </form>
        </div>
      )}
      
      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.close} onClick={handleCloseModal}>&times;</span>
            <h2>Edit Book</h2>
            <form style={styles.form} onSubmit={handleEditBook}>
              <input
                style={styles.input}
                type="text"
                name="title"
                value={editBook.title}
                onChange={handleInputChange}
                placeholder="Title"
                required
              />
              <input
                style={styles.input}
                type="text"
                name="author"
                value={editBook.author}
                onChange={handleInputChange}
                placeholder="Author"
                required
              />
              <input
                style={styles.input}
                type="text"
                name="isbn"
                value={editBook.isbn}
                onChange={handleInputChange}
                placeholder="ISBN"
                required
              />
              <input
                style={styles.input}
                type="text"
                name="category"
                value={editBook.category}
                onChange={handleInputChange}
                placeholder="Category"
                required
              />
              <input
                style={styles.input}
                type="number"
                name="quantity"
                value={editBook.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
                required
                min="1"
              />
              <button type="submit" style={styles.submitButton}>Save</button>
              <button type="button" style={styles.cancelButton} onClick={handleCloseModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Author</th>
            <th style={styles.th}>ISBN</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td style={styles.td}>{book.id}</td>
              <td style={styles.td}>{book.title}</td>
              <td style={styles.td}>{book.author}</td>
              <td style={styles.td}>{book.isbn}</td>
              <td style={styles.td}>{book.category}</td>
              <td style={styles.td}>{book.quantity}</td>
              <td style={styles.td}>
                <button style={styles.deleteButton} onClick={() => handleDelete(book.id)}><FaTrash/></button>
                <button style={styles.editButton} onClick={() => handleEditClick(book)}><FaEdit/></button>
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
    backgroundColor: '#f0f0f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '15px',
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
  searchForm: {
    display: 'flex',
    marginBottom: '20px',
  },
  select: {
    padding: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  searchButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '5px'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  editButton: {
    backgroundColor: '#ffc107',
    color: 'black',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modal: {
    display: 'block',
    position: 'fixed',
    zIndex: 1,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: '15% auto',
    padding: '20px',
    border: '1px solid #888',
    width: '50%',
    borderRadius: '10px',
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

export default BooksManagement;