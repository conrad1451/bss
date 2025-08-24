// DescopeAuth.tsx

import { useCallback } from "react";

import { Descope, useDescope, useSession, useUser } from "@descope/react-sdk";
import { getSessionToken } from "@descope/react-sdk"; // CHQ: suggested by Descope AI

import DescopeLandingPage from "./DescopeLoginLandingPage";

const DescopeAuth = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const { logout } = useDescope();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  if (isSessionLoading || isUserLoading) {
    return <p>Loading...</p>;
  }

  if (isAuthenticated) {
    // CHQ: Gemini AI had getSessionToken called here and passed
    //      into DescopeLandingPage to eliminate race conditions
    const sessionToken = getSessionToken();
    return (
      <>
        <DescopeLandingPage
          theUser={user}
          theHandleLogout={handleLogout}
          theSessionToken={sessionToken}
        />
      </>
    );
  }

  return (
    <div>
      <h1>Sign In</h1>
      <Descope
        flowId="sign-up-or-in"
        onSuccess={(e) => console.log(e.detail.user)}
        onError={() => console.log("Could not log in!")}
      />
    </div>
  );
};

export default DescopeAuth;
