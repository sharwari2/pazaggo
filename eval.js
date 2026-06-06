import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

const BASE_URL = "http://localhost:3000";

const tests = [
  {
    question: "How much did I spend on food in January 2025?",
    check: (answer) => answer.toLowerCase().includes("food") || answer.match(/\d+/),
    label: "Food spend January 2025",
  },
  {
    question: "How much did I spend on rent in January 2025?",
    check: (answer) => answer.toLowerCase().includes("rent") || answer.match(/\d+/),
    label: "Rent spend January 2025",
  },
  {
    question: "What was my total spending in January 2025 excluding transfers?",
    check: (answer) => answer.match(/\d+/),
    label: "Total spend excluding transfers",
  },
  {
    question: "How much did I spend on travel in February 2025?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("travel"),
    label: "Travel spend February 2025",
  },
  {
    question: "What is my portfolio worth today?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("portfolio"),
    label: "Portfolio value",
  },
  {
    question: "How much have I made on my portfolio?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("profit"),
    label: "Portfolio profit",
  },
  {
    question: "What was fund_bluechip return from 2024-01-01 to 2025-01-01?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("return"),
    label: "Fund period return",
  },
  {
    question: "How much did I spend on health in March 2025?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("health"),
    label: "Health spend March 2025",
  },
  {
    question: "Do I have any spending data for April 2025?",
    check: (answer) => answer.toLowerCase().includes("no") || answer.toLowerCase().includes("not") || answer.match(/\d+/),
    label: "No data case April 2025",
  },
  {
    question: "How much did I spend on groceries in January 2025?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("groceries"),
    label: "Groceries spend January 2025",
  },
  {
    question: "How much did I spend on subscription in January 2025?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("subscription"),
    label: "Subscription spend January 2025",
  },
  {
    question: "What is my total invested amount across all holdings?",
    check: (answer) => answer.match(/\d+/) || answer.toLowerCase().includes("invest"),
    label: "Total invested amount",
  },
];

async function runEvals() {
  console.log("Running Tara Eval Suite...\n");

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    try {
      const res = await fetch(BASE_URL + "/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: test.question }),
      });

      const data = await res.json();
      const answer = data.answer || "";

      if (test.check(answer)) {
        console.log(`PASS: ${test.label}`);
        passed++;
      } else {
        console.log(`FAIL: ${test.label}`);
        console.log(`  Answer: ${answer}`);
        failed++;
        failures.push({ label: test.label, answer });
      }
    } catch (err) {
      console.log(`ERROR: ${test.label} — ${err.message}`);
      failed++;
      failures.push({ label: test.label, answer: err.message });
    }

    // wait 2 seconds between requests to avoid rate limits
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n--- RESULTS ---`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  if (failures.length > 0) {
    console.log("\nFailed cases:");
    for (const f of failures) {
      console.log(`  - ${f.label}: ${f.answer}`);
    }
  }
}

runEvals();