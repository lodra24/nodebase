"use client";

import { createId } from "@paralleldrive/cuid2";
import { NodeType } from "@prisma/client";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger manually",
    description:
      "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form",
    description: "Runs the flow when a Google Form is submitted",
    icon: "/logos/googleform.svg",
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Runs the flow when a Stripe Event is captured",
    icon: "/logos/stripe.svg",
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description:
      "Connect to any third-party API or web service. Supports all standard HTTP methods (GET, POST, etc.).",
    icon: GlobeIcon,
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Uses Google Gemini to generate text",
    icon: "/logos/gemini.svg",
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Uses OpenAI to generate text",
    icon: "/logos/openai.svg",
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Uses Anthropic to generate text",
    icon: "/logos/anthropic.svg",
  },
  {
    type: NodeType.DISCORD,
    label: "Discord",
    description: "Sende a message to discord",
    icon: "/logos/discord.svg",
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a message to a Slack channel",
    icon: "/logos/slack.svg",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      // Adım 1: MANUAL_TRIGGER'a özel kontroller
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const hasManualTrigger = getNodes().some(
          (node) => node.type === NodeType.MANUAL_TRIGGER
        );
        if (hasManualTrigger) {
          toast.error("A workflow can only have one manual trigger.");
          return; // İşlemi durdur
        }
      }

      // Adım 2: Tüm node'lar için ortak ekleme mantığı
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const flowPosition = screenToFlowPosition({
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
      });

      const newNode = {
        id: createId(),
        data: {},
        position: flowPosition,
        type: selection.type,
      };

      setNodes((nodes) => {
        const hasInitialNode = nodes.some(
          (node) => node.type === NodeType.INITIAL
        );
        const isTrigger = triggerNodes.some(
          (trigger) => trigger.type === selection.type
        );

        // Eğer sahnede "INITIAL" node'u varsa ve eklenen node bir "trigger" ise,
        // "INITIAL" node'unu yenisiyle değiştir.
        if (hasInitialNode && isTrigger) {
          return [newNode];
        }

        // Diğer tüm durumlarda, yeni node'u mevcut node'lara ekle.
        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [getNodes, onOpenChange, screenToFlowPosition, setNodes]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {/* Başlığı ve açıklamayı, hem trigger hem execution node'larını kapsayacak şekilde güncelleyelim. */}
        <SheetHeader>
          <SheetTitle>Add a Node</SheetTitle>
          <SheetDescription>
            Select a trigger to start your workflow or an action to continue it.
          </SheetDescription>
        </SheetHeader>
        {/* Trigger Nodes */}
        <p className="px-4 pt-4 text-sm font-semibold text-muted-foreground">
          TRIGGERS
        </p>
        <div>
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-4 px-4 rounded-none cursor-pointer flex items-center gap-4 hover:bg-accent"
                onClick={() => handleNodeSelect(nodeType)}
              >
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={nodeType.label}
                    width={24}
                    height={24}
                    className="object-contain rounded-sm"
                  />
                ) : (
                  <Icon className="size-6" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium text-sm">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <Separator />
        {/* Execution Nodes */}
        <p className="px-4 pt-4 text-sm font-semibold text-muted-foreground">
          ACTIONS
        </p>
        <div>
          {executionNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-4 px-4 rounded-none cursor-pointer flex items-center gap-4 hover:bg-accent"
                onClick={() => handleNodeSelect(nodeType)}
              >
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={nodeType.label}
                    width={24}
                    height={24}
                    className="object-contain rounded-sm"
                  />
                ) : (
                  <Icon className="size-6" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium text-sm">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
