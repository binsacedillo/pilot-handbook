'use client';

import { trpc } from '@/trpc/client';
import SettingsSkeleton from '@/components/SettingsSkeleton';
import { SettingsForm } from '@/components/SettingsForm';

/**
 * Settings Page - Data Fetching Layer
 * 
 * This component handles ONLY data fetching and loading states.
 * The actual form logic is delegated to SettingsForm component.
 * This separation ensures clean component mounting with synchronized data.
 */
export default function SettingsPage() {
  const { data: preferences, isLoading: preferencesLoading } = trpc.preferences.getPreferences.useQuery();
  const { data: aircraft, isLoading: aircraftLoading } = trpc.aircraft.getAll.useQuery();

  // Wait for both queries to complete before rendering the form
  if (preferencesLoading || aircraftLoading || !preferences || !aircraft) {
    return <SettingsSkeleton />;
  }

  // ✅ Pass data to child. The child will mount ONLY when data exists.
  return <SettingsForm initialData={preferences} aircraft={aircraft} />;
}
