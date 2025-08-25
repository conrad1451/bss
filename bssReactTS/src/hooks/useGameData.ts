// hooks/useGameData.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import type { CheckPointRecord } from "../utils/dataTypes";

interface UseCheckPointsResult {
  checkpoints: CheckPointRecord[];
  loading: boolean;
  error: string | null;
  refetchCheckpoints: () => void;
}

export const useGameData = (
  theApiURL: string,
  theSessionToken: string
): UseCheckPointsResult => {
  const apiURL = theApiURL;

  const [checkpoints, setCheckpoints] = useState<CheckPointRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState(0);

  // CHQ: Gemini AI modified to use useCallback
  // Use useCallback to create a memoized function that has access to the latest token
  const fetchCheckpoints = useCallback(async () => {
    // Add a guard clause to prevent the API call if the token is invalid or missing.
    if (!theSessionToken) {
      console.warn("Session token is not available. Aborting API call.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!apiURL) {
      setError("API URL is not defined in environment variables.");
      setLoading(false);
      console.error("API URL is not set.");
      return;
    }

    try {
      const response = await fetch(apiURL, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${theSessionToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CheckPointRecord[] = await response.json();
      setCheckpoints(data);
    } catch (e: any) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Failed to fetch checkpoints:", e);
    } finally {
      setLoading(false);
    }
  }, [apiURL, theSessionToken]); // the `fetchCheckpoints` function depends on these values

  useEffect(() => {
    // Call the memoized fetch function inside useEffect
    fetchCheckpoints();
  }, [fetchCheckpoints, triggerRefetch]); // Now useEffect depends on the `fetchCheckpoints` function itself

  const refetchCheckpoints = () => {
    setTriggerRefetch((prev) => prev + 1);
  };

  return { checkpoints, loading, error, refetchCheckpoints };
};
