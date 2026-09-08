import React from 'react';

/**
 * LinkedIn brand mark. lucide-react 1.0 dropped every brand icon (the former
 * `Linkedin` export); this keeps the same 24×24 stroke-based drawing so the
 * CRM menu and the LinkedIn page look unchanged. Accepts the same props a
 * lucide icon does (className, size, aria-*).
 */
export interface LinkedinIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function LinkedinIcon({ size = 24, className, ...rest }: LinkedinIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={rest['aria-label'] ? undefined : true}
      {...rest}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
