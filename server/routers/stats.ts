import { createTRPCRouter, protectedProcedure } from '../trpc';

export const statsRouter = createTRPCRouter({
  // Get hours by aircraft type (Pie chart data)
  getHoursByType: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }

      const stats = await ctx.db.flight.groupBy({
        by: ['aircraftId'],
        _sum: { duration: true },
        where: { userId: ctx.user.id },
      });

    // Join with aircraft to get aircraft names
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        const aircraft = await ctx.db.aircraft.findUnique({
          where: { id: stat.aircraftId },
          select: { model: true },
        });
        return {
          aircraftId: stat.aircraftId,
          aircraftName: aircraft?.model || 'Unknown',
          totalHours: stat._sum.duration || 0,
        };
      })
    );

    return enrichedStats;
  }),

  // Get hours by month (Bar chart data - last 12 months)
  getHoursByMonth: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }

      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const flights = await ctx.db.flight.findMany({
        where: {
          userId: ctx.user.id,
          date: {
            gte: twelveMonthsAgo,
          },
        },
        select: {
          date: true,
          duration: true,
        },
      });

    // Group flights by month
    const monthlyData: Record<string, number> = {};

    // Initialize all months with 0 hours
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[monthKey] = 0;
    }

    // Aggregate flight hours by month
    flights.forEach((flight) => {
      const monthKey = new Date(flight.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (flight.duration || 0);
    });

    // Convert to array and reverse to get chronological order
    return Object.entries(monthlyData)
      .map(([month, hours]) => ({
        month,
        hours,
      }))
      .reverse();
  }),

  // Get total stats summary
  getSummary: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return {
          totalHours: 0,
          totalFlights: 0,
          averageFlightHours: 0,
        };
      }

      const flights = await ctx.db.flight.findMany({
        where: { userId: ctx.user.id },
        select: { duration: true, date: true },
      });

    const totalHours = flights.reduce((sum, flight) => sum + (flight.duration || 0), 0);
    const totalFlights = flights.length;
    const averageFlightHours = totalFlights > 0 ? (totalHours / totalFlights).toFixed(2) : 0;

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalFlights,
      averageFlightHours: parseFloat(averageFlightHours as string),
    };
  }),
});
