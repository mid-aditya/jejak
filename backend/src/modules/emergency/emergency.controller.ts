import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { EmergencyService } from "./emergency.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

interface SosLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  batteryLevel?: number;
}

@Controller("emergency")
@UseGuards(JwtAuthGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post("sos")
  async triggerSOS(
    @CurrentUser("id") userId: string,
    @Body()
    body: {
      // Mobile sends a (client-side encrypted) `location` object
      location?: SosLocation;
      // Flat lat/lng also accepted for other clients
      latitude?: number;
      longitude?: number;
      altitude?: number;
      accuracy?: number;
      batteryLevel?: number;
      message?: string;
      tripId?: string;
      activeTripId?: string;
    },
  ) {
    const loc: SosLocation = {
      latitude: body.location?.latitude ?? (body.latitude as number),
      longitude: body.location?.longitude ?? (body.longitude as number),
      altitude: body.location?.altitude ?? body.altitude,
      accuracy: body.location?.accuracy ?? body.accuracy,
      batteryLevel: body.location?.batteryLevel ?? body.batteryLevel,
    };

    return this.emergencyService.triggerSOS(
      userId,
      loc,
      body.message,
      body.tripId ?? body.activeTripId,
    );
  }

  @Post("sos/:id/resolve")
  async resolveSOS(@Param("id", ParseUUIDPipe) id: string) {
    return this.emergencyService.resolveSOS(id);
  }

  @Get("sos/active")
  async getActiveSOS() {
    return this.emergencyService.getActiveSOS();
  }

  @Get("hike/:bookingId/overdue-check")
  async checkOverdueHike(@Param("bookingId", ParseUUIDPipe) bookingId: string) {
    await this.emergencyService.sendSafeConfirmation(bookingId);
    return { message: "Overdue check initiated" };
  }
}
