'use client';

import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { UnitSystem, Theme } from '@prisma/client';
import { useState } from 'react';
import { Loader2, Monitor, Globe, Plane, Banknote, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/toast';
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from '@/lib/error-utils';
import { cn } from '@/lib/utils';

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
    const { setTheme } = useTheme();
    const { showToast } = useToast();

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
            showToast("System configurations committed successfully", "success");
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
        setTheme(form.theme.toLowerCase());
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
        <div className="space-y-8 pb-10">
            {/* Header / Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GlassCard className="border-l-4 border-l-primary" bezel={false}>
                    <GlassCardContent className="py-4">
                        <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Active Profile</p>
                        <p className="text-lg font-bold tracking-tight uppercase italic italic">Primary Aviator</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard className="border-l-4 border-l-emerald-500" bezel={false}>
                    <GlassCardContent className="py-4">
                        <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Unit System</p>
                        <p className="text-lg font-bold tracking-tight uppercase italic">{form.unitSystem}</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard className="hidden lg:block border-l-4 border-l-blue-500" bezel={false}>
                    <GlassCardContent className="py-4">
                        <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Timezone</p>
                        <p className="text-lg font-bold tracking-tight uppercase italic">UTC / ZULU</p>
                    </GlassCardContent>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Interface & Theme Section */}
                <GlassCard className="animate-entry [animation-delay:200ms]">
                    <GlassCardHeader className="flex flex-row items-center gap-3">
                        <Monitor className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-bold uppercase tracking-tight text-sm">Interface Control</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Visual Calibration</p>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="theme" className="text-xs uppercase font-mono text-muted-foreground">Master Appearance</Label>
                            <Select value={form.theme} onValueChange={(value) => handleChange('theme', value as Theme)}>
                                <SelectTrigger id="theme" className="bg-muted/10 border-muted-foreground/20 focus:ring-primary h-11">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent className="bg-(--glass-bg) backdrop-blur-xl border-(--glass-border)">
                                    <SelectItem value={Theme.SYSTEM}>System Default</SelectItem>
                                    <SelectItem value={Theme.LIGHT}>Day Mode (High Contrast)</SelectItem>
                                    <SelectItem value={Theme.DARK}>Night Mode (Reduced Glare)</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.theme && <p className="text-xs text-red-500 font-mono mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.theme}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitSystem" className="text-xs uppercase font-mono text-muted-foreground">Metric Configuration</Label>
                            <Select value={form.unitSystem} onValueChange={(value) => handleChange('unitSystem', value as UnitSystem)}>
                                <SelectTrigger id="unitSystem" className="bg-muted/10 border-muted-foreground/20 focus:ring-primary h-11">
                                    <SelectValue placeholder="Select unit system" />
                                </SelectTrigger>
                                <SelectContent className="bg-(--glass-bg) backdrop-blur-xl border-(--glass-border)">
                                    <SelectItem value={UnitSystem.METRIC}>Metric (KM, KG, MB)</SelectItem>
                                    <SelectItem value={UnitSystem.IMPERIAL}>Imperial (NM, LB, INHG)</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.unitSystem && <p className="text-xs text-red-500 font-mono mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.unitSystem}</p>}
                        </div>
                    </GlassCardContent>
                </GlassCard>

                {/* Operations & Logistics Section */}
                <GlassCard className="animate-entry [animation-delay:300ms]">
                    <GlassCardHeader className="flex flex-row items-center gap-3">
                        <Plane className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-bold uppercase tracking-tight text-sm">Operational Parameters</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Fleet & Navigation Defaults</p>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="defaultAircraft" className="text-xs uppercase font-mono text-muted-foreground">Primary Airframe</Label>
                            <Select
                                value={form.defaultAircraftId || 'none'}
                                onValueChange={(value) => handleChange('defaultAircraftId', value === 'none' ? null : value)}
                            >
                                <SelectTrigger id="defaultAircraft" className="bg-muted/10 border-muted-foreground/20 focus:ring-primary h-11">
                                    <SelectValue placeholder="Select default aircraft" />
                                </SelectTrigger>
                                <SelectContent className="bg-(--glass-bg) backdrop-blur-xl border-(--glass-border)">
                                    <SelectItem value="none">Undefined / Rotate As Needed</SelectItem>
                                    {aircraft?.map((ac) => (
                                        <SelectItem key={ac.id} value={ac.id}>
                                            {ac.registration} - {ac.make} {ac.model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="favoriteAirport" className="text-xs uppercase font-mono text-muted-foreground">Base of Operations (ICAO)</Label>
                            <Input
                                id="favoriteAirport"
                                type="text"
                                value={form.favoriteAirport || ''}
                                onChange={(e) => handleChange('favoriteAirport', e.target.value.toUpperCase() || null)}
                                placeholder="ICAO CODE"
                                maxLength={4}
                                className="uppercase font-mono tracking-widest h-11 bg-muted/10 border-muted-foreground/20 focus:border-primary focus:ring-primary"
                            />
                            {formErrors.favoriteAirport && <p className="text-xs text-red-500 font-mono mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.favoriteAirport}</p>}
                        </div>
                    </GlassCardContent>
                </GlassCard>

                {/* Economics Section */}
                <GlassCard className="animate-entry [animation-delay:400ms]">
                    <GlassCardHeader className="flex flex-row items-center gap-3">
                        <Banknote className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-bold uppercase tracking-tight text-sm">International Economics</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Currency & Transaction Formats</p>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent className="py-6">
                        <div className="space-y-2 max-w-sm">
                            <Label htmlFor="currency" className="text-xs uppercase font-mono text-muted-foreground">Flight Accounting Currency</Label>
                            <div className="relative">
                                <Input
                                    id="currency"
                                    type="text"
                                    value={form.currency}
                                    onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                                    placeholder="USD"
                                    maxLength={3}
                                    className="uppercase font-mono tracking-widest h-11 pl-10 bg-muted/10 border-muted-foreground/20 focus:border-primary focus:ring-primary"
                                />
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            </div>
                            {formErrors.currency && <p className="text-xs text-red-500 font-mono mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.currency}</p>}
                        </div>
                    </GlassCardContent>
                </GlassCard>
            </div>

            {/* Commit Changes Section */}
            <div className={cn(
                "sticky bottom-6 z-20 flex justify-center transition-all duration-500",
                !hasChanges ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
            )}>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                    className="relative overflow-hidden group h-14 px-8 rounded-2xl bg-primary text-black font-bold uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] animate-hud-shimmer"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Synchronizing Data...
                        </>
                    ) : (
                        <>
                            <Save className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                            Commit System Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Success Feedback Annunciator */}
            {updateMutation.isSuccess && (
                <div className="flex justify-center animate-entry">
                    <div className="px-6 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <CheckCircle2 className="h-4 w-4" />
                        Master Config Synchronized
                    </div>
                </div>
            )}
        </div>
    );
}
