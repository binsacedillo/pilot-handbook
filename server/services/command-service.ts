import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { FlightCommand, AircraftCommand, updateFlightCommandSchema, createFlightCommandSchema, deleteFlightCommandSchema, updateAircraftCommandSchema, createAircraftCommandSchema, deleteAircraftCommandSchema } from "@/lib/shared-schemas";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-logger";

export const CommandService = {
  /**
   * Executes a Flight Command with server-side authority and concurrency control.
   */
  async updateFlight(db: any, userId: string, command: z.infer<typeof updateFlightCommandSchema>) {
    const { flightId, changes, clientVersion } = command;

    const flight = await db.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight || flight.userId !== userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Flight not found or unauthorized",
      });
    }

    if (flight.version !== clientVersion) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Version mismatch. Client has ${clientVersion}, but Server has ${flight.version}. Please refresh.`,
      });
    }

    const updatedFlight = await db.flight.update({
      where: { id: flightId },
      data: {
        ...changes,
        version: { increment: 1 },
      },
    });

    await createAuditLog({
      userId,
      action: "UPDATE",
      entityType: "Flight",
      entityId: flightId,
      oldValues: flight as any,
      newValues: updatedFlight as any,
      changes: `Updated flight (Command): ${Object.keys(changes).join(", ")}`,
    });

    return updatedFlight;
  },

  async createFlight(db: any, userId: string, command: z.infer<typeof createFlightCommandSchema>) {
    const flight = await db.flight.create({
      data: {
        ...command.data,
        userId,
        version: 1,
      },
    });

    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "Flight",
      entityId: flight.id,
      newValues: flight as any,
      changes: `Created flight (Command): ${flight.departureCode} -> ${flight.arrivalCode}`,
    });

    return flight;
  },

  async deleteFlight(db: any, userId: string, command: z.infer<typeof deleteFlightCommandSchema>) {
    const flight = await db.flight.findUnique({
      where: { id: command.flightId },
    });

    if (!flight || flight.userId !== userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    await db.flight.delete({ where: { id: command.flightId } });

    await createAuditLog({
      userId,
      action: "DELETE",
      entityType: "Flight",
      entityId: command.flightId,
      oldValues: flight as any,
      changes: `Deleted flight (Command): ${flight.departureCode} -> ${flight.arrivalCode}`,
    });

    return { success: true };
  },

  /**
   * @deprecated Use specialized methods instead (createFlight, updateFlight, deleteFlight)
   */
  async executeFlightCommand(db: any, userId: string, command: FlightCommand) {
    switch (command.operation) {
      case "UPDATE_FLIGHT": return this.updateFlight(db, userId, command);
      case "CREATE_FLIGHT": return this.createFlight(db, userId, command);
      case "DELETE_FLIGHT": return this.deleteFlight(db, userId, command);
      default:
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown operation" });
    }
  },

  /**
   * Executes an Aircraft Command.
   */
  async updateAircraft(db: any, userId: string, command: z.infer<typeof updateAircraftCommandSchema>) {
    const { aircraftId, changes, clientVersion } = command;

    const aircraft = await db.aircraft.findUnique({
      where: { id: aircraftId },
    });

    if (!aircraft || aircraft.userId !== userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    if (aircraft.version !== clientVersion) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Version mismatch. Client has ${clientVersion}, but Server has ${aircraft.version}. Please refresh.`,
        });
    }

    const updatedAircraft = await db.aircraft.update({
      where: { id: aircraftId },
      data: {
        ...changes,
        version: { increment: 1 },
      },
    });

    await createAuditLog({
      userId,
      action: "UPDATE",
      entityType: "Aircraft",
      entityId: aircraftId,
      oldValues: aircraft as any,
      newValues: updatedAircraft as any,
      changes: `Updated aircraft (Command): ${Object.keys(changes).join(", ")}`,
    });

    return updatedAircraft;
  },

  async createAircraft(db: any, userId: string, command: z.infer<typeof createAircraftCommandSchema>) {
    const aircraft = await db.aircraft.create({
      data: {
        ...command.data,
        userId,
        version: 1,
      },
    });

    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "Aircraft",
      entityId: aircraft.id,
      newValues: aircraft as any,
      changes: `Created aircraft (Command): ${aircraft.registration}`,
    });

    return aircraft;
  },

  async deleteAircraft(db: any, userId: string, command: z.infer<typeof deleteAircraftCommandSchema>) {
    const aircraft = await db.aircraft.findUnique({
      where: { id: command.aircraftId },
    });

    if (!aircraft || aircraft.userId !== userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const deleted = await db.aircraft.update({
      where: { id: command.aircraftId },
      data: { isArchived: true, version: { increment: 1 } },
    });

    await createAuditLog({
        userId,
        action: "DELETE",
        entityType: "Aircraft",
        entityId: command.aircraftId,
        oldValues: aircraft as any,
        changes: `Archived aircraft (Command): ${aircraft.registration}`,
    });

    return deleted;
  },

  /**
   * @deprecated Use specialized methods instead (createAircraft, updateAircraft, deleteAircraft)
   */
  async executeAircraftCommand(db: any, userId: string, command: AircraftCommand) {
    switch (command.operation) {
      case "UPDATE_AIRCRAFT": return this.updateAircraft(db, userId, command);
      case "CREATE_AIRCRAFT": return this.createAircraft(db, userId, command);
      case "DELETE_AIRCRAFT": return this.deleteAircraft(db, userId, command);
      default:
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown operation" });
    }
  },
};
