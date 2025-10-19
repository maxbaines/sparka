import type React from 'react';
import type { WebSearchUpdate } from '@/lib/ai/tools/research-updates-schema';
import { WebToolAction } from './tool-actions';

// TODO: Make sure these components are used or remove them

// Web updates component
const _WebUpdates: React.FC<{ updates: WebSearchUpdate[] }> = ({ updates }) => {
  return (
    <>
      {updates.map((update, updateIndex) => (
        <div key={`web-update-${updateIndex}`} className="space-y-2">
          {update.results?.map((result, resultIndex) => (
            <WebToolAction
              key={`web-${updateIndex}-${resultIndex}`}
              result={result}
            />
          ))}
        </div>
      ))}
    </>
  );
};
