import LoginDashboard from "../../components/accountAccessPages/LoginDashboard";

interface DescopeUser {
  name?: string; // Assuming 'name' is a property in the user object. Adjust as needed.
  // [key: string]: any; // To allow other potential properties
}

interface LandingPageProps {
  theUser: DescopeUser;
  theHandleLogout: () => void;
}

const DescopeLandingPage = (props: LandingPageProps) => {
  return (
    <>
      {/* <p>Hello {props.theUser.name}</p> */}
      <p>Hello {props.theUser?.name}</p>{" "}
      {/* Using optional chaining in case name is not always present */}
      <div>My Private Component</div>
      <LoginDashboard />
      {/* <FormToMongo /> */}
      <button onClick={props.theHandleLogout}>Logout</button>
    </>
  );
};

export default DescopeLandingPage;
