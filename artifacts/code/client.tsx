import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from '@/components/console';

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ['basic'];

  if (code.includes('matplotlib') || code.includes('plt.')) {
    handlers.push('matplotlib');
  }

  return handlers;
}

function parseContent(content: string): { code: string; language: string } {
  try {
    const parsed = JSON.parse(content);
    return {
      code: parsed.code || content,
      language: parsed.language || 'python',
    };
  } catch {
    // If parsing fails, treat as plain code
    return {
      code: content,
      language: 'python',
    };
  }
}

// TypeScript execution using eval (with basic error handling)
async function executeTypeScript(code: string): Promise<string> {
  try {
    // Simple TypeScript-to-JavaScript transpilation for basic cases
    // Remove type annotations and interfaces for basic execution
    const jsCode = code
      .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
      .replace(/export\s+/g, '') // Remove exports
      .replace(/import\s+.*from\s+['"][^'"]+['"];?/g, ''); // Remove imports

    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    let output = '';

    console.log = (...args) => {
      output +=
        args
          .map((arg) =>
            typeof arg === 'object'
              ? JSON.stringify(arg, null, 2)
              : String(arg),
          )
          .join(' ') + '\n';
    };

    console.error = (...args) => {
      output +=
        'ERROR: ' +
        args
          .map((arg) =>
            typeof arg === 'object'
              ? JSON.stringify(arg, null, 2)
              : String(arg),
          )
          .join(' ') +
        '\n';
    };

    try {
      // Execute the JavaScript code
      // eslint-disable-next-line no-eval
      const result = eval(jsCode);
      if (result !== undefined) {
        output += String(result);
      }
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
    }

    return output || 'Code executed successfully (no output)';
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
  language: string;
}

export const codeArtifact = new Artifact<'code', Metadata>({
  kind: 'code',
  description:
    'Useful for code generation; Code execution is available for Python and TypeScript/JavaScript.',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      outputs: [],
      language: 'python',
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'code-delta') {
      const parsedContent = parseContent(streamPart.content as string);

      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible:
          draftArtifact.status === 'streaming' &&
          parsedContent.code.length > 300 &&
          parsedContent.code.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));

      // Update language in metadata
      setMetadata((metadata) => ({
        ...metadata,
        language: parsedContent.language,
      }));
    }
  },
  content: ({ metadata, setMetadata, isReadonly, content, ...props }) => {
    const parsedContent = parseContent(content);

    return (
      <>
        <div className="px-1">
          <CodeEditor
            {...props}
            content={parsedContent.code}
            language={parsedContent.language}
            isReadonly={isReadonly}
          />
        </div>

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code',
      onClick: async ({ content, setMetadata, metadata }) => {
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];
        const parsedContent = parseContent(content);

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            {
              id: runId,
              contents: [],
              status: 'in_progress',
            },
          ],
        }));

        try {
          if (parsedContent.language === 'python') {
            // Python execution using Pyodide
            // @ts-expect-error - loadPyodide is not defined
            const currentPyodideInstance = await globalThis.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
            });

            currentPyodideInstance.setStdout({
              batched: (output: string) => {
                outputContent.push({
                  type: output.startsWith('data:image/png;base64')
                    ? 'image'
                    : 'text',
                  value: output,
                });
              },
            });

            await currentPyodideInstance.loadPackagesFromImports(
              parsedContent.code,
              {
                messageCallback: (message: string) => {
                  setMetadata((metadata) => ({
                    ...metadata,
                    outputs: [
                      ...metadata.outputs.filter(
                        (output) => output.id !== runId,
                      ),
                      {
                        id: runId,
                        contents: [{ type: 'text', value: message }],
                        status: 'loading_packages',
                      },
                    ],
                  }));
                },
              },
            );

            const requiredHandlers = detectRequiredHandlers(parsedContent.code);
            for (const handler of requiredHandlers) {
              if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
                await currentPyodideInstance.runPythonAsync(
                  OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS],
                );

                if (handler === 'matplotlib') {
                  await currentPyodideInstance.runPythonAsync(
                    'setup_matplotlib_output()',
                  );
                }
              }
            }

            await currentPyodideInstance.runPythonAsync(parsedContent.code);
          } else if (
            parsedContent.language === 'typescript' ||
            parsedContent.language === 'javascript'
          ) {
            // TypeScript/JavaScript execution
            const result = await executeTypeScript(parsedContent.code);
            outputContent.push({
              type: 'text',
              value: result,
            });
          } else {
            // Unsupported language
            outputContent.push({
              type: 'text',
              value: `Code execution not supported for ${parsedContent.language}. Only Python and TypeScript/JavaScript are supported.`,
            });
          }

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: 'completed',
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: 'text', value: error.message }],
                status: 'failed',
              },
            ],
          }));
        }
      },
      isDisabled: ({ isReadonly }) => !!isReadonly,
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        const parsedContent = parseContent(content);
        navigator.clipboard.writeText(parsedContent.code);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: 'Add comments',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add comments to the code snippet for understanding',
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: 'Add logs',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add logs to the code snippet for debugging',
        });
      },
    },
  ],
});
