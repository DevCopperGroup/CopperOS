import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Company, 
  ModuleDefinition, 
  User, 
  Organization, 
  AlertItem, 
  ActivityLogItem, 
  DirectoryRecord, 
  ReportItem 
} from '../types';
import { 
  initialCompanies, 
  initialModulesCatalog, 
  mockOrganization, 
  currentUser as initialUser,
  mockAlerts as initialAlerts,
  mockActivityLogs as initialActivityLogs,
  mockDirectoryRecords as initialDirectoryRecords,
  mockReports as initialReports
} from '../data/mockData';

interface CopperOSContextType {
  organization: Organization;
  user: User;
  companies: Company[];
  currentCompany: Company | null;
  currentCompanyId: string | null;
  modulesCatalog: ModuleDefinition[];
  enabledModules: ModuleDefinition[];
  
  // Auth state
  isAuthenticated: boolean;
  loginSession: (token?: string, userData?: Partial<User>) => void;
  logoutSession: () => void;

  // Data for current company
  alerts: AlertItem[];
  activityLogs: ActivityLogItem[];
  directoryRecords: DirectoryRecord[];
  reports: ReportItem[];

  // Actions
  setCurrentCompanyId: (id: string) => void;
  addCompany: (newComp: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'lastActivityAt'>) => string;
  updateCompany: (companyId: string, data: Partial<Company>) => void;
  toggleCompanyModule: (companyId: string, moduleId: string) => void;
  addDirectoryRecord: (record: Omit<DirectoryRecord, 'id' | 'updatedAt'>) => void;
  updateDirectoryRecord: (id: string, record: Partial<DirectoryRecord>) => void;
  deleteDirectoryRecord: (id: string) => void;
  dismissAlert: (alertId: string) => void;
  
