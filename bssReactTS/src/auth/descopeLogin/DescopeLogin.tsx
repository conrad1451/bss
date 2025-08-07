// DescopeLogin.tsx

import { AuthProvider } from "@descope/react-sdk";

import DescopeAuth from "./DescopeAuth";

function DescopeLogin() {
  const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID;

  return (
    <div>
      <AuthProvider projectId={projectId}>
        <DescopeAuth />
      </AuthProvider>
    </div>
  );
}

export default DescopeLogin;
