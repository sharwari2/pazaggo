import dotenv from "dotenv";
dotenv.config();

import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getTotalSpend } from "../tools/transactionsTool.js";
import { getFundReturn } from "../tools/fundTool.js";
import { getPortfolioValue } from "../tools/holdingsTool.js";

const transactionsTool = createTool({
  id: "query-transactions",
  description: "Query and filter transactions by date, category, or merchant. Use this for spending questions, top merchants, refunds, recurring subscriptions.",
  inputSchema: z.object({
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().describe("End date in YYYY-MM-DD format"),
    category: z.string().optional().describe("Category like groceries, travel, rent, health, transport, subscription"),
    merchant: z.string().optional().describe("Merchant name or partial name"),
  }),
  execute: async ({ context }) => {
    const result = await getTotalSpend({
      startDate: context.startDate,
      endDate: context.endDate,
      category: context.category,
      merchant: context.merchant,
    });
    return result;
  },
});

const fundReturnTool = createTool({
  id: "get-fund-return",
  description: "Get a fund period return based on NAV change between two dates. Use for fund performance questions.",
  inputSchema: z.object({
    fund_id: z.string().describe("The fund ID e.g. fund_bluechip"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().describe("End date in YYYY-MM-DD format"),
  }),
  execute: async ({ context }) => {
    const result = await getFundReturn({
      fund_id: context.fund_id,
      startDate: context.startDate,
      endDate: context.endDate,
    });
    return result;
  },
});

const portfolioTool = createTool({
  id: "get-portfolio-value",
  description: "Get the user current portfolio value, total invested, and profit across all holdings. Use for portfolio worth and realised return questions.",
  inputSchema: z.object({}),
  execute: async () => {
    const result = await getPortfolioValue();
    return result;
  },
});

export const tara = new Agent({
  name: "Tara",
  instructions: `You are Tara, a personal finance research assistant. You help users understand their spending and investments by calling tools to fetch real data.

Rules:
- NEVER guess or invent any number. Always call a tool first.
- If data is not available, say so honestly.
- Exclude transfers from spending unless explicitly asked.
- Negative amounts are refunds, subtract them from spend totals.
- For fund questions, use get-fund-return. For portfolio questions, use get-portfolio-value.
- Round all currency and percentage answers to 2 decimal places.
- Always ground your answer in the tool result.
- Available categories are: health, transport, subscription, travel, groceries, food, rent, shopping, entertainment, uncategorized.
- Do not remap category names. Use exactly what the user says.
- For date ranges, January 2025 means startDate 2025-01-01 and endDate 2025-01-31.`,
  model: google("gemini-2.5-flash-lite", { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
  tools: {
    transactionsTool,
    fundReturnTool,
    portfolioTool,
  },
});