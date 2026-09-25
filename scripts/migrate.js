const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let databaseUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    databaseUrl = line.substring('DATABASE_URL='.length).trim();
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase Postgres!');

  const query = `
    ALTER TABLE public.app_briefs ADD COLUMN IF NOT EXISTS target_platform text;
    ALTER TABLE public.app_briefs ADD COLUMN IF NOT EXISTS payments_integrations text;
    ALTER TABLE public.app_briefs ADD COLUMN IF NOT EXISTS target_timeline text;
  `;

  await client.query(query);
  console.log('Successfully executed migration on Supabase: added target_platform, payments_integrations, and target_timeline columns.');

  // Verify columns on app_briefs
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'app_briefs'
    ORDER BY ordinal_position;
  `);

  console.log('Current columns in public.app_briefs:');
  console.table(res.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
