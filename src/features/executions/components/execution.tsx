"use client";

import { useSuspenseExecution } from "../hooks/use-executions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  CalendarIcon,
  Loader2Icon,
  CopyIcon,
} from "lucide-react";
import { ExecutionStatus } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Durum ikonları ve renkleri
const STATUS_CONFIG: Record<
  ExecutionStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  [ExecutionStatus.RUNNING]: {
    icon: <Loader2Icon className="size-4 animate-spin" />,
    color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    label: "Running",
  },
  [ExecutionStatus.SUCCESS]: {
    icon: <CircleCheckIcon className="size-4" />,
    color: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    label: "Success",
  },
  [ExecutionStatus.FAILED]: {
    icon: <CircleXIcon className="size-4" />,
    color: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    label: "Failed",
  },
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);

  const statusConfig = STATUS_CONFIG[execution.status];

  // Süre Hesaplama
  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000
      )
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Execution Details
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            ID: {execution.id}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`px-3 py-1 gap-2 ${statusConfig.color}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STATS CARDS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Started At</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(execution.startedAt), "PPpp")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {duration !== null ? `${duration}s` : "In Progress..."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflow ID</CardTitle>
            <CopyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-sm font-mono truncate"
              title={execution.workflowId}
            >
              {execution.workflowId}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ERROR SECTION (IF FAILED) */}
      {execution.status === ExecutionStatus.FAILED && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <CircleXIcon className="size-5" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-sm mb-1">Message:</p>
              <div className="bg-background/50 p-3 rounded-md border text-sm font-mono text-red-600 dark:text-red-400">
                {execution.error}
              </div>
            </div>
            {execution.errorStack && (
              <div>
                <p className="font-semibold text-sm mb-1">Stack Trace:</p>
                <div className="bg-background/50 p-3 rounded-md border text-xs font-mono overflow-x-auto whitespace-pre">
                  {execution.errorStack}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* OUTPUT SECTION */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Execution Output</CardTitle>
            <CardDescription>
              The final JSON output returned by the workflow.
            </CardDescription>
          </div>
          {execution.output && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(JSON.stringify(execution.output, null, 2))
              }
            >
              <CopyIcon className="size-4 mr-2" />
              Copy JSON
            </Button>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="bg-muted/30 p-6 overflow-x-auto">
            {execution.output ? (
              <pre className="text-sm font-mono">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {execution.status === ExecutionStatus.RUNNING
                  ? "Waiting for output..."
                  : "No output available"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
