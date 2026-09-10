import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SpareParts from './pages/SpareParts';
import AddSparePart from './pages/AddSparePart';
import EditSparePart from './pages/EditSparePart';
import SparePartDetails from './pages/SparePartDetails';
import Categories from './pages/Categories';
import AddCategory from './pages/AddCategory';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="spare-parts" element={<SpareParts />} />
            <Route path="spare-parts/add" element={<AddSparePart />} />
            <Route path="spare-parts/:id" element={<SparePartDetails />} />
            <Route path="spare-parts/:id/edit" element={<EditSparePart />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
