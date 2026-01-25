// Import navigation hooks from Next.js
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// Import TRPC client for API calls
import { trpc } from '@/trpc/client';
// Import UI components for the select dropdown
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// FlightFilterBar displays a dropdown to filter flights by aircraft
export default function FlightFilterBar() {
  // Get router and current path info
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Fetch user's aircraft list from API
  const { data: aircraftList } = trpc.flight.getUserAircraft.useQuery();

  return (
    // Dropdown select for aircraft filter
    <Select
      // When the selected value changes, update the URL query params
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        // If a specific aircraft is selected, set its ID in the params
        if (value && value !== 'ALL') params.set('aircraftId', value);
        // If 'All Aircraft' is selected, remove the filter
        else params.delete('aircraftId');
        // Navigate to the new URL with updated params
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      {/* Trigger button for the dropdown - responsive width */}
      <SelectTrigger className="w-full sm:w-45">
        {/* Placeholder text for the dropdown */}
        <SelectValue placeholder="Select Aircraft" />
      </SelectTrigger>
      {/* Dropdown content with aircraft options */}
      <SelectContent>
        {/* Option to show all aircraft */}
        <SelectItem value="ALL">All Aircraft</SelectItem>
        {/* List user's aircraft as options */}
        {aircraftList?.map((item) => (
          <SelectItem key={item.aircraft.id} value={item.aircraft.id}>
            {/* Show registration and model */}
            {item.aircraft.registration} ({item.aircraft.model})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
