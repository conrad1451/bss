import SamplePage from "./components/SamplePage";
// import CustomTable from './MyTable'
// import StudentTable from "./components/StudentTable";

import {
  useNavigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import GameApp from "./components/GameApp";

import "./App.css";
// import DataFetcher from "./components/StudentsDisplay";

// eslint@typescript-eslint/no-empty-object-type
// interface NavigationButtonsProps {}

// const NavigationButtons: React.FC<NavigationButtonsProps> = () => {
function NavigationButtons() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
      <Button variant="contained" onClick={() => handleNavigate("/orig")}>
        Go to original page
      </Button>
      <Button variant="contained" onClick={() => handleNavigate("/gameplay")}>
        Go to game
      </Button>
      {/* <Button
        variant="contained"
        onClick={() => handleNavigate("/datafetchergo1")}
      >
        Go to data fetcher (Go-Neon)
      </Button> */}
      <Button variant="contained" onClick={() => handleNavigate("/tabletest")}>
        Go to table testing
      </Button>
    </Box>
  );
}

function FirstApp() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<NavigationButtons />} />
          <Route path="/orig" element={<SamplePage />} />
          <Route path="/gameplay" element={<GameApp />} />
        </Routes>
      </Router>
    </>
  );
}

export default FirstApp;
