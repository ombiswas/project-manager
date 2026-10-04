import React from "react";

interface TopProgressBarProps {
  label?: string;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  label = "Updating...",
}) => (
  <div
    role="progressbar"
    aria-label={label}
    className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-transparent via-[#ff7a17] to-transparent animate-pulse"
  />
);
