"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewAircraftPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createAircraft = trpc.aircraft.create.useMutation({
    onSuccess: async () => {
      await utils.aircraft.getAll.invalidate();
      router.push("/aircraft");
    },
  });

  const [form, setForm] = useState({
    make: "",
    model: "",
    registration: "",
    imageUrl: "",
    status: "operational",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createAircraft.mutate({
      make: form.make,
      model: form.model,
      registration: form.registration.toUpperCase(),
      imageUrl: form.imageUrl || undefined,
      status: form.status,
    });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      <main className="max-w-2xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Add Aircraft</h1>
        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration">Registration</Label>
              <Input id="registration" required value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full border rounded-md h-10 px-3"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={createAircraft.isPending}>
              {createAircraft.isPending ? "Saving…" : "Save Aircraft"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
      <AppFooter />
    </div>
  );
}
