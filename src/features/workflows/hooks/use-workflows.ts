import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflow.getMany.queryOptions());
};

export const useCreateWorkflows = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflow.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} created!`);
        queryClient.invalidateQueries(trpc.workflow.getMany.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
      },
    })
  );
};
