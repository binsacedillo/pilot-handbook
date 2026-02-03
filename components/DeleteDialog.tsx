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
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void> | void;
  /** Require user to type this text to confirm deletion (e.g., "DELETE") */
  requireConfirmText?: string;
  /** Custom label for the confirm button */
  confirmLabel?: string;
  /** Button variant for the confirm action */
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Optional class for the title */
  titleClassName?: string;
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
      requireConfirmText,
      confirmLabel = "Delete",
      confirmVariant = "destructive",
      titleClassName = "text-destructive",
    },
    ref
  ) => {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState("");

    // Reset confirmation text when dialog opens/closes
    React.useEffect(() => {
      if (!open) {
        setConfirmText("");
      }
    }, [open]);

    const isConfirmTextValid = !requireConfirmText || confirmText === requireConfirmText;

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
          className="sm:max-w-106.25 bg-card text-card-foreground"
        >
          <DialogHeader>
            <DialogTitle className={titleClassName}>{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            {description}
            {itemName && (
              <span className="font-semibold text-foreground"> &quot;{itemName}&quot;</span>
            )}
            {itemName && <span>?</span>}
          </DialogDescription>

          {requireConfirmText && (
            <div className="space-y-2 pb-4">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Type <span className="font-bold text-destructive">{requireConfirmText}</span> to confirm:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requireConfirmText}
                className="font-mono"
                autoComplete="off"
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting || isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={handleDelete}
              disabled={isDeleting || isLoading || !isConfirmTextValid}
            >
              {isDeleting ? "Working..." : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteDialog.displayName = "DeleteDialog";
