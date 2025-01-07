import type {
    IAgentRuntime,
    Memory,
    State,
    Action,
    HandlerCallback,
} from "@elizaos/core";

import { ModelClass, generateText } from "@elizaos/core";
import axios from "axios";
import { IDexScreenerResponse, ISolanaTrackerTokenDetails } from "./interface";

async function getTokenInfoFromDexScreener(address: string) {
    address = address.replace(/"/g, "");
    const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;

    console.log(">> dex url", url);
    const response = await axios.get<IDexScreenerResponse>(url);
    return response.data;
}

async function getTokenInfoFromSolanaTracker(address: string) {
    address = address.replace(/"/g, "");

    const url = `https://data.solanatracker.io/tokens/${address}`;

    console.log(">> sol url", url);
    const response = await axios.get<ISolanaTrackerTokenDetails>(url, {
        headers: {
            "x-api-key": process.env.SOLANA_TRACKER_API_KEY,
        },
    });
    return response.data;
}

// async function getVolumeFromSolanaTracker(address: string) {
//     address = address.replace(/"/g, "");

//     const url = `https://data.solanatracker.io/stats/${address}`;

//     console.log(">> sol volume url", url);
//     const response = await axios.get<TokenAnalysis>(url, {
//         headers: {
//             "x-api-key": process.env.SOLANA_TRACKER_API_KEY,
//         },
//     });
//     return response.data;
// }

export const analyzeTokenAction: Action = {
    name: "ANALYZE_TOKEN",
    similes: ["GET_TOKEN_INFO", "GET_CURRENT_TOKEN"],
    description: "this action is used to analyze a token",
    validate: async () => {
        // const apikey = process.env.SOLANA_TRACKER_API_KEY;
        // return typeof apikey === "string";
        return true;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback // tell the user i'm still thinking or doing stuff
    ) => {
        try {
            const context = `Extract the token address from the user's message here: ${message.content.text}. Only return the token address as a string.`;
            const tokenAddress = await generateText({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                stop: ["\n"],
            });

            if (!tokenAddress || typeof tokenAddress !== "string") {
                callback({
                    text: `
                        Unable to extract the token address. Please try using one of the following formats:
                        - Analyze this token {{tokenAddress}}
                        - Get me information on this token {{tokenAddress}}
                        - What do you know about this token {{tokenAddress}}?
                        - Do a quick research on this token {{tokenAddress}}
                    `,
                    action: "ANALYZE_TOKEN_RESPONSE",
                    source: message?.content?.source ?? "token analysis",
                });
                return;
            }

            let dataSource = "";
            let dexScreenerResponse: IDexScreenerResponse = null;
            let solanaTrackerResponse: ISolanaTrackerTokenDetails = null;
            // let solanaTrackerVolumeResponse: TokenAnalysis = null;

            // Query Dex Screener
            dexScreenerResponse =
                await getTokenInfoFromDexScreener(tokenAddress);
            if (dexScreenerResponse?.pairs?.length > 0) {
                dataSource = "dexScreener";
            } else {
                // Query Solana Tracker if Dex Screener has no data
                solanaTrackerResponse =
                    await getTokenInfoFromSolanaTracker(tokenAddress);
                if (solanaTrackerResponse) dataSource = "solanaTracker";
                // solanaTrackerVolumeResponse =
                //     await getVolumeFromSolanaTracker(tokenAddress);
            }

            // Handle the results based on the identified data source
            switch (dataSource) {
                case "dexScreener":
                    {
                        const firstDexScreenerPair =
                            dexScreenerResponse?.pairs?.[0];
                        const socials =
                            firstDexScreenerPair?.info?.socials
                                ?.map(
                                    (social) =>
                                        `- ${social?.type}:\n${social?.url}`
                                )
                                .join("\n\n") ?? "No socials";
                        const dexScreenerContext = `
                        Using the data below, generate a comprehensive token analysis in the following format:

                        # {tokenName} ({tokenSymbol}) Analysis 📊

                        🔹 Address: [{tokenAddress}](https://metadapp.com/sol/{tokenAddress})

                        💹 Market Statistics:
                        ├ Price: ${firstDexScreenerPair?.priceUsd}
                        ├ Market Cap: ${firstDexScreenerPair?.marketCap}
                        ├ 24h Volume: ${firstDexScreenerPair?.volume?.h24}
                        └ Liquidity: ${firstDexScreenerPair?.liquidity?.usd}

                        📈 24h Trading Activity:
                        ├ Buys: {24h_buys}
                        ├ Sells: {24h_sells}
                        └ Sentiment: {marketSentiment}
                        [Calculate based on:
                            Bullish 🟢 if buys > 60% of total transactions
                            Bearish 🔴 if buys < 40% of total transactions
                            Neutral 😐 otherwise]

                        🔒 Security:
                        ├ Freeze Authority: {⚫ if no, 🟢 if yes}
                        ├ Mint Authority: {⚫ if no, 🟢 if yes}
                        └ Liquidity Locked: {🔒 if yes, ⚠️ if no}

                        💡 Market Insight:
                        [Generate a 1-2 sentence insight based on:
                        - Price change trends (5m, 1h, 6h, 24h)
                        - Volume patterns
                        - Buy/sell ratio
                        - Liquidity changes]

                        🌐 Socials:
                        [List available social links or "No social links available"]


                        # Name
                        ${firstDexScreenerPair?.baseToken?.name}

                        # Symbol
                        ${firstDexScreenerPair?.baseToken?.symbol}

                        # Address
                        ${firstDexScreenerPair?.baseToken?.address}

                        # Price Usd
                        $${firstDexScreenerPair?.priceUsd}

                        # Price Native
                        ${firstDexScreenerPair?.priceNative}

                        # Transactions
                        - 5 minutes:
                            * buys ${firstDexScreenerPair?.txns?.m5?.buys}
                            * sells ${firstDexScreenerPair?.txns?.m5?.sells}
                        - 1 hour:
                            * buys ${firstDexScreenerPair?.txns?.h1?.buys}
                            * sells ${firstDexScreenerPair?.txns?.h1?.sells}
                        - 6 hours:
                            * buys ${firstDexScreenerPair?.txns?.h6?.buys}
                            * sells ${firstDexScreenerPair?.txns?.h6?.sells}
                        - 24 hours:
                            * buys ${firstDexScreenerPair?.txns?.h24?.buys}
                            * sells ${firstDexScreenerPair?.txns?.h24?.sells}

                        # MarketCap
                        ${firstDexScreenerPair?.marketCap}

                        # Volume
                        - 5 minutes:
                            ${firstDexScreenerPair?.volume?.m5}
                        - 1 hour:
                            ${firstDexScreenerPair?.volume?.h1}
                        - 6 hours:
                            ${firstDexScreenerPair?.volume?.h6}
                        - 24 hours:
                            ${firstDexScreenerPair?.volume?.h24}

                        # Price Changes
                        - 5 minutes:
                            ${firstDexScreenerPair?.priceChange?.m5}
                        - 1 hour:
                            ${firstDexScreenerPair?.priceChange?.h1}
                        - 6 hours:
                            ${firstDexScreenerPair?.priceChange?.h6}
                        - 24 hours:
                            ${firstDexScreenerPair?.priceChange?.h24}

                        # liquidity
                        - Usd Value:
                            ${firstDexScreenerPair?.liquidity?.usd}
                        - base Value:
                            ${firstDexScreenerPair?.liquidity?.base}
                        - Quote Value:
                            ${firstDexScreenerPair?.liquidity?.quote}

                        # Socials
                        ${socials}
                    `;

                        const insights = await generateText({
                            runtime,
                            context: dexScreenerContext,
                            modelClass: ModelClass.SMALL,
                            // stop: ["\n"],
                        });
                        callback({
                            text: insights,
                            action: "ANALYZE_TOKEN_RESPONSE",
                            source:
                                message?.content?.source ?? "token analysis",
                            data: dexScreenerResponse, // Pass Dex Screener data if needed
                        });
                    }
                    break;

                case "solanaTracker":
                    {
                        const poolData = solanaTrackerResponse?.pools?.[0];
                        const solanaTrackerContext = `
                        Using the data below, generate a comprehensive token analysis in the following format:

                        # {tokenName} ({tokenSymbol}) Analysis 📊

                        🔹 Address: [{tokenAddress}](https://metadapp.com/sol/{tokenAddress})

                        💹 Market Statistics:
                        ├ Price: ${poolData?.price?.usd}
                        ├ Market Cap: ${poolData?.marketCap?.usd}
                        └ Liquidity: ${poolData?.liquidity?.usd}

                        📈 24h Trading Activity:
                        ├ Buys: {24h_buys}
                        ├ Sells: {24h_sells}
                        └ Sentiment: {marketSentiment}
                        [Calculate based on:
                            Bullish 🟢 if buys > 60% of total transactions
                            Bearish 🔴 if buys < 40% of total transactions
                            Neutral 😐 otherwise]

                        🔒 Security:
                        ├ Freeze Authority: {⚫ if no, 🟢 if yes}
                        ├ Mint Authority: {⚫ if no, 🟢 if yes}
                        └ Liquidity Locked: {🔒 if yes, ⚠️ if no}

                        💡 Market Insight:
                        [Generate a 1-2 sentence insight based on:
                        - Price change trends (5m, 1h, 6h, 24h)
                        - Volume patterns
                        - Buy/sell ratio
                        - Liquidity changes]

                        🌐 Socials:
                        [List available social links or "No social links available"]

                        # Name
                        ${solanaTrackerResponse?.token?.name}

                        # Symbol
                        ${solanaTrackerResponse?.token?.symbol}

                        # Address
                        ${solanaTrackerResponse?.token?.mint}

                        # Price Usd
                        $${poolData?.price?.usd}

                        # Price Quote
                        ${poolData?.price?.quote}

                        # Bonding curve percentage
                        ${poolData?.curvePercentage}

                        # Transactions
                        - buys:
                            ${poolData?.txns?.buys}
                        - sells:
                            ${poolData?.txns?.sells}

                        # MarketCap
                        ${poolData?.marketCap?.usd}


                        # Price Changes
                        - 1 minute:
                            ${solanaTrackerResponse?.events?.["1m"]}
                        - 5 minutes:
                            ${solanaTrackerResponse?.events?.["5m"]}
                        - 15 minutes:
                            ${solanaTrackerResponse?.events?.["15m"]}
                        - 30 minutes:
                            ${solanaTrackerResponse?.events?.["30m"]}
                        - 1 hour:
                            ${solanaTrackerResponse?.events?.["1h"]}
                        - 2 hours:
                            ${solanaTrackerResponse?.events?.["2h"]}
                        - 3 hours:
                            ${solanaTrackerResponse?.events?.["3h"]}
                        - 4 hours:
                            ${solanaTrackerResponse?.events?.["4h"]}
                        - 5 hours:
                            ${solanaTrackerResponse?.events?.["5h"]}
                        - 6 hours:
                            ${solanaTrackerResponse?.events?.["6h"]}
                        - 12 hours:
                            ${solanaTrackerResponse?.events?.["12h"]}
                        - 24 hours:
                            ${solanaTrackerResponse?.events?.["24h"]}

                        # liquidity
                        - Usd Value:
                            ${poolData?.liquidity?.usd}
                        - Quote Value:
                            ${poolData?.liquidity?.quote}

                        # Socials
                        - Twitter:
                            ${solanaTrackerResponse?.token?.twitter}
                        - Website:
                            ${solanaTrackerResponse?.token?.website}

                        # Security
                        - Freeze Authority:
                            ${poolData?.security?.freezeAuthority}
                        - Mint Authority:
                            ${poolData?.security?.mintAuthority}
                    `;

                        const solTrackerinsights = await generateText({
                            runtime,
                            context: solanaTrackerContext,
                            modelClass: ModelClass.SMALL,
                            // stop: ["\n"],
                        });
                        callback({
                            text: `Information on the token ${tokenAddress} has been successfully retrieved \n${solTrackerinsights}.`,
                            action: "ANALYZE_TOKEN_RESPONSE",
                            source:
                                message?.content?.source ?? "token analysis",
                            data: dexScreenerResponse, // Pass Dex Screener data if needed
                        });
                    }
                    break;

                default:
                    callback({
                        text: `Unable to retrieve information for the address ${tokenAddress}. Please try again later.`,
                        action: "ANALYZE_TOKEN_RESPONSE",
                        source: message?.content?.source ?? "token analysis",
                    });
            }
        } catch (error) {
            console.error("Error fetching token information:", error);
            callback({
                text: `An error occurred while processing your request. Please try again later.`,
                action: "ANALYZE_TOKEN_RESPONSE",
                source: message?.content?.source ?? "token analysis",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Analyze this token {{tokenAddress}}" },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_TOKEN" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Get me information on this token {{tokenAddress}}",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_TOKEN" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "what do you know about this token {{tokenAddress}}?",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_TOKEN" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Do a quick research on this token {{tokenAddress}}",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_TOKEN" },
            },
        ],
    ],
};
