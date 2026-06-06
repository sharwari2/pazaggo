import { getTotalSpend } from "./src/mastra/tools/transactionsTool.js";

const run = async () => {
  const res = await getTotalSpend({
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    category: "food",
  });

  console.log(res);
};

run();