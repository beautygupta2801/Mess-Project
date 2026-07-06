// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import PublicLayout from "./components/PublicLayout"; // <-- IMPORT NEW LAYOUT

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Dashboards
import StudentDashboard from "./pages/student/StudentDashboard";
import MunshiDashboard from "./pages/munshi/MunshiDashboard";
// import ClerkDashboard from "./pages/munshi/ClerkDashboard";

import ClerkDashboard from "./pages/clerk/ClerkDashboard";

export default function App() {
  
  return (
    
    <Router>
      <Routes>
        {/* 1. Public Routes: These pages WILL have the Navbar and Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* 2. Dashboard Routes: These pages will NOT have the public Navbar and Footer */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/munshi/*" element={<MunshiDashboard />} />
        <Route path="/clerk/dashboard/*" element={<ClerkDashboard />} />
        
      </Routes>
    </Router>
  );
}

