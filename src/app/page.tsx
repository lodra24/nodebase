"use client";

import { Button } from "@/components/ui/button";
import { Logout } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const testAi = useMutation(trpc.testAi.mutationOptions());
  const create = useMutation(
    trpc.createWorkflows.mutationOptions({
      onSuccess: () => {
        toast.success("job queued...");
      },
    })
  );

  return (
    <div>
      <h1 className="text-red-400">Protected Server Component</h1>
      <div className=" min-h-screen min-w-screen flex flex-col items-center justify-center gap-3">
        {JSON.stringify(data, null, 2)}

        <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
          Test AI
        </Button>
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          Create Workflow
        </Button>
        <Logout />
      </div>
    </div>
  );
};

export default Page;
