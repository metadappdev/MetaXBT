export * from "./actions/bridge";
export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";
import type { Plugin } from "@elizaos/core";
import { analyzeTokenAction } from "./actions/token";
import { analyzeWalletAction } from "./actions/wallet";
// import { evmWalletProvider } from "./providers/wallet";

export const metadappPlugin: Plugin = {
    name: "metadapp",
    description: "metadapp plugin",
    providers: [],
    evaluators: [],
    services: [], //speech rec service
    actions: [analyzeTokenAction, analyzeWalletAction],
};

export default metadappPlugin;
