"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileSearch, Edit, MoreVertical, Trash2 } from "lucide-react";

interface ActionCellProps {
  itemId: string;
  onDetail?: () => void;
  onDelete: (studentId: string) => void;
  onUpdate?: () => void;
}

export default function ActionCell({
  onDetail,
  onDelete,
  itemId,
  onUpdate,
}: ActionCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-primary hover:bg-primary/80"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-card shadow-lg z-50">
          <div className="flex flex-col gap-1 p-2">
            <Button
              onClick={() => {
                setIsOpen(false);
                onDetail?.();
              }}
              variant="ghost"
              size="sm"
              className="justify-start text-primary hover:bg-primary/80"
            >
              <FileSearch className="h-4 w-4 mr-2" />
              Detail
            </Button>

            <Button
              onClick={() => {
                setIsOpen(false);
                onUpdate?.();
              }}
              variant="ghost"
              size="sm"
              className="justify-start text-primary hover:bg-primary/80"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>

            <Button
              onClick={() => {
                setIsOpen(false);
                setShowDeleteConfirm(true);
              }}
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:bg-destructive/80"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Allow to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to allow this item to be deleted permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Don&apos;t allow
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(itemId)}>
              Allow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
