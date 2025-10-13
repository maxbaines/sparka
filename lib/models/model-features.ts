import { generatedModelFeatures } from './model-features.generated';
import { manualModelFeatures } from './model-features.manual';

export interface ModelFeatures {
  knowledgeCutoff?: Date;
  releaseDate: Date;
  // temperature: boolean; // TODO: does it replace fixedTemperature?
  // last updated: Date;
  // weights: "Open" | "Closed"
  fixedTemperature?: number;
}

export const modelFeatures = {
  ...generatedModelFeatures,
  ...manualModelFeatures,
};
