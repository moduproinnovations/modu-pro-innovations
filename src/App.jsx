import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Divisions = lazy(() => import('./pages/Divisions'));
const DivisionDetail = lazy(() => import('./pages/DivisionDetail'));
const Industries = lazy(() => import('./pages/Industries'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminDivisions = lazy(() => import('./admin/pages/AdminDivisions'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminServices = lazy(() => import('./admin/pages/AdminServices'));
const AdminIndustries = lazy(() => import('./admin/pages/AdminIndustries'));
const AdminEnquiries = lazy(() => import('./admin/pages/AdminEnquiries'));
const AdminMedia = lazy(() => import('./admin/pages/AdminMedia'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
          Modu Pro Innovation
        </p>
        <p className="text-xs text-[#F4EEDF]/70">Loading view...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Six Public Corporate Pages + Four Division Detail Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="divisions/:slug" element={<DivisionDetail />} />
          <Route path="industries" element={<Industries />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected Enterprise Admin Interface */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="divisions" element={<AdminDivisions />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="industries" element={<AdminIndustries />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
