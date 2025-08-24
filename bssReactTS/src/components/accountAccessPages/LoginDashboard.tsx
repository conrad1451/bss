// LoginDashboard.tsx

// import FormToNotion from "./MyNotionForm";
import SamplePage from "../SamplePage";
// import Login from "../../auth/Login";
// import FirstApp from "../../FirstApp";
import AppWrapper from "../../FirstApp";

const LoginDashboard = (props: { sessionToken: string }) => {
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
