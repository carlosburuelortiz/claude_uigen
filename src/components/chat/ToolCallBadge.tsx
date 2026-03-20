"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getLabel(toolName: string, args: Record<string, any>): string {
  const filename = (path: string) =>
    path.split("/").filter(Boolean).at(-1) ?? path;

  if (toolName === "str_replace_editor") {
    const file = filename(args.path ?? "");
    switch (args.command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Viewing ${file}`;
      case "undo_edit":
        return `Undoing edit to ${file}`;
    }
  }

  if (toolName === "file_manager") {
    const file = filename(args.path ?? "");
    switch (args.command) {
      case "rename":
        return `Renaming ${file} to ${filename(args.new_path ?? "")}`;
      case "delete":
        return `Deleting ${file}`;
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const label = getLabel(toolName, args as Record<string, any>);
  const isDone =
    state === "result" && (toolInvocation as any).result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
