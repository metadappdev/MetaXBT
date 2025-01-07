interface Token {
    name: string;
    symbol: string;
    mint: string;
    uri: string;
    decimals: number;
    hasFileMetaData: boolean;
    createdOn: string;
    description: string;
    image: string;
    showName: boolean;
    twitter: string;
    website: string;
}

interface Liquidity {
    quote: number;
    usd: number;
}

interface Price {
    quote: number;
    usd: number;
}

interface MarketCap {
    quote: number;
    usd: number;
}

interface Security {
    freezeAuthority: string | null;
    mintAuthority: string | null;
}

interface Txns {
    buys: number;
    total: number;
    volume: number;
    sells: number;
}

interface Pool {
    poolId: string;
    liquidity: Liquidity;
    price: Price;
    tokenSupply: number;
    lpBurn: number;
    tokenAddress: string;
    marketCap: MarketCap;
    decimals: number;
    security: Security;
    quoteToken: string;
    market: string;
    curvePercentage: number;
    curve: string;
    lastUpdated: number;
    createdAt: number;
    deployer: string;
    txns: Txns;
}

interface Event {
    priceChangePercentage: number;
}

interface RiskItem {
    name: string;
    description: string;
    level: string;
    score: number;
}

interface Risk {
    rugged: boolean;
    risks: RiskItem[];
    score: number;
}

export interface ISolanaTrackerTokenDetails {
    token: Token;
    pools: Pool[];
    events: {
        "1m": Event;
        "5m": Event;
        "15m": Event;
        "30m": Event;
        "1h": Event;
        "2h": Event;
        "3h": Event;
        "4h": Event;
        "5h": Event;
        "6h": Event;
        "12h": Event;
        "24h": Event;
    };
    risk: Risk;
    buys: number;
    sells: number;
    txns: number;
}

interface IDexScreenerTokenPairDetails {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels: string[];
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: {
            buys: number;
            sells: number;
        };
        h1: {
            buys: number;
            sells: number;
        };
        h6: {
            buys: number;
            sells: number;
        };
        h24: {
            buys: number;
            sells: number;
        };
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info: {
        imageUrl: string;
        header: string;
        openGraph: string;
        websites: {
            label: string;
            url: string;
        }[];
        socials: {
            type: string;
            url: string;
        }[];
    };
}

export interface IDexScreenerResponse {
    schemaVersion: string;
    pairs: IDexScreenerTokenPairDetails[] | null;
}

interface Volume {
    buys: number;
    sells: number;
    total: number;
}

interface TimeFrameData {
    buyers: number;
    sellers: number;
    volume: Volume;
    transactions: number;
    buys: number;
    sells: number;
    wallets: number;
    price: number;
    priceChangePercentage: number;
}

export interface TokenAnalysis {
    "1m": TimeFrameData;
    "5m": TimeFrameData;
    "15m": TimeFrameData;
    "30m": TimeFrameData;
    "1h": TimeFrameData;
    "2h": TimeFrameData;
    "3h": TimeFrameData;
    "4h": TimeFrameData;
    "5h": TimeFrameData;
    "6h": TimeFrameData;
    "12h": TimeFrameData;
    "24h": TimeFrameData;
}

export interface IHolding {
    first_buy_amount: number;
    first_buy_value: number;
    current_value: number;
    realized: number;
    unrealized: number;
    total: number;
    name: string;
    symbol: string;
    mint: string;
}

export interface IWalletAnalysis {
    // label: string;
    walletAddress: string;
    usdBalance: number;
    solBalance: number;
    walletAnalysis: WalletAnalysi;
    trades: Trade[];
}

export interface WalletAnalysi {
    realizedChange: number;
    unrealizedChange: number;
    totalChange: number;
    percentageChange: number;
    wins: number;
    losses: number;
    winPercentage: number;
    lossPercentage: number;
    newTokens: {
        tokens: {
            [key: string]: IHolding;
        };
        count: number;
        total_invested: number;
        total_current_value: number;
        total_pnl: number;
    };
}

export interface MostProfit {
    mint: string;
    holding: number;
    held: number;
    sold: number;
    sold_usd: number;
    realized: number;
    unrealized: number;
    total: number;
    total_sold: number;
    total_invested: number;
    average_buy_amount: number;
    current_value: number;
    cost_basis: number;
    first_buy_time: number;
    meta: Meta;
    pnlPercentage: number;
    avgBuyPrice: number;
    avgSellPrice: number;
}

export interface Meta {
    name: string;
    symbol: string;
    mint?: string;
    uri?: string;
    decimals: number;
    hasFileMetaData?: boolean;
    createdOn?: string;
    description?: string;
    image: string;
    showName?: boolean;
    twitter?: string;
    telegram?: string;
    website?: string;
}

export interface MostLoss {
    mint: string;
    holding: number;
    held: number;
    sold: number;
    sold_usd: number;
    realized: number;
    unrealized: number;
    total: number;
    total_sold: number;
    total_invested: number;
    average_buy_amount: number;
    current_value: number;
    cost_basis: number;
    first_buy_time: number;
    meta: Meta2;
    pnlPercentage: number;
    avgBuyPrice: number;
    avgSellPrice: number;
}

export interface Meta2 {
    name: string;
    symbol: string;
    mint?: string;
    uri?: string;
    decimals: number;
    hasFileMetaData?: boolean;
    createdOn?: string;
    description?: string;
    image: string;
    showName?: boolean;
    twitter?: string;
    website?: string;
    telegram?: string;
    extensions?: Extensions;
    tags?: any[];
    creator?: Creator;
}

export interface Extensions {
    twitter: string;
    telegram: string;
}

export interface Creator {
    name: string;
    site: string;
}

export interface Summary {
    realized: number;
    unrealized: number;
    total: number;
    totalInvested: number;
    totalWins: number;
    totalLosses: number;
    averageBuyAmount: number;
    winPercentage: number;
    lossPercentage: number;
    neutralPercentage: number;
}

export interface Trade {
    tx: string;
    from: From;
    to: To;
    price: AnalysisPrice;
    volume: AnalysisVolume;
    wallet: string;
    program: string;
    time: number;
    type: string;
}

export interface From {
    address: string;
    amount: number;
    token: AnalysisToken;
}

export interface AnalysisToken {
    name: string;
    symbol: string;
    image?: string;
    decimals: number;
}

export interface To {
    address: string;
    amount: number;
    token: Token2;
}

export interface Token2 {
    name: string;
    symbol: string;
    image?: string;
    decimals: number;
}

export interface AnalysisPrice {
    usd: number;
    sol: string;
}

export interface AnalysisVolume {
    usd: number;
    sol: number;
}
