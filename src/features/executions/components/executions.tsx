"use client";

import {
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
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { Execution, ExecutionStatus } from "@prisma/client";
import { CircleCheckIcon, CircleXIcon, Loader2Icon } from "lucide-react";

const STATUS_ICON_MAP: Record<ExecutionStatus, React.ReactNode> = {
  [ExecutionStatus.RUNNING]: (
    <Loader2Icon className="size-5 text-blue-500 animate-spin" />
  ),
  [ExecutionStatus.SUCCESS]: (
    <CircleCheckIcon className="size-5 text-green-500" />
  ),
  [ExecutionStatus.FAILED]: <CircleXIcon className="size-5 text-red-500" />,
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeadar
      title="Executions"
      description="View your workflow execution history"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPaginaton
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChanged={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading Executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error Loading Executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions found. Run a workflow to see it here." />
  );
};

type ExecutionWithWorkflow = Execution & {
  workflow: {
    id: string;
    name: string;
  };
};

export const ExecutionItem = ({ data }: { data: ExecutionWithWorkflow }) => {
  const icon = STATUS_ICON_MAP[data.status];

  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000
      )
    : null;

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={data.workflow.name}
      subtitle={
        <div className="flex items-center gap-x-2 text-xs md:text-sm">
          <span className="font-medium">{data.status}</span>

          <span>&bull;</span>

          {duration !== null && (
            <>
              <span>{duration}s</span>
              <span>&bull;</span>
            </>
          )}

          <span>
            {formatDistanceToNow(new Date(data.startedAt), { addSuffix: true })}
          </span>
        </div>
      }
      image={
        <div className="size-8 flex items-center justify-center bg-muted rounded-full">
          {icon}
        </div>
      }
    />
  );
};
