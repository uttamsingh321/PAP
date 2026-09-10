import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function useSidebar() {
    return useContext(SidebarContext);
}

export function SidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            if (width < 768) {
                setIsOpen(false);
                setIsCollapsed(false);
            } else if (width >= 768 && width < 1024) {
                setIsCollapsed(true);
                setIsOpen(false);
            } else {
                setIsCollapsed(false);
                setIsOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && isMobile) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isMobile]);

    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isOpen]);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsOpen(!isOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    return (
        <SidebarContext.Provider value={{ isOpen, isMobile, isCollapsed, toggleSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export default SidebarContext;
