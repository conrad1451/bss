// LoginDashboard.tsx
import React, { useEffect, useCallback } from "react";

import SamplePage from "../SamplePage";
import AppWrapper from "../../FirstApp";

import type { ApiResponse } from "../../utils/dataTypes";

const LoginDashboard = (props: { sessionToken: string }) => {
  // const handleNewUserSubmit = async (event: React.FormEvent) => {

  const handleNewUserSubmit = useCallback(async () => {
    try {
      const BASE_URL =
        import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_LOCALHOST;
      const sessionToken = props.sessionToken;

      const response = await fetch(`${BASE_URL}/api/usercreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      const result = await response.json();
      console.log("New user created successfully:", result);
    } catch (error) {
      console.error(
        "Error creating new user (possibly already exists):",
        error
      );
    }
  }, [props.sessionToken]);

  // Use a useEffect hook to call the function when the component loads.
  useEffect(() => {
    if (props.sessionToken) {
      handleNewUserSubmit();
      // handleNewUserSubmit("dd");
    }
  }, [props.sessionToken, handleNewUserSubmit]); // Re-run if the token changes
  // A simple guard clause to check if the sessionToken exists and is not empty.
  if (!props.sessionToken) {
    // If no token is present, you should render your login page or a loading screen.
    // For now, we'll just return a message.
    return <div>Please log in to access the game portal.</div>;
    // In a real app, you would render: <Login />
  }

  // const myChoice:string = "NotionForm";
  const myChoice: string = "GamePortal";
  // const myChoice: string = "NOPE";

  return (
    <>
      {myChoice === "GamePortal" ? (
        // <FirstApp />
        <AppWrapper sessionToken={props.sessionToken} />
      ) : myChoice === "NotionForm" ? (
        <SamplePage />
      ) : (
        <SamplePage />
      )}
    </>
  );
};

export default LoginDashboard;
