// dataTypes.ts

// CHQ: Claude AI rewrote
export interface TableBodyRowsProps {
  data: Checkpoint[];
  visibleColumns: ColumnVisibilityMiniTable;
  theColumnKeys: Array<keyof ColumnVisibilityMiniTable>;
  onOpenActionModal: (checkpoint: Checkpoint) => void;
}
// export interface TableBodyRowsProps {
//   data: RowPage[];
//   visibleColumns: ColumnVisibilityMiniTable;
//   theColumnKeys: Array<keyof ColumnVisibilityMiniTable>;
//   onOpenActionModal: (student: RowPage) => void;
//   // NEW PROPS - passed down from StudentTable
//   // myId: number;
//   myUsername: string;
//   setMyUsername: (value: string) => void;
//   myCheckpointData: string;
//   setMyCheckpointData: (value: string) => void;
//   loading: boolean;
//   successMessage: string | null;
//   errorMessage: string | null;
//   onNewCheckpointSubmit: (event: React.FormEvent) => Promise<void>;
// }

// export interface ColumnVisibility {
//   myID: boolean;
//   Username: boolean;
//   CheckpointData: boolean;
//   CreatedAt: boolean;
//   LastEditedAt: boolean;
//   playerID: boolean;
// }
// export interface ColumnVisibilityMiniTable {
//   myID: boolean;
//   Qty: boolean;
//   Username: boolean;
//   CheckpointData: boolean;
//   CreatedAt: boolean;
//   LastEditedAt: boolean;
//   playerID: boolean;
// }

// --- Core API types ---
export interface User {
  user_id: number;
  username: string | null;
  players: Player[];
}

export interface Player {
  id: number;
  user_id: number;
  playername: string | null;
  created_at: string;
}

export interface Checkpoint {
  id: number;
  player_id: number;
  title: string;
  data: string;
  created_at: string;
  updated_at: string;
}

// --- Auth ---
export interface LandingPageProps {
  theHandleLogout: () => void;
  theSessionToken: string;
}

export interface DescopeUser {
  name: string;
  email: string;
  roleNames?: string[];
}

// --- API responses ---
export interface ApiResponse {
  message: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// --- Table/UI types ---
export interface ColumnVisibilityMiniTable {
  id: boolean;
  // player_id: boolean;
  title: boolean;
  data: boolean;
  created_at: boolean;
  updated_at: boolean;
}
export interface ColumnVisibility {
  id: boolean;
  // player_id: boolean;
  title: boolean;
  data: boolean;
  created_at: boolean;
  updated_at: boolean;
}

export const allColumnKeys: Array<keyof ColumnVisibility> = [
  "id",
  // "player_id",
  "title",
  "data",
  "created_at",
  "updated_at",
];
