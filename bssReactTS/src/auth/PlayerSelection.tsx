// src/auth/PlayerSelection.tsx
import { getSessionToken } from "@descope/react-sdk";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { Player } from "../utils/dataTypes";
import { useState } from "react";
import CreatePlayer from "./CreatePlayer";

type Props = {
  players: Player[];
  onSelect: (player: Player) => void;
  onPlayerCreated: () => void;
};

const PlayerSelection = ({ players, onSelect, onPlayerCreated }: Props) => {
  const [showCreate, setShowCreate] = useState(false);

  if (showCreate) {
    return (
      <CreatePlayer
        onSuccess={() => {
          setShowCreate(false);
          onPlayerCreated();
        }}
      />
    );
  }

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
      <Typography variant="h5">Choose your character</Typography>
      {players.map((player) => (
        <Button
          key={player.id}
          variant="outlined"
          onClick={() => onSelect(player)}
        >
          {player.playername ?? `Character ${player.id}`}
        </Button>
      ))}
      {players.length < 10 && (
        <Button variant="contained" onClick={() => setShowCreate(true)}>
          + Create New Character
        </Button>
      )}
    </Box>
  );
};

export default PlayerSelection;
