import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { BMKGAdapter } from "../../adapters/bmkg.adapter";
import { InaRiskAdapter } from "../../adapters/inarisk.adapter";

export interface HazardCheckResult {
  isHazardous: boolean;
  hazards: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }>;
  recommendation: "turn_back" | "caution" | "safe";
}

export interface DisasterInfo {
  landslide_risk?: string;
  flood_risk?: string;
  [key: string]: any;
}

@Injectable()
export class WeatherService {
  private readonly CACHE_TTL = 60 * 30; // 30 min
  private readonly redis: Redis | null;

  // In-memory fallback so the service works without a Redis instance
  private readonly memoryCache = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  constructor(
    private readonly bmkgAdapter: BMKGAdapter,
    private readonly inaRiskAdapter: InaRiskAdapter,
  ) {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (redisUrl) {
      this.redis = new Redis(redisUrl, { lazyConnect: true });
    } else if (redisHost) {
      this.redis = new Redis({
        host: redisHost,
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        lazyConnect: true,
      });
    } else {
      this.redis = null;
    }
  }

  private async cacheGet(key: string): Promise<string | null> {
    if (this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        return null;
      }
    }
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  private async cacheSet(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, value);
      } catch {
        // Cache is best-effort
      }
      return;
    }
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getCurrentWeather(params: {
    mountainId?: string;
    lat?: number;
    lng?: number;
  }) {
    const cacheKey = `weather:current:${params.lat}:${params.lng}`;
    const cached = await this.cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const weather = await this.bmkgAdapter.getWeather(params.lat!, params.lng!);
    await this.cacheSet(cacheKey, JSON.stringify(weather), this.CACHE_TTL);
    return weather;
  }

  async getForecast(params: {
    mountainId?: string;
    lat?: number;
    lng?: number;
    days?: number;
  }) {
    const cacheKey = `weather:forecast:${params.lat}:${params.lng}:${params.days || 3}`;
    const cached = await this.cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const forecast = await this.bmkgAdapter.getForecast(
      params.lat!,
      params.lng!,
      params.days || 3,
    );
    await this.cacheSet(cacheKey, JSON.stringify(forecast), this.CACHE_TTL);
    return forecast;
  }

  async checkHazardConditions(
    lat: number,
    lng: number,
  ): Promise<HazardCheckResult> {
    const hazards: HazardCheckResult["hazards"] = [];
    let recommendation: HazardCheckResult["recommendation"] = "safe";

    try {
      const weather = await this.getCurrentWeather({ lat, lng });
      if (weather) {
        if (weather.windSpeed > 50) {
          hazards.push({
            type: "high_wind",
            severity: weather.windSpeed > 80 ? "critical" : "high",
            description: `Kecepatan angin ${weather.windSpeed}km/h, berbahaya untuk pendakian.`,
          });
        }
        if (weather.visibility < 1000) {
          hazards.push({
            type: "low_visibility",
            severity: "medium",
            description: `Visibilitas rendah ${weather.visibility}m, hati-hati di jalur.`,
          });
        }
      }

      const riskInfo: any = await this.inaRiskAdapter.getDisasterInfo(
        lat,
        lng,
        10,
      );
      if (
        riskInfo?.landslide_risk === "high" ||
        riskInfo?.flood_risk === "high"
      ) {
        hazards.push({
          type: riskInfo.landslide_risk === "high" ? "landslide" : "flood",
          severity: "critical",
          description: `Risiko ${riskInfo.landslide_risk === "high" ? "longsor" : "banjir"} tinggi di area ini.`,
        });
      }

      if (hazards.some((h) => h.severity === "critical")) {
        recommendation = "turn_back";
      } else if (hazards.length > 0) {
        recommendation = "caution";
      }
    } catch (error) {
      console.error("[Weather] Hazard check error:", error);
      recommendation = "caution";
    }

    return { isHazardous: hazards.length > 0, hazards, recommendation };
  }

  async getAlertsForArea(lat: number, lng: number, radiusKm: number) {
    const cacheKey = `weather:alerts:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
    const cached = await this.cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const [weatherAlerts, disasterAlerts] = await Promise.allSettled([
      this.bmkgAdapter.getEarlyWarning().catch(() => []),
      this.inaRiskAdapter.getDisasterInfo(lat, lng, radiusKm).catch(() => null),
    ]);

    const alerts: any[] = [];
    if (weatherAlerts.status === "fulfilled") {
      alerts.push(...(weatherAlerts.value || []));
    }
    if (disasterAlerts.status === "fulfilled" && disasterAlerts.value) {
      alerts.push(disasterAlerts.value);
    }

    await this.cacheSet(cacheKey, JSON.stringify(alerts), this.CACHE_TTL);
    return alerts;
  }
}
