import pkg from "pg";
const { Client } = pkg;
const c = new Client({
  connectionString: "postgresql://postgres:sharwari23@localhost:5432/provue_tara",
});
c.connect()
  .then(() => c.query("SELECT category, amount, date FROM transactions WHERE date::date >= '2025-01-01' AND date::date <= '2025-01-31' AND LOWER(category) = 'food'"))
  .then(r => { console.log("count:", r.rows.length); console.log(r.rows); c.end(); });