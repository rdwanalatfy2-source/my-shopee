
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import POS from './components/POS';
import SalesHistory from './components/SalesHistory';
import Login from './components/Login';
import EmployeeManager from './components/Admin/EmployeeManager';
import CategoryManager from './components/Admin/CategoryManager';
import { getCurrentUser } from './utils/storage';
import { Role } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحديث حالة المستخدم عند التحميل الأول
    setUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setUser(getCurrentUser());
  };

  if (isLoading) return null;

  if (!user) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/history" element={<SalesHistory />} />
          
          {user.role === Role.ADMIN && (
            <>
              <Route path="/products" element={<ProductManager />} />
              <Route path="/categories" element={<CategoryManager />} />
              <Route path="/employees" element={<EmployeeManager />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
