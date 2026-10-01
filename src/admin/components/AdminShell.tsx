import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { CommandPalette } from './CommandPalette';
import { GlobalBackground } from '../../components/GlobalBackground';
import './AdminShell.css';

export const AdminShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  return (
    <div className="admin-shell bg-transparent text-theme-text font-sans">
      <GlobalBackground />
      {/* 1. Desktop Sidebar */}
      <div className="admin-sidebar-slot">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Меню админки">
          <div
            className="fixed inset-0 bg-black/35"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="admin-drawer-panel relative z-10">
            <AdminSidebar
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="admin-main">
        {/* Topbar */}
        <AdminTopbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Content Viewport — themed ambient shield. No backdrop-filter:
            AGENTS.md forbids it on main, and the colour comes from the same
            token family the public portal reads, not from a local hex. */}
        <main
          className="admin-content p-4 sm:p-6 lg:p-8 relative"
          style={{ background: 'color-mix(in srgb, var(--bg-secondary) 72%, transparent)' }}
        >
          {/* Subtle Ambient — same as public DigitalDataRain, very low opacity */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(var(--court-gold) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. Global Command Palette (`Ctrl + K`) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
