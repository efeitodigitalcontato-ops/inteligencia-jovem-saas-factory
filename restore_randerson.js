process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'randersoncontato@gmail.com';
  const userId = '70eecef0-1e32-4172-9f10-17e4a208fe50'; // User ID found in Supabase Auth

  console.log(`Starting restoration for ${email} (${userId})...`);

  // 1. Read users.json
  const usersPath = path.join(__dirname, 'users.json');
  if (!fs.existsSync(usersPath)) {
    console.error(`users.json not found at ${usersPath}`);
    process.exit(1);
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const legacyUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!legacyUser) {
    console.error(`User ${email} not found in legacy users.json`);
    process.exit(1);
  }

  console.log(`Found legacy user in users.json. Sites count: ${legacyUser.sites ? legacyUser.sites.length : 0}`);

  // 2. Clean up any existing data in profiles and sites tables for this user to avoid conflicts
  console.log('Cleaning up existing sites in DB...');
  const { error: delSitesErr } = await supabase
    .from('sites')
    .delete()
    .eq('user_id', userId);
  
  if (delSitesErr) {
    console.warn('Warning deleting sites:', delSitesErr.message);
  }

  console.log('Cleaning up existing profile in DB...');
  const { error: delProfileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (delProfileErr) {
    console.warn('Warning deleting profile:', delProfileErr.message);
  }

  // 3. Restore profile
  console.log('Restoring profile in Supabase profiles table...');
  const profileData = {
    id: userId,
    email: email.toLowerCase(),
    name: legacyUser.name || 'Randerson',
    github_token: legacyUser.githubToken || '',
    vercel_token: legacyUser.vercelToken || '',
    vercel_team_id: legacyUser.vercelTeamId || '',
    gemini_api_key: legacyUser.geminiApiKey || '',
    approved: true,
    two_factor_enabled: legacyUser.twoFactorEnabled !== undefined ? legacyUser.twoFactorEnabled : true,
    onboarding_complete: true
  };

  const { data: newProfile, error: profileErr } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();

  if (profileErr) {
    console.error('Error inserting profile:', profileErr);
    process.exit(1);
  }

  console.log('Profile successfully restored:', newProfile);

  // 4. Restore sites
  if (legacyUser.sites && legacyUser.sites.length > 0) {
    console.log(`Inserting ${legacyUser.sites.length} sites...`);
    for (const site of legacyUser.sites) {
      const siteData = {
        user_id: userId,
        repo_name: site.repoName,
        theme: site.theme || '',
        custom_domain: site.customDomain || site.custom_domain || '',
        deploy_url: site.deployUrl || site.deploy_url || ''
      };

      const { error: siteErr } = await supabase
        .from('sites')
        .insert(siteData);

      if (siteErr) {
        console.error(`Error inserting site ${site.repoName}:`, siteErr.message);
      } else {
        console.log(`Restored site: ${site.repoName}`);
      }
    }
  }

  console.log('--- Restored Status Validation ---');
  const { data: finalProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  const { data: finalSites } = await supabase.from('sites').select('*').eq('user_id', userId);

  console.log('Final Profile in DB:', finalProfile);
  console.log(`Final Sites Count in DB: ${finalSites ? finalSites.length : 0}`);
}

run();
