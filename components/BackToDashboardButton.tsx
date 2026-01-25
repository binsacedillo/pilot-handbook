import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  return (
    <Button asChild variant="outline">
      <Link href="/dashboard">
        ← Back to Dashboard
      </Link>
    </Button>
  );
}
