// import FormToNotion from "./MyNotionForm";
import SamplePage from "../SamplePage";
// import Login from "../../auth/Login";
import FirstApp from "../../FirstApp";

function LoginDashboard() {
  // const myChoice:string = "NotionForm";
  const myChoice: string = "StudentPortal";
  // const myChoice: string = "NOPE";

  return (
    <>
      {myChoice === "StudentPortal" ? (
        <FirstApp />
      ) : myChoice === "NotionForm" ? (
        <SamplePage />
      ) : (
        <SamplePage />
      )}
    </>
  );
}

export default LoginDashboard;
