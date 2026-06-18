// engine/FieldManager.js

// CHQ: Gemini AI generated

import { EventManager } from "./eventManager.js";

export class FieldManager {
  constructor(initialFieldConfigs = {}) {
    // Contains configuration data for each field (e.g., Sunflower Field, Clover Field)
    this.configs = initialFieldConfigs;

    // Core state tracking arrays/objects for operational runtime data
    this.fieldInfo = {};
    this.flowers = {};

    this.initFields();
  }

  /**
   * Initializes state maps for each field to ensure safeguards prevent undefined checks.
   */
  initFields() {
    Object.keys(this.configs).forEach((fieldId) => {
      this.fieldInfo[fieldId] = {
        id: fieldId,
        name: this.configs[fieldId].name || fieldId,
        pollenCapacity: this.configs[fieldId].capacity || 10000,
        currentPollen: this.configs[fieldId].capacity || 10000,
        degradationRate: this.configs[fieldId].degradationRate || 0.05,
        regenRate: this.configs[fieldId].regenRate || 2,
      };

      this.flowers[fieldId] = []; // Populated during mesh generation staging
    });
  }

  /**
   * Core simulation processing step for managing cell decay, flower growth, and regeneration.
   * Called on every frame inside the central gameLoop/updateEngine pipeline.
   */
  update(dt, gameState) {
    const fieldInfoMap = gameState?.fieldInfo || this.fieldInfo;
    const flowersMap = gameState?.flowers || this.flowers;

    Object.keys(fieldInfoMap).forEach((fieldId) => {
      const field = fieldInfoMap[fieldId];

      // 1. Process natural field/flower height regeneration over time
      if (field.currentPollen < field.pollenCapacity) {
        field.currentPollen = Math.min(
          field.pollenCapacity,
          field.currentPollen + field.regenRate * dt,
        );
      }

      // 2. Process localized flower structures
      const fieldFlowers = flowersMap[fieldId] || [];
      for (let i = 0; i < fieldFlowers.length; i++) {
        const flower = fieldFlowers[i];

        // Example logic: Gradually grow back flowers that have been depleted
        if (flower.height < flower.maxHeight) {
          flower.height = Math.min(
            flower.maxHeight,
            flower.height + (flower.growthSpeed || 1) * dt,
          );
          flower.isDirty = true; // Flag for WebGL vertex buffer staging updates if necessary
        }
      }
    });

    // Optional: Periodically broadcast field status reports for UI rendering updates
    if (gameState?.frameCount % 30 === 0) {
      EventManager.emit("FIELDS_UPDATED", { fieldInfo: fieldInfoMap });
    }
  }

  /**
   * Safe interface mutator for when player or bees harvest pollen from a targeted coordinate.
   */
  depletePollen(fieldId, amount, flowerIndex = null) {
    const field = this.fieldInfo[fieldId];
    if (!field) return 0;

    const oldPollen = field.currentPollen;
    field.currentPollen = Math.max(0, field.currentPollen - amount);
    const actualHarvested = oldPollen - field.currentPollen;

    // Handle precise sub-cell flower height manipulation if given an index
    if (flowerIndex !== null && this.flowers[fieldId]?.[flowerIndex]) {
      const flower = this.flowers[fieldId][flowerIndex];
      flower.height = Math.max(0, flower.height - amount * 0.1);
      flower.isDirty = true;
    }

    return actualHarvested;
  }
}
