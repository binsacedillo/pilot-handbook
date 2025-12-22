import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plane } from "lucide-react";

export default async function SignInPage() {
  const { userId } = await auth();

  // Avoid rendering the sign-in UI when already authenticated to silence Clerk's single-session warning
  if (userId) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Pilot Logbook</span>
          </div>
          
          <div className="mt-20">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome Back,<br />Captain
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Sign in to continue tracking your flight hours and aviation journey.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex gap-8 text-blue-100">
            <div>
              <div className="text-3xl font-bold text-white">10k+</div>
              <div className="text-sm">Active Pilots</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500k+</div>
              <div className="text-sm">Flights Logged</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Pilot Logbook</span>
            </div>
            <p className="text-gray-600">Track your flight hours efficiently</p>
          </div>
          
          <SignIn routing="hash" appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl border-0",
            }
          }} />
        </div>
      </div>
    </div>
  );
}