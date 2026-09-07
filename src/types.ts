export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type LikelihoodLevel = 1 | 2 | 3 | 4 | 5;

export type RiskCategory = 
  | 'heights'
  | 'confined_space'
  | 'hot_work'
  | 'electrical'
  | 'excavation'
  | 'lifting'
  | 'chemical'
  | 'mechanical'
  | 'ergonomic'
  | 'general';

export type HierarchyControl = 
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export interface RiskAssessmentItem {
  id: string;
  activityName: string;
  location: string;
  category: RiskCategory;
  hazardDescription: string;
  potentialHarm: string;
  whoIsAtRisk: string; // e.g. عمال الموقع، الزوار، المقاولون
  initialLikelihood: LikelihoodLevel;
  initialSeverity: SeverityLevel;
  initialRiskScore: number; // L * S
  existingControls: string;
  controlHierarchy: HierarchyControl[];
  additionalControls: string;
  residualLikelihood: LikelihoodLevel;
  residualSeverity: SeverityLevel;
  residualRiskScore: number;
  isAlarp: boolean; // As Low As Reasonably Practicable
  assessorName: string;
  reviewerName?: string;
  photoUrl?: string;
  date: string;
  reviewDate?: string;
  status: 'draft' | 'active' | 'reviewed';
}

// Work Permit (PTW)
export type PermitType = 
  | 'hot_work'          // تصريح أعمال ساخنة
  | 'cold_work'         // تصريح أعمال باردة
  | 'confined_space'    // تصريح دخول أماكن محصورة
  | 'electrical_loto'   // تصريح أعمال كهربائية وعزل طاقة
  | 'excavation'        // تصريح أعمال الحفر
  | 'work_at_height'    // تصريح العمل على ارتفاعات
  | 'lifting_rigging';  // تصريح أعمال الرفع والتصبين

export type PermitStatus = 'requested' | 'approved' | 'active' | 'suspended' | 'closed' | 'cancelled';

export interface GasTestRecord {
  testedAt: string;
  oxygenPercent: number;        // 19.5% - 23.5% safe
  lelPercent: number;           // < 10%
  h2sPpm: number;               // < 10 ppm
  coPpm: number;                // < 25-35 ppm
  testerName: string;
  isSafe: boolean;
  notes?: string;
}

export interface WorkPermit {
  id: string;
  permitNumber: string;
  type: PermitType;
  title: string;
  description: string;
  location: string;
  department: string;
  contractorName?: string;
  workerCount: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: PermitStatus;
  requestorName: string;
  siteSupervisorName: string;
  safetyOfficerName: string;
  precautions: { [key: string]: boolean };
  gasTestRequired: boolean;
  gasTests?: GasTestRecord[];
  isolationCertificateNumber?: string;
  fireWatchRequired?: boolean;
  fireWatchName?: string;
  closeoutRemarks?: string;
  closedAt?: string;
}

// Safety Observations (BBS)
export type ObservationType = 'unsafe_act' | 'unsafe_condition' | 'safe_behavior' | 'stop_work';

export interface SafetyObservation {
  id: string;
  type: ObservationType;
  title: string;
  description: string;
  location: string;
  department: string;
  observedBy: string;
  observedAt: string;
  immediateActionTaken?: string;
  status: 'open' | 'addressed' | 'closed';
  riskRating: 'low' | 'medium' | 'high';
  photoUrl?: string;
}

// Incidents & Near Misses
export type IncidentType = 'near_miss' | 'first_aid' | 'medical_treatment' | 'lti' | 'property_damage' | 'environmental' | 'dangerous_occurrence';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  referenceNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  reportedBy: string;
  photoUrl?: string;
  injuredPersonName?: string;
  injuredPersonJob?: string;
  injuryNature?: string;
  lostTimeDays?: number;
  equipmentDamaged?: string;
  immediateCauses: string[];
  rootCauses: string[];
  correctiveActions: Array<{
    id: string;
    action: string;
    responsiblePerson: string;
    targetDate: string;
    completedDate?: string;
    isCompleted: boolean;
  }>;
  status: 'investigating' | 'action_pending' | 'closed';
}

// Checklists
export type ChecklistFrequency = 'daily' | 'weekly' | 'pre_task';

export interface ChecklistQuestion {
  id: string;
  category: string;
  question: string;
  standardReference?: string; // e.g. OSHA 1926.451
  status?: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface InspectionChecklist {
  id: string;
  templateId: string;
  title: string;
  category: string;
  frequency: ChecklistFrequency;
  inspectorName: string;
  location: string;
  inspectedAt: string;
  overallStatus: 'passed' | 'failed' | 'conditional';
  complianceRate: number; // Percentage
  items: ChecklistQuestion[];
  supervisorSignOff?: string;
  inspectorSignature?: string; // Base64 Canvas PNG
  signatureTimestamp?: string;
  isoStandardRef?: string;
  signatureHash?: string;
}

// Language and Localization
export type AppLanguage = 'ar' | 'en';

// Role-Based Access Control (RBAC) & Authentication
export type UserRole = 'admin_owner' | 'authorized_staff' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
}

export interface SecurityConfig {
  allowedDomain: string; // e.g., 'company.com'
  allowedEmails: string[]; // Whitelist of emails explicitly permitted by the owner
  enforce2FA: boolean;
  httpsEncrypted: boolean;
  wafProtected: boolean; // Cloudflare / Google Cloud Armor
  backendApiProxy: boolean;
  allowPublicViewing?: boolean;
}

// Daily Task Board (قائمة المهام اليومية الميدانية)
export type TaskPriority = 'urgent' | 'medium' | 'routine';
export type TaskCategory = 
  | 'inspection'      // تفتيش ميداني
  | 'permits'         // تصاريح العمل PTW
  | 'equipment_ppe'   // معدات ووقاية
  | 'toolbox_talk'    // اجتماع وتوعية TBT
  | 'audit_action'    // متابعة ملاحظات وإجراءات تصحيحية
  | 'general';        // عامة

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueTime?: string; // e.g. "08:30"
  assignedTo?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

// Offline Caching & IndexedDB Sync (التخزين المؤقت والمزامنة التلقائية)
export interface OfflineQueueItem {
  id: string;
  type: 'incident' | 'observation' | 'permit' | 'assessment';
  title: string;
  payload: any;
  queuedAt: string;
  status: 'pending_sync' | 'synced' | 'failed';
  errorMessage?: string;
}

export interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt?: string;
  offlineQueue: OfflineQueueItem[];
}

