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
} from "@mui/material";
import Modal from "@mui/material/Modal";
import { useTableFilters } from "../hooks/useTableFilters";
import { useTableSorting } from "../hooks/useTableSorting";
import { useColumnVisibilityMiniTable } from "../hooks/useColumnVisibility";
import { useConfirmationModal } from "../hooks/useConfirmationModule";
import { ColumnVisibilityControlModal } from "./ColumnVisibilityModule";
import { TableHeaderCells, TableBodyRows } from "./TableSubcomponents";

import type { Checkpoint } from "../utils/dataTypes";
import { allColumnKeys } from "../utils/dataTypes";

// Simple icon components for the collapse button
const MyChevronRightIcon = () => {
  return <>▶️</>;
};

const MyExpandMoreIcon = () => {
  return <>🔽</>;
};

// CHQ: Claude AI refactored
const CheckpointActionModal = (props: {
  open: boolean;
  onClose: () => void;
  checkpoint: Checkpoint | null;
  onPlay: (checkpoint: Checkpoint) => void;
  onDelete: (checkpoint: Checkpoint) => void;
}) => {
  const { checkpoint, open, onClose, onPlay, onDelete } = props;
  if (!checkpoint) return null;

  return (
    <Modal open={open} onClose={onClose}>
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
          {/* Actions for {student.FirstName} {student.LastName} (ID:{" "}
          {student.myID}) */}
          Actions for checkpoint
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onPlay(checkpoint!)}
          sx={{
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": { bgcolor: "primary.light" },
            borderRadius: "8px",
          }}
        >
          Play Game at checkpoint
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onDelete(checkpoint!)}
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
          onClick={onClose}
          variant="text"
          sx={{ mt: 1, borderRadius: "8px" }}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

// // Update Confirmation Modal component, now controlled by the hook
// const UpdateConfirmationModal = (props: {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   message: string;
//   loading: boolean;
//   successMessage: string | null;
//   errorMessage: string | null;
//   currentCheckpointData: string;
//   setCheckpointData: (value: string) => void;
// }) => {
//   const {
//     open,
//     onClose,
//     onConfirm,
//     message,
//     currentCheckpointData,
//     setCheckpointData,
//     loading,
//     successMessage,
//     errorMessage,
//   } = props;

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           width: { xs: "90%", sm: 400 },
//           bgcolor: "background.paper",
//           border: "2px solid #000",
//           boxShadow: 24,
//           p: 4,
//           display: "flex",
//           flexDirection: "column",
//           gap: 2,
//           borderRadius: "8px",
//         }}
//       >
//         <Typography variant="h6" component="h2">
//           Confirmation
//         </Typography>
//         <Typography>{message}</Typography>

