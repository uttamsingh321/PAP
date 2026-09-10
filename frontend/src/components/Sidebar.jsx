import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

function Sidebar() {
    const { isOpen, isMobile, isCollapsed, closeSidebar } = useSidebar();

    const menuItems = [
        { path: "/", label: "Dashboard", icon: "📊" },
        { path: "/assembly", label: "Assembly", icon: "🔧" },
        { path: "/smt", label: "SMT", icon: "🏭" },
        { path: "/rbc", label: "Role Management", icon: "🛡️" },
        { path: "/reports", label: "Reports", icon: "📄" },
        { path: "/settings", label: "Settings", icon: "⚙️" },
    ];

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const initials = (user.username || "U").substring(0, 1).toUpperCase();

    const handleNavClick = () => {
        if (isMobile) {
            closeSidebar();
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">PAP</div>
                {!isCollapsed && (
                    <div>
                        <div className="sidebar-title">PAP</div>
                        <div className="sidebar-subtitle">Production Analytics Platform</div>
                    </div>
                )}
            </div>
            <ul className="sidebar-menu">
                {menuItems.map(item => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            onClick={handleNavClick}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="sidebar-decoration"></div>
            <div className="sidebar-user">
                <div className="sidebar-user-avatar">{initials}</div>
                {!isCollapsed && (
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.username || "User"}</div>
                        <div className="sidebar-user-role">{user.role || "Guest"}</div>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
