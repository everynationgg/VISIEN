const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
} catch (e) {
  console.warn('Could not read .env.local file directly:', e.message);
}

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const sql = `
      -- Update chapter constraint
      alter table public.sessions drop constraint if exists sessions_current_chapter_check;
      alter table public.sessions add constraint sessions_current_chapter_check check (current_chapter in (1, 2, 3, 4));

      -- Add project status tracking columns if they do not exist
      alter table public.sessions add column if not exists project_status text default 'received';
      alter table public.sessions add column if not exists project_status_note text;
      alter table public.sessions add column if not exists project_status_updated_at timestamptz default now();
      alter table public.sessions add column if not exists client_clarification_reply text;
      alter table public.sessions add column if not exists client_clarification_replied_at timestamptz;

      -- Add new app_briefs columns
      alter table public.app_briefs add column if not exists user_roles text;
      alter table public.app_briefs add column if not exists auth_requirements text;
      alter table public.app_briefs add column if not exists notifications_channels text;
      alter table public.app_briefs add column if not exists hardware_capabilities text;
      alter table public.app_briefs add column if not exists data_readiness text;
      alter table public.app_briefs add column if not exists budget_range text;
      alter table public.app_briefs add column if not exists concept_image_url text;
      alter table public.app_briefs add column if not exists concept_image_feedback text;
      alter table public.app_briefs add column if not exists concept_image_notes text;
    `;

    console.log('Running migration SQL...');
    await client.query(sql);
    console.log('Migration SQL executed successfully!');

    // Verify columns on public.sessions
    const res = await client.query(`
      select column_name, data_type, column_default 
      from information_schema.columns 
      where table_schema = 'public' and table_name = 'sessions'
      order by ordinal_position;
    `);

    console.log('Current columns in public.sessions:');
    res.rows.forEach(r => {
      console.log(` - ${r.column_name} (${r.data_type}) [default: ${r.column_default}]`);
    });

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
