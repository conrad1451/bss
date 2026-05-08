// LoginDashboard.tsx
import AppWrapper from "../../FirstApp";
import type { Player } from "../../utils/dataTypes";

const LoginDashboard = (props: {
  sessionToken: string;
  selectedPlayer: Player;
}) => {
  const { sessionToken, selectedPlayer } = props;

  if (!sessionToken) return <div>Please log in to access the game portal.</div>;

  return (
    <AppWrapper sessionToken={sessionToken} selectedPlayer={selectedPlayer} />
  );
};

export default LoginDashboard;
