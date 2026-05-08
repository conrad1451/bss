// TableSubcomponents.tsx
import React from "react";
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
} from "@mui/material";

// import { useTableFilters } from "../hooks/useTableFilters";
import { useTableSorting } from "../hooks/useTableSorting";

import type { ColumnVisibility, TableBodyRowsProps } from "../utils/dataTypes";

export const TableHeaderCells = (props: {
  visibleColumns: ColumnVisibility;
  sortProps: ReturnType<typeof useTableSorting>["sortProps"];
  sortHandlers: ReturnType<typeof useTableSorting>["sortHandlers"];
  theColumnKeys: Array<keyof ColumnVisibility>;
}) => {
  const { visibleColumns, sortProps, sortHandlers, theColumnKeys } = props;

  type SortableTableColumns = "title" | "created_at" | "updated_at";
  return (
    <TableHead>
      <TableRow>
        {theColumnKeys.map((colName) =>
          visibleColumns[colName] ? (
            <TableCell key={colName}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  {colName}
                </Typography>
                {(
                  [
                    "title",
                    "created_at",
                    "updated_at",
                  ] as SortableTableColumns[]
                ).includes(colName as SortableTableColumns) && (
                  <>
                    <Button
                      onClick={() =>
                        sortHandlers.handleSort(colName as SortableTableColumns)
                      }
                      title={
                        sortProps.sortColumn === colName &&
                        sortProps.sortDirection === "asc"
                          ? "Current: Ascending. Click to sort Descending."
                          : "Click to sort Ascending."
                      }
                      sx={{
                        minWidth: "auto",
                        p: "2px",
                        // Only show the up arrow if not currently sorted ascending
                        visibility:
                          sortProps.sortColumn === colName &&
                          sortProps.sortDirection === "asc"
                            ? "visible" // Show if currently ascending
                            : "visible", // Always visible to allow sorting
                      }}
                    >
                      {sortProps.sortColumn === colName &&
                      sortProps.sortDirection === "asc"
                        ? "▲"
                        : "⬆️"}
                    </Button>
                    <Button
                      onClick={() =>
                        sortHandlers.handleSort(colName as SortableTableColumns)
                      }
                      title={
                        sortProps.sortColumn === colName &&
                        sortProps.sortDirection === "desc"
                          ? "Current: Descending. Click to reset sort."
                          : "Click to sort Descending."
                      }
                      sx={{
                        minWidth: "auto",
                        p: "2px",
                        // Only show the down arrow if not currently sorted descending
                        visibility:
                          sortProps.sortColumn === colName &&
                          sortProps.sortDirection === "desc"
                            ? "visible" // Show if currently descending
                            : "visible", // Always visible to allow sorting
                      }}
                    >
                      {sortProps.sortColumn === colName &&
                      sortProps.sortDirection === "desc"
                        ? "▼"
                        : "⬇️"}
                    </Button>

                    {sortProps.sortColumn === colName &&
                      sortProps.sortDirection && (
                        <Button
                          onClick={sortHandlers.resetSort}
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
          ) : null,
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
  const { data, theColumnKeys, visibleColumns, onOpenActionModal } = props;
  console.log("TableBodyRows data:", data);
  console.log("TableBodyRows theColumnKeys:", theColumnKeys);
  console.log("TableBodyRows visibleColumns:", visibleColumns);
  return (
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          {theColumnKeys.map((colName) =>
            visibleColumns[colName] ? (
              <TableCell key={colName}>
                {colName === "id"
                  ? row.id
                  : colName === "title"
                    ? row.title
                    : colName === "data"
                      ? row.data
                      : colName === "created_at"
                        ? row.created_at
                        : colName === "updated_at"
                          ? row.updated_at
                          : null}
              </TableCell>
            ) : (
              <React.Fragment key={colName} />
            ),
          )}
          <TableCell>
            <IconButton
              aria-label="actions"
              onClick={() => onOpenActionModal(row)}
            >
              <MoreVertIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
