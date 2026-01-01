import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void> | void;
}

export const DeleteDialog = React.forwardRef<HTMLDivElement, DeleteDialogProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      itemName,
      isLoading = false,
      onConfirm,
    },
    ref
  ) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
      try {
        setIsDeleting(true);
        await onConfirm();
        onOpenChange(false);
      } catch (error) {
        console.error("Delete error:", error);
        // Dialog stays open on error
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          className="sm:max-w-[425px] bg-card text-card-foreground"
        >
          <DialogHeader>
            <DialogTitle className="text-destructive">{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            {description}
            {itemName && (
              <span className="font-semibold text-foreground"> &quot;{itemName}&quot;</span>
            )}
            {itemName && <span>?</span>}
          </DialogDescription>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting || isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteDialog.displayName = "DeleteDialog";
