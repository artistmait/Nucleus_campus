import React from "react";

export function Card({
  children,
  className = "",
  style = {},
  onClick,
}) {
  return (
    <div
      className={`rounded-lg border bg-white ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-b ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-t ${className}`}>
      {children}
    </div>
  );
}
