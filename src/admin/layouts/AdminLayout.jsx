import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { ap } from '../adminPath';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Package,
  Wrench,
  Factory,
  Inbox,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';

const ADMIN_NAV = [
  { to: ap('/admin/dashboard'), label: 'Dashboard', Icon: LayoutDashboard },
  { to: ap('/admin/enquiries'), label: 'Enquiries CRM', Icon: Inbox },
  { to: ap('/admin/divisions'), label: 'Divisions', Icon: Layers },
  { to: ap('/admin/products'), label: 'Products', Icon: Package },
  { to: ap('/admin/services'), label: 'Services & Support', Icon: Wrench },
  { to: ap('/admin/industries'), label: 'Industries', Icon: Factory },
  { to: ap('/admin/media'), label: 'Media Library', Icon: ImageIcon },
  { to: ap('/admin/settings'), label: 'Site Settings', Icon: Settings },
];

export default function AdminLayout() {
  const { admin, checkingAuth, logout } = useAuth();
  const { siteSettings } = useSite();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0A1428] text-[#F4EEDF] flex items-center justify-center p-6">
        <div className="bg-[#16294D] border border-[#D9C08B]/40 px-8 py-6 text-center space-y-2">
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Verifying Session
          </p>
          <p className="text-sm text-[#F4EEDF]/80">Checking administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to={ap('/admin/login')} replace />;
  }

  const handleLogout = async () => {
    await logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Your administrator session has been closed.',
    });
    navigate(ap('/admin/login'));
  };

  return (
    <div className="min-h-screen bg-[#0A1428] text-[#F4EEDF] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-68 bg-[#16294D] border-r border-[#D9C08B]/25 shrink-0 justify-between sticky top-0 h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#3F5E8C]/40 flex items-center gap-3">
            <div className="bg-[#F4EEDF] px-2 py-1 border border-[#D9C08B]/50">
              <img
                src={siteSettings?.logoUrl || '/assets/logo/modu-pro-logo.png'}
                alt="Modu Pro"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <p className="font-display text-lg font-semibold uppercase tracking-widest text-[#F4EEDF] leading-none">
                Modu Pro
              </p>
              <p className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-[#D9C08B] mt-1">
                Admin Console
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav aria-label="Admin sidebar navigation" className="p-4 space-y-1">
            {ADMIN_NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs font-medium uppercase tracking-wider border transition-colors ${
                    isActive
                      ? 'bg-[#0A1428] text-[#D9C08B] border-[#D9C08B]/60'
                      : 'border-transparent text-[#F4EEDF]/80 hover:bg-[#0A1428]/50 hover:text-[#D9C08B]'
                  }`
                }
              >
                <Icon aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Footer */}
        <div className="p-5 border-t border-[#3F5E8C]/40 space-y-3 bg-[#0A1428]/40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F4EEDF] truncate">{admin.name}</p>
              <p className="text-[11px] text-[#F4EEDF]/65 truncate">{admin.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://www.moduproinnovations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#16294D] border border-[#3F5E8C]/50 hover:border-[#D9C08B] text-[11px] uppercase tracking-wider text-[#F4EEDF]"
            >
              <span>Public Site</span>
              <ExternalLink aria-hidden="true" className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[11px] uppercase tracking-wider text-[#D9C08B] cursor-pointer"
            >
              <LogOut aria-hidden="true" className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Mobile & Breadcrumb */}
        <header className="bg-[#16294D] border-b border-[#D9C08B]/25 px-3 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle admin menu"
              className="lg:hidden p-2 rounded-lg bg-[#0A1428] border border-[#D9C08B]/40 text-[#F4EEDF] shrink-0"
            >
              {sidebarOpen ? (
                <X aria-hidden="true" className="w-5 h-5" />
              ) : (
                <Menu aria-hidden="true" className="w-5 h-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="font-mono-code text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#D9C08B] truncate">
                Modu Pro Innovation
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#F4EEDF] truncate">
                <span className="hidden sm:inline">Enterprise Content &amp; Enquiry Management</span>
                <span className="sm:hidden">Admin Console</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://www.moduproinnovations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 hover:border-[#D9C08B] text-xs uppercase tracking-wider text-[#F4EEDF]"
            >
              <span>View Live Website</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
            </a>
          </div>
        </header>

        {/* Mobile Admin Drawer (Slide-Over with Backdrop) */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 top-[57px] sm:top-[65px] z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 top-[57px] sm:top-[65px] bg-[#0A1428]/80 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed left-0 top-[57px] sm:top-[65px] bottom-0 w-[min(19rem,82vw)] bg-[#16294D] border-r border-[#D9C08B]/30 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-1">
                  <div className="pb-3 mb-2 border-b border-[#3F5E8C]/35">
                    <p className="font-mono-code text-[10px] uppercase tracking-widest text-[#D9C08B]">
                      Navigation
                    </p>
                  </div>
                  {ADMIN_NAV.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-[#0A1428] text-[#D9C08B] border border-[#D9C08B]/50'
                            : 'text-[#F4EEDF] hover:bg-[#0A1428]/40'
                        }`
                      }
                    >
                      <Icon aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#3F5E8C]/35 space-y-3">
                  <a
                    href="https://www.moduproinnovations.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0A1428] border border-[#3F5E8C]/50 text-xs text-[#F4EEDF]"
                  >
                    <span>View Public Website</span>
                    <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0A1428] border border-[#D9C08B]/40 text-xs uppercase tracking-wider text-[#D9C08B]"
                  >
                    <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