  // Theme & Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // UI State
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

const CopperOSContext = createContext<CopperOSContextType | undefined>(undefined);

export const CopperOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('copperos_user_data');
      return saved ? JSON.parse(saved) : initialUser;
    } catch {
      return initialUser;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('copperos_session_auth_token');
  });

  const loginSession = (token?: string, userData?: Partial<User>) => {
    sessionStorage.setItem('copperos_session_auth_token', token || 'CP_SEC_TOKEN_ACTIVE');
    if (userData) {
      setCurrentUser(prev => {
        const updated = {
          ...prev,
          ...userData,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
        };
        localStorage.setItem('copperos_user_data', JSON.stringify(updated));
        return updated;
      });
    }
    setIsAuthenticated(true);
  };

  const logoutSession = () => {
    sessionStorage.removeItem('copperos_session_auth_token');
    localStorage.removeItem('copperos_user_data');
    setIsAuthenticated(false);
  };

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('copperos_companies_v3');
    return saved ? JSON.parse(saved) : initialCompanies;
  });

  const [currentCompanyId, setCurrentCompanyIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('copperos_current_company_id');
    return saved || 'emp-copper-group';
  });

  // Theme & Dark Mode State
  // Read initial value from localStorage (already applied to <html> by inline script in index.html)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      // Trust the DOM class as source of truth (set by inline script before React loads)
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  // Synchronous DOM manipulation — no useEffect needed for theme toggling
  const toggleDarkMode = () => {
    const html = document.documentElement;
    const nextDark = !html.classList.contains('dark');

    if (nextDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    try {
      localStorage.setItem('copperos_theme', nextDark ? 'dark' : 'light');
    } catch (e) {
      console.error('[CopperOS] Could not persist theme:', e);
    }

    // Update React state so icon in Header re-renders
    setIsDarkMode(nextDark);
  };

  const [modulesCatalog] = useState<ModuleDefinition[]>(initialModulesCatalog);
  const [alertsState, setAlertsState] = useState<Record<string, AlertItem[]>>(initialAlerts);
  const [activityLogsState, setActivityLogsState] = useState<Record<string, ActivityLogItem[]>>(initialActivityLogs);
  const [directoryRecordsState, setDirectoryRecordsState] = useState<Record<string, DirectoryRecord[]>>(initialDirectoryRecords);
  const [reportsState] = useState<Record<string, ReportItem[]>>(initialReports);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('copperos_companies_v2', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem('copperos_current_company_id', currentCompanyId);
    }
  }, [currentCompanyId]);

  // Global Keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setCurrentCompanyId = (id: string) => {
    setCurrentCompanyIdState(id);
    setIsMobileSidebarOpen(false);
  };

  const currentCompany = useMemo(() => {
    return companies.find(c => c.id === currentCompanyId) || companies[0] || null;
  }, [companies, currentCompanyId]);

  const enabledModules = useMemo(() => {
    if (!currentCompany) return [];
    return modulesCatalog.filter(m => currentCompany.enabledModules.includes(m.id));
  }, [currentCompany, modulesCatalog]);

  const alerts = useMemo(() => {
    if (!currentCompanyId) return [];
    return alertsState[currentCompanyId] || [];
  }, [alertsState, currentCompanyId]);

  const activityLogs = useMemo(() => {
    if (!currentCompanyId) return [];
    return activityLogsState[currentCompanyId] || [];
  }, [activityLogsState, currentCompanyId]);

  const directoryRecords = useMemo(() => {
    if (!currentCompanyId) return [];
    return directoryRecordsState[currentCompanyId] || [];
  }, [directoryRecordsState, currentCompanyId]);

  const reports = useMemo(() => {
    if (!currentCompanyId) return [];
    return reportsState[currentCompanyId] || [];
  }, [reportsState, currentCompanyId]);

  const addCompany = (newComp: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'lastActivityAt'>) => {
    const slugId = 'emp-' + newComp.tradeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const words = newComp.tradeName.split(' ').filter(Boolean);
    const monogram = newComp.monogram || (words.length > 1 ? `${words[0][0]}${words[1][0]}` : newComp.tradeName.slice(0, 2)).toUpperCase();

    const fullCompany: Company = {
      ...newComp,
      monogram,
      id: slugId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: 'Recém criado',
      stats: {
        ordersCount: 0,
        inProductionCount: 0,
        pendingCount: 0,
        alertsCount: 0,
        revenueMtd: 'R$ 0,00',
        operationalEfficiency: '100%',
      }
    };

    setCompanies(prev => [...prev, fullCompany]);
    return fullCompany.id;
  };

  const updateCompany = (companyId: string, data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const toggleCompanyModule = (companyId: string, moduleId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const isEnabled = c.enabledModules.includes(moduleId);
        const nextModules = isEnabled 
          ? c.enabledModules.filter(id => id !== moduleId)
          : [...c.enabledModules, moduleId];
        return {
          ...c,
          enabledModules: nextModules,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const addDirectoryRecord = (record: Omit<DirectoryRecord, 'id' | 'updatedAt'>) => {
    if (!currentCompanyId) return;
    const newRecord: DirectoryRecord = {
      ...record,
      id: 'rec-' + Date.now().toString().slice(-6),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setDirectoryRecordsState(prev => ({
      ...prev,
      [currentCompanyId]: [newRecord, ...(prev[currentCompanyId] || [])]
    }));

    // Register an activity log
    const newLog: ActivityLogItem = {
      id: 'act-' + Date.now(),
      companyId: currentCompanyId,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title: `Novo cadastro criado: ${record.name} (${record.code})`,
      code: record.code,
      user: initialUser.name,
      type: 'SUPPLIER'
    };
    setActivityLogsState(prev => ({
      ...prev,
      [currentCompanyId]: [newLog, ...(prev[currentCompanyId] || [])]
    }));
  };

  const updateDirectoryRecord = (id: string, recordUpdate: Partial<DirectoryRecord>) => {
    if (!currentCompanyId) return;
    setDirectoryRecordsState(prev => ({
      ...prev,
      [currentCompanyId]: (prev[currentCompanyId] || []).map(r => 
        r.id === id ? { ...r, ...recordUpdate, updatedAt: new Date().toISOString().split('T')[0] } : r
      )
    }));
  };

  const deleteDirectoryRecord = (id: string) => {
    if (!currentCompanyId) return;
    setDirectoryRecordsState(prev => ({
      ...prev,
      [currentCompanyId]: (prev[currentCompanyId] || []).filter(r => r.id !== id)
    }));
  };

  const dismissAlert = (alertId: string) => {
    if (!currentCompanyId) return;
    setAlertsState(prev => ({
      ...prev,
      [currentCompanyId]: (prev[currentCompanyId] || []).filter(a => a.id !== alertId)
    }));
  };

  return (
    <CopperOSContext.Provider
      value={{
        organization: mockOrganization,
        user: currentUser,
        companies,
        currentCompany,
        currentCompanyId,
        modulesCatalog,
        enabledModules,
        isAuthenticated,
        loginSession,
        logoutSession,
        alerts,
        activityLogs,
        directoryRecords,
        reports,
        setCurrentCompanyId,
        addCompany,
        updateCompany,
        toggleCompanyModule,
        addDirectoryRecord,
        updateDirectoryRecord,
        deleteDirectoryRecord,
        dismissAlert,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </CopperOSContext.Provider>
  );
};

export const useCopperOS = () => {
  const context = useContext(CopperOSContext);
  if (!context) {
    throw new Error('useCopperOS must be used within a CopperOSProvider');
  }
  return context;
};
