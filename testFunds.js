import { getFundReturn } from "./src/mastra/tools/fundTool.js";

const run = async () => {
  const res = await getFundReturn({
    fund_id: "fund_bluechip",
    startDate: "2023-04-01",
    endDate: "2025-03-01",
  });

  console.log(res);
};

run();