import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { $generateNodesFromDOM } from '@lexical/html';
import { createEditor, $getRoot, $isTextNode, TextNode, type EditorConfig, type LexicalEditor } from 'lexical';
import { DecoratorNode } from 'lexical';
import React, { useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

import { diffEditor, DiffType } from '@/lib/editor/diff';
import { createEditorConfig } from '@/lib/editor/config';

// Define diff types
type DiffTypeValue = typeof DiffType[keyof typeof DiffType];

// Custom diff text node that supports styling
class DiffTextNode extends TextNode {
  __diffType?: DiffTypeValue;

  static getType(): string {
    return 'diff-text';
  }

  static clone(node: DiffTextNode): DiffTextNode {
    const newNode = new DiffTextNode(node.__text, node.__key);
    newNode.__diffType = node.__diffType;
    return newNode;
  }

  constructor(text: string, key?: string) {
    super(text, key);
  }

  setDiffType(diffType: DiffTypeValue): void {
    const writable = this.getWritable();
    writable.__diffType = diffType;
  }

  getDiffType(): DiffTypeValue | undefined {
    return this.__diffType;
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const element = super.createDOM(config, editor);
    const diffType = this.getDiffType();
    
    if (diffType) {
      let className = '';
      switch (diffType) {
        case DiffType.Inserted:
          className = 'bg-green-100 text-green-700 dark:bg-green-500/70 dark:text-green-300';
          break;
        case DiffType.Deleted:
          className = 'bg-red-100 line-through text-red-600 dark:bg-red-500/70 dark:text-red-300';
          break;
        default:
          className = '';
      }
      element.className = className;
    }
    
    return element;
  }

  updateDOM(prevNode: DiffTextNode, dom: HTMLElement, config: EditorConfig): boolean {
    const prevDiffType = prevNode.getDiffType();
    const currentDiffType = this.getDiffType();
    
    if (prevDiffType !== currentDiffType) {
      // Update classes if diff type changed
      return false; // Force recreation
    }
    
    return super.updateDOM(prevNode as this, dom, config);
  }
}

// Simple diff computation function
function computeSimpleDiff(oldText: string, newText: string) {
  // This is a simplified diff - in a real implementation you'd use a proper diff algorithm
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const result: Array<{ text: string; type: DiffTypeValue }> = [];
  
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine === undefined) {
      // Added line
      result.push({ text: newLine + '\n', type: DiffType.Inserted });
    } else if (newLine === undefined) {
      // Removed line
      result.push({ text: oldLine + '\n', type: DiffType.Deleted });
    } else if (oldLine !== newLine) {
      // Changed line - show both
      result.push({ text: oldLine + '\n', type: DiffType.Deleted });
      result.push({ text: newLine + '\n', type: DiffType.Inserted });
    } else {
      // Unchanged line
      result.push({ text: oldLine + '\n', type: DiffType.Unchanged });
    }
  }
  
  return result;
}

function DiffContentPlugin({ 
  oldContent, 
  newContent 
}: { 
  oldContent: string; 
  newContent: string; 
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (oldContent && newContent) {
      editor.update(() => {
        const root = $getRoot();
        
        // Clear existing content
        const children = root.getChildren();
        for (const child of children) {
          child.remove();
        }

        // Compute diff
        const diffResult = computeSimpleDiff(oldContent, newContent);
        
        // Create diff nodes
        diffResult.forEach(({ text, type }) => {
          const textNode = new DiffTextNode(text);
          textNode.setDiffType(type);
          root.append(textNode);
        });
      });
    }
  }, [oldContent, newContent, editor]);

  return null;
}

type DiffEditorProps = {
  oldContent: string;
  newContent: string;
};

export const DiffView = ({ oldContent, newContent }: DiffEditorProps) => {
  const initialConfig = {
    ...createEditorConfig(),
    nodes: [DiffTextNode],
    editable: false,
  };

  return (
    <div className="diff-editor">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <DiffContentPlugin oldContent={oldContent} newContent={newContent} />
      </LexicalComposer>
    </div>
  );
};
