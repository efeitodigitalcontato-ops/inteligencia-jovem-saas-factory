process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

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
  console.log(`Checking database for: ${email}`);

  // Query auth.users using admin client
  try {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error('Error listing auth users:', usersError);
    } else {
      console.log(`Found ${usersData.users.length} auth users.`);
      const match = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        console.log('Auth user match found:', {
          id: match.id,
          email: match.email,
          email_confirmed_at: match.email_confirmed_at,
          last_sign_in_at: match.last_sign_in_at
        });
      } else {
        console.log('No auth user match found in auth.users.');
      }
    }
  } catch (e) {
    console.error('Auth check error:', e);
  }

  // Query profiles table
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else {
      console.log('Profile match found in profiles table:', profiles);
    }
  } catch (e) {
    console.error('Profile query error:', e);
  }

  // Query sites table
  try {
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*');
    if (sitesError) {
      console.error('Error listing sites:', sitesError);
    } else {
      console.log(`Total sites in database: ${sites.length}`);
      // Find sites associated with user_id or repo names
    }
  } catch (e) {
    console.error('Sites query error:', e);
  }
}

run();
