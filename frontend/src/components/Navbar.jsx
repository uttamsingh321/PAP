import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import FullscreenButton from './FullscreenButton';

function Navbar() {
    const navigate = useNavigate();
    const { isOpen, isMobile, isCollapsed, toggleSidebar } = useSidebar();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout/", { method: "POST" });
            localStorage.removeItem("user");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const initials = (user.username || "U").substring(0, 1).toUpperCase();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button
                    className="menu-btn"
                    onClick={toggleSidebar}
                    aria-label={isOpen || !isCollapsed ? "Close navigation" : "Open navigation"}
                >
                    {isOpen && isMobile ? "✕" : "☰"}
                </button>
                <div className="navbar-brand">
                    <div className="brand-logo">PAP</div>
                    <span className="brand-name">Production Analytics</span>
                </div>
            </div>
            <div className="navbar-actions">
                <div className="user-info">
                    <div className="user-avatar">{initials}</div>
                    <span className="user-name">{user.username || "User"} ({user.role || "Guest"})</span>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                    Logout
                </button>
                <FullscreenButton />
            </div>
        </nav>
    );
}

export default Navbar;
