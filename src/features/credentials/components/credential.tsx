"use client";

import { CredentialType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(CredentialType),
  value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;
  const isPending = createCredential.isPending || updateCredential.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync(
        {
          id: initialData.id,
          ...values,
        },
        {
          onSuccess: () => {
            router.push("/credentials");
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess: () => {
          router.push("/credentials");
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your API key or credential details"
              : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Api Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                              <span>{option.label}</span>
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Your key is encrypted and stored securely.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                  )}
                  {isEdit ? "Save Changes" : "Create Credential"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};
