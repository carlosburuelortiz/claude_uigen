import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, any>,
  state: "call" | "result" = "result",
  result: any = "Success"
): ToolInvocation {
  if (state === "call") {
    return { toolCallId: "1", toolName, args, state };
  }
  return { toolCallId: "1", toolName, args, state, result };
}

test("str_replace_editor create shows Creating filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "/src/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "/src/components/Card.jsx",
      })}
    />
  );
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "/src/index.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing index.tsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "/src/lib/utils.ts",
      })}
    />
  );
  expect(screen.getByText("Viewing utils.ts")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit to filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "undo_edit",
        path: "/src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Undoing edit to App.tsx")).toBeDefined();
});

test("file_manager rename shows Renaming to new filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "/src/Foo.jsx",
        new_path: "/src/Bar.jsx",
      })}
    />
  );
  expect(screen.getByText("Renaming Foo.jsx to Bar.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting filename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "/src/OldFile.jsx",
      })}
    />
  );
  expect(screen.getByText("Deleting OldFile.jsx")).toBeDefined();
});

test("unknown tool falls back to raw tool name", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_unknown_tool", { command: "foo", path: "/x" })}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("shows green dot when state is result with result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "result",
        "Success"
      )}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when state is call (in-progress)", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "call"
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
