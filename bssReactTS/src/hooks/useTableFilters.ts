// useTableFilters.ts

import { useState, useMemo } from "react";
// import { SelectChangeEvent } from "@mui/material/Select"; // For Material-UI Select events

import type { RowPage } from "../utils/dataTypes";

// --- Utility Filtering Functions (Can be moved to a separate file like utils/filters.ts) ---

/**
 * Filters RowPage data based on a single selected value for a specified key.
 * @param filterEnabled - Boolean to enable/disable this filter.
 * @param selectedValue - The value to filter by.
 * @param curData - The current array of RowPage objects to filter.
 * @param selection - The key (property name) on which to apply the filter.
 * @returns Filtered array of RowPage objects.
 */

/**
 * Filters RowPage data based on whether the Name property includes the filter text (case-insensitive).
 * @param data - The array of RowPage objects to filter.
 * @param enabled - Boolean to enable/disable this filter.
 * @param filterText - The text to search for in the Name property.
 * @returns Filtered array of RowPage objects.
 */
function filterByPageName(
  data: RowPage[],
  enabled: boolean,
  filterText: string
): RowPage[] {
  if (enabled && filterText.trim() !== "") {
    return data.filter((row) =>
      row.Username.toLowerCase().includes(filterText.toLowerCase())
    );
  }
  return data;
}

// --- useTableFilters Custom Hook ---

/**
 * A custom React hook for managing all table filtering logic and state.
 * It takes the raw table data and returns the filtered data, along with
 * filter properties and handler functions to control the filters.
 *
 * @param initialData The initial, unfiltered data in RowPage[] format.
 * @returns An object containing:
 * - filteredData: The RowPage[] array after all filters have been applied.
 * - filterProps: An object containing all the state variables for filters.
 * - filterHandlers: An object containing all the functions to change filter states.
 * - derivedLists: An object containing lists derived from the data for filter options (e.g., tag counts).
 */
export const useTableFilters = (initialData: RowPage[]) => {
  // --- State for Filters ---
  const [pageFilterEnabled, setPageFilterEnabled] = useState(false);
  const [pageFilterText, setPageFilterText] = useState("");

  // --- Filter Handlers ---

  const handlePageFilterToggle = () => {
    setPageFilterEnabled((prev) => !prev);
    setPageFilterText(""); // Clear filter text when toggling off
  };

  // --- Reset Functions ---
  const resetPageFilters = () => {
    setPageFilterText("");
    setPageFilterEnabled(false);
  };

  // --- Memoized Filtered Data ---
  const filteredData = useMemo(() => {
    let currentFilteredData = initialData;

    // Apply page name filter
    currentFilteredData = filterByPageName(
      currentFilteredData,
      pageFilterEnabled,
      pageFilterText
    );

    return currentFilteredData;
  }, [initialData, pageFilterEnabled, pageFilterText]);

  return {
    filteredData,
    filterProps: {
      isPageFilterEnabled: pageFilterEnabled,
      pageFilterText,
    },
    filterHandlers: {
      togglePageFilter: handlePageFilterToggle,
      setPageFilterText,
      resetPageFilters,
    },
  };
};
