// DescopeAuth.tsx

import { useState, useEffect, useCallback } from "react";

import { Descope, useDescope, useSession, useUser } from "@descope/react-sdk";
import { getSessionToken } from "@descope/react-sdk"; // CHQ: suggested by Descope AI

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import DescopeLandingPage from "./DescopeLoginLandingPage";

import type { DescopeUser } from "../../utils/dataTypes";

import ChooseUsername from "../ChooseUsername";

function checkPermission(user: DescopeUser, permission: string) {
  const hasPlayerRole =
    user.roleNames &&
    user.roleNames.some((role) => role.toLowerCase() === "player");
  const hasAdminRole =
    user.roleNames &&
    user.roleNames.some((role) => role.toLowerCase() === "game admin");

  if (hasAdminRole) {
    return true;
  }

  if (hasPlayerRole) {
    return ["create", "read", "update", "delete"].includes(permission);
  }
}

function updateUIBasedOnPermissions(user: DescopeUser) {
  const permissions = ["create", "update", "delete", "publish"];
  permissions.forEach((permission) => {
    const elements = document.querySelectorAll(
      `[data-permission="${permission}"]`
    );
    const shouldDisplay = checkPermission(user, permission);
    elements.forEach((element) => {
      // CHQ: Gemini AI added check for the element being an HTMLElement before trying to access 'style' property
      if (element instanceof HTMLElement) {
        element.style.display = shouldDisplay ? "inline-block" : "none";
      }
    });
  });
}

const UserLoginRegister = () => {
  return (
    <Descope
      // flowId="sign-up-or-in"
      flowId="sign-up-or-in-username"
      onSuccess={(e) => {
        console.log(e.detail.user?.name);
        console.log(e.detail.user?.email);

        // Check if e.detail.user is not undefined before calling the function.
        if (e.detail.user) {
          updateUIBasedOnPermissions(e.detail.user as DescopeUser);
        }
      }}
      onError={(err) => {
        console.log("Error!", err);
        alert("Error: " + err.detail.errorMessage);
        console.log("Could not log in");
      }}
    />
  );
};

const UserSignIn = () => {
  return (
    <Descope
      // flowId="sign-in"
      // flowId="step-up"
      // flowId="add-passkeys"
      flowId="sign-in-passkeys-or-otp"
      onSuccess={(e) => {
        console.log(e.detail.user?.name);
        console.log(e.detail.user?.email);

        // Check if e.detail.user is not undefined before calling the function.
        if (e.detail.user) {
          updateUIBasedOnPermissions(e.detail.user as DescopeUser);
        }
      }}
      onError={(err) => {
        console.log("Error!", err);
        alert("Error: " + err.detail.errorMessage);
        console.log("Could not log in");
      }}
    />
  );
};

const Buttons = (props: { theSetChoice: (input: number) => void }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
      {/* <Button variant="contained" onClick={() => props.theSetChoice(1)}>
        Go to Guest sign in
      </Button> */}

      <Button variant="contained" onClick={() => props.theSetChoice(2)}>
        Go to User sign in
      </Button>

      <Button variant="contained" onClick={() => props.theSetChoice(3)}>
        Go to Admin sign in
      </Button>
    </Box>
  );
};

const DescopeAuth = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { isUserLoading } = useUser();
  // const { user, isUserLoading } = useUser();
  const { logout } = useDescope();
  const [choice, setChoice] = useState(0);

  // CHQ: ChatGPT added two states
  const [me, setMe] = useState<null | { username: string | null }>(null);
  const [meLoading, setMeLoading] = useState(false);

  // CHQ: ChatGPT added useEffect for new endpoint
  useEffect(() => {
    if (!isAuthenticated) return;

    setMeLoading(true);

    const apiURL: string = import.meta.env.VITE_API_BASE_URL + "/me";

    fetch(apiURL, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("me failed");
        return res.json();
      })
      .then((data) => {
        setMe(data);
      })
      .catch(() => {
        setMe(null);
      })
      .finally(() => {
        setMeLoading(false);
      });
  }, [isAuthenticated]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  if (isSessionLoading || isUserLoading) {
    return <p>Loading...</p>;
  }

  // if (isAuthenticated) {
  //   // CHQ: Gemini AI had getSessionToken called here and passed
  //   //      into DescopeLandingPage to eliminate race conditions
  //   const sessionToken = getSessionToken();
  //   return (
  //     <>
  //       <DescopeLandingPage
  //         // theUser={user}
  //         theHandleLogout={handleLogout}
  //         theSessionToken={sessionToken}
  //       />
  //     </>
  //   );
  // }

  // CHQ: ChatGPT modified this block to account for authenticated
  //      users without a username vs users ready to go
  if (isAuthenticated) {
    if (meLoading || me === null) {
      return <p>Loading profile…</p>;
    }

    // // CHQ: ChatGPT: USER IS AUTHENTICATED BUT HAS NO USERNAME
    if (!me.username) {
      return (
        <ChooseUsername
          onSuccess={() => {
            // re-fetch /me
            setMe(null);
          }}
        />
      );
    }

    // CHQ: ChatGPT: FULLY READY USER
    const sessionToken = getSessionToken();
    return (
      <DescopeLandingPage
        theHandleLogout={handleLogout}
        theSessionToken={sessionToken}
      />
    );
  }

  // return (
  //   <div>
  //     <h1>Sign In</h1>
  //     <Descope
  //       flowId="sign-up-or-in"
  //       onSuccess={(e) => console.log(e.detail.user)}
  //       onError={() => console.log("Could not log in!")}
  //     />
  //   </div>
  // );

  return (
    <div>
      <h1>Sign In</h1>
      <Buttons theSetChoice={setChoice} />
      {/* {choice === 1 && <GuestLogin />} */}
      {choice === 2 && <UserLoginRegister />}
      {choice === 3 && <UserSignIn />}

      {/* UserSignIn */}
    </div>
  );
};

export default DescopeAuth;
