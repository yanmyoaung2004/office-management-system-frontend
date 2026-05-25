"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { apiPost, apiPut } from "@/lib/api-client";
import type { FormConfig, FieldDef } from "@/types/forms";

interface EntityFormDialogProps<T extends FieldValues> {
  config: FormConfig<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<T>;
  isUpdate?: boolean;
  entityId?: string;
  onSuccess?: () => void;
}

function renderField<T extends FieldValues>(
  fieldDef: FieldDef<T>,
  form: ReturnType<typeof useForm<T>>,
) {
  const { name, label, type, required, placeholder, description } = fieldDef;

  if (type === "custom") {
    return fieldDef.render(form);
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FormLabel>
          <FormControl>
            {type === "select" ? (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={fieldDef.type === "select" && fieldDef.disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {(fieldDef as any).options.map(
                    (opt: { value: string; label: string }) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            ) : type === "textarea" ? (
              <textarea
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rows={(fieldDef as any).rows ?? 3}
                placeholder={placeholder}
                {...field}
              />
            ) : type === "checkbox" ? (
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={fieldDef.disabled}
                {...field}
                value={field.value ?? ""}
              />
            )}
          </FormControl>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EntityFormDialog<T extends FieldValues>({
  config,
  open,
  onOpenChange,
  initialData,
  isUpdate = false,
  entityId,
  onSuccess,
}: EntityFormDialogProps<T>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(config.schema as any) as any,
    defaultValues: { ...config.defaultValues, ...initialData } as any,
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);
      try {
        if (isUpdate && entityId && config.updateEndpoint) {
          await apiPut(config.updateEndpoint(entityId), data);
        } else {
          const response: any = await apiPost(config.createEndpoint, data);
          if (config.detailRoute && response?.data?.id) {
            router.push(config.detailRoute(response.data.id));
          }
        }
        toast.success(
          config.successMessage ??
            `${config.entityName} ${isUpdate ? "updated" : "created"} successfully`,
        );
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } catch {
        toast.error(
          config.errorMessage ??
            `Failed to ${isUpdate ? "update" : "create"} ${config.entityName.toLowerCase()}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      config,
      isUpdate,
      entityId,
      form,
      onOpenChange,
      onSuccess,
      router,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Edit" : "Create"} {config.entityName}
          </DialogTitle>
          {config.entityNamePlural && (
            <DialogDescription>
              Fill in the details below to{" "}
              {isUpdate ? "update" : "create a new"} {config.entityName.toLowerCase()}.
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-6"
          >
            {config.sections.map((section, si) => (
              <div key={si} className="space-y-4">
                {section.title && (
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                )}
                {section.description && (
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                )}
                <div
                  className={
                    section.columns === 2
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                      : "space-y-4"
                  }
                >
                  {section.fields.map((fieldDef) => (
                    <div
                      key={String(fieldDef.name)}
                      className={
                        (fieldDef as any).colSpan === 2
                          ? "sm:col-span-2"
                          : undefined
                      }
                    >
                      {fieldDef.type === "custom"
                        ? fieldDef.render(form as any)
                        : renderField(fieldDef, form as any)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : isUpdate
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
