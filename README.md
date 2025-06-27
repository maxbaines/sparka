<div align="center">

# 📱 AssistGram

**AI-powered Instagram Direct Message assistant**

*Demo showcasing Instagram MCP capabilities with Sparka AI*

Built with the [Instagram DM MCP](https://github.com/trypeggy/instagram_dm_mcp) 🤖

</div>

---

## 🎯 What is AssistGram?

Your personal Instagram AI that helps you use Instagram more intelligently and efficiently. This demo showcases how to integrate the Instagram MCP with a modern AI chat interface.

### ✨ Key Features

- **📬 Message Overview**: List and read your Instagram DMs
- **👤 User Context**: Get profile details and recent stories
- **💬 Smart Responses**: AI can send messages on your behalf

### 🚀 Demo Starters

Try these commands to get started:
- "Give me a morning briefing of my Instagram DMs"
- "Help me respond to my latest messages"
- "Show me [friend's username]'s recent stories"

---

## 🛠️ Setup

### 1. Instagram MCP Setup
First, set up the Instagram MCP server by following the detailed instructions at:
**[Instagram DM MCP Repository](https://github.com/trypeggy/instagram_dm_mcp)**

### 2. Run the Demo
```bash
git clone https://github.com/franciscomoretti/sparka.git
cd sparka
bun install
cp .env.example .env.local
# Configure your environment variables
bun run db:migrate
bun dev
```

### 3. Configure MCP Connection
Add the Instagram MCP server to your configuration following the instructions in the [Instagram MCP repo](https://github.com/trypeggy/instagram_dm_mcp#connect-to-the-mcp-server).

---

## 🏗️ Architecture

Built with:
- **Next.js 15** with App Router
- **Vercel AI SDK** for AI integration
- **Instagram MCP** for Instagram functionality
- **tRPC** for type-safe APIs
- **Drizzle ORM** with PostgreSQL

---

## 🙏 Credits

- **[Instagram DM MCP](https://github.com/trypeggy/instagram_dm_mcp)** - Instagram functionality
