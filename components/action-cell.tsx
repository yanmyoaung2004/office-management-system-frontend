"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch, Edit, MoreVertical, Trash2 } from "lucide-react";
import { ConfirmationPopup } from "./confirmation-popup";

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

            <ConfirmationPopup
              itemId={itemId}
              onAllow={onDelete}
              onCancel={() => {}}
              onButtonText="Delete"
              onButtonVariant="ghost"
              onAllowButtonText="Allow"
              onCancelButtonText="Don't allow"
              primaryText="Allow to delete?"
              description="Do you want to allow this intake to be deleted permanently?"
              buttonIcon={Trash2}
              buttonClass={
                "justify-start text-destructive hover:bg-destructive/80"
              }
              iconClass="h-4 w-4 mr-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
