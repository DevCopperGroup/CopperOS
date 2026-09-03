import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CopperOSProvider, useCopperOS } from './context/CopperOSContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HubPage } from './pages/HubPage';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { ControlTowerPage } from './pages/ControlTowerPage';
import { CadastroPage } from './pages/CadastroPage';
import { EstoquePage } from './pages/EstoquePage';
import { TarefasPage } from './pages/TarefasPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModulesPage } from './pages/ModulesPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { GeneralDashboardPage } from './pages/GeneralDashboardPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated } = useCopperOS();
  return <Navigate to={isAuthenticated ? "/hub" : "/login"} replace />;
};

export const App: React.FC = () => {
  return (
    <CopperOSProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/companies" element={<RootRedirect />} />

          {/* Protected Main Global Corporate Hub */}
          <Route 
            path="/hub" 
            element={
              <ProtectedRoute>
                <HubPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected General / Holding Executive Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <GeneralDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/general-dashboard" 
            element={
              <Navigate to="/dashboard" replace />
            } 
          />

          {/* Protected Company Workspace Routes */}
          <Route 
            path="/companies/:companyId" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="control-tower" element={<ControlTowerPage />} />
            <Route path="cadastro" element={<CadastroPage />} />
            <Route path="estoque" element={<EstoquePage />} />
            <Route path="tarefas" element={<TarefasPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="settings" element={<CompanySettingsPage />} />
            {/* Catch-all inside workspace for any newly enabled module routes */}
            <Route path="*" element={<OverviewPage />} />
          </Route>

          {/* Catch-all global route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </CopperOSProvider>
  );
};

export default App;
