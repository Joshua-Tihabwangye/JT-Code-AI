import { createContext, useContext, useState, type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  defaultValue?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, children, defaultValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || value);
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange(newValue);
    };

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={clsx('', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
      role="tablist"
      aria-orientation="horizontal"
      {...props}
    >
      {children}
    </div>
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { value: currentValue, onValueChange } = useTabsContext();
    const isActive = currentValue === value;

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-background text-foreground shadow-sm'
            : 'data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground',
          className
        )}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-content-${value}`}
        id={`tabs-trigger-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        disabled={disabled}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const { value: currentValue } = useTabsContext();
    const isActive = currentValue === value;

    if (!forceMount && !isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        role="tabpanel"
        aria-labelledby={`tabs-trigger-${value}`}
        id={`tabs-content-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        data-orientation="horizontal"
        hidden={!isActive}
        {...props}
      >
        {isActive && children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';