import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

let mcpClient: any = null;
let mcpTools: any = null;

export async function getInstagramMCPTools() {
  // Return empty object if MCP is not configured or fails
  //   if (!process.env.INSTAGRAM_MCP_PATH) {
  //     console.log('Instagram MCP not configured - skipping');
  //     return {};
  //   }

  if (mcpClient && mcpTools) {
    return mcpTools;
  }

  try {
    // Create the MCP client connected to Instagram DM MCP server via STDIO
    mcpClient = await experimental_createMCPClient({
      transport: new Experimental_StdioMCPTransport({
        command: 'uv',
        args: [
          'run',
          '--directory',
          '/home/fran/code/instagram_dm_mcp',
          'python',
          'src/mcp_server.py',
        ],
        // env: process.env,
      }),
    });

    // Get tools from the MCP server - these can be used directly with generateText
    mcpTools = await mcpClient.tools();

    return mcpTools;
  } catch (error) {
    console.error('Failed to create Instagram MCP client:', error);
    // Return empty object so the app continues to work without MCP
    return {};
  }
}

// Cleanup function to close MCP connection
export async function closeMCPClient() {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
    mcpTools = null;
  }
}
