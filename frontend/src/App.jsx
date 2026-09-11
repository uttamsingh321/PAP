import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './authentication/Login';
import MainDashboard from './main_dashboard/MainDashboard';
import Assembly from './assembly/Assembly';
import AssemblyFPY from './assembly/AssemblyFPY';
import NgNdfPage from './assembly/NgNdfPage';
import SMT from './smt/SMT';
import RBC from './rbc/RBC';
import Reports from './reports/Reports';
import Settings from './settings/Settings';

function Backdrop() {
    const { isOpen, isMobile, closeSidebar } = useSidebar();
    if (!isMobile || !isOpen) return null;
    return <div className="sidebar-backdrop" onClick={closeSidebar} />;
}

function AppLayout() {
    return (
        <div className="app">
            <Navbar />
            <Sidebar />
            <Backdrop />
            <main className="main-content">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<MainDashboard />} />
                    <Route path="/assembly" element={<Assembly />} />
                    <Route path="/assembly/fpy" element={<AssemblyFPY />} />
                    <Route path="/ng-ndf" element={<NgNdfPage />} />
                    <Route path="/smt" element={<SMT />} />
                    <Route path="/rbc" element={<RBC />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <SidebarProvider>
                <AppLayout />
            </SidebarProvider>
        </Router>
    );
}

export default App;
