import { InitialNode } from "@/components/initial-nodes";
import { NodeType } from "@prisma/client";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponent = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisterNodeType = keyof typeof nodeComponent;