//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//           <TextField
//             label="First Name"
//             type="text"
//             value={currentCheckpointData}
//             onChange={(e) => setCheckpointData(e.target.value)}
//             placeholder="First Name"
//             size="small"
//             variant="outlined"
//           />
//         </Box>
//         {loading && <p>Loading...</p>}
//         {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
//         {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//         <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
//           <Button
//             variant="contained"
//             color="info"
//             onClick={onConfirm}
//             sx={{ borderRadius: "8px" }}
//             disabled={loading}
//           >
//             Confirm Update
//           </Button>
//           <Button
//             variant="outlined"
//             onClick={onClose}
//             sx={{ borderRadius: "8px" }}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// Deletion Confirmation Modal component, now controlled by the hook
const ConfirmationModal = (props: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;

  confirmLabel?: string;
  confirmColor?: "error" | "primary" | "info";
}) => {
  const {
    confirmLabel = "Confirm",
    confirmColor = "primary",
    open,
    onClose,
    onConfirm,
    message,
    loading,
    successMessage,
    errorMessage,
  } = props;

  return (
    <Modal open={open} onClose={onClose}>
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
        <Typography>{message}</Typography>
        {loading && <p>Loading...</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
          <Button
            variant="contained"
            color={confirmColor}
            onClick={onConfirm}
            sx={{ borderRadius: "8px" }}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: "8px" }}
            disabled={loading}
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
  thePages: Checkpoint[];
  theChoice: string;
  theToken: string;
}) => {
  const { thePages, theChoice, theToken } = props;

  const [rawTableData, setRawTableData] = useState<Checkpoint[]>(thePages);

  // Sync local state with props whenever thePages changes
  useEffect(() => {
    setRawTableData(thePages);
  }, [thePages]);

  // Filter out any rows that have invalid data before passing to hooks
  // const initialTableDataForHooks = rawTableData.filter(
  //   (row) => row && row.Username && row.Username.trim() !== "",
  // );

  const initialTableDataForHooks = rawTableData;

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

  // State for API call feedback
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use the new confirmation hook
  const confirmationModal = useConfirmationModal();

  // // States for the update modal's input fields (now controlled by the main component)
  // const [updateFirstName, setUpdateFirstName] = useState("");
  // const [updateLastName, setUpdateLastName] = useState("");
  // const [updateEmail, setUpdateEmail] = useState("");
  // const [updateMajor, setUpdateMajor] = useState("");

  //   const newMyID: number = idGenerator(rawTableData);
  const apiURL = theChoice;

  // Handler to open the action modal for a specific student
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedCheckpointForActions, setSelectedCheckpointForActions] =
    useState<Checkpoint | null>(null);
  const handleOpenActionModal = (student: Checkpoint) => {
    setSelectedCheckpointForActions(student);
    setIsActionModalOpen(true);
  };
  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedCheckpointForActions(null);
  };

  // Handler to open the update confirmation modal
  const handlePlayCheckpoint = (checkpoint: Checkpoint) => {
    handleCloseActionModal();
    setSuccessMessage(null); // clear stale msgs
    setErrorMessage(null); // clear stale msgs
    if (checkpoint.id !== null && checkpoint.id !== undefined) {
      confirmationModal.showConfirmation(
        `Enter game at checkpoint ${checkpoint.id} - ${checkpoint.title}?`,
        confirmPlayCheckpoint,
        checkpoint,
        "play",
      );
    }
  };

  // CHQ: Claude AI updated this
  // Handler to open the delete confirmation modal
  const handleDeleteCheckpoint = (checkpoint: Checkpoint) => {
    handleCloseActionModal();
    setSuccessMessage(null); // clear stale msgs
    setErrorMessage(null); // clear stale msgs;
    if (checkpoint.id !== null && checkpoint.id !== undefined) {
      confirmationModal.showConfirmation(
        `Are you sure you want to delete checkpoint ${checkpoint.id} - ${checkpoint.title}? This action cannot be undone.`,
        confirmDeleteCheckpoint,
        checkpoint,
        "delete",
      );
    }
  };

  // CHQ: Claude AI updated this
  // Handler to confirm delete and make the API call
  const confirmDeleteCheckpoint = async (dataPayload: Checkpoint) => {
    const checkpointToDelete = dataPayload as Checkpoint;
    if (!checkpointToDelete) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiURL}/${checkpointToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${theToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      setSuccessMessage("Checkpoint deleted successfully!");
      setRawTableData((prevData) =>
        prevData.filter((cp) => cp.id !== checkpointToDelete.id),
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete checkpoint.");
    } finally {
      setLoading(false);
    }
  };

  // Handler to confirm entering game at checkpoint and make the API call
  const confirmPlayCheckpoint = async (dataPayload: Checkpoint) => {};

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
            Checkpoint Data
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
            <Table stickyHeader aria-label="checkpoint table">
              <TableHeaderCells
                visibleColumns={visibleColumns}
                sortProps={sortProps}
                sortHandlers={sortHandlers}
                theColumnKeys={allColumnKeys}
              />
              {/* CHQ: Claude AI removed unused props */}
              <TableBodyRows
                data={sortedData}
                visibleColumns={visibleColumns}
                theColumnKeys={allColumnKeys}
                onOpenActionModal={handleOpenActionModal}
              />
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Modal (Edit/Delete) */}
      <CheckpointActionModal
        open={isActionModalOpen}
        onClose={handleCloseActionModal}
        checkpoint={selectedCheckpointForActions}
        onPlay={handlePlayCheckpoint}
        onDelete={handleDeleteCheckpoint}
      />

      {/* Play Confirmation Modal */}
      {(confirmationModal.confirmationType === "delete" ||
        confirmationModal.confirmationType === "play") && (
        <ConfirmationModal
          open={confirmationModal.isOpen}
          onClose={confirmationModal.cancelAction}
          onConfirm={confirmationModal.confirmAction}
          message={confirmationModal.message}
          loading={loading}
          successMessage={successMessage}
          errorMessage={errorMessage}
          confirmLabel={
            confirmationModal.confirmationType === "delete"
              ? "Confirm Delete"
              : "Confirm"
          }
          confirmColor={
            confirmationModal.confirmationType === "delete"
              ? "error"
              : "primary"
          }
        />
      )}
    </Box>
  );
};

export default CheckpointTable;
