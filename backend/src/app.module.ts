import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { databaseConfig } from "./config/database.config";
import { decryptRequestBody } from "./common/middleware/decrypt-request.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { MountainModule } from "./modules/mountain/mountain.module";
import { EmergencyModule } from "./modules/emergency/emergency.module";
import { TripModule } from "./modules/trip/trip.module";
import { WeatherModule } from "./modules/weather/weather.module";
import { CommunityModule } from "./modules/community/community.module";
import { MarketplaceModule } from "./modules/marketplace/marketplace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get("THROTTLE_TTL", 60000),
            limit: configService.get("THROTTLE_LIMIT", 100),
          },
        ],
      }),
    }),
    AuthModule,
    UserModule,
    MountainModule,
    EmergencyModule,
    TripModule,
    WeatherModule,
    CommunityModule,
    MarketplaceModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Decrypt fields the mobile app encrypts client-side (password, location,
    // medicalInfo, emergencyContacts). Module middleware is attached after the
    // internal body parser, so `req.body` is already populated here — unlike
    // middleware registered via `app.use()` in main.ts.
    consumer.apply(decryptRequestBody).forRoutes("*");
  }
}
