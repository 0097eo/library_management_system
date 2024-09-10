import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const MembersManagement = () => {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [editMember, setEditMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false); // Control Add Member form visibility
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/members', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(response => response.json())
      .then(data => setMembers(data))
      .catch(error => console.error('Error fetching members:', error));
  }, []);

  const handleDelete = (memberId) => {
    fetch(`/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(() => setMembers(members.filter(member => member.id !== memberId)))
      .then(() => toast.success('Member deleted successfully'))
      .catch(error => console.error('Error deleting member:', error));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    fetch('/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(newMember)
    })
      .then(response => response.json())
      .then(member => {
        setMembers([...members, member]);
        setShowAddForm(false); // Hide the form after adding
        setNewMember({ name: '', email: '', phone: '' }); // Reset form fields
      })
      .then(() => toast.success('Member added successfully'))
      .catch(error => console.error('Error adding member:', error));
  };

  const handleEditMember = (e) => {
    e.preventDefault();
    fetch(`/members/${editMember.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(editMember)
    })
      .then(response => response.json())
      .then(updatedMember => {
        setMembers(members.map(member => (member.id === updatedMember.id ? updatedMember : member)));
        setEditMember(null); // Close the edit form after updating
      })
      .then(() => toast.success('Member details updated successfully'))
      .catch(error => console.error('Error editing member:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editMember) {
      setEditMember({ ...editMember, [name]: value });
    } else {
      setNewMember({ ...newMember, [name]: value });
    }
  };

  const handleEditClick = (member) => {
    setEditMember(member);
  };

  const generateReport = () => {
    const totalMembers = members.length;
    const totalOutstandingDebt = members.reduce((sum, member) => sum + (member.outstanding_debt || 0), 0);
    const averageDebt = (totalOutstandingDebt / totalMembers).toFixed(2);
    const memberWithHighestDebt = members.reduce((prev, current) => 
      (prev.outstanding_debt > current.outstanding_debt) ? prev : current
    );
    const memberWithLowestDebt = members.reduce((prev, current) => 
      (prev.outstanding_debt < current.outstanding_debt) ? prev : current
    );

    const pdf = new jsPDF();

    // Add header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Member Management Report', 20, 20);

    // Add report details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const details = [
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Members: ${totalMembers}`,
      `Total Outstanding Debt: Ksh ${totalOutstandingDebt.toFixed(2)}`,
      `Average Debt per Member: Ksh ${averageDebt}`,
      `Member with Highest Debt: ${memberWithHighestDebt.name} (Ksh ${memberWithHighestDebt.outstanding_debt.toFixed(2)})`,
      `Member with Lowest Debt: ${memberWithLowestDebt.name} (Ksh ${memberWithLowestDebt.outstanding_debt.toFixed(2)})`
    ];
    pdf.text(details, 20, 30);

    // Add members table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Member List', 20, 80);

    const tableColumn = ["ID", "Name", "Email", "Phone", "Outstanding Debt"];
    const tableRows = members.map(member => [
      member.id,
      member.name,
      member.email,
      member.phone || 'N/A',
      `Ksh ${(member.outstanding_debt || 0).toFixed(2)}`
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

    pdf.save('Member_Report.pdf');
    toast.success("Report generated successfully")
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.header}>
      <button style={styles.backButton}  onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
        <h2>Members Management</h2>
        <div>
        <button style={styles.reportButton} onClick={generateReport}>
            <FaFileAlt /> 
          </button>
        <button style={styles.addButton} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <FaTimes/> : <FaPlus/>}
        </button>
        </div>
      </div>

      {/* Conditionally render the Add Member Form */}
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3>Add New Member</h3>
          <form onSubmit={handleAddMember} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newMember.name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newMember.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={newMember.phone}
              onChange={handleInputChange}
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>Add Member</button>
          </form>
        </div>
      )}

      {/* Edit Member Form */}
      {editMember && (
        <div style={styles.formContainer}>
          <h3>Edit Member</h3>
          <form onSubmit={handleEditMember} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={editMember.name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={editMember.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={editMember.phone}
              onChange={handleInputChange}
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>Update Member</button>
            <button type="button" style={styles.cancelButton} onClick={() => setEditMember(null)}>Cancel</button> {/* Cancel Edit */}
          </form>
        </div>
      )}

      {/* Table listing members with delete and edit actions */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Outstanding Debt</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <td style={styles.td}>{member.id}</td>
              <td style={styles.td}>{member.name}</td>
              <td style={styles.td}>{member.email}</td>
              <td style={styles.td}>{member.phone || 'N/A'}</td>
              <td style={styles.td}>Ksh {(member.outstanding_debt || 0).toFixed(2)}</td>
              <td style={styles.td}>
                <button style={styles.deleteButton} onClick={() => handleDelete(member.id)}><FaTrash/></button>
                <button style={styles.editButton} onClick={() => handleEditClick(member)}><FaEdit/></button> {/* Edit button */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles for buttons, form, and table
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
    addButton: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      fontSize: "15px",
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
      borderRadius: '20px',
      border: '1px solid #ccc',
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
    submitButton: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '10px',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      width: "50%",
      marginLeft: "400px"
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      padding: '10px',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      marginTop: '10px',
      width: "50%",
      marginLeft: "400px"
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '5px',
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
  };

export default MembersManagement;
