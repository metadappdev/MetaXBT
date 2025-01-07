export interface Token {
    name: string;
    symbol: string;
    image: string;
    decimals: number;
}

export interface Transaction {
    tx: string;
    from: {
        address: string;
        amount: number;
        token: Token;
    };
    to: {
        address: string;
        amount: number;
        token: Token;
    };
    price: {
        usd: number;
        sol: string;
    };
    volume: {
        usd: number;
        sol: number;
    };
    wallet: string;
    program: string;
    time: number;
}

export type FilteredTransaction = Transaction & { type: "buy" | "sell" };
