import { useState } from "react";
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
import { Intake } from "@/types";

export interface CredentialType {
  studentId: string;
  scholar: boolean;
  registrationFee: boolean;
  firstInstallmentFee: boolean;
  nrcCopy: boolean;
  censusCopy: boolean;
  passportPhoto: boolean;
  educationCertificate: boolean;
}

interface ReactivateModalProps {
  intakes: Intake[];
  credential: CredentialType;
  onReactivate: (
    credential: CredentialType,
    remark: string,
    intakeId: string,
  ) => void;
}

export function ReactivateModal({
  intakes,
  credential,
  onReactivate,
}: ReactivateModalProps) {
  const [selectedIntake, setSelectedIntake] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const remark = formData.get("remarks") as string;

    if (!selectedIntake) {
      alert("Please select an intake");
      return;
    }

    onReactivate(credential, remark, selectedIntake);
    setSelectedIntake("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full shadow-md bg-primary hover:shadow-primary/20 transition-all font-bold text-xs uppercase tracking-widest"
        >
          Re-activate Student
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card/95">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reactivate Student</DialogTitle>
            <DialogDescription>
              Select the new intake and add any necessary notes to reactivate
              this student.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4 space-y-4">
            <Field>
              <Label htmlFor="intake" className="mb-2 block">
                Intake
              </Label>
              <select
                id="intake"
                required
                value={selectedIntake}
                onChange={(e) => setSelectedIntake(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Select an intake
                </option>
                {intakes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Reason for reactivation..."
                className="mt-2"
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Confirm Reactivation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
