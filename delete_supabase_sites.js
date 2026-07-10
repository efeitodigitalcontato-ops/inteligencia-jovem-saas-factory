process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const userId = '70eecef0-1e32-4172-9f10-17e4a208fe50';
  console.log(`Fetching sites from Supabase for user_id: ${userId}`);

  const { data: sites, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching sites:', error);
    return;
  }

  console.log(`Found ${sites.length} sites for this user.`);

  const urlsToRemove = [
    // Primeiro lote:
    'https://afiliados-blog-restaurao-de-biblia-em-sento-s.vercel.app',
    'https://afiliados-blog-b.vercel.app',
    'https://afiliados-blog-restaurando-biblias.vercel.app',
    'https://afiliados-blog-cafeteiras-1386.vercel.app',
    // Segundo lote:
    'https://afiliados-blog-cafeteiras-6815.vercel.app',
    'https://afiliados-blog-multicategorias-4015.vercel.app',
    'https://afiliados-blog-multicategorias-4394.vercel.app',
    'https://afiliados-blog-multicategorias-3125.vercel.app',
    'https://afiliados-blog-produtos-6722-geradorninja.vercel.app',
    'https://afiliados-blog-melhores-equipamentos-de-robs-aspir-geradorninja.vercel.app',
    'https://afiliados-blog-melhores-equipamentos-de-eletrodoms-geradorninja.vercel.app',
    'https://afiliados-blog-melhores-equipamentos-de-trabalho-freelancer.vercel.app',
    'https://afiliados-blog-melhores-equipamentos-de-ces-de-raa.vercel.app',
    'https://afiliados-blog-melhores-equipamentos-de-impressoras-3d.vercel.app'
  ].map(url => url.replace(/\/$/, '').toLowerCase());

  const matchedSiteIds = [];
  const matchedSiteUrls = [];

  for (const site of sites) {
    const deployUrlClean = (site.deploy_url || site.deployUrl || '').replace(/\/$/, '').toLowerCase();
    if (urlsToRemove.includes(deployUrlClean)) {
      matchedSiteIds.push(site.id);
      matchedSiteUrls.push(site.deploy_url || site.deployUrl);
    }
  }

  console.log('Sites matched for deletion:', matchedSiteUrls);

  if (matchedSiteIds.length === 0) {
    console.log('No matching sites found in Supabase.');
    return;
  }

  console.log(`Deleting ${matchedSiteIds.length} sites from Supabase...`);
  const { data: delData, error: delError } = await supabase
    .from('sites')
    .delete()
    .in('id', matchedSiteIds);

  if (delError) {
    console.error('Error during deletion:', delError);
  } else {
    console.log('Successfully deleted matched sites from Supabase!');
  }
}

run();
