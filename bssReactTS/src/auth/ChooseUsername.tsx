// CHQ: Gemini AI created

import { useState } from "react";
import { getSessionToken } from "@descope/react-sdk";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  onSuccess: () => void;
};

const ChooseUsername = ({ onSuccess }: Props) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    setError(null);

    const normalized = username.trim();

    if (!normalized) {
      setError("Username is required");
      return;
    }

    setLoading(true);

    const apiURL: string = import.meta.env.VITE_API_BASE_URL + "/username";

    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        // body: JSON.stringify({ username }),
        body: JSON.stringify({ username: normalized }),
      });

      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }

      if (res.status === 409) {
        setError("Username already taken");
        return;
      }

      if (!res.ok) {
        throw new Error("Unexpected error");
      }

      // ✅ success — tell parent to refetch /me
      onSuccess();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">Choose a username</Typography>

      <TextField
        label="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (error) setError(null);
        }}
        error={!!error}
        helperText={error}
        disabled={loading}
      />

      <Button
        variant="contained"
        onClick={submit}
        disabled={loading || !username.trim()}
      >
        {loading ? "Saving…" : "Continue"}
      </Button>
    </Box>
  );
};

export default ChooseUsername;
