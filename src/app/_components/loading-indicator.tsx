import { cn } from "~/lib/utils";

const LoadingIndicator = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default LoadingIndicator;

export const PageLoadingIndicator = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingIndicator />
    </div>
  );
};
