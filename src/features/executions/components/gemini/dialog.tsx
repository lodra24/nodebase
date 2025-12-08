"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const AVAILABLE_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-tts",
  "gemini-2.5-flash",
  "gemini-robotics-er-1.5-preview",
  "gemma-3-12b",
  "gemma-3-1b",
  "gemma-3-27b",
  "gemma-3-2b",
  "gemma-3-4b",
  "gemini-2.5-flash-live",
  "gemini-2.5-flash-native-audio-dialog",
  "gemini-2.0-flash-live",
] as const;

const DEFAULT_MODEL: (typeof AVAILABLE_MODELS)[number] = "gemma-3-27b";

const resolveModel = (value?: string): (typeof AVAILABLE_MODELS)[number] =>
  (AVAILABLE_MODELS as readonly string[]).includes(value || "")
    ? (value as (typeof AVAILABLE_MODELS)[number])
    : DEFAULT_MODEL;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required!" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers and underscores.",
    }),
  model: z.enum(AVAILABLE_MODELS),
  credentialId: z.string().min(1, "Credential is Required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  body: z.string().optional(), //.refine()
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GEMINI);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      model: resolveModel(defaultValues.model),
      credentialId: defaultValues.credentialId || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        model: resolveModel(defaultValues.model),
        credentialId: defaultValues.credentialId || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [
    open,
    defaultValues.variableName,
    defaultValues.model,
    defaultValues.systemPrompt,
    defaultValues.userPrompt,
    defaultValues.credentialId,
    form,
  ]);

  const watchVariableName = form.watch("variableName") || "myGemini";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default uses high-quota Gemma. Choose Flash models if you
                    need them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/logos/gemini.svg"
                              alt="Gemini"
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                            <span>{option.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="myGemini" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.aiResponse}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] font-mono text-sm"
                      placeholder={"You`re helpful assistant"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sets the behavior of the assistant. Use{" "}
                    <code className="bg-muted px-1 rounded">
                      {"{{variables}}"}
                    </code>{" "}
                    for simple values or{" "}
                    <code className="bg-muted px-1 rounded">
                      {"{{json variable}}"}
                    </code>{" "}
                    to stringify objects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] font-mono text-sm"
                      placeholder={
                        "Summarize this text: {{json.httpResponse.data}} "
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The prompt to send to the AI. Use{" "}
                    <code className="bg-muted px-1 rounded">
                      {"{{variables}}"}
                    </code>{" "}
                    for simple values or{" "}
                    <code className="bg-muted px-1 rounded">
                      {"{{json variable}}"}
                    </code>{" "}
                    to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
