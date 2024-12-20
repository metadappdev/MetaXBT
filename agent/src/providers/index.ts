import {
    Character,
    ModelProviderName,
    defaultCharacter,
    Clients,
    Provider,
    IAgentRuntime,
    Memory,
    State,
    formatMessages,
    embed,
    MemoryManager,
} from "@ai16z/eliza";

export const timeProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory) => {
        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString("en-US");
        const currentYear = currentDate.getFullYear();
        return `The current time is: ${currentTime}, ${currentYear}`;
    },
};

export const factsProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        // Create embedding for recent messages and retrieve relevant facts
        const recentMessages = formatMessages({
            messages: state?.recentMessagesData?.slice(-10),
            actors: state?.actorsData,
        });
        const embedding = await embed(runtime, recentMessages);
        const memoryManager = new MemoryManager({
            runtime,
            tableName: "facts",
        });
        const recentFactsData = await memoryManager.getMemories({
            roomId: message.roomId,
            count: 10,

            // agentId: runtime.agentId,
        });

        // Combine and format facts
        const allFacts = [...recentFactsData]; // Deduplication can be skipped if no overlap
        // const formattedFacts = formatFacts(allFacts);

        // return `Key facts that ${runtime.character.name} knows:\n${formattedFacts}`;
    },
};

