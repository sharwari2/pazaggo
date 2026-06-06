import pkg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:sharwari23@localhost:5432/provue_tara",
});

function normalizeMerchant(name = "") {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

export async function queryTransactions({ startDate, endDate, category, merchant }) {
  let query = `
    SELECT *
    FROM transactions
    WHERE date::date >= $1::date AND date::date <= $2::date
    AND category != 'transfer'
  `;

  let params = [startDate, endDate];
  let i = 3;

  if (category) {
    query += ` AND LOWER(category) = $${i}`;
    params.push(category.toLowerCase());
    i++;
  }

  if (merchant) {
    query += ` AND LOWER(merchant) LIKE $${i}`;
    params.push(`%${merchant.toLowerCase()}%`);
    i++;
  }

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Query error:", err.message);
    return [];
  }
}

export async function getTotalSpend({ startDate, endDate, category, merchant }) {
  console.log("getTotalSpend called with:", { startDate, endDate, category, merchant });
  const rows = await queryTransactions({ startDate, endDate, category, merchant });
  console.log("rows returned:", rows.length);

  let total = 0;
  for (const r of rows) {
    total += Number(r.amount);
  }

  return {
    total: Number(total.toFixed(2)),
    count: rows.length,
  };
}