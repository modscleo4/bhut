import { BHUTConfig } from "@app/providers/BHUTConfigProvider.js";
import { Logger } from "midori/log";

type AuthInfo = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresAt: Date;
};

type Pagination = {
    pagina: number;
    tamanhoPagina: number;
    total: number;
};

type Car = {
    id: string;
    nome: string;
    marca: string;
    preco: number;
    anoFabricacao: number;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class BHUTError extends Error {
    override name = 'BHUTError';

    constructor(message: string, public readonly statusCode: number) {
        super(message);
    }
}

export default class BHUTService {
    #config: BHUTConfig;
    #authInfo: AuthInfo | null = null;
    #logger: Logger;

    constructor(logger: Logger, config: BHUTConfig) {
        this.#logger = logger;
        this.#config = config;
    }

    async getCars(active: boolean): Promise<Car[]> {
        const size = 10;

        const { paginacao, itens } = await this.performGetCars(active, 1, size);
        for (let i = 2; i <= paginacao.total; i++) {
            const { itens: moreCars } = await this.performGetCars(active, i, size);
            itens.push(...moreCars);
        }

        return itens;
    }

    async createCar(car: { nome: string; marca: string; preco: number; anoFabricacao: number; }): Promise<string> {
        await this.authenticate();

        const res = await fetch(`${this.#config.url}/v1/carro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${this.#authInfo?.tokenType} ${this.#authInfo?.accessToken}`,
            },
            body: JSON.stringify(car),
        });

        if (!res.ok) {
            this.#logger.error(`Failed to create car (${res.status}).`);
            throw new BHUTError('Failed to create car', res.status);
        }

        const data = await res.json();
        return data.id;
    }

    async performGetCars(active: boolean, page: number, size: number): Promise<{ paginacao: Pagination; itens: Car[] }> {
        await this.authenticate();

        const res = await fetch(`${this.#config.url}/v1/carro?ativo=${active}&pagina=${page}&tamanhoPagina=${size}`, {
            headers: {
                Authorization: `${this.#authInfo?.tokenType} ${this.#authInfo?.accessToken}`,
            },
        });

        if (!res.ok) {
            this.#logger.error(`Failed to fetch cars (${res.status}).`);
            throw new BHUTError('Failed to fetch cars', res.status);
        }

        return await res.json();
    }

    async authenticate(): Promise<void> {
        if (this.#authInfo && this.#authInfo.expiresAt > new Date()) {
            return;
        }

        if (this.#authInfo) {
            this.#authInfo = await this.performTokenRefresh();
        } else {
            this.#authInfo = await this.performAuthentication();
        }
    }

    async performAuthentication(): Promise<AuthInfo> {
        const res = await fetch(`${this.#config.url}/v1/autenticacao/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: this.#config.username,
                senha: this.#config.password,
            }),
        });

        if (!res.ok) {
            this.#logger.error(`Failed to authenticate (${res.status}).`);
            throw new BHUTError('Failed to authenticate', res.status);
        }

        const data = await res.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresAt: new Date(Date.now() + (data.expiresIn - 1) * 1000),
        };
    }

    async performTokenRefresh(): Promise<AuthInfo> {
        if (!this.#authInfo) {
            throw new BHUTError('No auth info available', 0);
        }

        this.#logger.info('Refreshing token...');
        const res = await fetch(`${this.#config.url}/v1/autenticacao/renova-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tokenRenovado: this.#authInfo.refreshToken,
            }),
        });

        if (!res.ok) {
            this.#logger.error(`Failed to refresh token (${res.status}).`);
            throw new BHUTError('Failed to refresh token', res.status);
        }

        const data = await res.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresAt: new Date(Date.now() + (data.expiresIn - 1) * 1000),
        };
    }
}
