import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCopperOS } from '../../context/CopperOSContext';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { currentCompany, modulesCatalog } = useCopperOS();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getModuleName = (slug: string) => {
    const mod = modulesCatalog.find(m => m.slug === slug);
    if (mod) return mod.name;
    if (slug === 'modules') return 'Extensões & Módulos';
    if (slug === 'settings') return 'Configurações';
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  return (
    <nav className="flex items-center text-xs text-gray-500 space-x-1.5 overflow-x-auto whitespace-nowrap">
      <Link 
        to="/hub" 
        className="flex items-center gap-1 hover:text-emerald-600 transition-colors text-gray-700 font-semibold"
      >
        <span>CopperOS</span>
      </Link>

      {pathnames.length === 0 || pathnames[0] === 'hub' ? (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-medium">Hub Corporativo</span>
        </>
      ) : (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link to="/hub" className="hover:text-emerald-600 transition-colors text-gray-500">
            Empresas
          </Link>
          
          {currentCompany && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <Link 
                to={`/companies/${currentCompany.id}`}
                className="hover:text-emerald-600 transition-colors text-gray-700 font-medium"
              >
                {currentCompany.tradeName}
              </Link>
            </>
          )}

          {pathnames.length > 2 && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-emerald-600 font-semibold">
                {getModuleName(pathnames[2])}
              </span>
            </>
          )}
        </>
      )}
    </nav>
  );
};
