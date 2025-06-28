'use client';

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkNode } from '@lexical/link';
import {
  $getRoot,
  $createTextNode,
  $createParagraphNode,
  type EditorState,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { cn } from '@/lib/utils';
import { AutoLinkPlugin } from '@/lib/editor/link-decorator';

export interface LexicalChatInputRef {
  focus: () => void;
  adjustHeight: () => void;
  clear: () => void;
}

interface LexicalChatInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onPaste?: (event: any) => void;
  className?: string;
  autoFocus?: boolean;
  'data-testid'?: string;
}

// Plugin to sync value with external state
function ValuePlugin({
  value,
  onChange,
}: { value?: string; onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value !== undefined) {
      editor.update(() => {
        const root = $getRoot();
        let currentText = '';

        // Get current text content
        root.getChildren().forEach((child) => {
          currentText += child.getTextContent();
        });

        // Only update if content is different
        if (currentText !== value) {
          root.clear();
          if (value.trim()) {
            // Simple text parsing - create a single paragraph with the text
            const textNode = $createTextNode(value);
            const paragraph = $createParagraphNode();
            paragraph.append(textNode);
            root.append(paragraph);
          }
        }
      });
    }
  }, [value, editor]);

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange?.(textContent);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

// Plugin to handle keyboard events
function KeyboardPlugin({
  onKeyDown,
}: { onKeyDown?: (event: KeyboardEvent) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent) => {
        onKeyDown?.(event);
        return false; // Don't prevent default, let the component handle it
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onKeyDown]);

  return null;
}

// Plugin to handle paste events
function PastePlugin({ onPaste }: { onPaste?: (event: any) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handlePaste = (event: any) => {
      onPaste?.(event);
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste);
      return () => {
        editorElement.removeEventListener('paste', handlePaste);
      };
    }
  }, [editor, onPaste]);

  return null;
}

// Editor content component
function LexicalChatInputContent(
  props: LexicalChatInputProps,
  ref: React.Ref<LexicalChatInputRef>,
) {
  const [editor] = useLexicalComposerContext();
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editor.focus();
    },
    adjustHeight: () => {
      // Auto-height adjustment is handled by CSS
    },
    clear: () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
      });
    },
  }));

  useEffect(() => {
    if (props.autoFocus) {
      editor.focus();
    }
  }, [editor, props.autoFocus]);

  return (
    <>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            ref={contentEditableRef}
            className={cn(
              'min-h-[44px] w-full resize-none border-0 bg-transparent p-2 outline-none focus-visible:ring-0 shadow-none overflow-auto lexical-editor',
              'prose prose-sm max-w-none dark:prose-invert',
              props.className,
            )}
            data-testid={props['data-testid']}
            style={{
              WebkitBoxShadow: 'none',
              MozBoxShadow: 'none',
              boxShadow: 'none',
            }}
          />
        }
        placeholder={
          <div className="absolute top-2 left-2 text-muted-foreground pointer-events-none">
            {props.placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoLinkPlugin />
      <ValuePlugin value={props.value} onChange={props.onChange} />
      <KeyboardPlugin onKeyDown={props.onKeyDown} />
      <PastePlugin onPaste={props.onPaste} />
    </>
  );
}

const LexicalChatInputContentWithRef = forwardRef(LexicalChatInputContent);

// Main component
export const LexicalChatInput = forwardRef<
  LexicalChatInputRef,
  LexicalChatInputProps
>((props, ref) => {
  const initialConfig = {
    namespace: 'ChatInput',
    nodes: [LinkNode],
    onError: (error: Error) => {
      console.error('Lexical chat input error:', error);
    },
    theme: {
      link: 'inline-flex items-center bg-foreground/5 text-foreground px-1 py-0.5 rounded-md text-sm font-medium border border-foreground/10',
    },
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalChatInputContentWithRef {...props} ref={ref} />
      </LexicalComposer>
    </div>
  );
});

LexicalChatInput.displayName = 'LexicalChatInput';
