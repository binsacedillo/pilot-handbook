'use client';


import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UnitSystem, Theme } from '@prisma/client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import SettingsSkeleton from '@/components/SettingsSkeleton';
import { z } from 'zod';


const preferencesSchema = z.object({
  theme: z.nativeEnum(Theme),
  unitSystem: z.nativeEnum(UnitSystem),
  currency: z.string().length(3, 'Currency must be 3 letters'),
  defaultAircraftId: z.string().nullable(),
});

function SettingsPage() {
  // Form state
  type PreferencesForm = {
    theme: Theme;
    unitSystem: UnitSystem;
    currency: string;
    defaultAircraftId: string | null;
  };
  const [form, setForm] = useState<PreferencesForm | null>(null);

  // Data
  const { data: prefs, isLoading } = trpc.preferences.getPreferences.useQuery();
  const { data: aircraft } = trpc.aircraft.getAll.useQuery();
  const utils = trpc.useContext();

  // Initialize form state from prefs on first load
  useEffect(() => {
    if (prefs && !form) {
      setForm({
        theme: prefs.theme as Theme || Theme.SYSTEM,
        unitSystem: prefs.unitSystem as UnitSystem || UnitSystem.METRIC,
        currency: prefs.currency || 'USD',
        defaultAircraftId: prefs.defaultAircraftId || null,
      });
    }
  }, [prefs, form]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Removed unused optimisticPrefs


  const updateMutation = trpc.preferences.updatePreferences.useMutation({
    onSuccess: () => {
      utils.preferences.getPreferences.invalidate();
    },
  });

  const handleChange = <K extends keyof PreferencesForm>(field: K, value: PreferencesForm[K]) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = () => {
    if (!form) return;
    const result = preferencesSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
      }
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    updateMutation.mutate(form);
  };

  const hasChanges = prefs && form && (
    form.theme !== prefs.theme ||
    form.unitSystem !== prefs.unitSystem ||
    form.currency !== prefs.currency ||
    form.defaultAircraftId !== prefs.defaultAircraftId
  );

  if (isLoading || !form) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>
            Customize your pilot handbook experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={form.theme} onValueChange={(value) => handleChange('theme', value as Theme)}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Theme.SYSTEM}>System</SelectItem>
                <SelectItem value={Theme.LIGHT}>Light</SelectItem>
                <SelectItem value={Theme.DARK}>Dark</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.theme && <p className="text-xs text-red-600">{formErrors.theme}</p>}
          </div>

          {/* Unit System */}
          <div className="space-y-2">
            <Label htmlFor="unitSystem">Unit System</Label>
            <Select value={form.unitSystem} onValueChange={(value) => handleChange('unitSystem', value as UnitSystem)}>
              <SelectTrigger id="unitSystem">
                <SelectValue placeholder="Select unit system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UnitSystem.METRIC}>Metric (km, kg)</SelectItem>
                <SelectItem value={UnitSystem.IMPERIAL}>Imperial (mi, lb)</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.unitSystem && <p className="text-xs text-red-600">{formErrors.unitSystem}</p>}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              type="text"
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={3}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Enter 3-letter currency code (e.g., USD, EUR, GBP)
            </p>
            {formErrors.currency && <p className="text-xs text-red-600">{formErrors.currency}</p>}
          </div>

          {/* Default Aircraft */}
          <div className="space-y-2">
            <Label htmlFor="defaultAircraft">Default Aircraft</Label>
            <Select
              value={form.defaultAircraftId || 'none'}
              onValueChange={(value) => handleChange('defaultAircraftId', value === 'none' ? null : value)}
            >
              <SelectTrigger id="defaultAircraft">
                <SelectValue placeholder="Select default aircraft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {aircraft?.map((ac) => (
                  <SelectItem key={ac.id} value={ac.id}>
                    {ac.registration} - {ac.make} {ac.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.defaultAircraftId && <p className="text-xs text-red-600">{formErrors.defaultAircraftId}</p>}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>

            {updateMutation.isSuccess && (
              <p className="text-sm text-green-600 mt-2 text-center">
                Preferences saved successfully!
              </p>
            )}

            {updateMutation.isError && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Error saving preferences. Please try again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
