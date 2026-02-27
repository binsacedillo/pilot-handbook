'use client';

import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UnitSystem, Theme } from '@prisma/client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/toast';
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from '@/lib/error-utils';

const preferencesSchema = z.object({
    theme: z.nativeEnum(Theme),
    unitSystem: z.nativeEnum(UnitSystem),
    currency: z.string().length(3, 'Currency must be 3 letters'),
    defaultAircraftId: z.string().nullable(),
    favoriteAirport: z.string().min(4).max(4).toUpperCase().nullable(),
});

type PreferencesForm = {
    theme: Theme;
    unitSystem: UnitSystem;
    currency: string;
    defaultAircraftId: string | null;
    favoriteAirport: string | null;
};

type UserPreferences = {
    theme: Theme;
    unitSystem: UnitSystem;
    currency: string;
    defaultAircraftId: string | null;
    favoriteAirport: string | null;
    id?: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type Aircraft = {
    id: string;
    registration: string;
    make: string;
    model: string;
};

interface SettingsFormProps {
    initialData: UserPreferences;
    aircraft: Aircraft[];
}

export function SettingsForm({ initialData, aircraft }: SettingsFormProps) {
    // Theme hook for immediate application
    const { setTheme } = useTheme();
    const { showToast } = useToast();

    // Initialize form state DIRECTLY from props - no useEffect needed!
    const [form, setForm] = useState<PreferencesForm>({
        theme: initialData.theme,
        unitSystem: initialData.unitSystem,
        currency: initialData.currency,
        favoriteAirport: initialData.favoriteAirport,
        defaultAircraftId: initialData.defaultAircraftId,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const utils = trpc.useContext();
    const updateMutation = trpc.preferences.updatePreferences.useMutation({
        onSuccess: () => {
            utils.preferences.getPreferences.invalidate();
            showToast("Settings saved successfully!", "success");
        },
        onError: (err, variables) => {
            const errorMessage = isNetworkError(err)
                ? getNetworkErrorMessage("save settings")
                : getServerErrorMessage("save settings", err);
            showToast(errorMessage, "error", {
                action: {
                    label: "Retry",
                    onClick: () => updateMutation.mutate(variables),
                },
            });
        },
    });

    const handleChange = <K extends keyof PreferencesForm>(field: K, value: PreferencesForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
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

        // Apply theme immediately for instant visual feedback
        const themeValue = form.theme.toLowerCase();
        setTheme(themeValue);

        // Save to database
        updateMutation.mutate(form);
    };

    const hasChanges = (
        form.theme !== initialData.theme ||
        form.unitSystem !== initialData.unitSystem ||
        form.currency !== initialData.currency ||
        form.favoriteAirport !== initialData.favoriteAirport ||
        form.defaultAircraftId !== initialData.defaultAircraftId
    );

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

                    {/* Favorite Airport */}
                    <div className="space-y-2">
                        <Label htmlFor="favoriteAirport">Favorite Airport (Weather Widget)</Label>
                        <Input
                            id="favoriteAirport"
                            type="text"
                            value={form.favoriteAirport || ''}
                            onChange={(e) => handleChange('favoriteAirport', e.target.value.toUpperCase() || null)}
                            placeholder="KJFK"
                            maxLength={4}
                            className="uppercase"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter 4-letter ICAO airport code (e.g., KJFK, EGLL, YSSY)
                        </p>
                        {formErrors.favoriteAirport && <p className="text-xs text-red-600">{formErrors.favoriteAirport}</p>}
                    </div>

                    {/* 
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
