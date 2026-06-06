import pkg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:sharwari23@localhost:5432/provue_tara",
});

async function getLatestNav(fund_id) {
  const res = await pool.query(
    `SELECT nav FROM fund_nav
     WHERE fund_id = $1
     ORDER BY nav_date DESC LIMIT 1`,
    [fund_id]
  );
  return res.rows[0]?.nav;
}

async function getNavOnDate(fund_id, date) {
  const res = await pool.query(
    `SELECT nav FROM fund_nav
     WHERE fund_id = $1 AND nav_date <= $2
     ORDER BY nav_date DESC LIMIT 1`,
    [fund_id, date]
  );
  return res.rows[0]?.nav;
}

export async function getPortfolioValue() {
  const holdings = await pool.query(`SELECT * FROM holdings`);

  let totalInvested = 0;
  let currentValue = 0;
  const breakdown = [];

  for (const h of holdings.rows) {
    const purchaseNav = await getNavOnDate(h.fund_id, h.purchase_date);
    const latestNav = await getLatestNav(h.fund_id);

    if (!purchaseNav || !latestNav) continue;

    const invested = h.units * purchaseNav;
    const current = h.units * latestNav;

    totalInvested += invested;
    currentValue += current;

    breakdown.push({
      fund_id: h.fund_id,
      invested: Number(invested.toFixed(2)),
      currentValue: Number(current.toFixed(2)),
      profit: Number((current - invested).toFixed(2)),
    });
  }

  return {
    totalInvested: Number(totalInvested.toFixed(2)),
    currentValue: Number(currentValue.toFixed(2)),
    totalProfit: Number((currentValue - totalInvested).toFixed(2)),
    breakdown,
  };
}