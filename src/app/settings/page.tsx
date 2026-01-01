
import { UserProfile } from '@clerk/nextjs';
import dynamic from "next/dynamic";

const AdminTools = dynamic(() => import("./AdminTools"), { ssr: false });

export default function SettingsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="w-full max-w-md">
        <UserProfile />
      </div>
      <AdminTools />
    </main>
  );
}
