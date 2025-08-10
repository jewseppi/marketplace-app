import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
