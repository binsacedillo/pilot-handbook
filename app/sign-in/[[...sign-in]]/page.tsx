import { SignIn } from "@clerk/nextjs";

// ✅ CORRECT: No arguments (props) are passed to the function.
// We let Clerk handle the redirects internally.
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        path="/sign-in" 
        forceRedirectUrl="/dashboard" 
      />
    </div>
  );
}