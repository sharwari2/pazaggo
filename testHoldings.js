import { getPortfolioValue } from "./src/mastra/tools/holdingsTool.js";

const run = async () => {
  const res = await getPortfolioValue();
  console.log(JSON.stringify(res, null, 2));
};

run();