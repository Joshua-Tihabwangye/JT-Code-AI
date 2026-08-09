import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, description, children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            ref={ref}
            className={clsx(
              'relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg transition-all',
              className
            )}
            {...props}
          >
            {(title || description) && (
              <div className="mb-4">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';