import { type ModelData, modelsData } from '@/lib/models/models.generated';
import { allModelsExtra, type ModelExtra } from '@/lib/models/model-extra';

export type ModelDefinition = ModelData & ModelExtra;

export const modelDefinitions: ModelDefinition[] = modelsData.map((model) => ({
  ...model,
  ...allModelsExtra[model.id],
}));
