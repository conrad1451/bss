// hooks/useGameData.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import type { CheckPointRecord } from "../utils/dataTypes";

interface UseCheckPointsResult {
  checkpoints: CheckPointRecord[];
  loading: boolean;
  error: string | null;
  refetchCheckpoints: () => void; // Add a refetch function
}

export const useGameData = (
  theApiURL: string,
  theSessionToken: string
): UseCheckPointsResult => {
  // === Constants and State ===
  // IMPORTANT: This variable should be defined here, as it's a hook dependency
  // const API_BASE_URL = import.meta.env.API_BASE_URL;
  // const apiURL = API_BASE_URL;

  // const API_BASE_URL = theApiURL;
  const apiURL = theApiURL;

  const headers = useMemo(() => {
    return {
      Authorization: `Bearer ${theSessionToken}`,
    };
  }, [theSessionToken]);

  const [saves, setSaves] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false });

  const [checkpoints, setCheckpoints] = useState<CheckPointRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState(0); // State to trigger refetch

  // // === User ID Initialization ===
  // useEffect(() => {
  //   let currentUserId = localStorage.getItem("bss_user_id");
  //   if (!currentUserId) {
  //     currentUserId = crypto.randomUUID();
  //     localStorage.setItem("bss_user_id", currentUserId);
  //   }
  //   setUserId(currentUserId);
  // }, []);

  useEffect(() => {
    const fetchCheckpoints = async () => {
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
          headers: headers,
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
    };
    fetchCheckpoints();
  }, [apiURL, headers, triggerRefetch, theSessionToken]); // Add theSessionToken to dependencies

  const refetchCheckpoints = () => {
    setTriggerRefetch((prev) => prev + 1);
  };

  return { checkpoints, loading, error, refetchCheckpoints };

  // // === Backend API Functions ===
  // const fetchSaves = useCallback(async () => {
  //   if (!userId) return;
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch(API_BASE_URL, { method: "GET" });
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch saves");
  //     }
  //     const allSaves = await response.json();
  //     const userSaves = allSaves
  //       .filter((save) => save.user_name === userId)
  //       .map((save) => ({
  //         id: save.id,
  //         data: {
  //           name: `Game #${save.id}`,
  //           lastSaved: Date.now(),
  //           saveCode: save.checkpoint_data,
  //         },
  //       }));

  //     userSaves.sort((a, b) => b.id - a.id);
  //     setSaves(userSaves);
  //   } catch (error) {
  //     console.error("Error fetching saves:", error);
  //     setModal({
  //       isOpen: true,
  //       title: "Data Error",
  //       message:
  //         "Failed to fetch saved games from the backend. Please check your API URL.",
  //       onConfirm: () => setModal({ isOpen: false }),
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [userId, API_BASE_URL]);

  // const deleteFromBackend = useCallback(
  //   async (saveId) => {
  //     if (!userId) return;
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/${saveId}`, {
  //         method: "DELETE",
  //       });
  //       if (!response.ok) {
  //         throw new Error("Failed to delete save");
  //       }
  //       await fetchSaves();
  //     } catch (error) {
  //       console.error("Error deleting document:", error);
  //       setModal({
  //         isOpen: true,
  //         title: "Delete Error",
  //         message: "Failed to delete the game. Please try again.",
  //         onConfirm: () => setModal({ isOpen: false }),
  //       });
  //     }
  //   },
  //   [userId, fetchSaves, API_BASE_URL]
  // );

  // // The saveToBackend function from your original code
  // const saveToBackend = useCallback(
  //   async (saveId, data) => {
  //     if (!userId) return false;

  //     const payload = {
  //       user_name: userId,
  //       checkpoint_data: data.saveCode,
  //     };

  //     try {
  //       let response;
  //       if (saveId) {
  //         response = await fetch(`${API_BASE_URL}/${saveId}`, {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload),
  //         });
  //       } else {
  //         response = await fetch(API_BASE_URL, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload),
  //         });
  //       }

  //       if (!response.ok) {
  //         throw new Error("Failed to save game");
  //       }

  //       await response.json();
  //       await fetchSaves();
  //       return true;
  //     } catch (error) {
  //       console.error("Error saving document:", error);
  //       setModal({
  //         isOpen: true,
  //         title: "Save Error",
  //         message:
  //           "Failed to save the game. Please check your network and API URL.",
  //         onConfirm: () => setModal({ isOpen: false }),
  //       });
  //       return false;
  //     }
  //   },
  //   [userId, fetchSaves, API_BASE_URL]
  // );

  // // === Effect for Initial Data Loading ===
  // useEffect(() => {
  //   if (userId) {
  //     fetchSaves();
  //   }
  // }, [userId, fetchSaves]);

  // return {
  //   saves,
  //   userId,
  //   isLoading,
  //   modal,
  //   setModal,
  //   fetchSaves,
  //   saveToBackend,
  //   deleteFromBackend,
  // };
};
