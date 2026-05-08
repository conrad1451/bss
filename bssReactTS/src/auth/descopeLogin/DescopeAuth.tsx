// src/auth/descopeLogin/DescopeAuth.tsx

import { useState, useEffect, useCallback } from "react";

import {
  Descope,
  useDescope,
  useSession,
  useUser,
  getSessionToken,
} from "@descope/react-sdk";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import DescopeLandingPage from "./DescopeLoginLandingPage";

import type { DescopeUser, Player } from "../../utils/dataTypes";

import ChooseUsername from "../ChooseUsername";

import CreatePlayer from "../CreatePlayer";
import PlayerSelection from "../PlayerSelection";

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
      `[data-permission="${permission}"]`,
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

const UserLoginRegister = () => (
  <Descope
    flowId="sign-up-or-in-no-username"
    onSuccess={(e) => console.log(e.detail.user)}
    onError={(err) => {
      console.log("Error!", err);
      alert("Error: " + err.detail.errorMessage);
    }}
  />
);

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
  const { theSetChoice } = props;
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
      <Button variant="contained" onClick={() => theSetChoice(2)}>
        Go to User sign in
      </Button>
      <Button variant="contained" onClick={() => theSetChoice(3)}>
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
  const [refreshMe, setRefreshMe] = useState(0);

  const [me, setMe] = useState<null | {
    user_id: number;
    username: string | null;
    players: Player[];
  }>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // CHQ: ChatGPT added useEffect for new endpoint
  useEffect(() => {
    if (!isAuthenticated) return;

    setMeLoading(true);
    const apiURL: string = import.meta.env.VITE_API_BASE_URL + "/api/me";

    fetch(apiURL, {
      headers: {
        Authorization: `Bearer ${getSessionToken()}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("me failed");
        return res.json();
      })
      .then((data) => {
        setMe(data);
        // auto-select if exactly one player
        if (data.players?.length === 1) {
          setSelectedPlayer(data.players[0]);
        } else {
          setSelectedPlayer(null);
        }
      })
      .catch(() => setMe(null))
      .finally(() => setMeLoading(false));
  }, [isAuthenticated, refreshMe]);

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
    // step 1 — no username
    if (!me.username) {
      return <ChooseUsername onSuccess={() => setRefreshMe((r) => r + 1)} />;
    }

    // CHQ: Claude AI fixed with check for players
    // step 2 — no players
    if (!me.players || me.players.length === 0) {
      return <CreatePlayer onSuccess={() => setRefreshMe((r) => r + 1)} />;
    }

    // step 3 — multiple players, none selected
    if (me.players.length > 1 && !selectedPlayer) {
      return (
        <PlayerSelection
          players={me.players}
          onSelect={(player) => setSelectedPlayer(player)}
          onPlayerCreated={() => setRefreshMe((r) => r + 1)}
        />
      );
    }

    // step 4 — player selected (or auto-selected), go to game
    const sessionToken = getSessionToken();
    return (
      <DescopeLandingPage
        theHandleLogout={handleLogout}
        theSessionToken={sessionToken}
        theSelectedPlayer={selectedPlayer!}
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
      {choice === 2 && <UserLoginRegister />}
      {choice === 3 && <UserSignIn />}
    </div>
  );
};

export default DescopeAuth;
