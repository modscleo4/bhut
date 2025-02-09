import { Application, ConfigProvider } from "midori/app";
import { Constructor } from "midori/util/types.js";

export type BHUTConfig = {
    url: string;
    webhookUrl: string;
    username: string;
    password: string;
};

export abstract class BHUTConfigProvider extends ConfigProvider<BHUTConfig> {
    static override config: symbol = Symbol('bhut::BHUT');
}

export default function BHUTConfigProviderFactory(config: BHUTConfig): Constructor<BHUTConfigProvider> & { [K in keyof typeof BHUTConfigProvider]: typeof BHUTConfigProvider[K] } {
    return class extends BHUTConfigProvider {
        override register(app: Application): BHUTConfig {
            return config;
        }
    };
}
