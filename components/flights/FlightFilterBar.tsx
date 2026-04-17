'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';

type FlightType = 'PIC' | 'DUAL' | 'SOLO';

export function FlightFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [flightType, setFlightType] = useState<FlightType | ''>(
    (searchParams.get('flightType') as FlightType) || '',
  );
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  const updateUrlParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParamsString);
      let changed = false;

      Object.entries(updates).forEach(([key, value]) => {
        const existing = params.get(key);
        if (value) {
          if (existing !== value) {
            params.set(key, value);
            changed = true;
          }
        } else if (existing !== null) {
          params.delete(key);
          changed = true;
        }
      });

      if (!changed) return;

      const query = params.toString();
      router.replace(query ? `?${query}` : '?', { scroll: false });
    },
    [searchParamsString, router],
  );

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams({ search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateUrlParams]);

  const handleFlightTypeChange = (value: string) => {
    if (value === 'ALL') {
      setFlightType('');
      updateUrlParams({ flightType: '' });
      return;
    }

    setFlightType(value as FlightType);
    updateUrlParams({ flightType: value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    updateUrlParams({ startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    updateUrlParams({ endDate: e.target.value });
  };

  const handleReset = () => {
    setSearch('');
    setFlightType('');
    setStartDate('');
    setEndDate('');
    router.push(window.location.pathname, { scroll: false });
  };

  const hasActiveFilters = search || flightType || startDate || endDate;

  return (
    <GlassCard className="border-blue-500/10 shadow-xl overflow-visible">
      <div className="p-4 md:p-6 space-y-4">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Search Section - Dominant on all screens */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-3 h-3 text-blue-500" />
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Log Search</label>
            </div>
            <Input
              placeholder="Filter by route, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 bg-zinc-950/40 border-zinc-800 focus:border-blue-500/50 transition-all text-xs"
            />
          </div>

          {/* Configuration / Type Select */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-3 h-3 text-zinc-500" />
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operation Type</label>
            </div>
            <Select value={flightType} onValueChange={handleFlightTypeChange}>
              <SelectTrigger className="h-10 bg-zinc-950/40 border-zinc-800 text-xs text-zinc-300">
                <SelectValue placeholder="All Operations" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="ALL">ALL OPERATIONS</SelectItem>
                <SelectItem value="PIC">PIC (COMMAND)</SelectItem>
                <SelectItem value="DUAL">DUAL (INSTRUCTION)</SelectItem>
                <SelectItem value="SOLO">SOLO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Group */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">From</label>
              </div>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="h-10 bg-zinc-950/40 border-zinc-800 text-xs text-zinc-300 invert-calendar"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block opacity-0">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="h-10 bg-zinc-950/40 border-zinc-800 text-xs text-zinc-300 invert-calendar"
              />
            </div>
          </div>
        </div>

        {/* Action Bar / Status */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Active Sync Status: Online</span>
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={handleReset} 
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:bg-blue-500/5 gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
