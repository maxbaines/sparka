import { $createHeadingNode, HeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list';
import { createEditor, type LexicalEditor } from 'lexical';
import { $insertNodes, $getRoot, $getSelection } from 'lexical';
import type { MutableRefObject } from 'react';

import { buildContentFromEditor } from './functions';

// Create initial editor configuration
export function createEditorConfig() {
  return {
    namespace: 'DocumentEditor',
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };
}

// Heading transform function equivalent to ProseMirror's headingRule
export function createHeadingTransform(level: number) {
  return {
    dependencies: [],
    export: null,
    importDOM: null,
    regExp: new RegExp(`^(#{1,${level}})\\s$`),
    replace: (textNode: any) => {
      const selection = $getSelection();
      if (selection) {
        const headingTag = `h${level}` as HeadingTagType;
        const headingNode = $createHeadingNode(headingTag);
        headingNode.append();
        $insertNodes([headingNode]);
      }
    },
    trigger: ' ',
    type: 'text-match',
  };
}

export const handleEditorChange = ({
  editorState,
  editor,
  onSaveContent,
}: {
  editorState: any;
  editor: LexicalEditor;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) => {
  let updatedContent = '';
  
  editor.getEditorState().read(() => {
    // Simple text extraction - will be improved in functions.tsx
    const root = $getRoot();
    updatedContent = root.getTextContent();
  });
  
  // Check if this should be debounced (similar to ProseMirror's no-debounce meta)
  const shouldDebounce = true; // Default to debounced saving
  
  onSaveContent(updatedContent, shouldDebounce);
};
