import type { ReactFlowInstance } from "@xyflow/react";
import { atom } from "jotai";

export const editorItem = atom<ReactFlowInstance | null>(null);
