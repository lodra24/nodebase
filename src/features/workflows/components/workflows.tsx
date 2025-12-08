"use client";
import {
  EntitySearch,
  EntityContainer,
  EntityHeadar,
  EntityPaginaton,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entity-component";
import { formatDistanceToNow } from "date-fns";
import { useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@prisma/client";
import { WorkflowIcon } from "lucide-react";
import { useState } from "react";
import { CreateWorkflowDialog } from "./create-workflow-dialog";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
    debounceMs: 1000,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CreateWorkflowDialog open={open} onOpenChange={setOpen} />
      <EntityHeadar
        title="workflows"
        description="Create and Manage Your Workflows"
        onNew={() => setOpen(true)}
        newButtonLabel="New Workflow"
        disabled={disabled}
      />
    </>
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPaginaton
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChanged={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading Workflows" />;
};
export const WorkflowsError = () => {
  return <ErrorView message="Error Loading Workflow" />;
};

export const WorkflowsEmpty = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CreateWorkflowDialog open={open} onOpenChange={setOpen} />
      <EmptyView
        onNew={() => setOpen(true)}
        message="You haven't create any workflows yet. Get started by creating your first workflow"
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();
  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id });
  };
  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};
