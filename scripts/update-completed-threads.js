const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
let dbUrl = '';
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts[0] === 'DATABASE_URL') dbUrl = parts.slice(1).join('=');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log('Connected to Supabase DB...');

  // Find all completed sessions that have current_question_index < 15
  const res = await client.query(`
    SELECT id, token, client_name, status, current_question_index 
    FROM public.sessions 
    WHERE current_question_index < 15;
  `);

  console.log(`Found ${res.rows.length} sessions to update:`);

  for (const session of res.rows) {
    console.log(`Updating session ${session.id} (${session.client_name || 'Client'}, token: ${session.token})...`);

    // 1. Update session to in_progress, chapter 4, project_status needs_info
    await client.query(`
      UPDATE public.sessions
      SET 
        status = 'in_progress',
        current_question_index = GREATEST(current_question_index, 9),
        current_chapter = 4,
        project_status = 'needs_info',
        project_status_note = 'Action required: Please answer 6 additional technical questions so our team can finalize your app architecture and build proposal.',
        project_status_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = $1;
    `, [session.id]);

    // 2. Check if a prompt for Question 10 already exists in messages
    const checkMsg = await client.query(`
      SELECT id FROM public.messages 
      WHERE session_id = $1 AND question_id = 'user_roles_and_access' AND role = 'enos';
    `, [session.id]);

    if (checkMsg.rows.length === 0) {
      const clientName = session.client_name ? session.client_name.split(' ')[0] : 'there';
      const promptText = `Welcome back, ${clientName}! Our engineering team has reviewed your vision so far. To finalize an exact custom app architecture, timeline, and build proposal, we have a few vital technical and operational questions.\n\nLet's start with this:\nWho are all the different types of people using this app (e.g. customers, staff, managers, vendors, admins), and what should each be able to do?`;

      await client.query(`
        INSERT INTO public.messages (session_id, role, content, question_id, is_follow_up, created_at)
        VALUES ($1, 'enos', $2, 'user_roles_and_access', false, NOW());
      `, [session.id, promptText]);
      console.log(`Inserted Enos prompt message for session ${session.id}`);
    }
  }

  console.log('All completed sessions successfully updated!');
  await client.end();
}

run().catch(e => {
  console.error('Update script failed:', e);
  process.exit(1);
});
