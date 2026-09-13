/* filepath: components/layout/Container.tsx */
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "small" | "large";
}

const SIZE_CLASSES = {
  default: "max-w-7xl",
  small: "max-w-4xl",
  large: "max-w-screen-2xl",
};

export function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
