// TableSubcomponents.tsx

import MoreVertIcon from "@mui/icons-material/MoreVert"; // Icon for the action button

import {
  //   Table,
  TableBody,
  TableCell,
  //   TableContainer,
  TableHead,
  TableRow,
  //   Paper,
  Button,
  Box,
  Typography,
  // Switch,
  // FormControlLabel,
  // FormControl,
  // Select,
  // MenuItem,
  IconButton,
  TextField, // Added TextField for better input control in modals
} from "@mui/material";

// import { useTableFilters } from "../hooks/useTableFilters";
import { useTableSorting } from "../hooks/useTableSorting";

import { displayDate } from "../utils/dataTransforms";

import type {
  //   RowPage,
  WebFormProps,
  //   ConfirmUpdateProps,
  //   ApiResponse,
  ColumnVisibility,
  TableBodyRowsProps,
} from "../utils/dataTypes";

const WebForm: React.FC<WebFormProps> = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      {" "}
      {/* Pass the onSubmit handler directly */}
      <button type="submit">Submit data to database</button>
    </form>
  );
};

export const TableHeaderCells = (props: {
  visibleColumns: ColumnVisibility;
  sortProps: ReturnType<typeof useTableSorting>["sortProps"];
  sortHandlers: ReturnType<typeof useTableSorting>["sortHandlers"];
  theColumnKeys: Array<keyof ColumnVisibility>;
}) => {
  type SortableTableColumns =
    | "Username"
    | "CreatedAt"
    | "LastEditedAt"
    | "playerID";
  return (
    <TableHead>
      <TableRow>
        {props.theColumnKeys.map((colName) =>
          props.visibleColumns[colName] ? (
            <TableCell key={colName}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  {colName}
                </Typography>
                {(
                  [
                    "Username",
                    "CreatedAt",
                    "LastEditedAt",
                    "playerID",
                  ] as SortableTableColumns[]
                ).includes(colName as SortableTableColumns) && (
                  <>
                    <Button
                      onClick={() =>
                        props.sortHandlers.handleSort(
                          colName as SortableTableColumns
                        )
                      }
                      title={
                        props.sortProps.sortColumn === colName &&
                        props.sortProps.sortDirection === "asc"
                          ? "Current: Ascending. Click to sort Descending."
                          : "Click to sort Ascending."
                      }
                      sx={{
                        minWidth: "auto",
                        p: "2px",
                        // Only show the up arrow if not currently sorted ascending
                        visibility:
                          props.sortProps.sortColumn === colName &&
                          props.sortProps.sortDirection === "asc"
                            ? "visible" // Show if currently ascending
                            : "visible", // Always visible to allow sorting
                      }}
                    >
                      {props.sortProps.sortColumn === colName &&
                      props.sortProps.sortDirection === "asc"
                        ? "▲"
                        : "⬆️"}
                    </Button>
                    <Button
                      onClick={() =>
                        props.sortHandlers.handleSort(
                          colName as SortableTableColumns
                        )
                      }
                      title={
                        props.sortProps.sortColumn === colName &&
                        props.sortProps.sortDirection === "desc"
                          ? "Current: Descending. Click to reset sort."
                          : "Click to sort Descending."
                      }
                      sx={{
                        minWidth: "auto",
                        p: "2px",
                        // Only show the down arrow if not currently sorted descending
                        visibility:
                          props.sortProps.sortColumn === colName &&
                          props.sortProps.sortDirection === "desc"
                            ? "visible" // Show if currently descending
                            : "visible", // Always visible to allow sorting
                      }}
                    >
                      {props.sortProps.sortColumn === colName &&
                      props.sortProps.sortDirection === "desc"
                        ? "▼"
                        : "⬇️"}
                    </Button>

                    {props.sortProps.sortColumn === colName &&
                      props.sortProps.sortDirection && (
                        <Button
                          onClick={props.sortHandlers.resetSort}
                          title="Reset All Sorts"
                          sx={{ minWidth: "auto", p: "2px" }}
                        >
                          🔄
                        </Button>
                      )}
                  </>
                )}
              </Box>
            </TableCell>
          ) : null
        )}
        {/* New TableCell for Actions header */}
        <TableCell>
          <Typography variant="subtitle2">Actions</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export const TableBodyRows = (props: TableBodyRowsProps) => {
  return (
    <TableBody>
      {props.data.map((row) => (
        <TableRow key={row.myID}>
          {props.theColumnKeys.map((colName) =>
            props.visibleColumns[colName] ? (
              <TableCell key={colName}>
                {colName === "myID" && row.myID}
                {colName === "Username" && row.Username}
                {colName === "CreatedAt" && displayDate(row.CreatedAt)}
                {colName === "LastEditedAt" && displayDate(row.LastEditedAt)}
                {colName === "playerID" && row.playerID}
              </TableCell>
            ) : null
          )}
          {/* TableCell for Actions button for existing rows */}
          <TableCell>
            <IconButton
              aria-label="actions"
              onClick={() => props.onOpenActionModal(row)} // Pass the entire row data
            >
              <MoreVertIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
      {/* New Row for adding a student */}
      <TableRow>
        {props.theColumnKeys.map((colName) =>
          props.visibleColumns[colName] ? (
            <TableCell key={colName}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* // CHQ: Gemini AI changed empty div to TextField for each field */}
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  {colName === "Username" ? (
                    <TextField
                      type="text"
                      value={props.myUsername}
                      onChange={(e) => props.setMyUsername(e.target.value)}
                      placeholder="First Name"
                      size="small"
                      variant="outlined"
                    />
                  ) : colName === "CheckpointData" ? (
                    <TextField
                      type="text"
                      value={props.myCheckpointData}
                      onChange={(e) =>
                        props.setMyCheckpointData(e.target.value)
                      }
                      placeholder="Last Name"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    // ) : colName === "myID" ? (
                    //   <>{props.myId}</>
                    ""
                  )}
                </Typography>
              </Box>
            </TableCell>
          ) : null
        )}
        {/* Cell for the WebForm in the new student row */}
        <TableCell>
          <div>
            {props.loading && <p>Loading...</p>}
            {props.successMessage && (
              <p style={{ color: "green" }}>{props.successMessage}</p>
            )}
            {props.errorMessage && (
              <p style={{ color: "red" }}>{props.errorMessage}</p>
            )}
            <WebForm onSubmit={props.onNewCheckpointSubmit} />{" "}
            {/* Pass the submit handler */}
          </div>
        </TableCell>
      </TableRow>
      {/* Footer row (Count of checkpoints saved) */}
      <TableRow>
        {props.theColumnKeys.map((colName) =>
          props.visibleColumns[colName] ? (
            <TableCell key={colName}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  {colName === "Username"
                    ? "Count of checkpoints saved: " + String(props.data.length)
                    : ""}
                </Typography>
              </Box>
            </TableCell>
          ) : null
        )}
        {/* Empty cell for the actions column in the footer row */}
        <TableCell></TableCell>
      </TableRow>
    </TableBody>
  );
};
