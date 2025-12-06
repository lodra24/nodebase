"use client";

import { Button } from "@/components/ui/button";
import {
  useExecuteWorkflow,
  useUpdateWorkflow,
} from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon, Loader2Icon } from "lucide-react";
import { useAtomValue } from "jotai";
import { editorItem } from "../store/atoms";
import { toast } from "sonner";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow({ disableToast: true });
  const updateWorkflow = useUpdateWorkflow({ disableToast: true });
  const editor = useAtomValue(editorItem);

  const handleExecute = () => {
    if (!editor) {
      return;
    }

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    updateWorkflow.mutate(
      {
        id: workflowId,
        nodes,
        edges,
      },
      {
        onSuccess: () => {
          executeWorkflow.mutate(
            { id: workflowId },
            {
              onSuccess: () =>
                toast.success("Workflow saved and executed successfully."),
              onError: () =>
                toast.error("Execution failed to start. Please try again."),
            }
          );
        },
        onError: () => {
          toast.error("Save failed. Execution aborted to prevent data loss.");
        },
      }
    );
  };

  const isSaving = updateWorkflow.isPending;
  const isExecuting = executeWorkflow.isPending;
  const isPending = isSaving || isExecuting;
  const isDisabled = !editor || isPending;

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={isDisabled}
      className="gap-2 font-semibold shadow-lg min-w-[180px]"
    >
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <FlaskConicalIcon className="size-4" />
      )}
      {isSaving
        ? "Saving..."
        : isExecuting
        ? "Starting..."
        : "Execute Workflow"}
    </Button>
  );
};
