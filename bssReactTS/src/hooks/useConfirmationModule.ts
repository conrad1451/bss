// useConfirmationModal.ts

// CHQ: Gemimi AI generated this hook

import { useState } from "react";
import type { ConfirmUpdateProps } from "../utils/dataTypes";
import type { RowPage } from "../utils/dataTypes";

// Define the type for the data that the modal will carry
type ConfirmationData = RowPage | ConfirmUpdateProps;

// Define the type for the confirmation callback function
type ConfirmationAction = (data: ConfirmationData) => Promise<void> | void;

// Custom hook to manage a generic confirmation modal's state
export const useConfirmationModal = () => {
  // State to control modal visibility
  const [isOpen, setIsOpen] = useState(false);
  // State to hold the message to display in the modal
  const [message, setMessage] = useState("");
  // State to hold the callback function to be executed on confirmation
  const [actionToConfirm, setActionToConfirm] =
    useState<ConfirmationAction | null>(null);
  // State to hold any data payload associated with the action
  const [dataPayload, setDataPayload] = useState<ConfirmationData | null>(null);
  // State to handle different confirmation types (e.g., 'delete', 'update')
  const [confirmationType, setConfirmationType] = useState<string>("");

  /**
   * Opens the confirmation modal with a specific message and action.
   * @param msg The message to display to the user.
   * @param action The function to call when the user confirms.
   * @param data The data payload to pass to the action function.
   * @param type A string to identify the type of confirmation (e.g., 'delete', 'update').
   */
  const showConfirmation = (
    msg: string,
    action: ConfirmationAction,
    data: ConfirmationData,
    type: string
  ) => {
    setMessage(msg);
    setActionToConfirm(() => action); // Use a function to set the state correctly
    setDataPayload(data);
    setConfirmationType(type);
    setIsOpen(true);
  };

  /**
   * Executes the pending action and closes the modal.
   */
  const confirmAction = async () => {
    if (actionToConfirm && dataPayload) {
      await actionToConfirm(dataPayload);
    }
    setIsOpen(false);
    setDataPayload(null);
    setMessage("");
    setConfirmationType("");
  };

  /**
   * Closes the modal without executing the action.
   */
  const cancelAction = () => {
    setIsOpen(false);
    setDataPayload(null);
    setMessage("");
    setConfirmationType("");
  };

  return {
    isOpen,
    message,
    dataPayload,
    confirmationType,
    showConfirmation,
    confirmAction,
    cancelAction,
  };
};
