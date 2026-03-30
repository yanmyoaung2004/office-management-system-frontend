import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ConfirmationPopupProps {
  itemId: string;
  onButtonText: string;
  onButtonVariant:
    | "outline"
    | "ghost"
    | "link"
    | "default"
    | "destructive"
    | "secondary";
  primaryText: string;
  description: string;
  onCancelButtonText: string;
  onAllowButtonText: string;
  buttonIcon: LucideIcon;
  buttonClass: string;
  iconClass: string;
  onCancel: () => void;
  onAllow: (id: string) => void;
}

export function ConfirmationPopup({
  itemId,
  onButtonText,
  onButtonVariant,
  primaryText,
  description,
  onCancelButtonText,
  onAllowButtonText,
  onCancel,
  onAllow,
  buttonIcon: Icon,
  buttonClass,
  iconClass,
}: ConfirmationPopupProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant={`${onButtonVariant}`}
          className={`${buttonClass}`}
        >
          <Icon className={`${iconClass}`} />
          {onButtonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{primaryText}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={"outline"} onClick={onCancel}>
            {onCancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600/80 hover:bg-red-700/90"
            onClick={() => onAllow(itemId)}
          >
            {onAllowButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
