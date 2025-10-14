import { type ModelData, modelsData } from './models.generated';
import { allModelsExtra, type ModelExtra } from './model-extra';

export type ModelDefinition = ModelData & ModelExtra;

export const modelDefinitions: ModelDefinition[] = modelsData.map((model) => ({
  ...model,
  ...allModelsExtra[model.id],
}));
