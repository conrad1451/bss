// DescopeLoginLandingPage.tsx

import LoginDashboard from "../../components/accountAccessPages/LoginDashboard";

// import type { DescopeUser, LandingPageProps } from "../../utils/dataTypes";

import type { LandingPageProps } from "../../utils/dataTypes";
// interface DescopeUser {
//   name?: string;
// }

const DescopeLandingPage = (props: LandingPageProps) => {
  // This guard clause is essential. It prevents the component from rendering
  // its children before a valid session token is available.
  // if (!props.theSessionToken) {
  //   // You can return a loading state or a simple message.
  //   return <div>Loading...</div>;
  // }
  return (
    <>
      {/* <p>Hello {props.theUser?.name}</p> */}
      <div>My Private Component</div>
      {/* Now, you can safely pass the token, knowing it is valid. */}
      {/* <LoginDashboard sessionToken={props.theSessionToken} /> */}
      <LoginDashboard />

      <button onClick={props.theHandleLogout}>Logout</button>
    </>
  );
};

export default DescopeLandingPage;
