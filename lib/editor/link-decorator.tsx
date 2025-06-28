import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createLinkNode, $isLinkNode } from '@lexical/link';
import { $createTextNode, TextNode } from 'lexical';
import { useEffect } from 'react';

// URL regex pattern to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Custom styled link component
function StyledLink({
  url,
  children,
}: { url: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md text-sm font-medium border border-blue-200 dark:border-blue-800">
      <span className="text-blue-500 mr-1">@</span>
      {children}
    </span>
  );
}

// Plugin to automatically detect and convert URLs to decorated links
export function AutoLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register a text transform that detects URLs in text nodes
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        const text = textNode.getTextContent();
        const urlMatches = Array.from(text.matchAll(URL_REGEX));

        // Only process if we found URLs and the text node isn't already inside a link
        if (urlMatches.length > 0) {
          const parent = textNode.getParent();
          if (parent && $isLinkNode(parent)) {
            return; // Don't process if already inside a link
          }

          let lastIndex = 0;
          const newNodes = [];

          for (const match of urlMatches) {
            if (match.index === undefined) continue;
            const matchStart = match.index;
            const matchEnd = matchStart + match[0].length;

            // Add text before the URL
            if (matchStart > lastIndex) {
              const beforeText = text.slice(lastIndex, matchStart);
              if (beforeText) {
                newNodes.push($createTextNode(beforeText));
              }
            }

            // Create link node for the URL
            const url = match[0].startsWith('http')
              ? match[0]
              : `https://${match[0]}`;
            const linkNode = $createLinkNode(url);
            linkNode.append($createTextNode(match[0]));
            newNodes.push(linkNode);

            lastIndex = matchEnd;
          }

          // Add remaining text after the last URL
          if (lastIndex < text.length) {
            const afterText = text.slice(lastIndex);
            if (afterText) {
              newNodes.push($createTextNode(afterText));
            }
          }

          // Replace the original node with new nodes
          if (newNodes.length > 0) {
            textNode.insertAfter(newNodes[0]);
            for (let i = 1; i < newNodes.length; i++) {
              newNodes[i - 1].insertAfter(newNodes[i]);
            }
            textNode.remove();
          }
        }
      },
    );

    return removeTransform;
  }, [editor]);

  return null;
}

// Custom Link Component that overrides the default link rendering
export function LinkComponent({ children, ...props }: any) {
  const url = props.href || props.url;

  return <StyledLink url={url}>{children}</StyledLink>;
}
