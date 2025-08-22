// useTableSorting.tsx
import { useState, useMemo } from "react";

import type { RowPage } from "../utils/dataTypes";

// CHQ: Gemini AI added
type SortableStringKeys =
  | "Username"
  | "CreatedAt"
  | "LastEditedAt"
  | "playerID";

// CHQ: Gemini AI refactored from a specific comparator for first names to that for strings
/**
 * Generic comparator function for sorting RowPage objects by a specified string property.
 * Handles case-insensitive comparison and null/undefined values.
 *
 * @param a - First RowPage object.
 * @param b - Second RowPage object.
 * @param columnKey - The key of the string property to sort by (e.g., "FirstName", "Email").
 * @param direction - Sort direction ("asc" or "desc").
 * @returns -1 if a < b, 1 if a > b, 0 if equal, based on direction.
 */
function sortByStringComparator(
  a: RowPage,
  b: RowPage,
  columnKey: SortableStringKeys,
  direction: "asc" | "desc"
): number {
  // Get values, convert to lowercase strings, handle null/undefined by treating as empty strings
  const valA = (a[columnKey] || "").toString().toLowerCase();
  const valB = (b[columnKey] || "").toString().toLowerCase();

  if (valA < valB) {
    return direction === "asc" ? -1 : 1;
  }
  if (valA > valB) {
    return direction === "asc" ? 1 : -1;
  }
  return 0;
}

// --- useTableSorting Custom Hook ---

/**
 * A custom React hook for managing all table sorting logic and state.
 * It takes filtered data and returns the sorted data, along with
 * sort properties and handler functions to control the sorting.
 *
 * @param filteredData The array of RowPage objects after filtering has been applied.
 * @returns An object containing:
 * - sortedData: The RowPage[] array after sorting has been applied.
 * - sortProps: An object containing all the state variables for sorting (e.g., current sort directions).
 * - sortHandlers: An object containing all the functions to change sort states.
 */
export const useTableSorting = (filteredData: RowPage[]) => {
  // State for the currently sorted column
  const [sortColumn, setSortColumn] = useState<SortableStringKeys | null>(null);
  // State for the sort direction of the current column
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  // CHQ: Gemini AI added the setSortColumn to null
  // FIX: This function should reset both sortColumn and sortDirection
  const resetSort = () => {
    setSortColumn(null); // Clear the sorted column
    setSortDirection(null); // Clear the sort direction
  };

  // --- Sort Handler (to be called by UI, e.g., on table header click) ---
  /**
   * Toggles the sort direction for a given column.
   * If the column is new, it sorts ascending. If it's the same column, it cycles: asc -> desc -> null (no sort).
   * @param column The key of the column to sort by.
   */
  const handleSort = (column: SortableStringKeys) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null); // No sort
        setSortDirection(null);
      } else {
        setSortDirection("asc"); // Start with ascending
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // --- Memoized Sorted Data ---
  const sortedData = useMemo(() => {
    // Create a shallow copy to avoid mutating the original array
    const sortableData = [...filteredData];

    if (sortColumn && sortDirection) {
      sortableData.sort((a, b) =>
        sortByStringComparator(a, b, sortColumn, sortDirection)
      );
    }

    return sortableData;
  }, [filteredData, sortColumn, sortDirection]); // Re-sort only when filteredData, sortColumn, or sortDirection changes

  return {
    sortedData,
    sortProps: {
      sortColumn,
      sortDirection,
    },
    sortHandlers: {
      handleSort,
      resetSort,
    },
  };
};
