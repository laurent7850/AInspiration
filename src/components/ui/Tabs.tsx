import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  className = '',
  children,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  return (
    <div className={`inline-flex items-center p-1 rounded-lg bg-gray-100 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  onClick?: () => void;
  children: React.ReactNode;
}

interface TabsTriggerPropsInternal {
  value: string;
  onClick?: () => void;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  onClick,
  children,
  ...props
}: any) => {
  // Get value and onValueChange from parent Tabs component
  const parentValue = props.value;
  const parentOnValueChange = props.onValueChange;

  const isActive = parentValue === value;

  const handleClick = () => {
    if (onClick) onClick();
    if (parentOnValueChange) parentOnValueChange(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-white text-indigo-600 shadow'
          : 'text-gray-600 hover:text-indigo-600'
      }`}
      aria-selected={isActive}
      role="tab"
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentPropsInternal {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, ...props }: any) => {
  // Get value from parent Tabs component
  const parentValue = props.value;

  // Only render content if this tab is active
  if (parentValue !== value) return null;

  return <div className="mt-2">{children}</div>;
};