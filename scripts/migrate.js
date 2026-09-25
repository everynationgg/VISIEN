const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Exact Supabase pooler connection for project qeinjomcfirfbtzesafo (ap-northeast-2)
  const connectionString = 'postgresql://postgres.qeinjomcfirfbtzesafo:xFp2Rr0v0pBb671H@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

  console.log('Connecting to Supabase (ap-northeast-2)...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to Supabase PostgreSQL!');

    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('✓ Schema executed successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified Public Tables in Supabase:');
    res.rows.forEach(r => console.log('  ✔ ' + r.table_name));

  } catch (sqlErr) {
    console.error('SQL Execution Error:', sqlErr);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
