// Login.tsx

import DescopeAuth from "./descopeLogin/DescopeAuth";
import SamplePage from "../components/SamplePage";
import { AuthProvider } from "@descope/react-sdk";

const Login = () => {
  const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID;

  const loginChoice: string = "Descope";
  return (
    <>
      {loginChoice === "Descope" ? (
        <AuthProvider projectId={projectId}>
          <DescopeAuth />
        </AuthProvider>
      ) : (
        <SamplePage />
      )}
    </>
  );
};

export default Login;
