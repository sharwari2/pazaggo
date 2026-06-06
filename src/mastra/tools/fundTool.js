import pkg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:sharwari23@localhost:5432/provue_tara",
});

async function getNav(fund_id, date) {
  const res = await pool.query(
    `SELECT nav FROM fund_nav
     WHERE fund_id = $1 AND nav_date <= $2
     ORDER BY nav_date DESC LIMIT 1`,
    [fund_id, date]
  );
  return res.rows[0]?.nav;
}

export async function getFundReturn({ fund_id, startDate, endDate }) {
  const startNav = await getNav(fund_id, startDate);
  const endNav = await getNav(fund_id, endDate);

  if (!startNav || !endNav) {
    return { error: "NAV data missing for given range" };
  }

  const returnPct = ((endNav - startNav) / startNav) * 100;

  return {
    fund_id,
    startNav,
    endNav,
    returnPct: Number(returnPct.toFixed(2)),
  };
}