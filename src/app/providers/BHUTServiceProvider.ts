import BHUTService from "@app/services/BHUTService.js";
import { Application, ServiceProvider } from "midori/app";
import { BHUTConfigProvider } from "./BHUTConfigProvider.js";
import { LoggerServiceProvider } from "midori/providers";

export default class BHUTServiceProvider extends ServiceProvider<BHUTService> {
    override register(app: Application): BHUTService {
        if (!app.config.has(BHUTConfigProvider)) {
            throw new Error("Missing BHUTConfig.");
        }

        return new BHUTService(app.services.get(LoggerServiceProvider), app.config.get(BHUTConfigProvider)!);
    }
}
