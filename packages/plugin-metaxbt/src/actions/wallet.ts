import type {
    IAgentRuntime,
    Memory,
    State,
    Action,
    HandlerCallback,
} from "@elizaos/core";
import { ModelClass, generateText } from "@elizaos/core";
import { IHolding } from "./interface";

import { formatDistanceToNow } from "date-fns";
import { SolanaTrackerAPI } from "../api/solana_tracker";

// async function getWalletDetails(address: string) {
//     address = address.replace(/"/g, "");
//     const url = `http://localhost:3300/solAnalysis/totalAnalysis/${address}/test`;
//     console.log(">> dex url", url);
//     const response = await axios.get<IWalletAnalysis>(url);
//     return response.data;
// }

function calculateTime(time: number) {
    const date = new Date(time * 1000);
    const timeAgo = formatDistanceToNow(date);
    return timeAgo;
}

// function formatDate(dateString: string): string {
//     // Use moment for flexible date parsing and formatting
//     const parsedDate = moment(dateString);

//     // Relative time (e.g., "2 hours ago", "3 days ago")
//     const relativeTime = parsedDate.fromNow();

//     // Formatted date (e.g., "January 15, 2024 at 3:45 PM")
//     const formattedDate = parsedDate.format("MMMM D, YYYY [at] h:mm A");

//     // Combine relative and formatted time for context
//     return `${relativeTime} (${formattedDate})`;
// }

