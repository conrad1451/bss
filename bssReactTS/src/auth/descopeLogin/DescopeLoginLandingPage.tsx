// DescopeLoginLandingPage.tsx

import LoginDashboard from "../../components/accountAccessPages/LoginDashboard";
// import { getSessionToken } from "@descope/react-sdk"; // CHQ: suggested by Descope AI

interface DescopeUser {
  name?: string; // Assuming 'name' is a property in the user object. Adjust as needed.
  // [key: string]: any; // To allow other potential properties
}

interface LandingPageProps {
  theUser: DescopeUser;
  theHandleLogout: () => void;
  theSessionToken: string;
}

const DescopeLandingPage = (props: LandingPageProps) => {
  // CHQ: Gemini AI generated check for user existence before setting sessiontoken

  // Check if a user object exists. If it doesn't, we can assume the session is not yet active.
  // The token will be non-null when theUser is a valid object.
  if (!props.theUser) {
    // You could return a loading indicator here.
    return <div>Loading...</div>;
  }

  // const sessionToken = getSessionToken();

  return (
    <>
      {/* <p>Hello {props.theUser.name}</p> */}
      <p>Hello {props.theUser?.name}</p>{" "}
      {/* Using optional chaining in case name is not always present */}
      <div>My Private Component</div>
      {/* <LoginDashboard /> */}
      {/* <LoginDashboard sessionToken={sessionToken} /> */}
      <LoginDashboard sessionToken={props.theSessionToken} />
      {/* <FormToMongo /> */}
      <button onClick={props.theHandleLogout}>Logout</button>
    </>
  );
};

export default DescopeLandingPage;
