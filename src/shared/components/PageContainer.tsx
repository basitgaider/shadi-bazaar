import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Optional extra class for background or spacing (e.g. bg-gray-50, py-12). */
  className?: string;
}

/**
 * Standard page wrapper: max-width container + horizontal padding.
 * Use for all main content pages for consistent layout.
 */
export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`.trim()}>
      {children}
    </div>
  );
}
