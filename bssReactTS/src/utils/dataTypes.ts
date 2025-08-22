// dataTypes.ts

export interface RowPage {
  myID: number;
  Username: string;
  CheckpointData: string;
  CreatedAt: Date;
  LastEditedAt: Date;
  playerID: string;
}

export interface DescopeUser {
  name: string;
  email: string;
  roleNames?: string[]; // The `roleNames` property is an optional array of strings
}
export interface CheckPointRecord {
  id: number;
  Username: string;
  CheckpointData: string;
  CreatedAt: string;
  LastEditedAt: string;
  playerID: string;
}

// CHQ: Gemini AI generated interface UserData
export interface UserData {
  loginsIds: string[];
  userId: string;
  userNames: {
    name: string;
    email: string;
    phone: string;
    verifiedEmail: boolean;
    verifiedPhone: boolean;
    roleNames: string[];
    logins: any[];
  }[];
  userTenants: any[];
  status: string;
  OAuth: {
    google: boolean;
  };
  SAML: boolean;
  SCIM: boolean;
  TOTP: boolean;
  createTime: number;
  customAttributes: {};
  email: string;
  externalIds: string[];
  familyName: string;
  givenName: string;
  loginIds: string[];
  middleName: string;
  password: boolean;
  phone: string;
  picture: string;
  roleNames: string[];
  ssoIds: any[];
  test: boolean;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  webauthn: boolean;
}
export interface Item {
  id: number;
  value: string;
}

// --- WebFormProps & WebForm Component ---
export interface WebFormProps {
  onSubmit: (event: React.FormEvent) => Promise<void>;
}

export interface ConfirmUpdateProps {
  Username: string;
  CheckpointData: string;
  //   playerID: string;
}

export interface ApiResponse {
  message: string;
  // ... other properties
}

export interface TableBodyRowsProps {
  data: RowPage[];
  visibleColumns: ColumnVisibilityMiniTable;
  theColumnKeys: Array<keyof ColumnVisibilityMiniTable>;
  onOpenActionModal: (student: RowPage) => void;
  // NEW PROPS - passed down from StudentTable
  myId: number;
  myUsername: string;
  setMyUsername: (value: string) => void;
  myCheckpointData: string;
  setMyCheckpointData: (value: string) => void;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  onNewCheckpointSubmit: (event: React.FormEvent) => Promise<void>;
}

export interface ColumnVisibility {
  myID: boolean;
  Username: boolean;
  CheckpointData: boolean;
  CreatedAt: boolean;
  LastEditedAt: boolean;
  playerID: boolean;
}
export interface ColumnVisibilityMiniTable {
  myID: boolean;
  Qty: boolean;
  Username: boolean;
  CheckpointData: boolean;
  CreatedAt: boolean;
  LastEditedAt: boolean;
  playerID: boolean;
}

export const allColumnKeys: Array<keyof ColumnVisibility> = [
  "myID",
  "Username",
  "CheckpointData",
  "CreatedAt",
  "LastEditedAt",
  "playerID",
];
