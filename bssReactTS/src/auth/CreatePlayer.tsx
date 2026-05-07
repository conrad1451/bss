// src/auth/CreatePlayer.tsx
import { useState } from "react";
import { getSessionToken } from "@descope/react-sdk";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type Props = {
  onSuccess: () => void;
};

const CreatePlayer = ({ onSuccess }: Props) => {
  const [playername, setPlayername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setError(null);

    const normalized = playername.trim();
    if (!normalized) {
      setError("Playername is required");
      return;
    }

    setLoading(true);
    // CHQ: Claude AI fixed the missing /api from the url
    const apiURL = import.meta.env.VITE_API_BASE_URL + "/api/players";

    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionToken()}`,
        },
        body: JSON.stringify({ playername: normalized }),
      });

      if (res.status === 409) {
        setError("Playername already taken");
        return;
      }
      if (res.status === 403) {
        setError("Player limit reached");
        return;
      }
      if (!res.ok) {
        throw new Error("Unexpected error");
      }

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
      <Typography variant="h5">Create your first character</Typography>
      <TextField
        label="Character name"
        value={playername}
        onChange={(e) => {
          setPlayername(e.target.value);
          if (error) setError(null);
        }}
        error={!!error}
        helperText={error}
        disabled={loading}
      />
      <Button
        variant="contained"
        onClick={submit}
        disabled={loading || !playername.trim()}
      >
        {loading ? "Creating…" : "Create Character"}
      </Button>
    </Box>
  );
};

export default CreatePlayer;
