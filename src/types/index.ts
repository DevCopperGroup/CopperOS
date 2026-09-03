export type CompanyStatus = 'OPERATIONAL' | 'WARNING' | 'MAINTENANCE' | 'INACTIVE';

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

export type Permission = 
  | 'company.view'
  | 'company.edit'
  | 'company.manage_modules'
  | 'module.view'
  | 'module.create'
  | 'module.edit'
  | 'module.delete'
  | 'reports.view'
  | 'reports.export'
  | 'control_tower.view'
  | 'control_tower.manage_alerts'
  | 'cadastro.view'
  | 'cadastro.edit';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
  companyAccess: string[];
  permissions: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  legalEntity: string;
  taxGroup: string;
  holdingCode: string;
}

export interface CompanyStats {
  ordersCount: number;
  inProductionCount: number;
  pendingCount: number;
  alertsCount: number;
  revenueMtd?: string;
  operationalEfficiency?: string;
}

export interface Company {
  id: string;
  monogram?: string;      // e.g. 'CG', 'AF', 'DC', 'SA'
  logoUrl?: string;       // e.g. '/logos/af-locacoes.png'
  legalName: string;      // Razão Social
  tradeName: string;      // Nome Fantasia (e.g. 'Copper Group')
  sector: string;         // Segmento (e.g. 'Soluções Industriais')
  cnpj: string;           // Identificador fiscal formatado
  status: CompanyStatus;
  unitsCount: number;
  state: string;
  city: string;
  enabledModules: string[];
  stats: CompanyStats;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export type ModuleCategory = 'CORE' | 'OPERATIONS' | 'MANAGEMENT' | 'ADVANCED';

export interface ModuleDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  route: string;
  version: string;
  status: 'ACTIVE' | 'BETA' | 'AVAILABLE';
  category: ModuleCategory;
  permissionsRequired: Permission[];
  enabledByDefault: boolean;
  tags: string[];
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  moduleSource: string;
  companyId: string;
  acknowledged?: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  title: string;
  code?: string;
  user: string;
  type: 'ORDER' | 'INVOICE' | 'SUPPLIER' | 'PRODUCTION' | 'SYSTEM' | 'SECURITY';
  companyId: string;
}

export type CadastroCategory = 
  | 'CLIENTS' 
  | 'SUPPLIERS' 
  | 'EMPLOYEES' 
  | 'PRODUCTS' 
  | 'SERVICES' 
  | 'UNITS' 
  | 'CONTACTS';

export interface DirectoryRecord {
  id: string;
  companyId: string;
  category: CadastroCategory;
  code: string;
  name: string;
  document?: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'BLOCKED';
  detail: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  updatedAt: string;
}

export type ReportCategory = 'OPERATIONAL' | 'FINANCIAL' | 'COMMERCIAL' | 'PRODUCTION' | 'INVENTORY';

export interface ReportItem {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: ReportCategory;
  lastUpdated: string;
  responsible: string;
  status: 'READY' | 'PROCESSING' | 'SCHEDULED';
  formats: ('PDF' | 'XLS' | 'INTERACTIVE')[];
  period: string;
  sizeEstimate?: string;
}
