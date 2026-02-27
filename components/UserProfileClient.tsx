"use client";
import dynamic from "next/dynamic";
const UserProfileClient = dynamic(() => import("@clerk/nextjs").then(mod => mod.UserProfile), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded" />,
});
export default UserProfileClient;
