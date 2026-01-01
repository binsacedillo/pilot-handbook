"use client";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";

export default function AdminTools() {
  const { user } = useUser();
  const [secret, setSecret] = useState("");

  const promote = trpc.user.claimAdmin.useMutation({
    onSuccess: () => {
      alert("🎉 You are now Admin! Refreshing...");
      window.location.reload();
    },
    onError: (err) => alert("Failed: " + err.message),
  });

  if (user?.publicMetadata?.role === "ADMIN") {
    return <div className="p-4 bg-green-100 text-green-800">✅ You are an Admin</div>;
  }

  return (
    <div className="p-6 border rounded-lg bg-gray-50 mt-8">
      <h2 className="font-bold mb-2">Dev Tools: Self-Promotion</h2>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="Secret Key"
          className="border p-2 rounded"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button
          onClick={() => promote.mutate({ secretKey: secret })}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={promote.isPending}
        >
          {promote.isPending ? "Upgrading..." : "Become Admin"}
        </button>
      </div>
    </div>
  );
}
