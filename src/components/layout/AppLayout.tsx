import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import { useCopperOS } from '../../context/CopperOSContext';

export const AppLayout: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { companies, currentCompanyId, setCurrentCompanyId } = useCopperOS();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route param companyId with context
  useEffect(() => {
    if (companyId && companyId !== currentCompanyId) {
      const exists = companies.some(c => c.id === companyId);
      if (exists) {
        setCurrentCompanyId(companyId);
      } else if (companies.length > 0) {
        // Fallback if company does not exist
        navigate(`/companies/${companies[0].id}`, { replace: true });
      }
    }
  }, [companyId, currentCompanyId, companies, setCurrentCompanyId, navigate]);

  // Is this the company mini-hub overview or modules selection screen?
  const isOverview = location.pathname === `/companies/${companyId}` || location.pathname === `/companies/${companyId}/`;
  const isModulesPage = location.pathname.includes('/modules');
  const hideSidebar = isOverview || isModulesPage;

  return (
    <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#070F0B] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      <Header />
      <div className="flex flex-1 relative">
        {/* Only render Sidebar on operational sub-pages, NOT on overview / choose modules screen */}
        {!hideSidebar && <Sidebar />}

        <main className={`flex-1 flex flex-col min-w-0 bg-[#FBFDFB] dark:bg-[#070F0B] transition-colors duration-200 ${!hideSidebar ? 'lg:pl-60' : ''}`}>
          <div className="flex-1 w-full mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};
