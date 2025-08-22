// CheckpointsDisplay.tsx

// import React from "react";
// import { useStudents } from "../hooks/useStudents";
import { useGameData } from "../hooks/useGameData";
import CheckpointTable from "./CheckpointTable";
// import { apiPicker } from "../services/apiPicker";

import { Box, Button, Typography } from "@mui/material"; // Import necessary MUI components
// import type { RowPage } from "../utils/dataTypes"; // Import both
import { transformCheckpointRecordToRowPage } from "../utils/dataTransforms";

// Define the prop type for EmptyDatabase for better type safety
interface EmptyDatabaseProps {
  theRefetchOfCheckpoints: () => void;
}

const EmptyDatabase = (props: EmptyDatabaseProps) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1">
        No checkpoints found. Add some from your database or via a POST request.
      </Typography>
      <Button
        variant="contained"
        onClick={props.theRefetchOfCheckpoints}
        sx={{ mt: 2 }}
      >
        Refresh Checkpoints
      </Button>
    </Box>
  );
};

// CHQ: Gemini AI renamed and refactored this.
//      It split a single functional component into a hook and a component
// const CheckpointsDisplay = (props: { theChoice: number; myToken: string }) => {
// const CheckpointsDisplay = (props: { theChoice: number; myUserID: string }) => {
const CheckpointsDisplay = (props: {
  theChoice: number;
  theSessionToken: string;
}) => {
  const API_BASE_URL = import.meta.env.API_BASE_URL;

  const { checkpoints, loading, error, refetchCheckpoints } = useGameData(
    API_BASE_URL,
    props.theSessionToken
  );
  // console.log("props.myToken");
  // console.log(props.myToken);

  // Set this to `false` to use real data from the API

  const useSampleData = false;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5">Loading checkpoints...</Typography>
      </Box>
    );
  }

  // Display error message if there's an error and we're not explicitly using sample data
  if (error && !useSampleData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" color="error">
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={refetchCheckpoints} sx={{ mt: 2 }}>
          Retry Fetch
        </Button>
      </Box>
    );
  }

  // Sample data, now explicitly typed as RowPage[] to match StudentTable's expectation
  // const studentSampleData: RowPage[] = [
  //   {
  //     myID: 101,
  //     FirstName: "Steven",
  //     LastName: "Okang",
  //     Email: "steveokang@gmail.com",
  //     Major: "Computer Science",
  //   },
  //   {
  //     myID: 102,
  //     FirstName: "Kwame",
  //     LastName: "Kingston",
  //     Email: "kwamekingston@gmail.com",
  //     Major: "Electrical Engineering",
  //   },
  // ];

  // --- Prepare the data for StudentTable based on 'useSampleData' flag ---
  // let dataForTable: RowPage[];
  // if (useSampleData) {
  //   dataForTable = studentSampleData;
  // } else {
  //   // --- THIS IS THE CRITICAL PART: Use the imported transformation function ---
  //   dataForTable = transformCheckpointRecordToRowPage(checkpoints);
  // }

  const dataForTable = transformCheckpointRecordToRowPage(checkpoints);

  // --- END DATA PREPARATION ---
  // const isHidingEmptyDatabase = true;
  const isHidingEmptyDatabase = false;
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Checkpoint Management Dashboard
      </Typography>

      {/* FIXME: add breakpoints here to debug why empty table does not show when there is no data */}
      {/* Show EmptyDatabase component if no error, no real checkpoints, AND not using sample data */}
      {!error &&
      dataForTable.length === 0 &&
      !useSampleData &&
      isHidingEmptyDatabase ? (
        <EmptyDatabase theRefetchOfCheckpoints={refetchCheckpoints} />
      ) : // Render StudentTable with the prepared data (either transformed real data or sample data)

      props.theChoice === 1 || props.theChoice === 2 ? (
        <CheckpointTable
          thePages={dataForTable}
          theChoice={API_BASE_URL}
          theToken={props.theSessionToken}
        />
      ) : (
        <h3>There has been some sort of error!</h3>
      )}
    </Box>
  );
};

export default CheckpointsDisplay;
