import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock heavy dependencies
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

vi.mock("react-resizable-panels", () => ({
  PanelGroup: ({ children }: any) => <div>{children}</div>,
  Panel: ({ children }: any) => <div>{children}</div>,
  PanelResizeHandle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: any) => <div>{children}</div>,
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders preview view by default", () => {
  render(<MainContent />);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code tab switches to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Initially in preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click the Code tab
  await user.click(screen.getByRole("tab", { name: "Code" }));

  // Should now show code editor
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("clicking Preview tab switches back to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to code
  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  await user.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Preview tab is active by default", () => {
  render(<MainContent />);
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("active");
});

test("Code tab becomes active after clicking", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));

  const codeTab = screen.getByRole("tab", { name: "Code" });
  expect(codeTab.getAttribute("data-state")).toBe("active");

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("inactive");
});
