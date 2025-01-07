import axios, { AxiosInstance } from "axios";
import { Transaction, FilteredTransaction } from "./interface";
import { IWalletAnalysis } from "../actions/interface";

export class SolanaTrackerAPI {
    analyticApi: AxiosInstance;
    swapApi: AxiosInstance;

    constructor() {
        this.analyticApi = axios.create({
            baseURL: process.env.SOLANA_TRACKER_BASE_URL,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.SOLANA_TRACKER_API_KEY,
            },
        });
    }


    async getTokenInfo(tokenAddress: string): Promise<any> {
        try {
            const res = await this.analyticApi.get<any>(
                `/tokens/${tokenAddress}`
            );
            return {
                ...res.data.token,
                pools: res.data.pools,
                priceUSD: res.data.pools[0].price.usd,
            };
        } catch (error: any) {
            console.log(error);
            if (error.response && error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Token not found");
                }
                return {
                    ...error.response.data.token,
                    pools: error.response.data.pools,
                    priceUSD: error.response.data.pools[0].price.usd,
                };
            }
        }
    }

    async getTerminalData(): Promise<any | undefined> {
        try {
            const response =
                await this.analyticApi.get<any>(`/tokens/multi/all`);
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth tokens");
                }
                return error.response.data;
            }
        }
    }

    async getWalletHoldingsData(
        walletAddress: string
    ): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/pnl/${walletAddress}?showMeta=true`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet holdings");
                }
                return error.response.data;
            }
        }
    }

    async getWalletHoldingsDataForAgent(
        walletAddress: string,
        timeFrame: string
    ): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/pnl/${walletAddress}?showMeta=true&showHistoricPnL=${timeFrame}`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet holdings");
                }
                return error.response.data;
            }
        }
    }

    async getWalletTokenHoldingsData(
        walletAddress: string
    ): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/wallet/${walletAddress}`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet holdings");
                }
                return error.response.data;
            }
        }
    }

    async getWalletTokensData(walletAddress: string): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/wallet/${walletAddress}`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet tokens");
                }
                return error.response.data;
            }
        }
    }

    async getTopTraderList(sortBy: string): Promise<any[]> {
        const allWallets: any[] = []; // Array to store all wallets from all pages
        let page = 1;
        let hasNext = true;
        const maxRetries = 3; // Set the maximum number of retries

        while (hasNext) {
            let attempts = 0;
            let success = false;

            while (attempts < maxRetries && !success) {
                try {
                    const response = await this.analyticApi.get<any>(
                        `/top-traders/all/${page}?sortBy=${sortBy}&expandPnl=true`
                    );

                    // Add wallets from the current page to the accumulated list
                    allWallets.push(...response.data.wallets);

                    // Check if there is a next page
                    hasNext = response.data.hasNext;
                    page++; // Increment to the next page
                    success = true; // Mark as successful if no error occurs
                } catch (error: any) {
                    attempts++; // Increment attempt count on failure
                    console.log(`Attempt ${attempts} failed: ${error.message}`);

                    if (attempts >= maxRetries) {
                        console.log("Max retries reached, aborting.");
                        if (error.response && error.response.status === 404) {
                            if (!error.response.data) {
                                throw new Error(
                                    "Failed to fetch top wallets list"
                                );
                            }
                            return error.response.data;
                        }
                        throw error; // Throw other errors if any
                    }
                }
            }
        }

        return allWallets; // Return the accumulated list of wallets
    }

    async getWalletTradesData(walletAddress: string): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/wallet/${walletAddress}/trades?showMeta=true`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fetch wallet trades");
                }
                return error.response.data;
            }
        }
    }

    async getWalletTokenTradesData(
        walletAddress: string,
        tokenAddress: string
    ): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/trades/${tokenAddress}/by-wallet/${walletAddress}?showMeta=true`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet token trades");
                }
                return error.response.data;
            }
        }
    }

    async getWalletTradesPerTokenData(
        walletAddress: string
    ): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/wallet/${walletAddress}/trades?showMeta=true`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth wallet trades");
                }
                return error.response.data;
            }
        }
    }

    async getTrendingData(timeFrame?: string): Promise<any | undefined> {
        try {
            const response = timeFrame
                ? await this.analyticApi.get<any>(
                      `/tokens/trending/${timeFrame}`
                  )
                : await this.analyticApi.get<any>(`/tokens/trending`);
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth tokens");
                }
                return error.response.data;
            }
        }
    }

    async searchToken(params?: string): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/search?query=${params}`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth tokens to search");
                }
                return error.response.data;
            }
        }
    }

    async getTokenData(tokenAddress: string): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/tokens/${tokenAddress}`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth tokens");
                }
                return error.response.data;
            }
        }
    }

    async getHoldersData(tokenAddress: string): Promise<any | undefined> {
        try {
            const response = await this.analyticApi.get<any>(
                `/tokens/${tokenAddress}/holders`
            );
            return response.data;
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 404) {
                if (!error.response.data) {
                    throw new Error("Failed to fecth tokens");
                }
                return error.response.data;
            }
        }
    }

    async generatePoolIdFromTokens(token: string, paymentToken?: string) {
        const tokenInfo = await new SolanaTrackerAPI().getTokenInfo(token);
        if (!paymentToken) {
            return tokenInfo.pools![0].poolId;
        }
        return tokenInfo.pools?.find(
            (pool) =>
                pool.tokenAddress === token && pool.quoteToken === paymentToken
        )?.poolId;
    }

    async get1dSummaryWithMetadata(data: any, timeFrame: string) {
        const summary1d = data?.historic?.summary?.[timeFrame];

        if (!summary1d) {
            throw new Error(`${timeFrame} summary not found in the data.`);
        }

        const newTokens = summary1d?.newTokens?.tokens;
        const historicTokens = data?.historic?.tokens;

        if (newTokens && historicTokens) {
            Object.keys(newTokens).forEach((tokenKey) => {
                const historicToken = historicTokens[tokenKey]?.current?.meta;
                if (historicToken) {
                    newTokens[tokenKey].name = historicToken.name || null;
                    newTokens[tokenKey].symbol = historicToken.symbol || null;
                    newTokens[tokenKey].mint = historicToken.mint || null;
                }
            });
        }

        return summary1d;
    }
    filterTransactionsByToken(
        transactions: Transaction[],
        tokenAddress?: string
    ): FilteredTransaction[] {
        if (tokenAddress) {
            return transactions
                ?.filter(
                    (transaction) =>
                        transaction.from.address === tokenAddress ||
                        transaction.to.address === tokenAddress
                )
                ?.map((transaction) => {
                    const type =
                        transaction.to.address === tokenAddress
                            ? "buy"
                            : "sell";
                    return { ...transaction, type };
                });
        } else {
            return transactions?.map((transaction) => {
                const type =
                    transaction.to.address ===
                    "So11111111111111111111111111111111111111112"
                        ? "sell"
                        : "buy";
                return { ...transaction, type };
            });
        }
    }

    async getWalletAnalysis(walletAddress: string): Promise<IWalletAnalysis> {
        const timeFrame = "7d";
        const [walletAnalysis, walletBalances, walletTrades] =
            await Promise.all([
                this.getWalletHoldingsDataForAgent(walletAddress, timeFrame),
                this.getWalletTokensData(walletAddress),
                this.getWalletTradesData(walletAddress),
            ]);
        console.log(">>walletAnalysis", walletAnalysis);
        console.log(">>walletBalances", walletBalances);
        console.log(">>walletTrades", walletTrades);
        const filteredResults = await this.get1dSummaryWithMetadata(
            walletAnalysis,
            timeFrame
        );

        return {
            walletAddress,
            usdBalance: walletBalances?.total,
            solBalance: walletBalances?.totalSol,
            walletAnalysis: filteredResults,
            trades: this.filterTransactionsByToken(walletTrades?.trades),
        };
    }
}
