# AssistaGram - Product Requirements Document

## Overview
An AI-powered Instagram Direct Message assistant that showcases Instagram MCP capabilities in a simple chat interface.

## Core Value Proposition
"Your personal Instagram AI that helps you use Instagram more intelligently and efficiently."

## Key Features (MVP Only)

### 1. Message Overview
- **List your DMs**: Show all your Instagram conversations
- **Read conversations**: Get messages from specific threads
- **Send messages**: AI can send DMs on your behalf

### 2. User Context
- **User info lookup**: Get profile details for any Instagram user
- **Recent activity**: Check user' latest stories

## Suggestion Templates (Demo Starters)
- "Give me a morning briefing of my Instagram DMs"
- "Help me respond to my latest messages"

## Technical Implementation

### Essential Tools Only
```typescript
// Core functionality for demo
- list_chats: Get all conversations
- list_messages: Read specific thread
- send_message: Send responses
- get_user_info: User profile context
- get_user_stories: Recent stories
```

## Demo Script
1. "Show me my Instagram DMs" → AI lists conversations
2. "What's been happening with [friend's username]?" → AI shows their recent stories
3. "Help me reply to [specific person]" → AI drafts contextual response

## Success Criteria
- Can list Instagram DMs
- Can get user context (stories, profile)
- Can send messages through AI
- Clean chat interface that works 