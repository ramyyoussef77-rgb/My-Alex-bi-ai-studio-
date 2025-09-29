import React from 'react';

const InsightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="2" />
    <path d="M12 8V2" />
    <path d="M12 22v-6" />
    <path d="M22 12h-6" />
    <path d="M8 12H2" />
    <path d="m19.07 4.93-4.24 4.24" />
    <path d="m9.17 14.83-4.24 4.24" />
    <path d="m19.07 19.07-4.24-4.24" />
    <path d="m9.17 9.17-4.24-4.24" />
  </svg>
);

export default InsightIcon;
