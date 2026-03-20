# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Reset database
npm run db:reset
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. Without it, the app uses a `MockLanguageModel` in `src/lib/provider.ts` that returns static, hardcoded component code — useful for UI development without API costs.

The active Claude model is set in `src/lib/provider.ts` via the `MODEL` constant (currently `claude-haiku-4-5`).

Auth uses JWT cookies signed with `JWT_SECRET` from `.env` (falls back to a hardcoded dev secret).

## Architecture

### Request Flow

1. User types in `ChatInterface` → `ChatProvider` (wraps Vercel AI SDK's `useChat`) sends POST to `/api/chat/route.ts`
2. API route reconstructs `VirtualFileSystem` from serialized file state sent in the request body, then calls `streamText` with two tools: `str_replace_editor` and `file_manager`
3. As the AI streams tool calls back, the client's `onToolCall` handler in `ChatContext` calls `handleToolCall` from `FileSystemContext`, which mutates the in-memory `VirtualFileSystem` and increments `refreshTrigger`
4. `PreviewFrame` watches `refreshTrigger`, calls `createImportMap` + `createPreviewHTML` from `jsx-transformer.ts`, and writes the result into an `<iframe srcdoc>`
5. On finish, the API route saves the full message history and serialized file system to `Project.messages` / `Project.data` (JSON strings in SQLite) — only for authenticated users with a `projectId`

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree of `FileNode` objects (Map-based, not persisted to disk). It lives client-side in `FileSystemContext` and is also reconstructed server-side on every API call from the serialized form sent in the request body. The two AI tools operate on the server-side instance; the client-side instance is mutated via `handleToolCall`.

### Database

The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand
the structure of data stored in the database.

### Preview Pipeline

`src/lib/transform/jsx-transformer.ts` handles client-side compilation:
- `transformJSX`: uses `@babel/standalone` to transpile JSX/TSX to plain JS
- `createImportMap`: builds a browser import map — React is loaded from `esm.sh`, third-party packages are resolved to `https://esm.sh/<pkg>`, and local files are compiled to blob URLs. Missing local imports get placeholder empty modules.
- `createPreviewHTML`: assembles a full HTML document with the import map and an `ErrorBoundary`; injects Tailwind CSS via CDN script tag

The preview iframe entry point defaults to `/App.jsx`, falling back to `/App.tsx`, `/index.jsx`, etc.

### Authentication

Custom JWT auth (`src/lib/auth.ts`) using `jose`. Session stored in an `httpOnly` cookie (`auth-token`). Server actions in `src/actions/` use `getSession()` to check auth. Anonymous users can generate components without signing in; their work is tracked via `anon-work-tracker.ts` (localStorage). On sign-up/sign-in, anonymous work can be preserved.

### Data Model (Prisma / SQLite)

- `User`: email + bcrypt password
- `Project`: belongs to optional `User`, stores `messages` (JSON array of AI message history) and `data` (serialized `VirtualFileSystem` nodes) as plain text columns

### Key Contexts

- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`): owns the `VirtualFileSystem` instance, exposes CRUD helpers + `handleToolCall`
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`): wraps Vercel AI SDK's `useChat`, wires `onToolCall` to `FileSystemContext.handleToolCall`, passes serialized file state on every request

### Testing

Tests use Vitest + jsdom + React Testing Library. Test files live alongside source in `__tests__/` subdirectories.
