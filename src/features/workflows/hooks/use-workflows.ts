import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();
  return useSuspenseQuery(trpc.workflow.getMany.queryOptions(params));
};

export const useCreateWorkflows = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflow.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created!`);
        queryClient.invalidateQueries(trpc.workflow.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
      },
    })
  );
};

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflow.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed`);
        queryClient.invalidateQueries(trpc.workflow.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflow.getOne.queryFilter({ id: data.id })
        );
      },
    })
  );
};

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflow.getOne.queryOptions({ id }));
};

export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflow.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} updated!`);
        queryClient.invalidateQueries(trpc.workflow.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflow.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Error to update workflow: ${error.message}`);
      },
    })
  );
};
