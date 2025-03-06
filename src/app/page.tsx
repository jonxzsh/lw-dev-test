import Link from "next/link";
import { Button } from "~/components/ui/button";
import { StyledH2, StyledText } from "./_components/typography";

const Page = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <StyledH2>Backend Test App: Frontend Interface</StyledH2>
        <StyledText>
          This app is designed as a basic interface for the API
        </StyledText>
      </div>
      <div className="flex w-full max-w-80 flex-col gap-4 rounded-md border border-border p-4 shadow-sm">
        <Link href="/patient">
          <Button variant="outline" className="w-full">
            Access as Patient
          </Button>
        </Link>
        <Link href="/doctor">
          <Button className="w-full">Access as Doctor</Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
