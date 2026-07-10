process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  // Query all profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('Profiles in DB:', profiles);

  // Query all sites
  const { data: sites, error: sErr } = await supabase.from('sites').select('*');
  console.log('Sites in DB:', sites);

  // Print columns of profiles
  if (profiles && profiles.length > 0) {
    console.log('Profile columns:', Object.keys(profiles[0]));
  }
  if (sites && sites.length > 0) {
    console.log('Sites columns:', Object.keys(sites[0]));
  }
}

run();