export const analyzeWalletAction: Action = {
    name: "ANALYZE_WALLET",
    similes: ["GET_WALLET_INFO", "GET_WALLET"],
    description: "this action is used to analyze a wallet",
    validate: async () => {
        // return Math.random() > 0.5;
        const apikey = process.env.SOLANA_TRACKER_API_KEY;
        return typeof apikey === "string";
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback // tell the user i'm still thinking or doing stuff
    ) => {
        try {
            const context = `Extract the wallet address from the user's message here: ${message.content.text}. Only return the token address as a string without quotes.`;
            let walletAddress = await generateText({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                stop: ["\n"],
            });

            if (!walletAddress || typeof walletAddress !== "string") {
                callback({
                    text: `Unable to extract the wallet address. Please try using one of the following formats:\n- Analyze this wallet {{walletAddress}}\n- Get me information on this wallet {{walletAddress}}\n- What do you know about this wallet {{walletAddress}}?\n- Do a quick research on this wallet {{walletAddress}}.`,
                    action: "ANALYZE_WALLET_RESPONSE",
                    source: message?.content?.source ?? "wallet analysis",
                });
                return;
            }
            //strip off quotes
            walletAddress = walletAddress?.replace(/"/g, "");
            const solanaTrackerApi = new SolanaTrackerAPI();
            const response =
                await solanaTrackerApi.getWalletAnalysis(walletAddress);

            if (!response) {
                callback({
                    text: `Unable to extract details on this wallet.`,
                    action: "ANALYZE_WALLET_RESPONSE",
                    source: message?.content?.source ?? "wallet analysis",
                });
                return;
            }

            const formatHoldings = (profits: Record<string, IHolding>) => {
                return (
                    Object.entries(profits)
                        ?.map(
                            ([_, profit]) =>
                                `Name: ${profit.name}\n` +
                                `Symbol: ${profit.symbol}\n` +
                                `Address: ${profit.mint}\n` +
                                `First Buy Amount: ${profit.first_buy_amount}\n` +
                                `First Buy Value: $${profit.first_buy_value.toFixed(2)}\n` +
                                `Current Value: $${profit.current_value.toFixed(2)}\n` +
                                `Realized: $${profit.realized.toFixed(2)}\n` +
                                `Unrealized: $${profit.unrealized.toFixed(2)}\n` +
                                `Total: $${profit.total.toFixed(2)}`
                        )
                        .join("\n\n") ?? "No data available"
                );
            };

            const holdings = formatHoldings(
                response?.walletAnalysis?.newTokens?.tokens
            );

            const transactions =
                response?.trades
                    ?.slice(0, 10)
                    ?.map(
                        (transaction) =>
                            `Hash: ${transaction?.tx}\n` +
                            `Base Token Address: ${transaction?.from?.address}\n` +
                            `Base Token Amount: ${transaction?.from?.amount}\n` +
                            `Base Token Details: ${transaction?.from?.token?.name} ${transaction?.from?.token?.symbol}\n` +
                            `Price: $${transaction?.price?.usd}\n` +
                            `Volume (USD): ${transaction?.volume?.usd}\n` +
                            `Volume (SOL): ${transaction?.volume?.sol}\n` +
                            `Wallet Address: ${transaction?.wallet}\n` +
                            `Action: ${transaction?.type}\n` +
                            `Time: ${calculateTime(transaction?.time)}`
                    )
                    .join("\n\n") ?? "No Trades";

            const insightsContext = `
                Using the wallet data below, generate a comprehensive wallet analysis in the following format:

                # ({walletAddress}) Analysis 📊

                [# Whale Analysis Criteria:

                🐋 Whale Classification
                [Analyze based on:
                1. Portfolio Value Tier
                - Dolphin: $100k-$500k
                - Whale: $500k-$1M
                - Mega Whale: >$1M

                2. Capital Scale 💰
                - Total Invested > $100,000 = Potential Whale
                - Total Invested > $500,000 = Likely Whale
                - Total Invested > $1,000,000 = Definite Whale

                3. Trading Behavior 📊
                - Average Buy Amount > $10,000 = Potential Whale
                - Average Buy Amount > $50,000 = Likely Whale
                - Average Buy Amount > $100,000 = Definite Whale

                4. Performance Metrics ⚖️
                - Win Percentage > 60% = Sophisticated Trader
                - Total Realized/Unrealized > $100,000 = Significant Impact]

                5. Trading Impact
                - Volume per trade
                - Position sizing
                - Market impact

                6. Trading Sophistication
                - Win rate vs market average
                - Portfolio diversification
                - Risk management patterns]

                # 📊 Trading Sophistication
                ├ Win rate vs market average: {{contentHere}}
                ├ Portfolio diversification:  {{contentHere}}
                └ Risk management patterns: {{contentHere}}

                # 📊 Risk Assessment
                Overall Risk Level: [Low 🟢 | Medium 🟡 | High 🔴]


                # 📊 Performance Summary
                ├ Total P&L: ${response?.walletAnalysis?.newTokens?.total_pnl}
                ├ Realized: ${response?.walletAnalysis?.realizedChange}
                ├ Unrealized: ${response?.walletAnalysis?.unrealizedChange}
                └ Total Capital Deployed: ${response?.walletAnalysis?.newTokens?.total_invested}

                # 📈 Trading Metrics
                ├ Success Rate: ${response?.walletAnalysis?.winPercentage}% (${response?.walletAnalysis?.wins} wins)
                ├ Loss Rate: ${response?.walletAnalysis?.lossPercentage}% (${response?.walletAnalysis?.losses} losses)
                ├ ROI: ${response?.walletAnalysis?.percentageChange}%
                └ Total Trades: ${response?.walletAnalysis?.newTokens?.count}

                💼 Portfolio Overview:
                ├ Total Capital: ${response?.walletAnalysis?.totalChange}
                ├ Realized P/L: ${response?.walletAnalysis?.realizedChange}
                └ Total Profit and Loss: ${response?.walletAnalysis?.newTokens?.total_pnl}

                📈 Performance Metrics:
                ├ Win Rate: ${response?.walletAnalysis?.winPercentage}%
                ├ Loss Rate: ${response?.walletAnalysis?.lossPercentage}%
                └ Break Even: ${response?.walletAnalysis?.percentageChange}%

                🎯 Whale Confidence Rating: [🔴/🟡/🟢]

                💡 Analysis:
                [Generate 2-3 sentences explaining the rating based on:
                - Size of positions relative to market
                - Win/loss ratio sophistication
                - Overall capital deployment
                - Transactions
                - Profits/losses]

                ⚠️ Risk Level: [Low/Medium/High]
                [Based on position sizes and win/loss ratio]

                # Wallet Address
                ${response?.walletAddress}

                # USD Balance
                $${response?.usdBalance ?? 0}

                # SOL Balance
                ${response?.solBalance ?? 0}

                # Holdings
                ${holdings}

                # History
                ${transactions}

                # Additional Insights:
                - Count: ${response?.walletAnalysis?.newTokens?.count}
                - Total Current Value: ${response?.walletAnalysis?.newTokens?.total_current_value}
            `;

            // const insightsContext = `
            //     Using the wallet data below, generate a detailed trading profile analysis:

            //     # 👛 Wallet Profile: ${response?.walletAddress}
            //     Current Balance: $${response?.usdBalance ?? 0} USD | ${response?.solBalance ?? 0} SOL

            //     # 📊 Performance Summary
            //     ├ Total P&L: ${response?.walletAnalysis?.newTokens?.total_pnl}
            //     ├ Realized: ${response?.walletAnalysis?.realizedChange}
            //     ├ Unrealized: ${response?.walletAnalysis?.unrealizedChange}
            //     └ Total Capital Deployed: ${response?.walletAnalysis?.newTokens?.total_invested}

            //     # 📈 Trading Metrics
            //     ├ Success Rate: ${response?.walletAnalysis?.winPercentage}% (${response?.walletAnalysis?.wins} wins)
            //     ├ Loss Rate: ${response?.walletAnalysis?.lossPercentage}% (${response?.walletAnalysis?.losses} losses)
            //     ├ ROI: ${response?.walletAnalysis?.percentageChange}%
            //     └ Total Trades: ${response?.walletAnalysis?.newTokens?.count}

            //     # 🐋 Whale Classification
            //     [Analyze based on:
            //     1. Portfolio Value Tier
            //     - Dolphin: $100k-$500k
            //     - Whale: $500k-$1M
            //     - Mega Whale: >$1M

            //     2. Trading Impact
            //     - Volume per trade
            //     - Position sizing
            //     - Market impact

            //     3. Trading Sophistication
            //     - Win rate vs market average
            //     - Portfolio diversification
            //     - Risk management patterns]

            //     # 📋 Portfolio Analysis
            //     Current Holdings:
            //     ${holdings}

            //     Recent Transactions:
            //     ${transactions}

            //     # 💡 Trading Behavior Profile
            //     [Generate insights on:
            //     1. Trading Style:
            //     - Position sizing patterns
            //     - Hold duration trends
            //     - Entry/exit timing

            //     2. Risk Profile:
            //     - Position concentration
            //     - Loss tolerance
            //     - Risk-adjusted returns

            //     3. Market Impact:
            //     - Typical trade size
            //     - Liquidity interaction
            //     - Price impact patterns]

            //     # 🎯 Overall Assessment
            //     Whale Status: [🔵 Dolphin | 🐋 Whale | 🌊 Mega Whale]
            //     Trading Style: [Conservative | Moderate | Aggressive]
            //     Market Impact: [Low | Medium | High]

            //     # ⚠️ Risk Assessment
            //     Overall Risk Level: [Low 🟢 | Medium 🟡 | High 🔴]
            //     [Based on:
            //     - Position concentration
            //     - Win/loss ratio
            //     - Capital at risk
            //     - Portfolio diversification]

            //     # Summary
            //     - Realized: ${response?.walletAnalysis?.realizedChange}
            //     - Unrealized: ${response?.walletAnalysis?.unrealizedChange}
            //     - Total: ${response?.walletAnalysis?.totalChange}
            //     - Total Invested: ${response?.walletAnalysis?.newTokens?.total_invested}
            //     - Total Wins: ${response?.walletAnalysis?.wins}
            //     - Total Losses: ${response?.walletAnalysis?.losses}
            //     - Count: ${response?.walletAnalysis?.newTokens?.count}
            //     - Win Percentage: ${response?.walletAnalysis?.winPercentage}%
            //     - Loss Percentage: ${response?.walletAnalysis?.lossPercentage}%
            //     - Percentage Change: ${response?.walletAnalysis?.percentageChange}%
            //     - Total Profit and Loss: ${response?.walletAnalysis?.newTokens?.total_pnl}
            //     - Total Current Value: ${response?.walletAnalysis?.newTokens?.total_current_value}
            // `;

            const insights = await generateText({
                runtime,
                context: insightsContext,
                modelClass: ModelClass.SMALL,
            });

            callback({
                text: insights,
                action: "ANALYZE_WALLET_RESPONSE",
                source: message?.content?.source ?? "wallet analysis",
                data: response,
            });
        } catch (error) {
            console.error("Error fetching token information:", error);
            callback({
                text: `An error occurred while processing your request. Please try again later.`,
                action: "ANALYZE_WALLET_RESPONSE",
                source: message?.content?.source ?? "wallet analysis",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Analyze this wallet {{walletAddress}}" },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_WALLET" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Get me information on this wallet {{walletAddress}}",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_WALLET" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "what do you know about this wallet {{walletAddress}}?",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_WALLET" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Do a quick research on this wallet {{walletAddress}}",
                },
            },

            {
                user: "{{user2}}",
                content: { text: "", action: "ANALYZE_WALLET" },
            },
        ],
    ],
};
