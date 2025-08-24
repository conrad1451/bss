// CheckpointTable.tsx

import React, { useState, useEffect } from "react";
// import { idGenerator } from "../utils/idGenerator";
import {
  Table,
  TableContainer,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import Modal from "@mui/material/Modal";
import { useTableFilters } from "../hooks/useTableFilters";
import { useTableSorting } from "../hooks/useTableSorting";
import { useColumnVisibilityMiniTable } from "../hooks/useColumnVisibility";
import { useConfirmationModal } from "../hooks/useConfirmationModule";
import { ColumnVisibilityControlModal } from "./ColumnVisibilityModule";
import { TableHeaderCells, TableBodyRows } from "./TableSubcomponents";

import type {
  RowPage,
  ConfirmUpdateProps,
  ApiResponse,
} from "../utils/dataTypes";
import { allColumnKeys } from "../utils/dataTypes";

// Simple icon components for the collapse button
const MyChevronRightIcon = () => {
  return <>▶️</>;
};

const MyExpandMoreIcon = () => {
  return <>🔽</>;
};

// New component for the Edit/Delete action modal
const CheckpointActionModal = (props: {
  open: boolean;
  onClose: () => void;
  student: RowPage | null;
  //   onEdit: (student: RowPage) => void;
  onDelete: (student: RowPage) => void;
}) => {
  if (!props.student) return null;

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" component="h2">
          {/* Actions for {props.student.FirstName} {props.student.LastName} (ID:{" "}
          {props.student.myID}) */}
          Actions for checkpoint
        </Typography>
        {/* <Button
          variant="contained"
          disabled={true}
          onClick={() => props.onEdit(props.student!)}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            borderRadius: "8px",
          }}
        >
          Edit
        </Button> */}
        <Button
          variant="outlined"
          color="error"
          onClick={() => props.onDelete(props.student!)}
          sx={{
            borderColor: "error.main",
            color: "error.main",
            "&:hover": { bgcolor: "error.light" },
            borderRadius: "8px",
          }}
        >
          Delete
        </Button>
        <Button
          onClick={props.onClose}
          variant="text"
          sx={{ mt: 1, borderRadius: "8px" }}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

// Update Confirmation Modal component, now controlled by the hook
const UpdateConfirmationModal = (props: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  currentFirstName: string;
  setCurrentFirstName: (value: string) => void;
  currentLastName: string;
  setCurrentLastName: (value: string) => void;
  currentEmail: string;
  setCurrentEmail: (value: string) => void;
  currentMajor: string;
  setCurrentMajor: (value: string) => void;
}) => {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" component="h2">
          Confirmation
        </Typography>
        <Typography>{props.message}</Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            type="text"
            value={props.currentFirstName}
            onChange={(e) => props.setCurrentFirstName(e.target.value)}
            placeholder="First Name"
            size="small"
            variant="outlined"
          />
          <TextField
            label="Last Name"
            type="text"
            value={props.currentLastName}
            onChange={(e) => props.setCurrentLastName(e.target.value)}
            placeholder="Last Name"
            size="small"
            variant="outlined"
          />
          <TextField
            label="Email"
            type="email"
            value={props.currentEmail}
            onChange={(e) => props.setCurrentEmail(e.target.value)}
            placeholder="Email"
            size="small"
            variant="outlined"
          />
          <TextField
            label="Major"
            type="text"
            value={props.currentMajor}
            onChange={(e) => props.setCurrentMajor(e.target.value)}
            placeholder="Major"
            size="small"
            variant="outlined"
          />
        </Box>
        {props.loading && <p>Loading...</p>}
        {props.successMessage && (
          <p style={{ color: "green" }}>{props.successMessage}</p>
        )}
        {props.errorMessage && (
          <p style={{ color: "red" }}>{props.errorMessage}</p>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
          <Button
            variant="contained"
            color="info"
            onClick={props.onConfirm}
            sx={{ borderRadius: "8px" }}
            disabled={props.loading}
          >
            Confirm Update
          </Button>
          <Button
            variant="outlined"
            onClick={props.onClose}
            sx={{ borderRadius: "8px" }}
            disabled={props.loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Deletion Confirmation Modal component, now controlled by the hook
const DeletionConfirmationModal = (props: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}) => {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" component="h2">
          Confirmation
        </Typography>
        <Typography>{props.message}</Typography>
        {props.loading && <p>Loading...</p>}
        {props.successMessage && (
          <p style={{ color: "green" }}>{props.successMessage}</p>
        )}
        {props.errorMessage && (
          <p style={{ color: "red" }}>{props.errorMessage}</p>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={props.onConfirm}
            sx={{ borderRadius: "8px" }}
            disabled={props.loading}
          >
            Confirm Delete
          </Button>
          <Button
            variant="outlined"
            onClick={props.onClose}
            sx={{ borderRadius: "8px" }}
            disabled={props.loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Main CheckpointTable component
const CheckpointTable = (props: {
  thePages: RowPage[];
  theChoice: string;
  theToken: string;
}) => {
  const [rawTableData, setRawTableData] = useState<RowPage[]>(props.thePages);

  // Sync local state with props whenever props.thePages changes
  useEffect(() => {
    setRawTableData(props.thePages);
  }, [props.thePages]);

  // Filter out any rows that have invalid data before passing to hooks
  const initialTableDataForHooks = rawTableData.filter(
    (row) => row && row.Username && row.Username.trim() !== ""
  );

  // Custom hooks for table functionality
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const {
    visibleColumns,
    handleToggleColumn,
    setPresetVisibility,
    resetVisibility,
    presets,
  } = useColumnVisibilityMiniTable("default");
  const { filteredData } = useTableFilters(initialTableDataForHooks);
  const { sortedData, sortProps, sortHandlers } = useTableSorting(filteredData);

  // State for the table collapse functionality
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  // State variables for the "Add New Student" form
  const [myUsername, setMyUsername] = useState("");
  const [myCheckpointData, setMyCheckpointData] = useState("");

  // State for API call feedback
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use the new confirmation hook
  const confirmationModal = useConfirmationModal();

  // States for the update modal's input fields (now controlled by the main component)
  const [updateFirstName, setUpdateFirstName] = useState("");
  const [updateLastName, setUpdateLastName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateMajor, setUpdateMajor] = useState("");

  //   const newMyID: number = idGenerator(rawTableData);
  const apiURL = props.theChoice;

  // Handler to open the action modal for a specific student
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedStudentForActions, setSelectedStudentForActions] =
    useState<RowPage | null>(null);
  const handleOpenActionModal = (student: RowPage) => {
    setSelectedStudentForActions(student);
    setIsActionModalOpen(true);
  };
  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedStudentForActions(null);
  };

  // Handler for adding a new student via a POST request
  const handleNewCheckpointSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // const BASE_URL =
      //   import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_LOCALHOST;
      const BASE_URL = apiURL;
      const sessionToken = props.theToken;
      const formData = {
        // id: newMyID,
        Username: myUsername,
        CheckpointData: myCheckpointData,
      };

      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      const result: ApiResponse = await response.json();
      console.log("Data sent to database successfully:", result);
      setSuccessMessage("Data sent to database successfully!");
      setRawTableData((prevData) => [
        ...prevData,
        {
          Username: myUsername,
          CheckpointData: myCheckpointData,
        } as RowPage,
      ]);

      // setRawTableData((prevData) => [...prevData, result.data as RowPage]);

      setMyCheckpointData("");
      setMyUsername("");
    } catch (error: any) {
      console.error("Error in database:", error);
      setErrorMessage(
        error.message || "Failed to send data to database. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler to open the update confirmation modal
  //   const handleEditStudent = (student: RowPage) => {
  //     setUpdateFirstName(student.FirstName);
  //     setUpdateLastName(student.LastName);
  //     setUpdateEmail(student.Email);
  //     setUpdateMajor(student.Major || "");
  //     handleCloseActionModal(); // Close the action modal first

  //     // Now use the hook to show the update confirmation modal
  //     confirmationModal.showConfirmation(
  //       `Are you sure you want to update student ID ${student.myID}?`,
  //       confirmUpdateStudent,
  //       student,
  //       "update"
  //     );
  //   };

  // Handler to open the delete confirmation modal
  const handleDeleteCheckpoint = (checkpoint: RowPage) => {
    handleCloseActionModal(); // Close the action modal first

    // if(checkpoint.myID?)
    if (checkpoint.myID !== null && checkpoint.myID !== undefined) {
      // Now use the hook to show the delete confirmation modal
      confirmationModal.showConfirmation(
        // `Are you sure you want to delete the checkpoint for ${checkpoint.Username}? This action cannot be undone.`,

        `Are you sure you want to delete checkpoint ${checkpoint.myID} - ${checkpoint.Username}? This action cannot be undone.`,
        confirmDeleteCheckpoint,
        checkpoint,
        "delete"
      );
      // } else {
    }
  };

  // Handler to confirm delete and make the API call
  const confirmDeleteCheckpoint = async (
    dataPayload: RowPage | ConfirmUpdateProps
  ) => {
    // Corrected type to match ConfirmationData
    const checkpointToDelete = dataPayload as RowPage;

    if (!checkpointToDelete) {
      console.warn("No student selected for deletion.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      //  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_LOCALHOST;
      const BASE_URL = apiURL;
      const sessionToken = props.theToken;
      const response = await fetch(`${BASE_URL}/${checkpointToDelete.myID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      console.log(
        `Checkpoint with ID ${checkpointToDelete.myID} deleted successfully.`
      );
      setSuccessMessage("Checkpoint deleted successfully!");
      setRawTableData((prevData) =>
        prevData.filter(
          (checkpoint) => checkpoint.myID !== checkpointToDelete.myID
        )
      );
    } catch (error: any) {
      console.error("Error deleting checkpoint:", error);
      setErrorMessage(
        error.message || "Failed to delete checkpoint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler to confirm update and make the API call
  //   const confirmUpdateStudent = async (
  //     dataPayload: ConfirmUpdateProps | RowPage
  //   ) => {
  //     const studentToUpdate = dataPayload as RowPage;

  //     // Create a new payload with only the fields that have been changed
  //     const updatePayload: {
  //       first_name?: string;
  //       last_name?: string;
  //       email?: string;
  //       major?: string | null;
  //     } = {};

  //     // Check which fields were actually changed and add them to the payload.
  //     // The user's input fields (`update...`) contain the potential new values.
  //     if (
  //       updateFirstName.trim() !== "" &&
  //       updateFirstName !== studentToUpdate.FirstName
  //     ) {
  //       updatePayload.first_name = updateFirstName;
  //     }
  //     if (
  //       updateLastName.trim() !== "" &&
  //       updateLastName !== studentToUpdate.LastName
  //     ) {
  //       updatePayload.last_name = updateLastName;
  //     }
  //     if (updateEmail.trim() !== "" && updateEmail !== studentToUpdate.Email) {
  //       updatePayload.email = updateEmail;
  //     }
  //     const newMajor = updateMajor.trim() === "" ? null : updateMajor;
  //     if (newMajor !== (studentToUpdate.Major || null)) {
  //       updatePayload.major = newMajor;
  //     }

  //     if (Object.keys(updatePayload).length === 0) {
  //       setErrorMessage("No changes detected. Nothing to update.");
  //       setLoading(false);
  //       return;
  //     }

  //     setLoading(true);
  //     setErrorMessage(null);
  //     setSuccessMessage(null);

  //     try {
  //       //  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_LOCALHOST;
  //       const BASE_URL = apiURL;
  //       const sessionToken = props.theToken;
  //       // The method is now "PATCH" as the server requires a partial payload.
  //       const response = await fetch(`${BASE_URL}/${studentToUpdate.myID}`, {
  //         method: "PATCH", // Changed back to "PATCH" from "PUT"
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${sessionToken}`,
  //         },
  //         body: JSON.stringify(updatePayload), // Now sending only the changed fields
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.message || "Server error during update");
  //       }

  //       const result: ApiResponse = await response.json();
  //       console.log("Student updated successfully:", result);
  //       setSuccessMessage("Student updated successfully!");

  //       // New and improved logic for updating local state
  //       // Create an object with the new values using the correct local PascalCase keys
  //       const updatedLocalData = {
  //         ...(updatePayload.first_name !== undefined && {
  //           FirstName: updatePayload.first_name,
  //         }),
  //         ...(updatePayload.last_name !== undefined && {
  //           LastName: updatePayload.last_name,
  //         }),
  //         ...(updatePayload.email !== undefined && {
  //           Email: updatePayload.email,
  //         }),
  //         ...(updatePayload.major !== undefined && {
  //           Major: updatePayload.major,
  //         }),
  //       };

  //       // Update the local state by merging the old student data with the new values
  //       setRawTableData((prevData) =>
  //         prevData.map((student) =>
  //           student.myID === studentToUpdate.myID
  //             ? {
  //                 ...student,
  //                 ...updatedLocalData,
  //               }
  //             : student
  //         )
  //       );

  //       setUpdateFirstName("");
  //       setUpdateLastName("");
  //       setUpdateEmail("");
  //       setUpdateMajor("");
  //     } catch (error: any) {
  //       console.error("Error updating student:", error);
  //       setErrorMessage(
  //         error.message || "Failed to update student. Please try again."
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="div">
            Student Data
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setIsColumnModalOpen(true)}
            >
              Customize Columns
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsTableCollapsed(!isTableCollapsed)}
            >
              {isTableCollapsed ? <MyChevronRightIcon /> : <MyExpandMoreIcon />}{" "}
              {isTableCollapsed ? "Expand" : "Collapse"} Table
            </Button>
          </Box>
        </Box>

        <ColumnVisibilityControlModal
          open={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          visibleColumns={visibleColumns}
          onToggle={handleToggleColumn}
          onSelectPreset={setPresetVisibility}
          onReset={resetVisibility}
          presets={presets}
        />

        {!isTableCollapsed && (
          <TableContainer>
            <Table stickyHeader aria-label="student table">
              <TableHeaderCells
                visibleColumns={visibleColumns}
                sortProps={sortProps}
                sortHandlers={sortHandlers}
                theColumnKeys={allColumnKeys}
              />
              <TableBodyRows
                data={sortedData}
                visibleColumns={visibleColumns}
                theColumnKeys={allColumnKeys}
                onOpenActionModal={handleOpenActionModal}
                // myId={newMyID}
                myUsername={myUsername}
                setMyUsername={setMyUsername}
                myCheckpointData={myCheckpointData}
                setMyCheckpointData={setMyCheckpointData}
                loading={loading}
                successMessage={successMessage}
                errorMessage={errorMessage}
                onNewCheckpointSubmit={handleNewCheckpointSubmit}
              />
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Modal (Edit/Delete) */}
      <CheckpointActionModal
        open={isActionModalOpen}
        onClose={handleCloseActionModal}
        student={selectedStudentForActions}
        // onEdit={handleEditStudent}
        onDelete={handleDeleteCheckpoint}
      />

      {/* Update Confirmation Modal (now controlled by the hook) */}
      {confirmationModal.confirmationType === "update" && (
        <UpdateConfirmationModal
          open={confirmationModal.isOpen}
          onClose={confirmationModal.cancelAction}
          onConfirm={confirmationModal.confirmAction}
          message={confirmationModal.message}
          currentFirstName={updateFirstName}
          setCurrentFirstName={setUpdateFirstName}
          currentLastName={updateLastName}
          setCurrentLastName={setUpdateLastName}
          currentEmail={updateEmail}
          setCurrentEmail={setUpdateEmail}
          currentMajor={updateMajor}
          setCurrentMajor={setUpdateMajor}
          loading={loading}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
      )}

      {/* Deletion Confirmation Modal (now controlled by the hook) */}
      {confirmationModal.confirmationType === "delete" && (
        <DeletionConfirmationModal
          open={confirmationModal.isOpen}
          onClose={confirmationModal.cancelAction}
          onConfirm={confirmationModal.confirmAction}
          message={confirmationModal.message}
          loading={loading}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
      )}
    </Box>
  );
};

export default CheckpointTable;
