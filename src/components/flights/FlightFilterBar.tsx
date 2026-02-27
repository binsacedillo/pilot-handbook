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
    <div className="flex flex-wrap items-end gap-4 rounded-lg border-2 border-blue-400 dark:border-blue-500 bg-card p-4 shadow">
      {/* Search Input */}
      <div className="flex-1 min-w-50">
        <label className="text-sm font-medium mb-1.5 block">Search</label>
        <Input
          placeholder="Search flights, routes, remarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Flight Type Select */}
      <div className="w-45">
        <label className="text-sm font-medium mb-1.5 block">Flight Type</label>
        <Select value={flightType} onValueChange={handleFlightTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="PIC">PIC</SelectItem>
            <SelectItem value="DUAL">DUAL</SelectItem>
            <SelectItem value="SOLO">SOLO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="w-40">
        <label className="text-sm font-medium mb-1.5 block">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="w-full"
        />
      </div>

      {/* End Date */}
      <div className="w-40">
        <label className="text-sm font-medium mb-1.5 block">End Date</label>
        <Input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="w-full"
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={handleReset} className="h-10">
          Reset
        </Button>
      )}
    </div>
  );
}
