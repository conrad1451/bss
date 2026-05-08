// dataTransforms.ts

export function displayDate(curDate: Date) {
  return curDate instanceof Date
    ? curDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long", // Use 'long' for the full month name
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
      })
    : curDate
      ? // Attempt to parse the string into a Date object
        new Date(curDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long", // Use 'long' for the full month name
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
        })
      : "-";
}

// export function createCustomTableData(
//   myID: number,
//   Username: string,
//   CheckpointData: string,
//   CreatedAt: Date,
//   LastEditedAt: Date,
//   playerID: string
// ): RowPage {
//   return {
//     myID,
//     Username,
//     CheckpointData,
//     CreatedAt,
//     LastEditedAt,
//     playerID,
//   };
// }

// export const transformCheckpointRecordToRowPageOld = (
//   pages: any
// ): RowPage[] => {
//   // Add this check! If 'pages' is null or not an array, return an empty array.
//   if (!Array.isArray(pages)) {
//     return [];
//   }

//   // Your existing .map() logic will go here

//   return pages.map((page) =>
//     createCustomTableData(
//       page.id,
//       page.Username,
//       page.checkpointdata,
//       page.CreatedAt,
//       page.LastEditedAt,
//       page.playerID
//     )
//   );
// };

// export const transformCheckpointRecordToRowPage = (
//   // checkpoints: CheckPointRecord[]

//   checkpoints: CheckPointRecordAlt[]
// ): RowPage[] => {
//   // Check for an empty or invalid input array

//   if (!checkpoints || !Array.isArray(checkpoints)) {
//     console.error("Invalid input for transformation.");

//     return [];
//   }

//   // Map each checkpoint record to the RowPage format

//   return checkpoints.map((record) => {
//     // CHQ: Gemini AI created the check to handle playerID
//     // Correctly handle the player_id object
//     const playerID = record.player_id.Valid ? record.player_id.String : null;

//     return {
//       myID: record.id,
//       Username: record.user_name,
//       CheckpointData: record.checkpoint_data,
//       // CheckpointData: String("record.checkpoint_data"),
//       // CheckpointData: "ddd",
//       CreatedAt: record.created_at,
//       LastEditedAt: record.last_edited_at,
//       playerID: playerID === null ? "N/A" : playerID, // CHQ: I added ternary to control display
//     };
//   });
// };

/**
 * Generates a list of unique property values from an array of RowPage objects,
 * suitable for populating dropdown filters. It can handle both single-string properties
 * (like 'Source' or 'Area') and array-of-string properties (like 'Tags').
 *
 * @param myTableView An array of `RowPage` objects representing the current table data.
 * This data is used to extract the property values.
 * @param selection The key (property name) from `RowPage` whose values are to be extracted.
 * This function is designed to work with string or string array properties.
 * Example: "Tags", "Source", "Area".
 * @returns An array of `Item` objects, where each `Item` has a `value` property (string).
 * Each `value` in the returned list is a unique, non-empty string extracted
 * from the specified `selection` property across all `myTableView` rows.
 */
// export function producePropList(
//   myTableView: RowPage[],
//   selection: keyof RowPage
// ): Item[] {
//   // Helper to determine if the property on RowPage is expected to be an array of strings.
//   // This list should be updated if new array-type properties are added to RowPage
//   // that need to be processed by this function.
//   const isArrayProp = (prop: keyof RowPage) =>
//     ["Area", "Source", "Tags"].includes(prop as string);

//   // Use reduce to iterate over each row and accumulate all relevant property values
//   // into a single flat array of strings.
//   const rawList: string[] = myTableView.reduce<string[]>((accumulator, row) => {
//     const propValue = row[selection]; // Get the value of the selected property from the current row

//     // Check if the property is expected to be an array and if its value is indeed an array.
//     if (isArrayProp(selection) && Array.isArray(propValue)) {
//       // CHQ: The two lines below determine the text that fills the options for the dropdown list
//       // If it's an array, spread its elements into the accumulator.
//       // return [...accumulator, ..."propValue"];
//       return [...accumulator, ...propValue];
//     } else if (
//       // If it's not an array property, check if its value is a non-empty string.
//       // CHQ: No need to keep single selects out of options that dropdown can select from
//       // !isArrayProp(selection) &&
//       typeof propValue === "string" &&
//       propValue.trim() !== ""
//     ) {
//       // If it's a valid non-empty string, add it to the accumulator.
//       return [...accumulator, propValue];
//     }
//     // If the value is not a string, or an empty string, or doesn't match the expected type,
//     // it's ignored and the accumulator remains unchanged.
//     return accumulator;
//   }, []);

//   // Create a Set from the raw list to automatically filter out duplicate values,
//   // then convert it back to an array.
//   const uniqueList = [...new Set(rawList)];

//   // Map the unique string values into the { value: string } format required by the Item interface.
//   const propList: Item[] = uniqueList.map((theProp, id) => ({
//     id: id,
//     value: theProp,
//   }));

//   return propList;
// }
