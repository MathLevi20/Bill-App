import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BillsLibrary from './pages/BillsLibrary';
import AdminPanel from './pages/AdminPanel';
import Navigation from './components/Navigation';
import './index.css';
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 p-5">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bills" element={<BillsLibrary />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
