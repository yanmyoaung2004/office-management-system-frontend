import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

export type DropoutType = "Interrupted" | "Dropout";

interface DropoutModalProps {
  type: DropoutType;
  enrollmentId: string;
  onDropout?: (
    enrollmentId: string,
    reason: string,
    remark: string,
    type: DropoutType,
    followUpDate: string,
  ) => void;
}

export function DropoutModal({
  type,
  enrollmentId,
  onDropout,
}: DropoutModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const reason = formData.get("reason") as string;
    const remark = formData.get("remarks") as string;
    const followUpDate = formData.get("followUpDate") as string;
    onDropout?.(enrollmentId, reason, remark, type, followUpDate);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={type === "Interrupted" ? "default" : "outline"}
          className={`${
            type === "Interrupted"
              ? "w-full shadow-md bg-primary hover:shadow-primary/20 transition-all font-bold text-xs uppercase tracking-widest"
              : "w-full text-destructive hover:bg-destructive/80 font-bold text-xs uppercase tracking-widest border-destructive/20"
          }`}
        >
          {type === "Interrupted" ? "Mark Interrupt" : "Mark Dropout"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card/95">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="">
              {type === "Interrupted"
                ? "Confirm Student Interruption"
                : "Confirm Student Dropout"}
            </DialogTitle>
            <DialogDescription>
              {type === "Interrupted"
                ? "Are you sure you want to mark this student as interrupted?"
                : "Are you sure you want to mark this student as dropped out?"}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="reason">Primary Reason for Withdrawal</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="e.g., Financial issues, transfer to another school..."
                required
              />
            </Field>
            <Field>
              <Label htmlFor="remarks">Administrative Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Internal notes for office use only"
              />
            </Field>
            <Field>
              <Label htmlFor="remarks">Follow Up Date</Label>
              <Input
                name="followUpDate"
                id="followUpDate"
                type="date"
                required
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-3">
            <DialogClose asChild className="">
              <Button
                type="button"
                variant="ghost"
                className="hover:bg-primary/80"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              Confirm Dropout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
