"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareDashed, Pencil, Trash2, Eye, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Prompt } from "@/lib/db/schema";
import { useTRPC } from "@/trpc/react";

export function SystemPromptControl({ chatId }: { chatId: string }) {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saveAsReusable, setSaveAsReusable] = useState(true);

  const { data: prompts } = useQuery({
    ...trpc.prompt.list.queryOptions(),
    staleTime: 10_000,
  });

  const { data: currentChat } = useQuery({
    ...trpc.chat.getChatById.queryOptions({ chatId }),
    staleTime: 5_000,
  });

  // Determine active prompt name (client-side only for localStorage)
  const activePromptName = (() => {
    // Check if there's a snapshot (one-off prompt)
    if (currentChat?.systemPromptSnapshot) {
      return "Custom";
    }
    
    // Check if there's a linked prompt ID
    if (currentChat?.systemPromptId) {
      const linkedPrompt = prompts?.find((p) => p.id === currentChat.systemPromptId);
      if (linkedPrompt) {
        return linkedPrompt.title;
      }
    }
    
    // Check localStorage for new chats (only on client side)
    if (typeof window !== "undefined") {
      const localPromptId = localStorage.getItem(`chat-${chatId}-promptId`);
      if (localPromptId) {
        const localPrompt = prompts?.find((p) => p.id === localPromptId);
        if (localPrompt) {
          return localPrompt.title;
        }
      }
      
      const localPromptContent = localStorage.getItem(`chat-${chatId}-promptContent`);
      if (localPromptContent) {
        return "Custom";
      }
    }
    
    return null;
  })();

  // Truncate prompt name for display (max 20 chars on desktop, 12 on mobile)
  const truncatePromptName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return `${name.slice(0, maxLength - 1)}…`;
  };

  const createPromptMutation = useMutation(
    trpc.prompt.create.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: trpc.prompt.list.queryKey() });
      },
    })
  );

  const updatePromptMutation = useMutation(
    trpc.prompt.update.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: trpc.prompt.list.queryKey() });
      },
    })
  );

  const deletePromptMutation = useMutation(
    trpc.prompt.remove.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: trpc.prompt.list.queryKey() });
      },
    })
  );

  const setPrompt = useMutation(
    trpc.prompt.setChatPrompt.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          qc.invalidateQueries({
            queryKey: trpc.chat.getChatById.queryKey({ chatId }),
          }),
          qc.invalidateQueries({ queryKey: trpc.prompt.list.queryKey() }),
        ]);
      },
    })
  );

  const setSnapshot = useMutation(
    trpc.prompt.setChatPromptSnapshot.mutationOptions({
      onSuccess: async () => {
        setEditorOpen(false);
        await qc.invalidateQueries({
          queryKey: trpc.chat.getChatById.queryKey({ chatId }),
        });
      },
    })
  );

  const clearPrompt = useMutation(
    trpc.prompt.clearChatPrompt.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: trpc.chat.getChatById.queryKey({ chatId }),
        });
      },
    })
  );

  // Optional: Cmd+; to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key === ";" && !e.shiftKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const onSelectPrompt = useCallback(
    async (promptId: string) => {
      try {
        await setPrompt.mutateAsync({ chatId, promptId });
        // Also save to localStorage as fallback
        localStorage.setItem(`chat-${chatId}-promptId`, promptId);
        setOpen(false);
      } catch (error) {
        // If chat doesn't exist yet, just save to localStorage
        localStorage.setItem(`chat-${chatId}-promptId`, promptId);
        setOpen(false);
      }
    },
    [chatId, setPrompt]
  );

  const onUseDefault = useCallback(async () => {
    try {
      await clearPrompt.mutateAsync({ chatId });
      localStorage.removeItem(`chat-${chatId}-promptId`);
      localStorage.removeItem(`chat-${chatId}-promptContent`);
      setOpen(false);
    } catch (error) {
      // If chat doesn't exist yet, just clear localStorage
      localStorage.removeItem(`chat-${chatId}-promptId`);
      localStorage.removeItem(`chat-${chatId}-promptContent`);
      setOpen(false);
    }
  }, [chatId, clearPrompt]);

  const onCreateSnapshot = useCallback(async () => {
    setOpen(false);
    setEditingPromptId(null);
    setTitle("");
    setDescription("");
    setContent("");
    setSaveAsReusable(true);
    setEditorOpen(true);
  }, []);

  const onViewPrompt = useCallback((prompt: Prompt) => {
    setViewingPrompt(prompt);
    setOpen(false);
    setViewerOpen(true);
  }, []);

  const onEditPrompt = useCallback((prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setTitle(prompt.title);
    setDescription(prompt.description || "");
    setContent(prompt.content);
    setSaveAsReusable(true);
    setOpen(false);
    setEditorOpen(true);
  }, []);

  const onDeletePrompt = useCallback(
    async (promptId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this prompt?")) return;

      try {
        await deletePromptMutation.mutateAsync({ id: promptId });
      } catch (error) {
        console.error("Failed to delete prompt:", error);
      }
    },
    [deletePromptMutation]
  );

  const onSaveSnapshot = useCallback(async () => {
    if (!content.trim()) return;

    try {
      if (editingPromptId) {
        // Update existing prompt
        await updatePromptMutation.mutateAsync({
          id: editingPromptId,
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim(),
        });

        // Always save to localStorage first
        localStorage.setItem(`chat-${chatId}-promptId`, editingPromptId);
        
        // Try to set in DB, but don't fail if chat doesn't exist yet
        try {
          await setPrompt.mutateAsync({ chatId, promptId: editingPromptId });
        } catch (error) {
          console.log("Chat not yet created, prompt saved to localStorage");
        }
      } else if (saveAsReusable && title.trim()) {
        // Create a new reusable prompt
        await createPromptMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim(),
        });

        // Refresh prompts list to get the new prompt ID
        await qc.invalidateQueries({ queryKey: trpc.prompt.list.queryKey() });

        // Get the newly created prompt
        const updatedPrompts = await qc.fetchQuery({
          ...trpc.prompt.list.queryOptions(),
        });
        const newPrompt = updatedPrompts?.find((p) => p.title === title.trim());

        if (newPrompt) {
          localStorage.setItem(`chat-${chatId}-promptId`, newPrompt.id);
          
          try {
            await setPrompt.mutateAsync({ chatId, promptId: newPrompt.id });
          } catch (error) {
            console.log("Chat not yet created, prompt saved to localStorage");
          }
        }
      } else {
        // Save as one-off snapshot
        localStorage.setItem(`chat-${chatId}-promptContent`, content.trim());
        
        try {
          await setSnapshot.mutateAsync({ chatId, content: content.trim() });
        } catch (error) {
          console.log("Chat not yet created, prompt saved to localStorage");
        }
      }

      setEditorOpen(false);
      setEditingPromptId(null);
      setTitle("");
      setDescription("");
      setContent("");
      setSaveAsReusable(true);
    } catch (error) {
      console.error("Failed to save prompt:", error);
    }
  }, [
    chatId,
    content,
    title,
    description,
    saveAsReusable,
    editingPromptId,
    setSnapshot,
    createPromptMutation,
    updatePromptMutation,
    setPrompt,
    qc,
    trpc,
  ]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8 px-2"
            onClick={() => setOpen(true)}
            size="sm"
            variant="outline"
          >
            <MessageSquareDashed className="mr-2 h-4 w-4" />
            {activePromptName ? (
              <>
                <span className="hidden sm:inline">
                  {truncatePromptName(activePromptName, 20)}
                </span>
                <span className="inline sm:hidden">
                  {truncatePromptName(activePromptName, 12)}
                </span>
              </>
            ) : (
              <span className="hidden sm:inline">System</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {activePromptName 
            ? `Active prompt: ${activePromptName} (Cmd+;)` 
            : "Pick or edit the system prompt (Cmd+;)"}
        </TooltipContent>
      </Tooltip>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Search prompts…" />
        <CommandList>
          <CommandEmpty>No prompts found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={onUseDefault} value="Use default">
              <RotateCcw className="mr-2 h-4 w-4" />
              Use default
            </CommandItem>
            <CommandItem onSelect={onCreateSnapshot} value="Create snapshot…">
              <Plus className="mr-2 h-4 w-4" />
              Create snapshot…
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Your prompts">
            {(prompts ?? []).map((p: Prompt) => (
              <CommandItem
                key={p.id}
                onSelect={() => onSelectPrompt(p.id)}
                value={`${p.title} ${p.description ?? ""}`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{p.title}</span>
                  {p.description ? (
                    <span className="truncate text-muted-foreground text-xs">
                      {p.description}
                    </span>
                  ) : null}
                </div>
                <div className="ml-2 flex shrink-0 gap-1">
                  <Button
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPrompt(p);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPrompt(p);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    className="h-6 w-6 p-0"
                    onClick={(e) => onDeletePrompt(p.id, e)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog onOpenChange={setEditorOpen} open={editorOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingPromptId ? "Edit system prompt" : "Create system prompt"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingPromptId && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={saveAsReusable}
                  id="save-reusable"
                  onCheckedChange={(checked) =>
                    setSaveAsReusable(!!checked)
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="save-reusable"
                >
                  Save as reusable prompt (requires title)
                </Label>
              </div>
            )}

            <Input
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                editingPromptId || saveAsReusable
                  ? "Title (required)"
                  : "Title (optional)"
              }
              value={title}
            />
            <Input
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              value={description}
            />
            <Textarea
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write the system prompt content…"
              rows={12}
              value={content}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setEditorOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={
                !content.trim() ||
                !!(saveAsReusable || editingPromptId) && !title.trim()
              }
              onClick={onSaveSnapshot}
            >
              {editingPromptId
                ? "Update & Apply"
                : saveAsReusable
                  ? "Save & Apply"
                  : "Apply to this chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setViewerOpen} open={viewerOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewingPrompt?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingPrompt?.description && (
              <div>
                <Label className="text-muted-foreground text-xs">
                  Description
                </Label>
                <p className="text-sm">{viewingPrompt.description}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground text-xs">Content</Label>
              <div className="mt-2 max-h-[400px] overflow-y-auto rounded-md border bg-muted/50 p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {viewingPrompt?.content}
                </pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewerOpen(false)} variant="outline">
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingPrompt) {
                  setViewerOpen(false);
                  onEditPrompt(viewingPrompt);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => {
                if (viewingPrompt) {
                  setViewerOpen(false);
                  onSelectPrompt(viewingPrompt.id);
                }
              }}
            >
              Apply to Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
