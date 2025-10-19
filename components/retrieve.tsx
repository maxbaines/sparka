'use client';

import { ChevronDown, ExternalLink, Globe, TextIcon } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface RetrieveResult {
  error?: string;
  results: {
    title: string;
    content: string;
    url: string;
    description: string;
    language: string;
    error?: string;
  }[];
}

export function Retrieve({ result }: { result?: RetrieveResult }) {
  if (!result) {
    return (
      <div className="border border-neutral-200 rounded-xl my-4 p-4 dark:border-neutral-800 bg-linear-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <Globe className="h-5 w-5 text-primary/70 absolute inset-0 m-auto" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-md" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
              <div className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Update the error message UI with better dark mode border visibility
  if (result.error || result.results?.[0]?.error) {
    const errorMessage = result.error || result.results?.[0]?.error;
    return (
      <div className="border border-red-200 dark:border-red-500 rounded-xl my-4 p-4 bg-red-50 dark:bg-red-950/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">
              Error retrieving content
            </div>
            <div className="text-red-600/80 dark:text-red-400/80 text-xs mt-1">
              {errorMessage}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update the "no content" message UI with better dark mode border visibility
  if (!result.results || result.results.length === 0) {
    return (
      <div className="border border-amber-200 dark:border-amber-500 rounded-xl my-4 p-4 bg-amber-50 dark:bg-amber-950/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="text-amber-700 dark:text-amber-300 text-sm font-medium">
            No content available
          </div>
        </div>
      </div>
    );
  }

  // Existing rendering for successful retrieval:
  return (
    <div className="border border-neutral-200 rounded-xl my-4 overflow-hidden dark:border-neutral-800 bg-linear-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent rounded-lg" />
            <Image
              className="absolute inset-0 m-auto"
              src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(result.results[0].url)}`}
              alt=""
              width={20}
              height={20}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
              {result.results[0].title || 'Retrieved Content'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {result.results[0].description || 'No description available'}
            </p>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {result.results[0].language || 'Unknown'}
              </span>
              <a
                href={result.results[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View source
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <details className="group">
          <summary className="w-full px-4 py-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TextIcon className="h-4 w-4 text-neutral-400" />
              <span>View content</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="max-h-[50vh] overflow-y-auto p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
            <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {result.results[0].content || 'No content available'}
              </ReactMarkdown>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
