import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function FlightFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: aircraftList } = trpc.flight.getUserAircraft.useQuery();

  return (
    <Select
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'ALL') params.set('aircraftId', value);
        else params.delete('aircraftId');
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Aircraft" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Aircraft</SelectItem>
        {aircraftList?.map((item) => (
          <SelectItem key={item.aircraft.id} value={item.aircraft.id}>
            {item.aircraft.registration} ({item.aircraft.model})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
