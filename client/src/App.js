import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BooksManagement from './pages/BooksManagement';
import Transactions from './pages/Transactions';
import OverdueBooksList from './pages/OverdueBooksList';
import MembersManagement from './pages/MembersManagement';
import "./index.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/books-management' element={<BooksManagement/>}/>
        <Route path='/transactions' element={<Transactions/>}/>
        <Route path='/overdue-books' element={<OverdueBooksList/>}/>
        <Route path='/members-management' element={<MembersManagement/>}/>
      </Routes>
    </Router>
  );
}

export default App;
