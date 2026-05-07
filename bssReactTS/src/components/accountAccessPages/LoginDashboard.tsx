// LoginDashboard.tsx
import AppWrapper from "../../FirstApp";
import type { Player } from "../../utils/dataTypes";

const LoginDashboard = (props: {
  sessionToken: string;
  selectedPlayer: Player;
}) => {
  if (!props.sessionToken)
    return <div>Please log in to access the game portal.</div>;

  return (
    <AppWrapper
      sessionToken={props.sessionToken}
      selectedPlayer={props.selectedPlayer}
    />
  );
};

export default LoginDashboard;
