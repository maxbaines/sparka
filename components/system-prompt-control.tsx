"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareDashed, Settings } from "lucide-react";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saveAsReusable, setSaveAsReusable] = useState(true);

  const { data: prompts } = useQuery({
    ...trpc.prompt.list.queryOptions(),
    staleTime: 10_000,
  });

  const createPromptMutation = useMutation(
    trpc.prompt.create.mutationOptions({
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
    setEditorOpen(true);
  }, []);

  const onSaveSnapshot = useCallback(async () => {
    if (!content.trim()) return;

    try {
      if (saveAsReusable && title.trim()) {
        // Create a reusable prompt first
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
          // Always save to localStorage first (works for both new and existing chats)
          localStorage.setItem(`chat-${chatId}-promptId`, newPrompt.id);
          
          // Try to set in DB, but don't fail if chat doesn't exist yet
          try {
            await setPrompt.mutateAsync({ chatId, promptId: newPrompt.id });
          } catch (error) {
            // Silently ignore - chat doesn't exist yet, localStorage will be used
            console.log("Chat not yet created, prompt saved to localStorage");
          }
        }
      } else {
        // Always save to localStorage first
        localStorage.setItem(`chat-${chatId}-promptContent`, content.trim());
        
        // Try to save as snapshot in DB, but don't fail if chat doesn't exist yet
        try {
          await setSnapshot.mutateAsync({ chatId, content: content.trim() });
        } catch (error) {
          // Silently ignore - chat doesn't exist yet, localStorage will be used
          console.log("Chat not yet created, prompt saved to localStorage");
        }
      }

      setEditorOpen(false);
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
    setSnapshot,
    createPromptMutation,
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
            <span className="hidden sm:inline">System</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Pick or edit the system prompt (Cmd+;)</TooltipContent>
      </Tooltip>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Search prompts…" />
        <CommandList>
          <CommandEmpty>No prompts found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={onUseDefault} value="Use default">
              Use default
            </CommandItem>
            <CommandItem onSelect={onCreateSnapshot} value="Create snapshot…">
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
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{p.title}</span>
                  {p.description ? (
                    <span className="truncate text-muted-foreground text-xs">
                      {p.description}
                    </span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog onOpenChange={setEditorOpen} open={editorOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create system prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={saveAsReusable}
                id="save-reusable"
                onCheckedChange={(checked) =>
                  setSaveAsReusable(checked === true)
                }
              />
              <Label className="cursor-pointer text-sm" htmlFor="save-reusable">
                Save as reusable prompt (requires title)
              </Label>
            </div>

            <Input
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                saveAsReusable ? "Title (required)" : "Title (optional)"
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
              disabled={!content.trim() || (saveAsReusable && !title.trim())}
              onClick={onSaveSnapshot}
            >
              {saveAsReusable ? "Save & Apply" : "Apply to this chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
