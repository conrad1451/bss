// import { useState, useMemo } from "react";
import { useState } from "react";

import type {
  ColumnVisibility,
  ColumnVisibilityMiniTable,
} from "../utils/dataTypes";

// --- Default and Preset Column Visibility Settings ---
export const defaultColumnVisibility: ColumnVisibility = {
  id: true,
  // player_id: true,
  title: true,
  data: true,
  created_at: true,
  updated_at: true,
};

export const smartphoneVisibility: ColumnVisibility = {
  id: true,
  // player_id: true,
  title: true,
  data: true,
  created_at: true,
  updated_at: true,
};

export const defaultColumnVisibilityMiniTable: ColumnVisibilityMiniTable = {
  id: true,
  // player_id: true,
  title: true,
  data: true,
  created_at: true,
  updated_at: true,
};

export const smartphoneVisibilityMiniTable: ColumnVisibilityMiniTable = {
  id: true,
  // player_id: true,
  title: true,
  data: true,
  created_at: true,
  updated_at: true,
};
export const visibilityPresetsMiniTable: Map<
  string,
  ColumnVisibilityMiniTable
> = new Map();

export const visibilityPresets: Map<string, ColumnVisibility> = new Map();

visibilityPresets.set("default", defaultColumnVisibility); // Explicitly set the default
visibilityPresets.set("smartphone", smartphoneVisibility); // Explicitly set the default

visibilityPresetsMiniTable.set("default", defaultColumnVisibilityMiniTable); // Explicitly set the default
visibilityPresetsMiniTable.set("smartphone", smartphoneVisibilityMiniTable); // Explicitly set the default

// --- useColumnVisibility Custom Hook ---

/**
 * A custom React hook for managing the visibility of table columns.
 * It provides state for visible columns and handler functions to toggle
 * individual columns, reset to a default, or apply preset visibility.
 *
 * @param initialPresetKey Optional. A key from `visibilityPresets` to set initial visibility.
 * Defaults to "default".
 * @returns An object containing:
 * - visibleColumns: The current ColumnVisibility object.
 * - handleToggleColumn: A function to toggle the visibility of a single column.
 * - setPresetVisibility: A function to apply a predefined visibility preset.
 * - resetVisibility: A function to reset to the default visibility.
 * - presets: The map of available visibility presets.
 */
export const useColumnVisibility = (
  initialPresetKey: keyof typeof visibilityPresets | string = "default",
) => {
  // Use a functional update for useState to ensure we get the correct initial state
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>(() => {
    // Attempt to get the preset, fall back to default if key is not found

    // Argument of type 'string | unique symbol | unique symbol' is not assignable to parameter of type 'string'.
    //   Type 'typeof Symbol.iterator' is not assignable to type 'string'.ts(2345)
    // (parameter) initialPresetKey: string | typeof Symbol.iterator | typeof Symbol.toStringTag
    // Optional. A key from visibilityPresets to set initial visibility. Defaults to "default".

    // @param initialPresetKey
    // Optional. A key from visibilityPresets to set initial visibility. Defaults to "default".
    // return visibilityPresets.get(initialPresetKey) || defaultColumnVisibility;

    return (
      visibilityPresets.get(String(initialPresetKey)) || defaultColumnVisibility
    );
  });

  /**
   * Toggles the visibility of a single column.
   * @param event The change event from a Switch or similar input.
   */
  const handleToggleColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  /**
   * Applies a predefined column visibility preset.
   * @param presetKey The key of the preset to apply (e.g., "smartphone", "companyInfo").
   */
  const setPresetVisibility = (presetKey: keyof typeof visibilityPresets) => {
    const preset = visibilityPresets.get(String(presetKey));
    if (preset) {
      setVisibleColumns(preset);
    } else {
      console.warn(
        `Preset "${String(presetKey)}" not found. Applying default visibility.`,
      );
      setVisibleColumns(defaultColumnVisibility);
    }
  };

  /**
   * Resets column visibility to the global default setting.
   */
  const resetVisibility = () => {
    setVisibleColumns(defaultColumnVisibility);
  };

  return {
    visibleColumns,
    handleToggleColumn,
    setPresetVisibility,
    resetVisibility,
    presets: visibilityPresets, // Provide presets if the consumer needs to list them
  };
};

export const useColumnVisibilityMiniTable = (
  initialPresetKey:
    | keyof typeof visibilityPresetsMiniTable
    | string = "default",
) => {
  // Use a functional update for useState to ensure we get the correct initial state
  const [visibleColumns, setVisibleColumns] =
    useState<ColumnVisibilityMiniTable>(() => {
      // Attempt to get the preset, fall back to default if key is not found

      // Argument of type 'string | unique symbol | unique symbol' is not assignable to parameter of type 'string'.
      //   Type 'typeof Symbol.iterator' is not assignable to type 'string'.ts(2345)
      // (parameter) initialPresetKey: string | typeof Symbol.iterator | typeof Symbol.toStringTag
      // Optional. A key from visibilityPresetsMiniTable to set initial visibility. Defaults to "default".

      // @param initialPresetKey
      // Optional. A key from visibilityPresetsMiniTable to set initial visibility. Defaults to "default".
      // return visibilityPresetsMiniTable.get(initialPresetKey) || defaultColumnVisibility;

      return (
        visibilityPresetsMiniTable.get(String(initialPresetKey)) ||
        defaultColumnVisibilityMiniTable
      );
    });

  /**
   * Toggles the visibility of a single column.
   * @param event The change event from a Switch or similar input.
   */
  const handleToggleColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  /**
   * Applies a predefined column visibility preset.
   * @param presetKey The key of the preset to apply (e.g., "smartphone", "companyInfo").
   */
  const setPresetVisibility = (
    presetKey: keyof typeof visibilityPresetsMiniTable,
  ) => {
    const preset = visibilityPresetsMiniTable.get(String(presetKey));
    if (preset) {
      setVisibleColumns(preset);
    } else {
      console.warn(
        `Preset "${String(presetKey)}" not found. Applying default visibility.`,
      );
      setVisibleColumns(defaultColumnVisibilityMiniTable);
    }
  };

  /**
   * Resets column visibility to the global default setting.
   */
  const resetVisibility = () => {
    setVisibleColumns(defaultColumnVisibilityMiniTable);
  };

  return {
    visibleColumns,
    handleToggleColumn,
    setPresetVisibility,
    resetVisibility,
    presets: visibilityPresetsMiniTable, // Provide presets if the consumer needs to list them
  };
};
