"use client";
import dynamic from "next/dynamic";
const AppHeader = dynamic(() => import("./AppHeader"), {
  ssr: false,
  loading: () => <div className="h-16 bg-gray-200 animate-pulse rounded" />,
});
export default AppHeader;
