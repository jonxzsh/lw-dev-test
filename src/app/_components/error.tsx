"use client";

import { StyledH3, StyledText } from "./typography";

const ErrorMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col">
      <StyledH3>An error occurred</StyledH3>
      <StyledText>{children}</StyledText>
    </div>
  );
};

export default ErrorMessage;
