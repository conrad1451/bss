import type { ColumnVisibility } from "../utils/dataTypes";

import {
  //   Table,
  //   TableBody,
  //   TableCell,
  //   TableContainer,
  //   TableHead,
  //   TableRow,
  //   Paper,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  //   IconButton,
  //   TextField, // Added TextField for better input control in modals
} from "@mui/material";
import {
  // useColumnVisibilityMiniTable,
  visibilityPresetsMiniTable,
  //   useColumnVisibility,
  //   visibilityPresets,
} from "../hooks/useColumnVisibility";
import Modal from "@mui/material/Modal";

import { allColumnKeys } from "../utils/dataTypes";
const ColumnVisibilityToggles = (props: {
  visibleColumns: ColumnVisibility;
  handleToggleColumn: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theColumnKeys: Array<keyof ColumnVisibility>;
}) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {props.theColumnKeys.map((colName) => (
        <FormControlLabel
          key={colName}
          control={
            <Switch
              checked={props.visibleColumns[colName]}
              onChange={props.handleToggleColumn}
              name={colName}
            />
          }
          label={colName}
        />
      ))}
    </Box>
  );
};

export const ColumnVisibilityControlModal = (props: {
  open: boolean;
  onClose: () => void;
  visibleColumns: ColumnVisibility;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPreset: (preset: keyof typeof visibilityPresetsMiniTable) => void;
  onReset: () => void;
  presets: Map<string, ColumnVisibility>;
}) => {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: 800 },
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Customize Column Visibility
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Apply Preset:</Typography>
          <FormControl fullWidth size="small">
            <Select
              value=""
              label="Presets"
              onChange={(e) =>
                props.onSelectPreset(
                  e.target.value as keyof typeof visibilityPresetsMiniTable
                )
              }
            >
              <MenuItem value="">
                <em>None (Select Preset)</em>
              </MenuItem>
              {[...props.presets.keys()].map((key) => (
                <MenuItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button onClick={props.onReset} variant="outlined" sx={{ mt: 1 }}>
            Reset to Default
          </Button>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Toggle Individual Columns:
        </Typography>
        <ColumnVisibilityToggles
          visibleColumns={props.visibleColumns}
          handleToggleColumn={props.onToggle}
          theColumnKeys={allColumnKeys}
        />

        <Button onClick={props.onClose} variant="contained" sx={{ mt: 3 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};
