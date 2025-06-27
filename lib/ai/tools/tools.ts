import type { ToolCall, ToolResult } from 'ai';
import type { Session } from 'next-auth';
import { getInstagramMCPTools } from '@/lib/ai/tools/instagram-mcp';
import type { z } from 'zod';
import type { AnnotationDataStreamWriter } from './annotation-stream';
import type { CoreMessage } from 'ai';

export async function getTools({
  dataStream,
  session,
  contextForLLM,
  messageId,
}: {
  dataStream: AnnotationDataStreamWriter;
  session: Session;
  contextForLLM?: CoreMessage[];
  messageId: string;
}) {
  const baseTools = {};

  try {
    // Get Instagram MCP tools and merge them with base tools
    const instagramTools = await getInstagramMCPTools();

    // Wrap Instagram tools to parse their .text results
    const wrappedInstagramTools: Record<string, any> = {};
    for (const [toolName, tool] of Object.entries(instagramTools)) {
      const typedTool = tool as any;
      wrappedInstagramTools[toolName] = {
        ...typedTool,
        execute: async (...args: any[]) => {
          const result = await typedTool.execute(...args);
          try {
            // Parse the content[0].text property as JSON if it exists
            if (
              result?.content?.[0]?.text &&
              typeof result.content[0].text === 'string'
            ) {
              return JSON.parse(result.content[0].text);
            }
            return result;
          } catch (parseError) {
            console.error(
              `Failed to parse JSON from ${toolName} result:`,
              parseError,
            );
            // Return original result if JSON parsing fails
            return result;
          }
        },
      };
    }

    return {
      ...baseTools,
      ...wrappedInstagramTools,
    };
  } catch (error) {
    console.error('Failed to load Instagram MCP tools:', error);
    // Return base tools if MCP fails
    return baseTools;
  }
}

type AvailableToolsReturn = Awaited<ReturnType<typeof getTools>>;

export type YourToolName = string & keyof AvailableToolsReturn;

export type ToolResultOf<T extends keyof AvailableToolsReturn> = Awaited<
  ReturnType<AvailableToolsReturn[T]['execute']>
>;

type ToolParametersOf<T extends keyof AvailableToolsReturn> = z.infer<
  AvailableToolsReturn[T]['parameters']
>;

type ToolInvocationOf<T extends YourToolName> =
  | ({
      state: 'partial-call';
      step?: number;
    } & ToolCall<T, ToolParametersOf<T>>)
  | ({
      state: 'call';
      step?: number;
    } & ToolCall<T, ToolParametersOf<T>>)
  | ({
      state: 'result';
      step?: number;
    } & ToolResult<T, ToolParametersOf<T>, ToolResultOf<T>>);

export type YourToolInvocation = {
  [K in YourToolName]: ToolInvocationOf<K>;
}[YourToolName];

type ToolDefinition = {
  name: string;
  description: string;
  cost: number;
};

export const toolsDefinitions: Record<string, ToolDefinition> = {
  // Instagram MCP tools
  send_message: {
    name: 'send_message',
    description: 'Send an Instagram direct message to a user by username',
    cost: 2,
  },
  send_photo_message: {
    name: 'send_photo_message',
    description:
      'Send a photo as an Instagram direct message to a user by username',
    cost: 3,
  },
  send_video_message: {
    name: 'send_video_message',
    description:
      'Send a video via Instagram direct message to a user by username',
    cost: 3,
  },
  list_chats: {
    name: 'list_chats',
    description:
      'Get Instagram Direct Message threads (chats) from your account, with optional filters/limits',
    cost: 1,
  },
  list_messages: {
    name: 'list_messages',
    description:
      'Get messages from a specific Instagram Direct Message thread by thread ID',
    cost: 1,
  },
  mark_message_seen: {
    name: 'mark_message_seen',
    description:
      'Mark a specific message in an Instagram Direct Message thread as seen',
    cost: 1,
  },
  list_pending_chats: {
    name: 'list_pending_chats',
    description: 'Get Instagram Direct Message threads from your pending inbox',
    cost: 1,
  },
  search_threads: {
    name: 'search_threads',
    description:
      'Search Instagram Direct Message threads by username or keyword',
    cost: 1,
  },
  get_thread_by_participants: {
    name: 'get_thread_by_participants',
    description:
      'Get an Instagram Direct Message thread by participant user IDs',
    cost: 1,
  },
  get_thread_details: {
    name: 'get_thread_details',
    description:
      'Get details and messages for a specific Instagram Direct Message thread by thread ID',
    cost: 1,
  },
  get_user_id_from_username: {
    name: 'get_user_id_from_username',
    description: 'Get the Instagram user ID for a given username',
    cost: 1,
  },
  get_username_from_user_id: {
    name: 'get_username_from_user_id',
    description: 'Get the Instagram username for a given user ID',
    cost: 1,
  },
  get_user_info: {
    name: 'get_user_info',
    description: 'Get information about a specific Instagram user by username',
    cost: 1,
  },
  check_user_online_status: {
    name: 'check_user_online_status',
    description: 'Check the online status of Instagram users',
    cost: 1,
  },
  search_users: {
    name: 'search_users',
    description: 'Search for Instagram users by username',
    cost: 1,
  },
  get_user_stories: {
    name: 'get_user_stories',
    description:
      'Get recent stories from a specific Instagram user by username',
    cost: 1,
  },
  like_media: {
    name: 'like_media',
    description: 'Like or unlike a specific media post by media ID',
    cost: 1,
  },
  get_user_followers: {
    name: 'get_user_followers',
    description:
      'Get a list of followers for a specific Instagram user by username',
    cost: 1,
  },
  get_user_following: {
    name: 'get_user_following',
    description:
      'Get a list of users that a specific Instagram user is following by username',
    cost: 1,
  },
  get_user_posts: {
    name: 'get_user_posts',
    description: 'Get recent posts from a specific Instagram user by username',
    cost: 1,
  },
};

export const allTools: string[] = Object.keys(toolsDefinitions);
