// LoginDashboard.tsx
import React from "react";

import { useGameData } from "../../hooks/useGameData";
import SamplePage from "../SamplePage";
import AppWrapper from "../../FirstApp";

const LoginDashboard = (props: { sessionToken: string }) => {
  if (!props.sessionToken) {
    return <div>Please log in to access the game portal.</div>;
  }

  const apiURL = import.meta.env.VITE_API_BASE_URL + "/api/gamecheckpoints";

  // This request carries the session token → middleware handles user creation
  const { checkpoints, loading, error, refetchCheckpoints } = useGameData(
    apiURL,
    props.sessionToken
  );

  const myChoice: string = "GamePortal";

  return (
    <>
      {myChoice === "GamePortal" ? (
        <AppWrapper sessionToken={props.sessionToken} />
      ) : (
        <SamplePage />
      )}
    </>
  );
};

export default LoginDashboard;
