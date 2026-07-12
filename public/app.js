// Override fetch to include token automatically
const originalFetch = window.fetch;
window.fetch = async function (resource, options) {
  const url = typeof resource === 'string' ? resource : (resource && resource.url);
  if (url && (url.startsWith('/api/') || url.includes('/api/')) && !url.includes('/api/login') && !url.includes('/api/register') && !url.includes('/api/config')) {
    const token = localStorage.getItem('saas_token');
    if (token) {
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return originalFetch(resource, options);
};

let supabaseClient = null;
async function initSupabase() {
  try {
    const configRes = await originalFetch('/api/config');
    const config = await configRes.json();
    if (config.supabaseUrl && config.supabaseAnonKey) {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      console.log('Supabase client initialized successfully.');
    }
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
}
initSupabase();

// App State Management
const State = {
  user: null,
  sites: [],
  credentials: {
    githubToken: '',
    vercelToken: '',
    vercelTeamId: ''
  }
};

// UI Elements Map
const el = {
  navLogo: document.getElementById('nav-logo-btn'),
  navLinksPrivate: document.querySelectorAll('.private-only'),
  navLinksPublic: document.querySelectorAll('.public-only'),
  loginNavBtn: document.getElementById('login-nav-btn'),
  registerNavBtn: document.getElementById('register-nav-btn'),
  heroCtaBtn: document.getElementById('hero-cta-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  userDisplayEmail: document.getElementById('user-display-email'),
  toastContainer: document.getElementById('toast-container'),
  
  // Views
  views: {
    landing: document.getElementById('view-landing'),
    auth: document.getElementById('view-auth'),
    dashboard: document.getElementById('view-dashboard'),
    newSite: document.getElementById('view-new-site'),
    niche: document.getElementById('view-niche'),
    multiGenerator: document.getElementById('view-multi-generator'),
    sitePosition: document.getElementById('view-site-position'),
    backlinkTracker: document.getElementById('view-backlink-tracker'),
    siloStructure: document.getElementById('view-silo-structure'),
    settings: document.getElementById('view-settings'),
    domainConfig: document.getElementById('view-domain-config'),
    netoSalva: document.getElementById('view-neto-salva'),
    payment: document.getElementById('view-payment'),
    imagesPanel: document.getElementById('view-images-panel')
  },

  // Auth
  tabLoginBtn: document.getElementById('tab-login-btn'),
  tabRegisterBtn: document.getElementById('tab-register-btn'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginEmail: document.getElementById('login-email'),
  loginPass: document.getElementById('login-password'),
  registerName: document.getElementById('register-name'),
  registerEmail: document.getElementById('register-email'),
  registerPass: document.getElementById('register-password'),
  authTriggerBtns: document.querySelectorAll('.auth-trigger-btn'),

  // Dashboard
  dashUserName: document.getElementById('dashboard-user-name'),
  dashNewBlogBtn: document.getElementById('dash-new-blog-btn'),
  emptyStateCreateBtn: document.getElementById('empty-state-create-btn'),
  statTotalBlogs: document.getElementById('stat-total-blogs'),
  statArticlesCount: document.getElementById('stat-articles-count'),
  blogListTbody: document.getElementById('blog-list-tbody'),
  siteListCount: document.getElementById('site-list-count'),

  // Wizard
  siteTheme: document.getElementById('site-theme'),
  customThemeGroup: document.getElementById('custom-theme-group'),
  siteCustomTheme: document.getElementById('site-custom-theme'),
  siteDescription: document.getElementById('site-description'),
  siteRepoName: document.getElementById('site-repo-name'),
  wizardForm: document.getElementById('wizard-form'),
  wizardCancelBtn: document.getElementById('wizard-cancel-btn'),
  wizardSubmitBtn: document.getElementById('wizard-submit-btn'),

  // Progress Overlay
  genOverlay: document.getElementById('generation-overlay'),
  progressStatus: document.getElementById('progress-status-text'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  steps: {
    github: document.getElementById('step-github'),
    template: document.getElementById('step-template'),
    git: document.getElementById('step-git'),
    vercel: document.getElementById('step-vercel')
  },

  // Settings
  settingsForm: document.getElementById('settings-form'),
  setGithubToken: document.getElementById('settings-github-token'),
  setVercelToken: document.getElementById('settings-vercel-token'),
  setVercelTeam: document.getElementById('settings-vercel-team'),
  setGeminiKey: document.getElementById('settings-gemini-key'),
  setPexelsKey: document.getElementById('settings-pexels-key'),

  // Domain Config
  domainSiteName: document.getElementById('domain-site-name'),
  domainSiteRepo: document.getElementById('domain-site-repo'),
  customDomainInput: document.getElementById('custom-domain-input'),
  domainConfigForm: document.getElementById('domain-config-form'),
  domainCancelBtn: document.getElementById('domain-cancel-btn'),

  // Two Factor Authentication
  twoFactorLoginForm: document.getElementById('two-factor-login-form'),
  login2faCode: document.getElementById('login-2fa-code'),
  btnCancel2faLogin: document.getElementById('btn-cancel-2fa-login'),
  
  twoFactorStatus: document.getElementById('two-factor-status'),
  btnEnable2fa: document.getElementById('btn-enable-2fa'),
  twoFactorSetupSteps: document.getElementById('two-factor-setup-steps'),
  qrImage: document.getElementById('qr-image'),
  twoFactorSecretKey: document.getElementById('two-factor-secret-key'),
  twoFactorVerifyForm: document.getElementById('two-factor-verify-form'),
  twoFactorVerificationCode: document.getElementById('two-factor-verification-code'),
  btnCancel2faSetup: document.getElementById('btn-cancel-2fa-setup'),
  
  twoFactorDisableSteps: document.getElementById('two-factor-disable-steps'),
  twoFactorDisableForm: document.getElementById('two-factor-disable-form'),
  twoFactorDisableCode: document.getElementById('two-factor-disable-code')
};

const MOTIVATIONAL_PHRASES = [
  "\"O único modo de fazer um excelente trabalho é amar o que você faz.\" – Steve Jobs",
  "\"Se você pode sonhar, você pode realizar.\" – Walt Disney",
  "\"Tudo é possível ao que crê.\" – Jesus (Marcos 9:23)",
  "\"Decidir o que não fazer é tão importante quanto decidir o que fazer.\" – Steve Jobs",
  "\"Seja forte e corajoso! Não desanime, pois o Senhor será com você por onde quer que for.\" – Josué 1:9",
  "\"Para começar, você precisa parar de falar e começar a fazer.\" – Walt Disney",
  "\"As pessoas que são loucas o suficiente para achar que podem mudar o mundo são as que de fato o mudam.\" – Steve Jobs",
  "\"Tudo posso naquele que me fortalece.\" – Filipenses 4:13",
  "\"Se seu tempo é limitado, não o desperdice vivendo a vida de outro.\" – Steve Jobs",
  "\"Peça, e lhe será dado; busque, e encontrará; bata, e a porta se abrirá.\" – Jesus (Mateus 7:7)",
  "\"Inovação é o que distingue um líder de um seguidor.\" – Steve Jobs",
  "\"Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.\" – Provérbios 16:3",
  "\"Seja corajoso o suficiente para seguir seu coração e intuição.\" – Steve Jobs",
  "\"O sucesso é a soma de pequenos esforços repetidos dia após dia.\" – Robert Collier",
  "\"A persistência é o caminho do êxito.\" – Charles Chaplin",
  "\"Nós não temos a chance de fazer muitas coisas, então cada uma deve ser excelente.\" – Steve Jobs",
  "\"Se você puder fazer rir, você pode fazer fazer qualquer coisa.\" – Walt Disney",
  "\"Tudo o que precisamos é de coragem e uma grande ideia para vencer.\" – Walt Disney",
  "\"Estou convencido de que metade do que separa os empreendedores bem-sucedidos dos não sucedidos é a pura perseverança.\" – Steve Jobs",
  "\"Tenha coragem de seguir seu coração e sua intuição. Eles já sabem o que você quer se tornar.\" – Steve Jobs",
  "\"Não vos inquieteis pelo dia de amanhã, pois o amanhã trará os seus cuidados.\" – Jesus (Mateus 6:34)",
  "\"Eu vim para que tenham vida, e a tenham em abundância.\" – Jesus (João 10:10)",
  "\"Os seus olhos devem olhar sempre para a frente, fixando a sua atenção no que está adiante.\" – Provérbios 4:25",
  "\"Bem-aventurado o homem que acha sabedoria, e o homem que adquire conhecimento.\" – Provérbios 3:13",
  "\"A fé é a certeza de coisas que se esperam, a convicção de fatos que se não vêem.\" – Hebreus 11:1",
  "\"Antes, sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros.\" – Efésios 4:32",
  "\"Esquecendo-me das coisas que para trás ficam e avançando para as que estão diante de mim, prossigo para o alvo.\" – Filipenses 3:13-14",
  "\"A jornada de mil milhas começa com um único passo.\" – Lao Tzu",
  "\"Faça o que puder, com o que tiver, onde estiver.\" – Theodore Roosevelt",
  "\"Cada sonho que você deixa para trás, é um pedaço do seu futuro que deixa de existir.\" – Steve Jobs",
  "\"Não pare quando estiver cansado, pare quando tiver terminado.\" – Motivação",
  "\"Grandes coisas nunca vêm de zonas de conforto.\" – Motivação",
  "\"O segredo da vitória é a constância do propósito.\" – Benjamin Disraeli",
  "\"O homem bom tira coisas boas do bom tesouro do seu coração.\" – Jesus (Lucas 6:45)"
];

let motivationalInterval = null;

function startMotivationalPhrases() {
  const container = document.getElementById('motivational-phrases-container');
  if (!container) return;
  
  stopMotivationalPhrases();
  
  let index = 0;
  const showNextPhrase = () => {
    container.style.opacity = 0;
    setTimeout(() => {
      container.textContent = MOTIVATIONAL_PHRASES[index];
      container.style.opacity = 1;
      index = (index + 1) % MOTIVATIONAL_PHRASES.length;
    }, 500);
  };
  
  showNextPhrase();
  motivationalInterval = setInterval(showNextPhrase, 6000);
}

function stopMotivationalPhrases() {
  if (motivationalInterval) {
    clearInterval(motivationalInterval);
    motivationalInterval = null;
  }
  const container = document.getElementById('motivational-phrases-container');
  if (container) {
    container.style.opacity = 0;
    container.textContent = '';
  }
}

// Router Helper
function showView(viewName) {
  if (typeof stopMotivationalPhrases === 'function') {
    stopMotivationalPhrases();
  }
  if (typeof ASMR !== 'undefined') {
    ASMR.playWhoosh();
  }
  Object.keys(el.views).forEach(name => {
    if (name === viewName) {
      el.views[name].classList.add('active');
    } else {
      el.views[name].classList.remove('active');
    }
  });

  if (viewName === 'settings') {
    updateTwoFactorUI();
  }

  if (viewName === 'dashboard') {
    checkGeminiKeyWarning();
  }

  if (viewName === 'multiGenerator') {
    populateMultiGeneratorSites();
  }

  if (viewName === 'sitePosition') {
    populatePositionSites();
  }

  if (viewName === 'backlinkTracker') {
    populateBacklinkSites();
    renderSavedBacklinks();
    if (window.initBacklinksProArea) {
      window.initBacklinksProArea();
    }
  }

  if (viewName === 'siloStructure') {
    populateSiloSites();
  }

  if (viewName === 'imagesPanel') {
    populateImagesSites();
  }

  if (viewName === 'netoSalva') {
    populateBackupSites();
  }

  if (viewName === 'niche') {
    initNicheSelector();
  }

  // Interação inteligente com a jornada da Safira ao trocar de tela
  if (window.comeceRapidoState && window.comeceRapidoState.active) {
    let newStep = 0;
    let selector = '';
    if (viewName === 'niche') {
      newStep = 1;
      selector = '.macro-card';
      if (window.comeceRapidoState.selectedMacro) selector = '.sub-card';
      if (window.comeceRapidoState.selectedSub) selector = '.btn-select-micro-niche';
    } else if (viewName === 'newSite') {
      newStep = 2;
      selector = '#wizard-submit-btn';
    } else if (viewName === 'siloStructure') {
      newStep = 3;
      selector = '#btn-analyze-silo';
    } else if (viewName === 'multiGenerator') {
      if (window.comeceRapidoState.generatedTitles) {
        if (window.comeceRapidoState.step === 5) {
          newStep = 5;
          selector = '#cn-login-colab-btn';
        } else {
          newStep = 4;
          selector = '#colabNinjaBtn';
        }
      } else {
        newStep = 4;
        selector = '#btn-get-ideas';
      }
    } else if (viewName === 'netoSalva') {
      newStep = 6;
      selector = '#btn-create-backup';
    }

    if (newStep > 0) {
      window.comeceRapidoState.step = newStep;
      setTimeout(() => {
        showSafiraComicBubble(selector, newStep);
      }, 150);
    }
  }

  // Smooth scroll to top on change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkGeminiKeyWarning() {
  const banner = document.getElementById('gemini-warning-banner');
  const tutorial = document.getElementById('gemini-tutorial-content');
  const showTutorialBtn = document.getElementById('btn-show-tutorial');
  
  if (!banner) return;
  
  // Show banner only if logged in and geminiApiKey is missing
  if (State.user && (!State.user.geminiApiKey || State.user.geminiApiKey.trim() === '')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
  
  // Wire up show tutorial button once if not already wired
  if (showTutorialBtn && !showTutorialBtn.dataset.wired) {
    showTutorialBtn.dataset.wired = 'true';
    showTutorialBtn.addEventListener('click', () => {
      if (tutorial.style.display === 'none') {
        tutorial.style.display = 'block';
        showTutorialBtn.textContent = 'Ocultar Tutorial';
      } else {
        tutorial.style.display = 'none';
        showTutorialBtn.textContent = 'Como Obter a Chave';
      }
    });
    
    // Wire up links to go to settings
    const goSettingsLinks = ['link-go-to-settings', 'link-go-to-settings-tutorial'];
    goSettingsLinks.forEach(id => {
      const link = document.getElementById(id);
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showView('settings');
        });
      }
    });
  }
}


// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  el.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Sluggify repository name dynamically
function sluggify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Migrate old local sites storage to new cloud database
async function migrateLocalSitesToServer(localSites) {
  try {
    console.log(`Syncing ${localSites.length} local sites to cloud...`);
    const response = await fetch('/api/sync-sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: State.user.email,
        sites: localSites
      })
    });
    const result = await response.json();
    if (response.ok && result.sites) {
      State.sites = result.sites;
      State.user.sites = result.sites;
      localStorage.setItem('saas_user', JSON.stringify(State.user));
      localStorage.removeItem(`saas_sites_${State.user.email}`);
      renderBlogList();
      console.log("Local sites successfully synced to cloud.");
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Initialize / Load from LocalStorage
function init() {
  const savedUser = localStorage.getItem('saas_user');
  if (savedUser) {
    State.user = JSON.parse(savedUser);
    State.sites = State.user.sites || [];

    // Trigger migration if old localStorage sites exist
    const localSites = JSON.parse(localStorage.getItem(`saas_sites_${State.user.email}`) || '[]');
    if (localSites.length > 0) {
      migrateLocalSitesToServer(localSites);
    }

    State.credentials = {
      githubToken: State.user.githubToken || "",
      vercelToken: State.user.vercelToken || "",
      vercelTeamId: State.user.vercelTeamId || "",
      geminiApiKey: State.user.geminiApiKey || ""
    };
    updateAuthUI(true);
    renderBlogList();
    updateTwoFactorUI();
    showView('dashboard');
    
    // Trigger Safira Onboarding Se necessário
    if (!State.user.onboardingComplete || !State.credentials.vercelToken || !State.credentials.githubToken || !State.credentials.geminiApiKey) {
      setTimeout(openSafiraOnboarding, 500);
    }
  } else {
    updateAuthUI(false);
    showView('landing');
  }

  // Pre-populate settings form
  el.setGithubToken.value = State.credentials.githubToken || '';
  el.setVercelToken.value = State.credentials.vercelToken || '';
  el.setVercelTeam.value = State.credentials.vercelTeamId || '';
  el.setGeminiKey.value = State.credentials.geminiApiKey || '';
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn) {
  const safiraTrigger = document.getElementById('safira-floating-trigger');
  const comeceTrigger = document.getElementById('comece-rapido-trigger');
  if (isLoggedIn) {
    el.navLinksPrivate.forEach(link => link.classList.remove('hidden'));
    el.navLinksPublic.forEach(link => link.classList.add('hidden'));
    el.userDisplayEmail.textContent = State.user.email;
    el.dashUserName.textContent = State.user.name || 'Empreendedor';
    if (safiraTrigger) safiraTrigger.classList.remove('hidden');
    if (comeceTrigger) comeceTrigger.classList.remove('hidden');
  } else {
    el.navLinksPrivate.forEach(link => link.classList.add('hidden'));
    el.navLinksPublic.forEach(link => link.classList.remove('hidden'));
    if (safiraTrigger) safiraTrigger.classList.add('hidden');
    if (comeceTrigger) comeceTrigger.classList.add('hidden');
    if (typeof closeSafiraChat === 'function') closeSafiraChat();
  }
}

// Auth Actions
function logout() {
  localStorage.removeItem('saas_user');
  localStorage.removeItem('saas_token');
  State.user = null;
  State.sites = [];
  updateAuthUI(false);
  showToast('Desconectado com sucesso!');
  showView('landing');
}

// Render user blog sites
function renderBlogList() {
  el.siteListCount.textContent = `${State.sites.length} site(s) criado(s)`;
  el.statTotalBlogs.textContent = State.sites.length;
  el.statArticlesCount.textContent = State.sites.length * 5; // Simulating initial generated articles

  if (State.sites.length === 0) {
    el.blogListTbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="4" class="empty-state">
          <div class="empty-icon">🛸</div>
          <h4>Nenhum blog criado ainda</h4>
          <p>Clique no botão para criar o seu primeiro blog em menos de 1 minuto!</p>
          <button class="btn btn-sm btn-primary" id="empty-state-create-btn-inside">Criar Meu Primeiro Blog</button>
        </td>
      </tr>
    `;
    const btn = document.getElementById('empty-state-create-btn-inside');
    if (btn) btn.addEventListener('click', () => showView('newSite'));
    return;
  }

  el.blogListTbody.innerHTML = '';
  State.sites.forEach(site => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="blog-name-cell">
          <span style="font-weight: 600; display: block; margin-bottom: 4px; color: var(--text-main);">${site.repoName}</span>
          ${site.lastSeoPosition !== undefined ? `
            <div style="font-size: 0.78rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="background: rgba(37, 99, 235, 0.12); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                🔍 Google Rank: ${site.lastSeoPosition > 0 ? `#${site.lastSeoPosition}` : 'N/A'}
              </span>
              <span style="color: var(--text-muted); font-size: 0.78rem;">
                para <strong style="color: var(--text-main);">"${site.lastSeoKeyword}"</strong> em ${new Date(site.lastSeoDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ` : ''}
          <a href="${site.repoUrl}" target="_blank" class="blog-sub">🌐 Ver Repositório GitHub</a>
        </div>
      </td>
      <td><span class="badge-outline" style="text-transform: capitalize;">${site.theme}</span></td>
      <td><span class="badge-success">Ativo & Online</span></td>
      <td>
        <div class="action-links" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${site.deployUrl}/admin/generator.html" target="_blank" class="btn btn-sm btn-primary">🚀 Gerar Conteúdo IA</a>
          <a href="${site.deployUrl}/admin/" target="_blank" class="btn btn-sm btn-secondary">Entrar no CMS</a>
          <button class="btn btn-sm btn-outline configure-domain-btn" data-repo="${site.repoName}" style="border: 1px solid var(--border); color: var(--text);">⚙️ Domínio</button>
          <a href="${site.deployUrl}" target="_blank" class="btn btn-sm" style="border: 1px solid var(--border); color: var(--text);">Ver Blog</a>
        </div>
      </td>
    `;
    el.blogListTbody.appendChild(tr);
  });

  // Attach event listeners to domain config buttons
  document.querySelectorAll('.configure-domain-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const repoName = e.currentTarget.getAttribute('data-repo');
      openDomainConfig(repoName);
    });
  });

  if (typeof cnLoadBlogsFromServer === 'function') {
    cnLoadBlogsFromServer();
  }
}

// Dynamic input handler for Theme selector
el.siteTheme.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    el.customThemeGroup.classList.remove('hidden');
    el.siteCustomTheme.required = true;
    el.siteRepoName.value = '';
  } else {
    el.customThemeGroup.classList.add('hidden');
    el.siteCustomTheme.required = false;
    el.siteCustomTheme.value = '';
    el.siteRepoName.value = `afiliados-blog-${e.target.value}`;
  }
});

// Update slug on custom theme change
el.siteCustomTheme.addEventListener('input', (e) => {
  el.siteRepoName.value = sluggify(`afiliados-blog-${e.target.value}`);
});

// Trigger change event to initialize fields on load
setTimeout(() => {
  if (el.siteTheme) {
    el.siteTheme.dispatchEvent(new Event('change'));
  }
}, 500);

// EVENT LISTENERS

// View Routing clicks
el.navLogo.addEventListener('click', () => showView(State.user ? 'dashboard' : 'landing'));
document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => { e.preventDefault(); showView('dashboard'); });
document.querySelector('a[href="#niche"]').addEventListener('click', (e) => { e.preventDefault(); showView('niche'); });
document.querySelector('a[href="#new-site"]').addEventListener('click', (e) => { e.preventDefault(); showView('newSite'); });
document.querySelector('a[href="#multi-generator"]').addEventListener('click', (e) => { e.preventDefault(); showView('multiGenerator'); });
document.querySelector('a[href="#silo-structure"]').addEventListener('click', (e) => { e.preventDefault(); showView('siloStructure'); });
document.querySelector('a[href="#site-position"]').addEventListener('click', (e) => { e.preventDefault(); showView('sitePosition'); });
document.querySelector('a[href="#backlink-tracker"]').addEventListener('click', (e) => { e.preventDefault(); showView('backlinkTracker'); });
document.querySelector('a[href="#neto-salva"]').addEventListener('click', (e) => { e.preventDefault(); showView('netoSalva'); });
document.querySelector('a[href="#images-panel"]').addEventListener('click', (e) => { e.preventDefault(); showView('imagesPanel'); });
document.querySelector('a[href="#settings"]').addEventListener('click', (e) => { e.preventDefault(); showView('settings'); });

el.loginNavBtn.addEventListener('click', () => { showView('auth'); el.tabLoginBtn.click(); });
el.registerNavBtn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
el.heroCtaBtn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
el.logoutBtn.addEventListener('click', logout);
el.dashNewBlogBtn.addEventListener('click', () => showView('newSite'));
const emptyBtn = document.getElementById('empty-state-create-btn');
if (emptyBtn) emptyBtn.addEventListener('click', () => showView('newSite'));

el.authTriggerBtns.forEach(btn => {
  btn.addEventListener('click', () => { showView('auth'); el.tabRegisterBtn.click(); });
});

// Auth Tabs switching
el.tabLoginBtn.addEventListener('click', () => {
  el.tabLoginBtn.classList.add('active');
  el.tabRegisterBtn.classList.remove('active');
  el.loginForm.classList.add('active');
  el.registerForm.classList.remove('active');
});

el.tabRegisterBtn.addEventListener('click', () => {
  el.tabRegisterBtn.classList.add('active');
  el.tabLoginBtn.classList.remove('active');
  el.registerForm.classList.add('active');
  el.loginForm.classList.remove('active');
});

// --- TWO-FACTOR AUTHENTICATION FRONTEND ENGINE ---
let tempLoginEmail = null;

function handleLoginSuccess(user) {
  localStorage.setItem('saas_user', JSON.stringify(user));
  State.user = user;
  State.sites = user.sites || [];
  State.credentials = {
    githubToken: user.githubToken || "",
    vercelToken: user.vercelToken || "",
    vercelTeamId: user.vercelTeamId || "",
    geminiApiKey: user.geminiApiKey || ""
  };
  
  // Pre-populate settings form
  el.setGithubToken.value = State.credentials.githubToken || '';
  el.setVercelToken.value = State.credentials.vercelToken || '';
  el.setVercelTeam.value = State.credentials.vercelTeamId || '';
  el.setGeminiKey.value = State.credentials.geminiApiKey || '';
  
  updateAuthUI(true);
  renderBlogList();
  updateTwoFactorUI();
  
  showToast(`Bem-vindo, ${user.name}!`);
  showView('dashboard');

  // Trigger Safira Onboarding Se necessário
  if (!user.onboardingComplete || !State.credentials.vercelToken || !State.credentials.githubToken || !State.credentials.geminiApiKey) {
    setTimeout(openSafiraOnboarding, 500);
  }
}

function updateTwoFactorUI() {
  if (!State.user) return;
  const isEnabled = !!State.user.twoFactorEnabled;
  
  if (isEnabled) {
    el.twoFactorStatus.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #10b981; font-size: 1.25rem;">●</span>
        <span>A autenticação de dois fatores (2FA) está <strong style="color: #10b981;">ATIVADA</strong> em sua conta.</span>
      </div>
    `;
    el.btnEnable2fa.style.display = 'none';
    el.twoFactorSetupSteps.style.display = 'none';
    el.twoFactorDisableSteps.style.display = 'block';
    el.twoFactorDisableCode.value = '';
  } else {
    el.twoFactorStatus.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #ef4444; font-size: 1.25rem;">●</span>
        <span>A autenticação de dois fatores (2FA) está <strong style="color: #ef4444;">DESATIVADA</strong> em sua conta.</span>
      </div>
    `;
    el.btnEnable2fa.style.display = 'inline-block';
    el.twoFactorSetupSteps.style.display = 'none';
    el.twoFactorDisableSteps.style.display = 'none';
  }
}

// 2FA Login Form
el.twoFactorLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.login2faCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/login/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempLoginEmail, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código inválido ou expirado.');
    }
    
    // Restore layout
    el.loginForm.style.display = 'block';
    el.twoFactorLoginForm.style.display = 'none';
    const tabs = document.querySelector('.auth-tabs');
    if (tabs) tabs.style.display = 'flex';
    
    handleLoginSuccess(result.user);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Cancel 2FA Login
el.btnCancel2faLogin.addEventListener('click', () => {
  tempLoginEmail = null;
  el.loginForm.style.display = 'block';
  el.twoFactorLoginForm.style.display = 'none';
  const tabs = document.querySelector('.auth-tabs');
  if (tabs) tabs.style.display = 'flex';
});

// Submit Login Form
el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = el.loginEmail.value;
  const password = el.loginPass.value;
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      if (result.requiresPayment) {
        showPaymentScreen(result.email);
        return;
      }
      throw new Error(result.error || 'Erro ao fazer login.');
    }
    
    if (result.token) {
      localStorage.setItem('saas_token', result.token);
    }
    
    if (result.twoFactorRequired) {
      tempLoginEmail = result.email;
      el.loginForm.style.display = 'none';
      if (el.registerForm) el.registerForm.style.display = 'none';
      const tabs = document.querySelector('.auth-tabs');
      if (tabs) tabs.style.display = 'none';
      el.twoFactorLoginForm.style.display = 'block';
      el.login2faCode.value = '';
      el.login2faCode.focus();
      showToast('Autenticação de dois fatores necessária.', 'info');
      return;
    }
    
    handleLoginSuccess(result.user);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

let pendingPaymentEmail = null;

function showPaymentScreen(email) {
  pendingPaymentEmail = email;
  showView('payment');
  showToast('Ativação pendente. Realize o pagamento para prosseguir.', 'info');
}

// Listeners para tela de pagamento
const btnPayNow = document.getElementById('btn-pay-now');
if (btnPayNow) {
  btnPayNow.addEventListener('click', async () => {
    if (!pendingPaymentEmail) {
      showToast('Nenhum e-mail pendente encontrado.', 'error');
      return;
    }

    const originalText = btnPayNow.innerHTML;
    btnPayNow.disabled = true;
    btnPayNow.innerHTML = '<span>⏳ Gerando checkout...</span>';

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingPaymentEmail })
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Erro ao criar checkout.');
      }
      
      showToast('Redirecionando para o pagamento seguro...', 'success');
      window.location.href = result.url;
    } catch (err) {
      showToast(err.message, 'error');
      btnPayNow.disabled = false;
      btnPayNow.innerHTML = originalText;
    }
  });
}

const btnPaymentLogout = document.getElementById('btn-payment-logout');
if (btnPaymentLogout) {
  btnPaymentLogout.addEventListener('click', () => {
    pendingPaymentEmail = null;
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    State.user = null;
    updateAuthUI(false);
    showView('auth');
  });
}

// 2FA Setup trigger
el.btnEnable2fa.addEventListener('click', async () => {
  try {
    el.btnEnable2fa.disabled = true;
    el.btnEnable2fa.textContent = 'Gerando Chave...';
    
    const res = await fetch('/api/two-factor/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao iniciar configuração de 2FA.');
    }
    
    el.qrImage.src = result.qrCodeUrl;
    el.twoFactorSecretKey.textContent = result.secret;
    el.twoFactorSetupSteps.style.display = 'block';
    el.btnEnable2fa.style.display = 'none';
    el.twoFactorVerificationCode.value = '';
    el.twoFactorVerificationCode.focus();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    el.btnEnable2fa.disabled = false;
    el.btnEnable2fa.textContent = 'Configurar 2FA';
  }
});

// Cancel 2FA Setup
el.btnCancel2faSetup.addEventListener('click', () => {
  el.twoFactorSetupSteps.style.display = 'none';
  el.btnEnable2fa.style.display = 'inline-block';
});

// Confirm 2FA Enable
el.twoFactorVerifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.twoFactorVerificationCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/two-factor/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código de verificação incorreto.');
    }
    
    State.user.twoFactorEnabled = true;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    
    updateTwoFactorUI();
    showToast('Autenticação de dois fatores ativada com sucesso!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Disable 2FA
el.twoFactorDisableForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = el.twoFactorDisableCode.value.trim().replace(/\s/g, '');
  if (!code || code.length !== 6) {
    showToast('O código deve conter 6 dígitos.', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/two-factor/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: State.user.email, code })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Código incorreto.');
    }
    
    State.user.twoFactorEnabled = false;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    
    updateTwoFactorUI();
    showToast('Autenticação de dois fatores desativada com sucesso.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Submit Register Form
el.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = el.registerName.value;
  const email = el.registerEmail.value;
  const password = el.registerPass.value;
  const geminiApiKey = document.getElementById('register-gemini-key').value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, geminiApiKey })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Erro ao realizar cadastro.');
    }

    showToast('Cadastro realizado com sucesso! Ative sua conta para continuar.', 'success');
    el.registerForm.reset();
    showPaymentScreen(email);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Submit Settings Form
el.settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const githubToken = el.setGithubToken.value.trim();
  const vercelToken = el.setVercelToken.value.trim();
  const vercelTeamId = el.setVercelTeam.value.trim();
  let geminiApiKey = el.setGeminiKey.value.trim();
  const pexelsApiKey = el.setPexelsKey ? el.setPexelsKey.value.trim() : '';

  try {
    if (pexelsApiKey && geminiApiKey) {
      geminiApiKey = geminiApiKey + '|||' + pexelsApiKey;
    }

    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: State.user.email,
        githubToken,
        vercelToken,
        vercelTeamId,
        geminiApiKey
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erro ao salvar configurações.');
    }

    State.user = result.user;
    localStorage.setItem('saas_user', JSON.stringify(State.user));
    State.credentials = {
      githubToken: State.user.githubToken || "",
      vercelToken: State.user.vercelToken || "",
      vercelTeamId: State.user.vercelTeamId || "",
      geminiApiKey: State.user.geminiApiKey || ""
    };

    localStorage.setItem('pexels_api_key', el.setPexelsKey.value.trim());

    showToast('Credenciais salvas com sucesso no banco de dados!', 'success');
    showView('dashboard');
  } catch (err) {
    console.error(err);
    showToast(`Falha ao salvar configurações: ${err.message}`, 'error');
  }
});

// Submit Wizard Site Creator Form (Real Cloud Generation!)
el.wizardForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const themeValue = el.siteTheme.value;
  const finalTheme = themeValue === 'custom' ? el.siteCustomTheme.value : themeValue;
  const finalDesc = el.siteDescription.value;
  const finalRepo = el.siteRepoName.value;
  const selectedPalette = document.querySelector('input[name="color-palette"]:checked').value;

  if (!State.credentials.vercelToken || State.credentials.vercelToken.trim() === '') {
    showToast('Token da Vercel obrigatório! Por favor, configure sua conta da Vercel.', 'error');
    if (!State.user.onboardingComplete) {
      openSafiraOnboarding();
    } else {
      showView('settings');
    }
    return;
  }

  // 1. Show generation loader overlay
  el.genOverlay.classList.remove('hidden');
  if (typeof startMotivationalPhrases === 'function') {
    startMotivationalPhrases();
  }
  if (typeof ASMR !== 'undefined') {
    ASMR.playAmbientMusic();
  }
  updateProgress('github', 'active', 'Conectando ao GitHub API...');

  try {
    // Stage 1: GitHub Creation
    await delay(1500);
    updateProgress('github', 'completed', 'Repositório GitHub criado com sucesso!');
    updateProgress('template', 'active', 'Acessando modelo Astro do Gerador Ninja...');

    // Stage 2: Cloning template
    await delay(1500);
    updateProgress('template', 'completed', 'Modelo Astro carregado na memória temporária.');
    updateProgress('git', 'active', 'Personalizando Sveltia CMS e enviando arquivos para nuvem...');

    // Stage 3: Remote Push
    await delay(1800);
    updateProgress('git', 'completed', 'Código-fonte enviado com sucesso para a branch main.');
    updateProgress('vercel', 'active', 'Conectando ao Gerador Ninja e iniciando deploy em nuvem...');

    // Stage 4: Call Real Server API
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: finalTheme,
        themeDescription: finalDesc,
        repoName: finalRepo,
        githubToken: State.credentials.githubToken,
        vercelToken: State.credentials.vercelToken,
        vercelTeamId: State.credentials.vercelTeamId,
        colorPalette: selectedPalette,
        geminiKey: localStorage.getItem("gemini_key") || "",
        userEmail: State.user.email
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      let errMsg = result.error || 'Erro ao gerar o site na nuvem.';
      if (result.details) {
        if (result.details.message) {
          errMsg += ` (${result.details.message})`;
        }
        if (Array.isArray(result.details.errors)) {
          const detailMsgs = result.details.errors.map(e => `${e.field || e.resource || 'erro'}: ${e.message}`).join(', ');
          errMsg += ` [${detailMsgs}]`;
        } else if (typeof result.details === 'string') {
          errMsg += ` (${result.details})`;
        }
      }
      throw new Error(errMsg);
    }

    updateProgress('vercel', 'active', 'Iniciando build no Gerador Ninja... (aguardando ficar online)');
    
    const dplId = result.vercelDeploymentId;
    let buildStatus = 'BUILDING';
    let pollCount = 0;
    const maxPolls = 40; // Max 200 seconds

    while ((buildStatus === 'BUILDING' || buildStatus === 'INITIALIZING' || buildStatus === 'QUEUED') && pollCount < maxPolls) {
      await delay(5000); // Check every 5 seconds
      pollCount++;
      try {
        const statusRes = await fetch(`/api/deployment-status/${dplId}?vercelToken=${encodeURIComponent(State.credentials.vercelToken)}&vercelTeamId=${encodeURIComponent(State.credentials.vercelTeamId)}`);
        const statusData = await statusRes.json();
        if (statusRes.ok && statusData.readyState) {
          buildStatus = statusData.readyState;
          console.log(`Vercel build status check: ${buildStatus}`);
          updateProgress('vercel', 'active', `Compilando no Gerador Ninja... Status: ${buildStatus} (${pollCount * 5}s)`);
        }
      } catch (err) {
        console.warn('Error polling build status:', err);
      }
    }

    if (buildStatus === 'READY') {
      updateProgress('vercel', 'completed', 'Deploy concluído! Site 100% online!');
    } else {
      updateProgress('vercel', 'completed', 'Build enviado para fila do Gerador Ninja! Ficando online em instantes.');
    }
    await delay(1500);

    // Update state & storage from the backend synchronized list
    if (result.sites) {
      State.sites = result.sites;
    } else {
      // Fallback
      const newSite = {
        repoName: result.repoName,
        repoUrl: result.repoUrl,
        deployUrl: result.deployUrl,
        theme: finalTheme,
        vercelProjectId: result.vercelProjectId
      };
      State.sites.push(newSite);
    }
    State.user.sites = State.sites;
    localStorage.setItem('saas_user', JSON.stringify(State.user));

    // Hide overlay
    el.genOverlay.classList.add('hidden');
    if (typeof stopMotivationalPhrases === 'function') {
      stopMotivationalPhrases();
    }
    if (typeof ASMR !== 'undefined') {
      ASMR.stopAmbientMusic();
      ASMR.playSuccess();
      ASMR.playApplause();
      triggerSuccessConfetti();
    }
    showToast('Parabéns! Seu blog premium foi fabricado do zero!', 'success');
    
    // Refresh & redirect to next step if in Comece Rápido journey
    renderBlogList();
    if (window.comeceRapidoState && window.comeceRapidoState.active) {
      window.comeceRapidoState.createdBlog = true;
      showView('dashboard');
      showToast('Safira: Excelente! Seu blog foi criado. Redirecionando para a Estrutura SILO em instantes...', 'info');
      setTimeout(() => {
        if (window.comeceRapidoState && window.comeceRapidoState.active) {
          advanceComeceRapidoComic(3);
        }
      }, 3500);
    } else {
      showView('dashboard');
    }

  } catch (err) {
    console.error(err);
    if (typeof ASMR !== 'undefined') {
      ASMR.stopAmbientMusic();
    }
    if (typeof stopMotivationalPhrases === 'function') {
      stopMotivationalPhrases();
    }
    el.genOverlay.classList.add('hidden');
    showToast(`Falha na criação do blog: ${err.message}`, 'error');
  }
});

// Cancel wizard
el.wizardCancelBtn.addEventListener('click', () => {
  showView('dashboard');
});

// Open domain config panel
function openDomainConfig(repoName) {
  const site = State.sites.find(s => s.repoName === repoName);
  if (!site) return;

  el.domainSiteName.textContent = site.repoName;
  el.domainSiteRepo.value = site.repoName;
  el.customDomainInput.value = site.customDomain || '';

  showView('domainConfig');
}

// Cancel domain config
el.domainCancelBtn.addEventListener('click', () => {
  showView('dashboard');
});

// Submit domain config form
el.domainConfigForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const repoName = el.domainSiteRepo.value;
  const domain = el.customDomainInput.value.trim().toLowerCase();

  if (!domain) {
    showToast('Por favor, insira um domínio válido.', 'error');
    return;
  }

  const submitBtn = document.getElementById('domain-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Configurando...';

  try {
    const response = await fetch('/api/configure-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoName: repoName,
        domain: domain,
        vercelToken: State.credentials.vercelToken,
        vercelTeamId: State.credentials.vercelTeamId,
        userEmail: State.user.email
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erro ao mapear o domínio na Vercel.');
    }

    // Update state & storage from the backend synchronized list
    if (result.sites) {
      State.sites = result.sites;
    } else {
      const siteIdx = State.sites.findIndex(s => s.repoName === repoName);
      if (siteIdx !== -1) {
        State.sites[siteIdx].customDomain = domain;
        State.sites[siteIdx].deployUrl = `https://${domain}`;
      }
    }
    State.user.sites = State.sites;
    localStorage.setItem('saas_user', JSON.stringify(State.user));

    showToast(`Domínio ${domain} configurado com sucesso!`, 'success');
    renderBlogList();
    showView('dashboard');
  } catch (err) {
    console.error(err);
    showToast(`Falha ao configurar domínio: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'USAR MEU DOMÍNIO';
  }
});

// Helper for UI loading states
function updateProgress(stepId, state, statusText) {
  const stepEl = el.steps[stepId];
  if (!stepEl) return;

  el.progressStatus.textContent = statusText;

  if (state === 'active') {
    stepEl.className = 'step active';
    if (stepId === 'github') el.progressBarFill.style.width = '25%';
    if (stepId === 'template') el.progressBarFill.style.width = '50%';
    if (stepId === 'git') el.progressBarFill.style.width = '75%';
    if (stepId === 'vercel') el.progressBarFill.style.width = '90%';
  } else if (state === 'completed') {
    stepEl.className = 'step completed';
    if (stepId === 'vercel') el.progressBarFill.style.width = '100%';
  }
}

// Delay promise helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Google Auth Frontend Functions
async function initGoogleAuth() {
  try {
    const configRes = await fetch('/api/config');
    const config = await configRes.json();

    if (config.googleClientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleGoogleAuthCallback
      });

      // Render the buttons
      const loginBtnDiv = document.getElementById('google-login-btn');
      if (loginBtnDiv) {
        window.google.accounts.id.renderButton(loginBtnDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          width: 320
        });
      }

      const registerBtnDiv = document.getElementById('google-register-btn');
      if (registerBtnDiv) {
        window.google.accounts.id.renderButton(registerBtnDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signup_with',
          width: 320
        });
      }
    }
  } catch (err) {
    console.error('Failed to init Google Auth:', err);
  }
}

async function handleGoogleAuthCallback(response) {
  const idToken = response.credential;
  if (!idToken) return;

  try {
    showToast('Autenticando com o Google...', 'info');
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      if (result.requiresPayment) {
        showPaymentScreen(result.email);
        return;
      }
      throw new Error(result.error || 'Erro ao autenticar com o Google.');
    }

    if (result.token) {
      localStorage.setItem('saas_token', result.token);
    }

    const user = result.user;
    localStorage.setItem('saas_user', JSON.stringify(user));
    State.user = user;
    State.sites = user.sites || [];
    State.credentials = {
      githubToken: user.githubToken || "",
      vercelToken: user.vercelToken || "",
      vercelTeamId: user.vercelTeamId || "",
      geminiApiKey: user.geminiApiKey || ""
    };

    // Pre-populate settings form
    el.setGithubToken.value = State.credentials.githubToken || '';
    el.setVercelToken.value = State.credentials.vercelToken || '';
    el.setVercelTeam.value = State.credentials.vercelTeamId || '';
    
    let displayGeminiKey = State.credentials.geminiApiKey || '';
    let displayPexelsKey = localStorage.getItem('pexels_api_key') || '';
    if (displayGeminiKey.includes('|||')) {
      const parts = displayGeminiKey.split('|||');
      displayGeminiKey = parts[0];
      displayPexelsKey = parts[1] || displayPexelsKey;
    }
    el.setGeminiKey.value = displayGeminiKey;
    if (displayPexelsKey) {
      localStorage.setItem('pexels_api_key', displayPexelsKey);
    }
    if (el.setPexelsKey) {
      el.setPexelsKey.value = displayPexelsKey;
    }

    updateAuthUI(true);
    renderBlogList();
    showToast(`Bem-vindo, ${user.name}!`);
    showView('dashboard');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================
// LÓGICA DO MULTI-GERADOR (ARTIGOS EM LOTE 1-CLIQUE)
// ==========================================

function populateMultiGeneratorSites() {
  const select = document.getElementById('multi-select-site');
  if (!select) return;
  
  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    return;
  }
  
  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.dataset.theme = site.theme;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });
}

// 1. Busca ideias de títulos de cauda longa
const btnGetIdeas = document.getElementById('btn-get-ideas');
if (btnGetIdeas) {
  btnGetIdeas.addEventListener('click', async () => {
    const keyword = document.getElementById('multi-seed-keyword').value.trim();
    if (!keyword) {
      showToast('Por favor, digite uma palavra-chave semente.', 'error');
      return;
    }
    
    // Pegamos a chave da API salva no state ou localStorage
    const apiKey = State.credentials.geminiApiKey || localStorage.getItem('user_gemini_key') || '';
    
    if (!apiKey) {
      showToast('Chave de API do Gemini não configurada!', 'error');
      return;
    }

    btnGetIdeas.disabled = true;
    btnGetIdeas.textContent = '🔍 Fazendo Busca em Tempo Real no Google...';
    
    // Obter dados do site selecionado no painel inferior para contexto de tema
    const siteSelectEl = document.getElementById('multi-select-site');
    const selectedSiteOption = siteSelectEl && siteSelectEl.selectedOptions.length > 0 ? siteSelectEl.selectedOptions[0] : null;
    let theme = selectedSiteOption ? (selectedSiteOption.dataset.theme || 'Geral') : 'Geral';
    
    // Fallback para o novo grid em lote
    if (!siteSelectEl && typeof selectedBulkBlog !== 'undefined' && selectedBulkBlog) {
      const matchedSite = State.sites.find(s => s.repoName === selectedBulkBlog);
      if (matchedSite && matchedSite.theme) {
        theme = matchedSite.theme;
      }
    }
    
    try {
      const prompt = `Você é um especialista em SEO avançado, tráfego orgânico de cauda longa, intenções de busca e micromomentos (Quero Saber, Quero Fazer, Quero Comprar, Quero Ir).
Sua tarefa é usar a sua ferramenta de busca (Google Search) para pesquisar sobre a palavra-chave semente "${keyword}" e analisar os resultados reais, dúvidas frequentes do público, perguntas reais do "As Pessoas Também Perguntam" (People Also Ask) e discussões online reais.

Com base nas pesquisas verdadeiras feitas na busca do Google e no tema do blog "${theme}", gere uma lista de EXATAMENTE 20 ideias de títulos de postagem extremamente originais, criativas e otimizadas para taxa de clique (CTR) alta e SEO.

REGRAS CRÍTICAS PARA EVITAR REPETIÇÃO E MONOTONIA:
1. NUNCA comece dois títulos com o mesmo prefixo ou palavra! Varie totalmente a primeira palavra de cada título.
2. NÃO use a mesma estrutura de frase para mais de um título. Evite padrões repetitivos (não use "Como escolher...", "Dicas de...", "Guia de..." em mais de um título).
3. NÃO faça apenas substituição simples de palavras em templates fixos. Cada título deve ter um vocabulário, estrutura e tom completamente diferentes, baseados em pesquisas reais.
4. Varie as intenções de busca e os micromomentos de forma equilibrada:
   - **Quero Comprar / Transacional**: Comparativos diretos (Ex: "A vs B: Qual vale mais a pena?"), custo-benefício real, guias de decisão e preços.
   - **Quero Saber / Informacional**: Dicas práticas, conceitos básicos, "o que é", curiosidades ou fatos desconhecidos.
   - **Quero Fazer / Tutorial**: Tutoriais passo a passo de uso, manutenção, limpeza ou como resolver problemas comuns.
   - **Análise / Avaliação Crítica**: Reviews detalhados com foco em se um modelo específico ou marca é boa/confiável de verdade.
5. Adicione tempero de copywriting de forma variada: use colchetes ou parênteses com chamadas extras (ex: "[Guia Completo]", "(Passo a Passo)", "[Cuidado]", "(Atualizado 2026)").
6. Os títulos devem soar naturais, escritos por humanos especialistas e apaixonados pelo assunto, nunca robóticos ou genéricos.

O resultado DEVE ser estritamente um array JSON válido de objetos, onde cada objeto tem uma propriedade 'title'. Exemplo:
[
  {"title": "Título Incrível e Único de Exemplo"},
  {"title": "Outra Abordagem Totalmente Diferente"}
]

Retorne APENAS o JSON bruto. Não inclua wraps de marcação de bloco de código como \`\`\`json ou \`\`\` no início ou final do texto.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.85 }
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Falha desconhecida na API do Gemini.');
      }
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text.trim();
        if (rawText.startsWith("```json")) {
          rawText = rawText.substring(7);
        } else if (rawText.startsWith("```")) {
          rawText = rawText.substring(3);
        }
        if (rawText.endsWith("```")) {
          rawText = rawText.substring(0, rawText.lastIndexOf("```"));
        }
        rawText = rawText.trim();
        
        const ideas = JSON.parse(rawText).slice(0, 20);
        
        const listContainer = document.getElementById('titles-list');
        if (listContainer) {
          listContainer.innerHTML = '';
          
          ideas.forEach((idea) => {
            const li = document.createElement('li');
            const titleText = idea.title.trim().replace(/[;,]$/, '');
            li.textContent = titleText;
            li.style.padding = '8px 0';
            li.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
            listContainer.appendChild(li);
          });
          
          document.getElementById('container-ideas-list').style.display = 'block';
          showToast('✓ 20 Ideias geradas com sucesso!', 'success');
          
          if (window.comeceRapidoState && window.comeceRapidoState.active) {
            window.comeceRapidoState.generatedTitles = true;
            
            const bulkTitles = document.getElementById('bulk-titles');
            if (bulkTitles && ideas) {
              bulkTitles.value = ideas.map(idea => {
                return idea.title.trim().replace(/[;,]$/, '');
              }).join('\n');
              bulkTitles.dispatchEvent(new Event('input'));
            }
            
            const cnTopics = document.getElementById('cn-topics');
            if (cnTopics && ideas) {
              cnTopics.value = ideas.map(idea => {
                return idea.title.trim().replace(/[;,]$/, '');
              }).join('\n');
              if (typeof cnCountTopics === 'function') cnCountTopics();
            }
            
            setTimeout(() => {
              showSafiraComicBubble('#colabNinjaBtn', 4);
            }, 300);
          }
        }
      } else {
        const candidate = data.candidates && data.candidates[0];
        const finishReason = candidate ? candidate.finishReason : 'UNKNOWN';
        throw new Error(`Resposta sem conteúdo do Gemini. Motivo de finalização: ${finishReason}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar ideias de títulos: ' + err.message, 'error');
    } finally {
      btnGetIdeas.disabled = false;
      btnGetIdeas.textContent = '🔍 Gerar Ideias de Títulos';
    }
  });
}

// 2. Copiar Todos os Títulos
const btnCopyTitles = document.getElementById('btn-copy-titles');
if (btnCopyTitles) {
  btnCopyTitles.addEventListener('click', () => {
    const listItems = document.querySelectorAll('#titles-list li');
    if (listItems.length === 0) {
      showToast('Nenhum título para copiar.', 'error');
      return;
    }
    const textToCopy = Array.from(listItems).map(li => {
      return li.textContent.trim().replace(/[;,]$/, '');
    }).join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('Todos os títulos foram copiados para a área de transferência!', 'success');
      })
      .catch(err => {
        showToast('Erro ao copiar títulos: ' + err.message, 'error');
      });
  });
}

// ==========================================
// LÓGICA DO MONITOR DE POSIÇÃO NO GOOGLE (SEO TRACKER)
// ==========================================

function populatePositionSites() {
  const select = document.getElementById('position-select-site');
  if (!select) return;
  
  select.innerHTML = '<option value="custom" selected>✨ Outro Site / URL Customizada</option>';
  
  if (State.sites && State.sites.length > 0) {
    State.sites.forEach(site => {
      const opt = document.createElement('option');
      opt.value = site.deployUrl || site.repoName;
      opt.dataset.repo = site.repoName;
      opt.textContent = `${site.repoName} (${site.deployUrl ? site.deployUrl.replace(/https?:\/\//, '') : 'Sem Domínio'})`;
      select.appendChild(opt);
    });
  }
  
  // Trigger update
  const event = new Event('change');
  select.dispatchEvent(event);
}

// Handler for select site dropdown change
const positionSelectSite = document.getElementById('position-select-site');
const positionCustomUrlGroup = document.getElementById('position-custom-url-group');
const positionCustomUrl = document.getElementById('position-custom-url');

if (positionSelectSite && positionCustomUrlGroup && positionCustomUrl) {
  positionSelectSite.addEventListener('change', () => {
    if (positionSelectSite.value === 'custom') {
      positionCustomUrlGroup.style.display = 'flex';
      positionCustomUrl.required = true;
    } else {
      positionCustomUrlGroup.style.display = 'none';
      positionCustomUrl.required = false;
    }
  });
}

// Clear button logic
const btnCancelPosition = document.getElementById('btn-cancel-position');
if (btnCancelPosition) {
  btnCancelPosition.addEventListener('click', () => {
    const form = document.getElementById('position-tracker-form');
    if (form) form.reset();
    
    const resultsContainer = document.getElementById('position-results-container');
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    const initialMock = document.getElementById('seo-initial-mock');
    if (initialMock) initialMock.classList.remove('hidden');
    
    const loadingMock = document.getElementById('seo-loading-mock');
    if (loadingMock) loadingMock.classList.add('hidden');
    
    if (positionSelectSite) {
      positionSelectSite.value = 'custom';
      const event = new Event('change');
      positionSelectSite.dispatchEvent(event);
    }
  });
}

// Tracker Form Submit
const positionTrackerForm = document.getElementById('position-tracker-form');
if (positionTrackerForm) {
  positionTrackerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectEl = document.getElementById('position-select-site');
    const selectSite = selectEl.value;
    let targetUrl = '';
    let repoName = '';
    if (selectSite === 'custom') {
      targetUrl = document.getElementById('position-custom-url').value.trim();
      
      // Fallback inteligente: se digitou manualmente, tenta bater o domínio com algum site do usuário para salvar
      const cleanTarget = targetUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      const matchedSite = State.sites.find(s => {
        const cleanDeploy = (s.deployUrl || '').toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
        const cleanRepo = s.repoName.replace('afiliados-blog-', '');
        return cleanTarget.includes(cleanDeploy) || cleanDeploy.includes(cleanTarget) || cleanTarget.includes(cleanRepo);
      });
      if (matchedSite) {
        repoName = matchedSite.repoName;
      }
    } else {
      targetUrl = selectSite;
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      if (selectedOpt) {
        repoName = selectedOpt.dataset.repo || '';
      }
    }
    
    const keyword = document.getElementById('position-keyword').value.trim();
    
    if (!targetUrl || !keyword) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    // UI elements
    const initialMock = document.getElementById('seo-initial-mock');
    const loadingMock = document.getElementById('seo-loading-mock');
    const loadingStatus = document.getElementById('seo-loading-status');
    const resultsContainer = document.getElementById('position-results-container');
    const analyzeBtn = document.getElementById('btn-analyze-position');
    
    // Update loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚡ Analisando...';
    if (initialMock) initialMock.classList.add('hidden');
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingStatus) loadingStatus.textContent = 'Rastreando as primeiras 100 posições orgânicas no Google...';
    
    try {
      const response = await fetch('/api/check-google-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: targetUrl,
          keyword: keyword,
          geminiApiKey: State.credentials.geminiApiKey,
          userEmail: State.user ? State.user.email : null,
          repoName: repoName || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro desconhecido ao rastrear a posição.');
      }
      
      // Update local storage and UI list if sites are returned
      if (data.sites) {
        State.sites = data.sites;
        if (State.user) {
          State.user.sites = data.sites;
          localStorage.setItem('saas_user', JSON.stringify(State.user));
        }
        renderBlogList();
      }
      
      if (loadingMock) loadingMock.classList.add('hidden');
      
      // Populate elements
      const methodBadge = document.getElementById('seo-method-badge');
      const rankValue = document.getElementById('seo-rank-value');
      const rankStatus = document.getElementById('seo-rank-status');
      const volumeValue = document.getElementById('seo-volume-value');
      const pageLink = document.getElementById('seo-page-link');
      const competitorsTbody = document.getElementById('seo-competitors-tbody');
      const adviceList = document.getElementById('seo-advice-list');
      
      if (methodBadge) methodBadge.textContent = data.method || 'Direct Scraper';
      
      // Rank Display format
      const pos = data.position;
      if (pos > 0) {
        if (rankValue) {
          rankValue.textContent = `#${pos}`;
          rankValue.className = 'gradient-text';
          rankValue.style.color = '';
        }
        if (rankStatus) {
          if (pos <= 3) {
            rankStatus.textContent = 'Excelente (Top 3)';
            rankStatus.style.background = 'rgba(16, 185, 129, 0.15)';
            rankStatus.style.color = '#10b981';
          } else if (pos <= 10) {
            rankStatus.textContent = 'Muito Bom (Top 10)';
            rankStatus.style.background = 'rgba(59, 130, 246, 0.15)';
            rankStatus.style.color = '#3b82f6';
          } else {
            rankStatus.textContent = 'Ranqueado (Top 100)';
            rankStatus.style.background = 'rgba(245, 158, 11, 0.15)';
            rankStatus.style.color = '#f59e0b';
          }
        }
      } else {
        if (rankValue) {
          rankValue.textContent = 'N/A';
          rankValue.className = '';
          rankValue.style.color = 'var(--text-muted)';
        }
        if (rankStatus) {
          rankStatus.textContent = 'Não Encontrado (Top 100)';
          rankStatus.style.background = 'rgba(239, 68, 68, 0.15)';
          rankStatus.style.color = '#ef4444';
        }
      }
      
      if (volumeValue) {
        volumeValue.textContent = data.searchVolume || 'Média';
      }
      
      if (pageLink) {
        if (data.pageUrl) {
          pageLink.href = data.pageUrl;
          pageLink.textContent = data.pageUrl.replace(/https?:\/\//, '');
          pageLink.style.pointerEvents = 'auto';
        } else {
          pageLink.href = '#';
          pageLink.textContent = 'Nenhuma página encontrada';
          pageLink.style.pointerEvents = 'none';
        }
      }
      
      // Top 10 Table
      if (competitorsTbody) {
        competitorsTbody.innerHTML = '';
        if (data.topResults && data.topResults.length > 0) {
          data.topResults.forEach(item => {
            const tr = document.createElement('tr');
            
            // Format domains for comparison
            const cleanTarget = targetUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
            const isUserSite = (item.url && item.url.includes(cleanTarget));
            
            if (isUserSite) {
              tr.style.background = 'rgba(37, 99, 235, 0.08)';
              tr.style.borderLeft = '4px solid #2563eb';
            }
            
            tr.innerHTML = `
              <td style="text-align: center; font-weight: bold; color: ${item.position <= 3 ? '#fbbf24' : 'var(--text-muted)'};">
                ${item.position}
              </td>
              <td>
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">
                  ${item.title || 'Resultado do Google'}
                </div>
                <a href="${item.url || '#'}" target="_blank" style="font-size: 0.8rem; color: var(--primary); text-decoration: none; word-break: break-all;">
                  ${item.url || ''}
                </a>
                ${item.snippet ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${item.snippet}</div>` : ''}
              </td>
            `;
            competitorsTbody.appendChild(tr);
          });
        } else {
          competitorsTbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum resultado orgânico retornado.</td></tr>';
        }
      }
      
      // Ninja Agent SEO Advice
      if (adviceList) {
        adviceList.innerHTML = '';
        if (data.seoAdvice && data.seoAdvice.length > 0) {
          data.seoAdvice.forEach(advice => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: var(--primary); font-weight: bold; margin-right: 5px;">✓</span> ${advice}`;
            adviceList.appendChild(li);
          });
        } else {
          adviceList.innerHTML = '<li>Nenhuma recomendação disponível para esta palavra-chave no momento.</li>';
        }
      }
      
      if (resultsContainer) resultsContainer.style.display = 'block';
      showToast('Análise de classificação concluída com sucesso!');
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.trackedPosition = true;
      }
      
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      if (initialMock) initialMock.classList.remove('hidden');
      if (resultsContainer) resultsContainer.style.display = 'none';
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Analisar Posição no Google';
      if (loadingMock) loadingMock.classList.add('hidden');
    }
  });
}

// ==========================================
// LÓGICA DO ARQUITETO SILO
// ==========================================

function populateSiloSites() {
  const select = document.getElementById('silo-select-site');
  if (!select) return;
  
  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    return;
  }
  
  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });
}

const siloForm = document.getElementById('silo-structure-form');
if (siloForm) {
  siloForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const repoName = document.getElementById('silo-select-site').value;
    const niche = document.getElementById('silo-niche').value.trim();
    
    if (!repoName || !niche) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    const initialMock = document.getElementById('silo-initial-mock');
    const loadingMock = document.getElementById('silo-loading-mock');
    const resultsContainer = document.getElementById('silo-results-container');
    const treeVisualizer = document.getElementById('silo-tree-visualizer');
    const analyzeBtn = document.getElementById('btn-analyze-silo');
    
    const stepClone = document.getElementById('silo-step-clone');
    const stepResearch = document.getElementById('silo-step-research');
    const stepTemplates = document.getElementById('silo-step-templates');
    const stepPush = document.getElementById('silo-step-push');
    
    // Reset steps UI
    [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
      if (el) {
        el.style.color = 'var(--text-muted)';
        el.textContent = el.textContent.replace('✓', '⏳').replace('❌', '⏳');
      }
    });
    
    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (resultsContainer) resultsContainer.style.display = 'none';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚡ Processando SILO...';
    
    try {
      // Step 1: Clone
      if (stepClone) {
        stepClone.style.color = 'var(--primary)';
        stepClone.textContent = '⏳ Clonando repositório e analisando artigos...';
      }
      
      const payload = {
        repoName,
        niche,
        githubToken: State.credentials.githubToken || localStorage.getItem('github_token'),
        geminiApiKey: State.credentials.geminiApiKey || localStorage.getItem('gemini_key'),
        userEmail: State.user ? State.user.email : null
      };
      
      // We will make a post to our API endpoint
      // We'll update the steps based on simulated delay or custom server events, but let's let the single request do it.
      if (stepResearch) {
        setTimeout(() => {
          stepClone.style.color = 'var(--success)';
          stepClone.textContent = '✓ Clonando repositório e analisando artigos concluído.';
          stepResearch.style.color = 'var(--primary)';
          stepResearch.textContent = '⏳ Pesquisando palavras cabeça e médias (Gemini)...';
        }, 3000);
      }
      
      if (stepTemplates) {
        setTimeout(() => {
          stepResearch.style.color = 'var(--success)';
          stepResearch.textContent = '✓ Pesquisando palavras cabeça e médias concluído.';
          stepTemplates.style.color = 'var(--primary)';
          stepTemplates.textContent = '⏳ Escrevendo silo.json e novos templates no repositório...';
        }, 9000);
      }

      if (stepPush) {
        setTimeout(() => {
          stepTemplates.style.color = 'var(--success)';
          stepTemplates.textContent = '✓ Escrevendo silo.json e novos templates concluído.';
          stepPush.style.color = 'var(--primary)';
          stepPush.textContent = '⏳ Enviando atualizações para o GitHub...';
        }, 13000);
      }

      const res = await fetch('/api/restructure-silo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error((data.error || 'Erro ao reestruturar blog em SILO.') + (data.details ? ' Detalhes: ' + data.details : ''));
      }
      
      // Update steps to done
      [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
        if (el) {
          el.style.color = 'var(--success)';
          el.textContent = el.textContent.replace('⏳', '✓');
        }
      });
      
      showToast('Estrutura SILO aplicada com sucesso!', 'success');
      
      // Render the visual tree
      if (treeVisualizer && data.silo) {
        let treeHtml = `<div style="font-weight: bold; color: var(--primary); margin-bottom: 1rem;">🌳 SITE: ${repoName} (Micro-Nicho: ${niche})</div>`;
        
        data.silo.categories.forEach(cat => {
          treeHtml += `<div style="margin-left: 10px; margin-top: 1rem;">📁 CATEGORIA (Head Term): <strong style="color: #fff;">${cat.name}</strong></div>`;
          treeHtml += `<div style="margin-left: 25px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${cat.description}"</div>`;
          
          cat.subcategories.forEach(sub => {
            treeHtml += `<div style="margin-left: 30px; margin-top: 0.5rem; color: #a855f7;">📂 SUBCATEGORIA (Middle Term): <strong>${sub.name}</strong></div>`;
            treeHtml += `<div style="margin-left: 45px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${sub.description}"</div>`;
            
            sub.articles.forEach(art => {
              treeHtml += `<div style="margin-left: 60px; color: #10b981;">📄 Artigo (Long-Tail): ${art.title} <span style="color: var(--text-muted); font-size: 0.85rem;">(${art.slug})</span></div>`;
            });
          });
        });
        
        treeVisualizer.innerHTML = treeHtml;
      }
      
      if (resultsContainer) resultsContainer.style.display = 'block';
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.structuredSilo = true;
      }
      
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      
      // Mark failed step in red
      [stepClone, stepResearch, stepTemplates, stepPush].forEach(el => {
        if (el && el.textContent.includes('⏳')) {
          el.style.color = '#ef4444';
          el.textContent = el.textContent.replace('⏳', '❌');
        }
      });
      
      if (initialMock) initialMock.classList.remove('hidden');
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Planejar e Estruturar SILO';
      if (loadingMock) loadingMock.classList.add('hidden');
    }
  });
}

// ========================================================
// LÓGICA DO SISTEMA NETO SALVA (BACKUPS)
// ========================================================

function populateBackupSites() {
  const select = document.getElementById('backup-select-site');
  if (!select) return;

  if (State.sites.length === 0) {
    select.innerHTML = '<option value="">Crie um blog primeiro na aba "Criar Blog"</option>';
    document.getElementById('backups-list-container').style.display = 'none';
    return;
  }

  select.innerHTML = '';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.textContent = `${site.repoName} (${site.theme})`;
    select.appendChild(opt);
  });

  // Attach event listener once if not already done
  if (!select.dataset.wired) {
    select.dataset.wired = 'true';
    select.addEventListener('change', () => {
      const repoName = select.value;
      if (repoName) {
        loadBackups(repoName);
      }
    });
  }

  // Initial load
  loadBackups(select.value);
}

async function loadBackups(repoName) {
  const container = document.getElementById('backups-list-container');
  const tbody = document.getElementById('backups-tbody');
  const badge = document.getElementById('backups-count-badge');

  if (!repoName) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;"><div class="spinner" style="margin: 0 auto 0.5rem auto;"></div>Carregando backups...</td></tr>';
  container.style.display = 'block';

  try {
    const response = await fetch(`/api/neto-salva/backups?repoName=${encodeURIComponent(repoName)}&githubToken=${encodeURIComponent(State.credentials.githubToken)}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao carregar os backups do servidor.');
    }

    badge.textContent = `${data.backups.length} backup(s) salvo(s)`;
    tbody.innerHTML = '';

    if (data.backups.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum ponto de restauração encontrado para este blog.</td></tr>';
      return;
    }

    data.backups.forEach(backup => {
      const tr = document.createElement('tr');
      const backupDate = new Date(backup.date).toLocaleString('pt-BR');
      const isAuto = backup.isAuto;
      
      tr.innerHTML = `
        <td><strong style="color: var(--text-main);">${backupDate}</strong></td>
        <td><code style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-size: 0.85rem;">${backup.id}</code></td>
        <td style="color: var(--text-main);">${backup.description}</td>
        <td>
          <span class="badge" style="background: ${isAuto ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${isAuto ? '#f59e0b' : '#10b981'}; font-weight: 600; padding: 4px 10px; border-radius: 6px;">
            ${isAuto ? 'Automático' : 'Manual'}
          </span>
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="triggerRestore('${repoName}', '${backup.id}')" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none;">Restaurar</button>
            <a class="btn btn-sm btn-outline" href="/api/neto-salva/download?repoName=${encodeURIComponent(repoName)}&tagName=${encodeURIComponent(backup.id)}&githubToken=${encodeURIComponent(State.credentials.githubToken)}" style="border: 1px solid var(--border); color: var(--text);">Baixar ZIP</a>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 1.5rem;">Erro ao carregar backups: ${err.message}</td></tr>`;
    showToast(err.message, 'error');
  }
}

// Global window reference for inline onclick triggers
window.triggerRestore = async function(repoName, tagName) {
  const confirmRestore = confirm(`Deseja realmente restaurar o blog para a versão "${tagName}"?\n\nIsso substituirá o estado atual do blog na nuvem. Um backup automático do estado atual será criado antes da restauração para sua segurança.`);
  if (!confirmRestore) return;

  const initialMock = document.getElementById('backup-initial-mock');
  const loadingMock = document.getElementById('backup-loading-mock');
  const loadingTitle = document.getElementById('backup-loading-title');
  const loadingStatus = document.getElementById('backup-loading-status');
  const createBtn = document.getElementById('btn-create-backup');

  // Set loading UI
  if (initialMock) initialMock.classList.add('hidden');
  if (loadingMock) loadingMock.classList.remove('hidden');
  if (loadingTitle) loadingTitle.textContent = 'Restaurando Blog...';
  if (loadingStatus) loadingStatus.textContent = 'Criando backup automático de segurança e aplicando a versão...';
  if (createBtn) createBtn.disabled = true;

  try {
    const response = await fetch('/api/neto-salva/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoName,
        tagName,
        githubToken: State.credentials.githubToken,
        userEmail: State.user ? State.user.email : null
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao realizar a restauração do backup.');
    }

    showToast('Blog restaurado com sucesso! O deploy da Vercel foi iniciado na nuvem.', 'success');
    
    // Reload backup list to show the new auto safeguard backup
    await loadBackups(repoName);

  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  } finally {
    if (loadingMock) loadingMock.classList.add('hidden');
    if (initialMock) initialMock.classList.remove('hidden');
    if (createBtn) createBtn.disabled = false;
  }
};

// Form submit for backup creation
const netoSalvaForm = document.getElementById('neto-salva-form');
if (netoSalvaForm) {
  netoSalvaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const repoName = document.getElementById('backup-select-site').value;
    const description = document.getElementById('backup-description').value.trim();

    if (!repoName || !description) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const initialMock = document.getElementById('backup-initial-mock');
    const loadingMock = document.getElementById('backup-loading-mock');
    const loadingTitle = document.getElementById('backup-loading-title');
    const loadingStatus = document.getElementById('backup-loading-status');
    const createBtn = document.getElementById('btn-create-backup');

    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingTitle) loadingTitle.textContent = 'Criando Backup...';
    if (loadingStatus) loadingStatus.textContent = 'Clonando repositório e gerando ponto de restauração no GitHub...';
    if (createBtn) createBtn.disabled = true;

    try {
      const response = await fetch('/api/neto-salva/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          description,
          githubToken: State.credentials.githubToken,
          userEmail: State.user ? State.user.email : null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar o ponto de restauração.');
      }

      showToast(`Ponto de restauração "${data.tagName}" criado com sucesso!`, 'success');
      document.getElementById('backup-description').value = '';
      
      // Reload backups list
      await loadBackups(repoName);
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.backedUp = true;
      }

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      if (loadingMock) loadingMock.classList.add('hidden');
      if (initialMock) initialMock.classList.remove('hidden');
      if (createBtn) createBtn.disabled = false;
    }
  });
}

// Form submit for backup restore via ZIP upload
const netoSalvaUploadForm = document.getElementById('neto-salva-upload-form');
if (netoSalvaUploadForm) {
  netoSalvaUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const repoName = document.getElementById('backup-select-site').value;
    const fileInput = document.getElementById('backup-zip-file');
    
    if (!repoName) {
      showToast('Selecione um blog primeiro.', 'error');
      return;
    }
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast('Por favor, selecione um arquivo ZIP de backup.', 'error');
      return;
    }

    const file = fileInput.files[0];
    const confirmUpload = confirm(`Deseja realmente restaurar o blog "${repoName}" a partir do arquivo "${file.name}"?\n\nIsso apagará e substituirá o estado atual do blog na nuvem. Um backup automático do estado atual será criado antes da restauração para sua segurança.`);
    if (!confirmUpload) return;

    const initialMock = document.getElementById('backup-initial-mock');
    const loadingMock = document.getElementById('backup-loading-mock');
    const loadingTitle = document.getElementById('backup-loading-title');
    const loadingStatus = document.getElementById('backup-loading-status');
    const uploadBtn = document.getElementById('btn-upload-restore');

    if (initialMock) initialMock.classList.add('hidden');
    if (loadingMock) loadingMock.classList.remove('hidden');
    if (loadingTitle) loadingTitle.textContent = 'Enviando & Restaurando ZIP...';
    if (loadingStatus) loadingStatus.textContent = 'Lendo o arquivo compactado e transmitindo para o servidor...';
    if (uploadBtn) uploadBtn.disabled = true;

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          // Extract base64 part of DataURL
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      if (loadingStatus) loadingStatus.textContent = 'Extraindo ZIP e atualizando repositório na nuvem (isso pode levar cerca de 1 minuto)...';

      const response = await fetch('/api/neto-salva/restore-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          zipData: base64Data,
          githubToken: State.credentials.githubToken,
          userEmail: State.user ? State.user.email : null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao restaurar a partir do ZIP enviado.');
      }

      showToast('Blog restaurado com sucesso a partir do ZIP! O deploy da Vercel foi iniciado na nuvem.', 'success');
      fileInput.value = '';
      
      // Reload backups list
      await loadBackups(repoName);

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      if (loadingMock) loadingMock.classList.add('hidden');
      if (initialMock) initialMock.classList.remove('hidden');
      if (uploadBtn) uploadBtn.disabled = false;
    }
  });
}
// helper delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- BACKLINK TRACKER CLIENT LOGIC ---

// Initialize Backlinks Pro members area
window.initBacklinksProArea = function() {
  // Navigation tabs inside Pro area
  const proNavItems = document.querySelectorAll('.pro-nav-item');
  const proSubViews = document.querySelectorAll('.pro-sub-view');
  
  proNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-pro-view');
      
      // Toggle active link
      proNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Toggle active sub-view
      proSubViews.forEach(view => {
        if (view.id === `pro-view-${targetView}`) {
          view.style.display = 'flex';
        } else {
          view.style.display = 'none';
        }
      });

      // Specific initializers per view
      if (targetView === 'dashboard') {
        renderProDashboard();
      } else if (targetView === 'create-article') {
        populateProHostBlogs();
      } else if (targetView === 'created-articles') {
        renderProCreatedArticles();
      } else if (targetView === 'partner-sites') {
        renderProPartnerSites();
      } else if (targetView === 'network-blogs') {
        renderProNetworkBlogs();
      } else if (targetView === 'keyword-campaigns') {
        renderProKeywordCampaigns();
      } else if (targetView === 'admin-panel') {
        renderProAdminPanel();
      }
    });
  });

  // Verify access permissions
  verifyProPermissions();
  
  // Render dashboard by default
  renderProDashboard();
};

function verifyProPermissions() {
  const userEmail = State.user ? State.user.email : '';
  const adminBtn = document.getElementById('pro-nav-admin');
  const networkBtn = document.getElementById('pro-nav-network-blogs');
  
  if (!adminBtn || !networkBtn) return;
  
  // Admin is randersoncontato@gmail.com
  const isAdmin = userEmail === 'randersoncontato@gmail.com';
  
  // Allowed publishers list
  let allowedEmails = [];
  try {
    allowedEmails = JSON.parse(localStorage.getItem('saas_allowed_publishers_emails')) || [];
  } catch (e) {
    allowedEmails = [];
  }
  const isAllowedPublisher = allowedEmails.includes(userEmail);

  if (isAdmin) {
    adminBtn.style.display = 'flex';
    networkBtn.style.display = 'flex';
  } else if (isAllowedPublisher) {
    adminBtn.style.display = 'none';
    networkBtn.style.display = 'flex';
  } else {
    adminBtn.style.display = 'none';
    networkBtn.style.display = 'none';
  }
}

// Domain Masker helper
function maskDomain(domain) {
  if (!domain) return '';
  const clean = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const parts = clean.split('.');
  const name = parts[0];
  const ext = parts.slice(1).join('.');
  if (name.length <= 3) {
    return `${name}$@$@$.${ext}`;
  }
  return `${name.substring(0, 3)}$@$@$.${ext}`;
}

// 1. DASHBOARD RENDERER & VISUALS
function renderProDashboard() {
  // Load local databases
  let created = [];
  let blogs = [];
  try {
    created = JSON.parse(localStorage.getItem('saas_created_articles')) || [];
  } catch(e) { created = []; }
  
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
      { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
      { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
    ];
  } catch(e) { blogs = []; }

  // Update Stats Cards
  document.getElementById('stat-links-count').textContent = created.length;
  document.getElementById('stat-blogs-count').textContent = blogs.length;
  
  // Avg difficulty
  let campaigns = [];
  try {
    campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
  } catch(e) {}
  let totalDif = 0, countDif = 0;
  campaigns.forEach(c => {
    (c.keywords || []).forEach(k => {
      countDif++;
      if (k.difficulty === 'Difícil') totalDif += 3;
      else if (k.difficulty === 'Médio') totalDif += 2;
      else totalDif += 1;
    });
  });
  let avgText = 'Fácil';
  if (countDif > 0) {
    const avg = totalDif / countDif;
    if (avg > 2.3) avgText = 'Difícil';
    else if (avg > 1.5) avgText = 'Médio';
  }
  document.getElementById('stat-avg-difficulty').textContent = avgText;

  // Last Created Date
  if (created.length > 0) {
    const last = created[created.length - 1];
    const date = new Date(last.createdAt);
    document.getElementById('stat-last-created').textContent = date.toLocaleDateString('pt-BR');
  } else {
    document.getElementById('stat-last-created').textContent = '-';
  }

  // Draw Niche Distribution Chart (SVG)
  renderNicheDistributionChart(blogs);

  // Draw SVG Connection Map
  renderConnectionsMap(created, blogs);
}

function renderNicheDistributionChart(blogs) {
  const svg = document.getElementById('network-niche-chart');
  const legend = document.getElementById('niche-chart-legend');
  if (!svg || !legend) return;

  svg.innerHTML = '';
  legend.innerHTML = '';

  if (blogs.length === 0) {
    svg.innerHTML = '<text x="50" y="50" text-anchor="middle" fill="var(--text-muted)" font-size="8">Sem dados</text>';
    return;
  }

  // Count niches
  const counts = {};
  blogs.forEach(b => {
    const theme = b.theme || 'Geral';
    counts[theme] = (counts[theme] || 0) + 1;
  });

  const total = blogs.length;
  const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
  let currentAngle = 0;
  let idx = 0;

  Object.entries(counts).forEach(([niche, val]) => {
    const percentage = val / total;
    const angle = percentage * 360;
    
    // Draw SVG Arc
    const r = 40;
    const cx = 50;
    const cy = 50;
    
    const x1 = cx + r * Math.cos((currentAngle - 90) * Math.PI / 180);
    const y1 = cy + r * Math.sin((currentAngle - 90) * Math.PI / 180);
    
    currentAngle += angle;
    
    const x2 = cx + r * Math.cos((currentAngle - 90) * Math.PI / 180);
    const y2 = cy + r * Math.sin((currentAngle - 90) * Math.PI / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = `
      M ${cx} ${cy}
      L ${x1} ${y1}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[idx % colors.length]);
    path.setAttribute('stroke', 'var(--bg-secondary)');
    path.setAttribute('stroke-width', '1.5');
    svg.appendChild(path);

    // Legend
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <span class="legend-dot" style="background: ${colors[idx % colors.length]};"></span>
      <span>${niche} (${val})</span>
    `;
    legend.appendChild(legendItem);
    
    idx++;
  });

  // Inner hole for Donut effect
  const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hole.setAttribute('cx', '50');
  hole.setAttribute('cy', '50');
  hole.setAttribute('r', '22');
  hole.setAttribute('fill', 'var(--bg-card)');
  svg.appendChild(hole);
}

function renderConnectionsMap(created, blogs) {
  const svg = document.getElementById('link-connections-map');
  if (!svg) return;
  
  svg.innerHTML = '';
  
  const width = svg.clientWidth || 300;
  const height = svg.clientHeight || 180;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Draw grid dots background
  for (let x = 10; x < width; x += 20) {
    for (let y = 10; y < height; y += 20) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', '1');
      dot.setAttribute('fill', 'rgba(255,255,255,0.03)');
      svg.appendChild(dot);
    }
  }

  // Define points: Hidden Network blogs (Left side) -> Client target sites (Right side)
  const leftX = width * 0.25;
  const rightX = width * 0.75;
  
  // Left nodes (Network Blogs)
  const leftNodes = blogs.slice(0, 4);
  if (leftNodes.length === 0) {
    leftNodes.push({ domain: 'Rede Oculta 1' });
    leftNodes.push({ domain: 'Rede Oculta 2' });
  }

  // Right nodes (Client partner sites)
  let partnerSites = [];
  try {
    partnerSites = JSON.parse(localStorage.getItem('saas_partner_sites')) || [];
  } catch(e) {}
  const rightNodes = partnerSites.slice(0, 3);
  if (rightNodes.length === 0) {
    rightNodes.push({ domain: 'Seu Site A' });
    rightNodes.push({ domain: 'Seu Site B' });
  }

  const leftStep = height / (leftNodes.length + 1);
  const rightStep = height / (rightNodes.length + 1);

  // Draw lines first
  leftNodes.forEach((ln, lIdx) => {
    const ly = leftStep * (lIdx + 1);
    
    rightNodes.forEach((rn, rIdx) => {
      const ry = rightStep * (rIdx + 1);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      // Cubic bezier path for smooth curved link lines
      const d = `M ${leftX} ${ly} C ${(leftX+rightX)/2} ${ly}, ${(leftX+rightX)/2} ${ry}, ${rightX} ${ry}`;
      line.setAttribute('d', d);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', 'url(#connections-gradient)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('class', 'connection-line');
      line.style.opacity = '0.3';
      svg.appendChild(line);
    });
  });

  // Gradient Definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="connections-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Draw Left Nodes
  leftNodes.forEach((ln, lIdx) => {
    const ly = leftStep * (lIdx + 1);
    
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    node.setAttribute('cx', leftX);
    node.setAttribute('cy', ly);
    node.setAttribute('r', '5');
    node.setAttribute('fill', '#a855f7');
    node.setAttribute('class', 'connection-node');
    svg.appendChild(node);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', leftX - 10);
    text.setAttribute('y', ly + 3);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'map-label');
    text.textContent = maskDomain(ln.domain);
    svg.appendChild(text);
  });

  // Draw Right Nodes
  rightNodes.forEach((rn, rIdx) => {
    const ry = rightStep * (rIdx + 1);
    
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    node.setAttribute('cx', rightX);
    node.setAttribute('cy', ry);
    node.setAttribute('r', '5');
    node.setAttribute('fill', '#10b981');
    node.setAttribute('class', 'connection-node');
    svg.appendChild(node);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', rightX + 10);
    text.setAttribute('y', ry + 3);
    text.setAttribute('text-anchor', 'start');
    text.setAttribute('class', 'map-label');
    const displayDomain = rn.domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    text.textContent = displayDomain;
    svg.appendChild(text);
  });
}

// 2. CREATE ARTICLE IA VIEW
function populateProHostBlogs() {
  const select = document.getElementById('pro-article-host-blog');
  if (!select) return;

  let blogs = [];
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
      { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
      { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
    ];
  } catch(e) { blogs = []; }

  select.innerHTML = '';
  if (blogs.length === 0) {
    select.innerHTML = '<option value="">⚠️ Nenhum blog disponível na rede (fale com o Admin)</option>';
    return;
  }

  blogs.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.domain;
    opt.dataset.theme = b.theme;
    opt.textContent = `${maskDomain(b.domain)} (${b.theme})`;
    select.appendChild(opt);
  });
}

// Submit generation form
const createForm = document.getElementById('pro-create-article-form');
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const targetUrl = document.getElementById('pro-article-target-url').value.trim();
    const keyword = document.getElementById('pro-article-keyword').value.trim();
    const hostBlog = document.getElementById('pro-article-host-blog').value;
    const tone = document.getElementById('pro-article-tone').value;

    if (!hostBlog) {
      showToast('Por favor, selecione um blog de destino válido.', 'error');
      return;
    }

    const selectEl = document.getElementById('pro-article-host-blog');
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const theme = selectedOpt ? selectedOpt.dataset.theme : 'Geral';

    // Show loading
    const statusContainer = document.getElementById('pro-article-generation-status');
    const loadingDiv = document.getElementById('pro-article-gen-loading');
    const previewDiv = document.getElementById('pro-article-gen-preview');
    
    statusContainer.classList.remove('hidden');
    loadingDiv.classList.remove('hidden');
    previewDiv.classList.add('hidden');

    // Helper function to generate bridged content
    function generateBridgedArticle(sourceTheme, hostTheme, keyword, targetUrl) {
      let title = `Como aliar ${sourceTheme} e ${hostTheme} para obter resultados extraordinários`;
      let body = '';

      if (sourceTheme === 'Dinheiro' && hostTheme.includes('Moda')) {
        title = `Como Ganhar Dinheiro e Empreender no Mercado da Moda`;
        body = `
          <p>O mercado fashion está em constante expansão e a busca por formas de rentabilizar marcas e serviços cresce a cada dia. Para quem deseja entender melhor sobre finanças neste nicho, compreender como faturar alto é o divisor de águas.</p>
          <p>Uma excelente alternativa de crescimento passa por dominar técnicas de marketing e investimento focadas. Ao utilizar <strong><a href="${targetUrl}" target="_blank" rel="noopener">${keyword}</a></strong>, empreendedores da moda conseguem posicionar seus produtos para o público de maior poder aquisitivo, maximizando a margem de lucro.</p>
          <p>Gerenciar o fluxo de caixa, planejar coleções viáveis e saber onde investir em divulgação digital são as chaves essenciais para quem busca o sucesso financeiro unindo o mundo dos negócios à estética e estilo.</p>
        `;
      }
      else if (sourceTheme === 'Dinheiro' && hostTheme.includes('Decoração')) {
        title = `Decoração Inteligente: Como Economizar Dinheiro ao Mobiliar seu Espaço`;
        body = `
          <p>Decorar uma casa de forma elegante não precisa custar uma fortuna. Hoje em dia, o design de interiores moderno valoriza muito o custo-benefício e o planejamento financeiro inteligente.</p>
          <p>A melhor forma de economizar sem perder o estilo é pesquisar materiais e fornecedores alternativos. Integrar soluções como <strong><a href="${targetUrl}" target="_blank" rel="noopener">${keyword}</a></strong> ajuda a planejar as compras passo a passo, evitando compras por impulso e mantendo o orçamento sob controle.</p>
          <p>Seja reaproveitando móveis antigos com técnicas de DIY (faça você mesmo) ou investindo em iluminação minimalista, é totalmente possível alcançar um resultado visual premium e sofisticado gastando muito menos.</p>
        `;
      }
      else if (sourceTheme === 'Tecnologia' && hostTheme.includes('Moda')) {
        title = `A Revolução da Tecnologia Vestível e a Moda do Futuro`;
        body = `
          <p>A moda e a tecnologia estão colidindo de formas fascinantes nos últimos anos. Desde tecidos inteligentes até provadores virtuais em 3D, a inovação digital está redesenhando como vestimos e compramos roupas.</p>
          <p>Esta fusão não se resume apenas a gadgets de pulso; ela alcança a otimização de toda a cadeia logística das marcas. Ao buscar inovação com <strong><a href="${targetUrl}" target="_blank" rel="noopener">${keyword}</a></strong>, os estilistas e engenheiros criam experiências de compra interativas que encantam o consumidor moderno.</p>
          <p>No futuro próximo, roupas customizadas por inteligência artificial e sensores de saúde integrados diretamente às fibras de linho e algodão serão itens padrão no nosso guarda-roupa diário.</p>
        `;
      }
      else if (sourceTheme === 'Saúde' && hostTheme.includes('Alimentação')) {
        title = `Alimentação Funcional: O Segredo de uma Saúde Blindada`;
        body = `
          <p>A nutrição correta é a base principal para evitar doenças e manter a energia elevada. Consumir alimentos naturais e funcionais ajuda o organismo a funcionar em sua capacidade máxima.</p>
          <p>Introduzir receitas balanceadas no dia a dia é o primeiro passo. Focar no consumo de macronutrientes adequados e soluções saudáveis como <strong><a href="${targetUrl}" target="_blank" rel="noopener">${keyword}</a></strong> fornece ao corpo os micronutrientes fundamentais para fortalecer a imunidade.</p>
          <p>Lembre-se sempre de consultar um especialista para ajustar suas porções e criar uma rotina alimentar rica em fibras, proteínas limpas e gorduras boas.</p>
        `;
      }
      else {
        title = `Tendências: A Integração de ${sourceTheme} no Universo de ${hostTheme}`;
        body = `
          <p>Em um mercado globalizado e interconectado, a fusão de diferentes especialidades é o que move a inovação. Entender como integrar conceitos de ${sourceTheme} com o nicho de ${hostTheme} cria oportunidades únicas de diferenciação.</p>
          <p>Esse cruzamento estratégico de audiências gera maior valor. Ao utilizar recursos como <strong><a href="${targetUrl}" target="_blank" rel="noopener">${keyword}</a></strong>, profissionais conseguem estabelecer autoridade nos dois mundos de forma orgânica e contextualizada.</p>
          <p>O futuro pertence a projetos que constroem pontes inteligentes e conectam necessidades diversas com soluções focadas, oferecendo uma experiência holística para os clientes.</p>
        `;
      }

      return { title, body };
    }

    const sourceTheme = document.getElementById('pro-article-source-theme').value;

    // Simulate IA call in client
    setTimeout(() => {
      const masked = maskDomain(hostBlog);
      const hostTheme = theme || 'Geral';
      
      const article = generateBridgedArticle(sourceTheme, hostTheme, keyword, targetUrl);

      // Save to created articles database
      let created = [];
      try {
        created = JSON.parse(localStorage.getItem('saas_created_articles')) || [];
      } catch(err) {}

      created.push({
        maskedDomain: masked,
        theme: hostTheme,
        anchorText: keyword,
        targetUrl: targetUrl,
        createdAt: new Date().toISOString()
      });

      localStorage.setItem('saas_created_articles', JSON.stringify(created));

      // Show preview
      loadingDiv.classList.add('hidden');
      previewDiv.classList.remove('hidden');
      
      document.getElementById('pro-preview-mask-domain').textContent = `Blog Destino: ${masked}`;
      document.getElementById('pro-preview-content').innerHTML = `
        <h3 style="margin-bottom: 10px; color: var(--primary); font-weight:700;">${article.title}</h3>
        ${article.body}
      `;

      showToast('Artigo gerado e publicado na rede oculta com sucesso!', 'success');
      createForm.reset();
    }, 2500);
  });
}

// 3. ARTIGOS CRIADOS VIEW
function renderProCreatedArticles() {
  const tbody = document.getElementById('pro-created-articles-tbody');
  if (!tbody) return;

  let created = [];
  try {
    created = JSON.parse(localStorage.getItem('saas_created_articles')) || [];
  } catch(e) { created = []; }

  if (created.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum artigo criado ainda. Vá na aba "Criar Artigo IA" para começar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  created.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong style="color:var(--primary); font-family: monospace;">${item.maskedDomain}</strong></td>
      <td><span class="badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary); padding:2px 6px; border-radius:4px; font-size:0.8rem;">${item.theme}</span></td>
      <td><code style="background:rgba(255,255,255,0.05); padding:3px 6px; border-radius:4px; font-weight:bold;">${item.anchorText}</code></td>
      <td><a href="${item.targetUrl}" target="_blank" style="color:var(--text-muted); font-size:0.8rem; text-decoration:underline;">Link Alvo</a></td>
      <td>${new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
      <td style="text-align:center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteProCreatedArticle(${idx})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 4px 8px; font-size:11px;">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.deleteProCreatedArticle = function(index) {
  let created = [];
  try {
    created = JSON.parse(localStorage.getItem('saas_created_articles')) || [];
  } catch(e) {}
  
  created.splice(index, 1);
  localStorage.setItem('saas_created_articles', JSON.stringify(created));
  renderProCreatedArticles();
  showToast('Registro de artigo removido.', 'success');
};

// 4. MEUS SITES COMUNS VIEW (RECEBER LINKS)
function renderProPartnerSites() {
  const tbody = document.getElementById('pro-partner-sites-tbody');
  if (!tbody) return;

  let partners = [];
  try {
    partners = JSON.parse(localStorage.getItem('saas_partner_sites')) || [];
  } catch(e) { partners = []; }

  if (partners.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum domínio cadastrado ainda. Adicione o seu primeiro site acima!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  partners.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong style="color:#fff;">${item.domain}</strong></td>
      <td>${new Date(item.addedAt).toLocaleDateString('pt-BR')}</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteProPartnerSite(${idx})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 4px 8px; font-size:11px;">Remover</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

const partnerForm = document.getElementById('pro-partner-site-form');
if (partnerForm) {
  partnerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const urlInput = document.getElementById('pro-partner-site-url');
    let url = urlInput.value.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let partners = [];
    try {
      partners = JSON.parse(localStorage.getItem('saas_partner_sites')) || [];
    } catch(err) {}

    partners.push({ domain: url, addedAt: new Date().toISOString() });
    localStorage.setItem('saas_partner_sites', JSON.stringify(partners));
    
    urlInput.value = '';
    renderProPartnerSites();
    showToast('Site parceiro adicionado com sucesso!', 'success');
  });
}

window.deleteProPartnerSite = function(index) {
  let partners = [];
  try {
    partners = JSON.parse(localStorage.getItem('saas_partner_sites')) || [];
  } catch(e) {}
  
  partners.splice(index, 1);
  localStorage.setItem('saas_partner_sites', JSON.stringify(partners));
  renderProPartnerSites();
  showToast('Site removido com sucesso.', 'success');
};

// 5. CADASTRAR BLOGS NA REDE (DELEGADOS E ADMIN)
function renderProNetworkBlogs() {
  const tbody = document.getElementById('pro-network-blogs-tbody');
  if (!tbody) return;

  let blogs = [];
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
      { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
      { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
    ];
  } catch(e) { blogs = []; }

  const currentUser = State.user ? State.user.email : '';

  // Filter only blogs registered by the current user
  const userBlogs = blogs.filter(b => b.addedBy === currentUser || (currentUser === 'randersoncontato@gmail.com' && b.addedBy === 'admin'));

  if (userBlogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum blog cadastrado por você ainda na rede comum.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  userBlogs.forEach((item) => {
    // Find absolute index in full blogs array for deletion
    const absIndex = blogs.findIndex(b => b.domain === item.domain);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.domain}</strong></td>
      <td><span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 6px; border-radius: 4px;">${item.theme}</span></td>
      <td>${item.addedBy === 'admin' ? 'Admin' : item.addedBy}</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteProNetworkBlog(${absIndex})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 4px 8px; font-size:11px;">Remover</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

const networkBlogForm = document.getElementById('pro-network-blog-form');
if (networkBlogForm) {
  networkBlogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const domainInput = document.getElementById('pro-network-blog-domain');
    const themeSelect = document.getElementById('pro-network-blog-theme');
    
    let domain = domainInput.value.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const theme = themeSelect.value;
    const currentUser = State.user ? State.user.email : '';

    if (!domain) return;

    let blogs = [];
    try {
      blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
        { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
        { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
      ];
    } catch(err) {}

    // Check duplicate
    if (blogs.some(b => b.domain === domain)) {
      showToast('Este blog já está cadastrado na rede.', 'error');
      return;
    }

    blogs.push({
      domain: domain,
      theme: theme,
      addedBy: currentUser === 'randersoncontato@gmail.com' ? 'admin' : currentUser
    });

    localStorage.setItem('saas_admin_backlink_blogs', JSON.stringify(blogs));
    domainInput.value = '';
    
    renderProNetworkBlogs();
    showToast('Seu blog foi disponibilizado na rede com sucesso!', 'success');
  });
}

window.deleteProNetworkBlog = function(absIndex) {
  let blogs = [];
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [];
  } catch(e) {}

  blogs.splice(absIndex, 1);
  localStorage.setItem('saas_admin_backlink_blogs', JSON.stringify(blogs));
  renderProNetworkBlogs();
  showToast('Blog removido da rede.', 'success');
};

// 6. KEYWORD PLANNER VIEW
const kwPlannerForm = document.getElementById('pro-keyword-planner-form');
if (kwPlannerForm) {
  kwPlannerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const seed = document.getElementById('pro-keyword-seed').value.trim();
    if (!seed) return;

    // Simulate Keyword generation
    const container = document.getElementById('keyword-results-container');
    const tbody = document.getElementById('keyword-planner-tbody');
    
    container.classList.remove('hidden');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem;"><div class="spinner" style="margin: 0 auto;"></div> Buscando termos...</td></tr>`;

    setTimeout(() => {
      const suggestions = [
        { term: `${seed} barato`, vol: 3200, cpc: 0.85, diff: 'Fácil' },
        { term: `melhor ${seed} para comprar`, vol: 2400, cpc: 1.45, diff: 'Médio' },
        { term: `como escolher ${seed}`, vol: 1600, cpc: 1.10, diff: 'Fácil' },
        { term: `${seed} profissional`, vol: 4800, cpc: 2.10, diff: 'Difícil' },
        { term: `guia de ${seed} completo`, vol: 900, cpc: 0.75, diff: 'Fácil' },
        { term: `dicas sobre ${seed}`, vol: 1800, cpc: 1.20, diff: 'Médio' }
      ];

      tbody.innerHTML = '';
      suggestions.forEach((item, idx) => {
        const row = document.createElement('tr');
        let badgeClass = 'difficulty-easy';
        if (item.diff === 'Médio') badgeClass = 'difficulty-medium';
        if (item.diff === 'Difícil') badgeClass = 'difficulty-hard';

        row.innerHTML = `
          <td style="text-align: center;"><input type="checkbox" class="keyword-select-item" data-term="${item.term}" data-vol="${item.vol}" data-cpc="${item.cpc}" data-diff="${item.diff}"></td>
          <td><strong>${item.term}</strong></td>
          <td>${item.vol.toLocaleString('pt-BR')} searches/mo</td>
          <td>R$ ${item.cpc.toFixed(2)}</td>
          <td><span class="difficulty-badge ${badgeClass}">${item.diff}</span></td>
        `;
        tbody.appendChild(row);
      });

      // Bind select all
      const selectAll = document.getElementById('keyword-select-all');
      if (selectAll) {
        selectAll.addEventListener('change', () => {
          const items = tbody.querySelectorAll('.keyword-select-item');
          items.forEach(i => i.checked = selectAll.checked);
        });
      }
    }, 1200);
  });
}

// Save selected keywords to campaign folder
const btnSaveToCampaign = document.getElementById('btn-save-to-campaign');
if (btnSaveToCampaign) {
  btnSaveToCampaign.addEventListener('click', () => {
    const checked = document.querySelectorAll('.keyword-select-item:checked');
    if (checked.length === 0) {
      showToast('Por favor, selecione pelo menos uma palavra-chave para salvar.', 'error');
      return;
    }

    let campaigns = [];
    try {
      campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
    } catch(e) {}

    if (campaigns.length === 0) {
      // Create a default campaign
      campaigns.push({ name: 'Minha Primeira Campanha', keywords: [] });
    }

    // Ask which campaign folder
    const list = campaigns.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
    const input = prompt(`Selecione o número da campanha para salvar as palavras:\n${list}\n\nOu digite um nome para criar uma nova campanha:`);
    if (input === null) return;

    let targetCampaign;
    const num = parseInt(input.trim());
    
    if (!isNaN(num) && num > 0 && num <= campaigns.length) {
      targetCampaign = campaigns[num - 1];
    } else if (input.trim().length > 0) {
      // Create new campaign
      targetCampaign = { name: input.trim(), keywords: [] };
      campaigns.push(targetCampaign);
    } else {
      showToast('Operação cancelada ou inválida.', 'error');
      return;
    }

    // Insert selected keywords
    checked.forEach(chk => {
      const term = chk.dataset.term;
      const vol = parseInt(chk.dataset.vol);
      const cpc = parseFloat(chk.dataset.cpc);
      const diff = chk.dataset.diff;

      if (!targetCampaign.keywords.some(k => k.term === term)) {
        targetCampaign.keywords.push({ term, vol, cpc, difficulty: diff });
      }
    });

    localStorage.setItem('saas_keyword_campaigns', JSON.stringify(campaigns));
    showToast(`Palavras salvas na campanha "${targetCampaign.name}" com sucesso!`, 'success');
    
    // Clear checks
    document.querySelectorAll('.keyword-select-item').forEach(i => i.checked = false);
    const selectAll = document.getElementById('keyword-select-all');
    if (selectAll) selectAll.checked = false;
  });
}

// 7. KEYWORD CAMPAIGNS VIEW
function renderProKeywordCampaigns() {
  const container = document.getElementById('campaigns-list-container');
  if (!container) return;

  let campaigns = [];
  try {
    campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
  } catch(e) { campaigns = []; }

  if (campaigns.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
        Nenhuma pasta de campanha criada ainda. Crie uma pasta acima para organizar suas palavras-chave.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  campaigns.forEach((camp, cIdx) => {
    const folder = document.createElement('div');
    folder.className = 'campaign-folder';
    
    let tableRows = '';
    if (!camp.keywords || camp.keywords.length === 0) {
      tableRows = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 15px;">Nenhuma palavra-chave nesta pasta. Use o Planejador para adicionar.</td></tr>`;
    } else {
      camp.keywords.forEach((kw, kIdx) => {
        let badgeClass = 'difficulty-easy';
        if (kw.difficulty === 'Médio') badgeClass = 'difficulty-medium';
        if (kw.difficulty === 'Difícil') badgeClass = 'difficulty-hard';
        
        tableRows += `
          <tr>
            <td><strong>${kw.term}</strong></td>
            <td>${kw.vol.toLocaleString('pt-BR')} searches/mo</td>
            <td>R$ ${kw.cpc.toFixed(2)}</td>
            <td><span class="difficulty-badge ${badgeClass}">${kw.difficulty}</span></td>
            <td style="text-align:center;">
              <button type="button" class="btn btn-sm btn-outline" onclick="deleteKeywordFromCampaign(${cIdx}, ${kIdx})" style="color:#ef4444; border-color:transparent; padding: 2px 6px; font-size:10px;">remover</button>
            </td>
          </tr>
        `;
      });
    }

    folder.innerHTML = `
      <div class="campaign-folder-header" onclick="toggleCampaignFolder(this)">
        <h5>📁 ${camp.name} (${camp.keywords ? camp.keywords.length : 0} palavras)</h5>
        <div style="display: flex; gap: 10px; align-items:center;">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); deleteCampaignFolder(${cIdx})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 4px 8px; font-size:11px;">Deletar Pasta</button>
          <span>▼</span>
        </div>
      </div>
      <div class="campaign-folder-content" style="display: none;">
        <table class="blog-table" style="font-size: 0.85rem; width:100%;">
          <thead>
            <tr>
              <th>Palavra-Chave</th>
              <th>Volume (Est.)</th>
              <th>CPC</th>
              <th>Dificuldade</th>
              <th style="width: 60px;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
    container.appendChild(folder);
  });
}

const campaignForm = document.getElementById('pro-campaign-form');
if (campaignForm) {
  campaignForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('pro-campaign-name');
    const name = nameInput.value.trim();
    if (!name) return;

    let campaigns = [];
    try {
      campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
    } catch(err) {}

    campaigns.push({ name: name, keywords: [] });
    localStorage.setItem('saas_keyword_campaigns', JSON.stringify(campaigns));
    
    nameInput.value = '';
    renderProKeywordCampaigns();
    showToast('Pasta de campanha criada com sucesso!', 'success');
  });
}

window.toggleCampaignFolder = function(headerEl) {
  const content = headerEl.nextElementSibling;
  const arrow = headerEl.querySelector('span:last-child');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    arrow.textContent = '▲';
  } else {
    content.style.display = 'none';
    arrow.textContent = '▼';
  }
};

window.deleteCampaignFolder = function(idx) {
  if (!confirm('Deseja realmente deletar esta pasta e todas as palavras-chave salvas nela?')) return;

  let campaigns = [];
  try {
    campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
  } catch(e) {}

  campaigns.splice(idx, 1);
  localStorage.setItem('saas_keyword_campaigns', JSON.stringify(campaigns));
  renderProKeywordCampaigns();
  showToast('Pasta de campanha deletada.', 'success');
};

window.deleteKeywordFromCampaign = function(cIdx, kIdx) {
  let campaigns = [];
  try {
    campaigns = JSON.parse(localStorage.getItem('saas_keyword_campaigns')) || [];
  } catch(e) {}

  campaigns[cIdx].keywords.splice(kIdx, 1);
  localStorage.setItem('saas_keyword_campaigns', JSON.stringify(campaigns));
  renderProKeywordCampaigns();
  showToast('Palavra-chave removida da campanha.', 'success');
};

// 8. ADMIN PANEL VIEW (EXCLUSIVE FOR RANDERSONCONTATO@GMAIL.COM)
function renderProAdminPanel() {
  renderAdminUsersList();
  renderAdminBlogsList();
}

function renderAdminUsersList() {
  const tbody = document.getElementById('admin-authorized-users-tbody');
  if (!tbody) return;

  let allowedEmails = [];
  try {
    allowedEmails = JSON.parse(localStorage.getItem('saas_allowed_publishers_emails')) || [];
  } catch(e) { allowedEmails = []; }

  if (allowedEmails.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--text-muted); padding:10px;">Nenhum usuário autorizado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  allowedEmails.forEach((email, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${email}</strong></td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteAdminUser(${idx})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 2px 6px; font-size:10px;">Revogar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderAdminBlogsList() {
  const tbody = document.getElementById('admin-blogs-tbody');
  if (!tbody) return;

  let blogs = [];
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
      { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
      { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
    ];
  } catch(e) { blogs = []; }

  // Filter only admin/global blogs
  const globalBlogs = blogs.filter(b => b.addedBy === 'admin');

  if (globalBlogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:10px;">Nenhum blog cadastrado na rede.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  globalBlogs.forEach((blog) => {
    const absIndex = blogs.findIndex(b => b.domain === blog.domain);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong style="color:var(--primary);">${blog.domain}</strong></td>
      <td>${blog.theme}</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteAdminBlog(${absIndex})" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding: 2px 6px; font-size:10px;">Remover</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Admin form handlers
const adminAddUserForm = document.getElementById('admin-add-user-form');
if (adminAddUserForm) {
  adminAddUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('admin-user-email');
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;

    let allowedEmails = [];
    try {
      allowedEmails = JSON.parse(localStorage.getItem('saas_allowed_publishers_emails')) || [];
    } catch(err) {}

    if (allowedEmails.includes(email)) {
      showToast('Este usuário já está autorizado.', 'error');
      return;
    }

    allowedEmails.push(email);
    localStorage.setItem('saas_allowed_publishers_emails', JSON.stringify(allowedEmails));
    emailInput.value = '';
    
    renderAdminUsersList();
    showToast('Usuário autorizado com sucesso!', 'success');
    verifyProPermissions();
  });
}

window.deleteAdminUser = function(idx) {
  let allowedEmails = [];
  try {
    allowedEmails = JSON.parse(localStorage.getItem('saas_allowed_publishers_emails')) || [];
  } catch(e) {}

  allowedEmails.splice(idx, 1);
  localStorage.setItem('saas_allowed_publishers_emails', JSON.stringify(allowedEmails));
  renderAdminUsersList();
  showToast('Permissão revogada.', 'success');
  verifyProPermissions();
};

const adminAddBlogForm = document.getElementById('admin-add-blog-form');
if (adminAddBlogForm) {
  adminAddBlogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const domainInput = document.getElementById('admin-blog-domain');
    const themeSelect = document.getElementById('admin-blog-theme');

    let domain = domainInput.value.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const theme = themeSelect.value;

    if (!domain) return;

    let blogs = [];
    try {
      blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [
        { domain: 'etecsr.com.br', theme: 'Decoração', addedBy: 'admin' },
        { domain: 'entecsolar.com.br', theme: 'Energia', addedBy: 'admin' }
      ];
    } catch(err) {}

    if (blogs.some(b => b.domain === domain)) {
      showToast('Este blog já está cadastrado na rede.', 'error');
      return;
    }

    blogs.push({ domain: domain, theme: theme, addedBy: 'admin' });
    localStorage.setItem('saas_admin_backlink_blogs', JSON.stringify(blogs));
    domainInput.value = '';

    renderAdminBlogsList();
    showToast('Blog global cadastrado com sucesso!', 'success');
  });
}

window.deleteAdminBlog = function(absIndex) {
  let blogs = [];
  try {
    blogs = JSON.parse(localStorage.getItem('saas_admin_backlink_blogs')) || [];
  } catch(e) {}

  blogs.splice(absIndex, 1);
  localStorage.setItem('saas_admin_backlink_blogs', JSON.stringify(blogs));
  renderAdminBlogsList();
  showToast('Blog global removido.', 'success');
};


// Populates drop-down selection with user's blogs (used in auditing analyzer tool)
function populateBacklinkSites() {
  const selectSite = document.getElementById('backlink-select-site');
  if (!selectSite) return;

  // Clear existing options except the manual input
  selectSite.innerHTML = '<option value="custom" selected>✨ Inserir URL Customizada</option>';

  State.sites.forEach(site => {
    const domain = site.deployUrl ? site.deployUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '') : site.repoName;
    const option = document.createElement('option');
    option.value = site.deployUrl || site.repoName;
    option.textContent = `${site.repoName} (${domain})`;
    option.dataset.repo = site.repoName;
    selectSite.appendChild(option);
  });
}

// Toggle manual input group based on dropdown selection
const selectBacklinkSite = document.getElementById('backlink-select-site');
const customUrlGroup = document.getElementById('backlink-custom-url-group');

if (selectBacklinkSite && customUrlGroup) {
  selectBacklinkSite.addEventListener('change', () => {
    if (selectBacklinkSite.value === 'custom') {
      customUrlGroup.style.display = 'flex';
    } else {
      customUrlGroup.style.display = 'none';
    }
  });
}

// Clear Backlink Form
const btnCancelBacklink = document.getElementById('btn-cancel-backlink');
if (btnCancelBacklink) {
  btnCancelBacklink.addEventListener('click', () => {
    const form = document.getElementById('backlink-tracker-form');
    if (form) form.reset();
    if (customUrlGroup) customUrlGroup.style.display = 'flex';
    
    document.getElementById('backlink-loading-mock').classList.add('hidden');
    document.getElementById('backlink-results-container').style.display = 'none';
  });
}

// Submit Handlers for auditing analyzer
const backlinkForm = document.getElementById('backlink-tracker-form');
if (backlinkForm) {
  backlinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectSite = document.getElementById('backlink-select-site').value;
    let targetUrl = '';
    
    if (selectSite === 'custom') {
      targetUrl = document.getElementById('backlink-custom-url').value.trim();
    } else {
      targetUrl = selectSite;
    }
    
    if (!targetUrl) {
      showToast('Por favor, insira ou selecione uma URL.', 'error');
      return;
    }
    
    const loadingMock = document.getElementById('backlink-loading-mock');
    const loadingStatus = document.getElementById('backlink-loading-status');
    const resultsContainer = document.getElementById('backlink-results-container');
    const analyzeBtn = document.getElementById('btn-analyze-backlink');
    const resultsTbody = document.getElementById('backlink-results-tbody');
    
    if (!loadingMock || !resultsContainer || !analyzeBtn || !resultsTbody) return;

    loadingMock.classList.remove('hidden');
    resultsContainer.style.display = 'none';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analisando...';
    
    const steps = {
      google: document.getElementById('backlink-step-google'),
      dns: document.getElementById('backlink-step-dns'),
      geoip: document.getElementById('backlink-step-geoip')
    };

    if (steps.google) steps.google.textContent = '⏳ Pesquisando backlinks (Gemini Grounding)...';
    if (steps.dns) steps.dns.textContent = '⏳ Resolvendo IP e servidores DNS...';
    if (steps.geoip) steps.geoip.textContent = '⏳ Localizando servidores de hospedagem...';

    try {
      loadingStatus.textContent = 'Pesquisando backlinks no índice do Google...';
      if (steps.google) steps.google.textContent = '⏳ Pesquisando backlinks (Gemini Grounding)...';
      
      const response = await fetch('/api/analyze-backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      if (steps.google) steps.google.textContent = '✅ Pesquisados backlinks com sucesso!';
      
      if (steps.dns) steps.dns.textContent = '⏳ Resolvendo IP e servidores DNS...';
      loadingStatus.textContent = 'Fazendo varredura DNS e Geolocation...';
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao analisar backlinks.');
      }
      
      const data = await response.json();
      
      if (steps.dns) steps.dns.textContent = '✅ IP e DNS resolvidos com sucesso!';
      if (steps.geoip) steps.geoip.textContent = '⏳ Localizando servidores de hospedagem...';
      
      setTimeout(() => {
        if (steps.geoip) steps.geoip.textContent = '✅ Geolocation mapeada com sucesso!';
        
        loadingMock.classList.add('hidden');
        resultsContainer.style.display = 'block';
        
        if (data.backlinks.length === 0) {
          resultsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum backlink externo real encontrado na varredura.</td></tr>';
        } else {
          resultsTbody.innerHTML = '';
          data.backlinks.forEach((link, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td><strong>${link.domain}</strong></td>
              <td><span class="badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">${link.relevance || 'N/A'}</span></td>
              <td><code>${link.anchorText || ''}</code></td>
              <td>
                <div style="font-family: monospace; font-size: 0.8rem;">IP: ${link.ip || 'Resolvendo...'}</div>
                <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">DNS: ${link.dns || 'N/A'}</div>
              </td>
              <td>
                <div style="font-size: 0.8rem;">ISP: ${link.isp || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${link.country || 'N/A'}</div>
              </td>
              <td style="text-align: center;">
                <button type="button" class="btn btn-sm btn-primary" onclick="saveBacklink('${link.anchorText || ''}', '${link.domain}')" style="font-size: 11px; padding: 4px 8px;">Salvar</button>
              </td>
            `;
            resultsTbody.appendChild(row);
          });
        }
        
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '⚡ Analisar Backlinks';
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast(error.message || 'Erro ao realizar a varredura.', 'error');
      loadingMock.classList.add('hidden');
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '⚡ Analisar Backlinks';
    }
  });
}

// Save backlink from auditor to local storage list
window.saveBacklink = function(anchorText, domain) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  if (saved.some(item => item.anchorText === anchorText && item.domain === domain)) {
    showToast('Este backlink já foi salvo anteriormente.', 'warning');
    return;
  }
  
  saved.push({ anchorText, domain, savedAt: new Date().toISOString() });
  localStorage.setItem('saas_saved_backlinks', JSON.stringify(saved));
  
  showToast('Link salvo com sucesso!', 'success');
  renderSavedBacklinks();
};

// Delete backlink from LocalStorage list
window.deleteSavedBacklink = function(index) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  saved.splice(index, 1);
  localStorage.setItem('saas_saved_backlinks', JSON.stringify(saved));
  
  showToast('Item removido da lista.', 'success');
  renderSavedBacklinks();
};

// Render saved backlinks table (auditor saved links)
function renderSavedBacklinks() {
  const savedTbody = document.getElementById('backlink-saved-tbody');
  if (!savedTbody) return;
  
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('saas_saved_backlinks')) || [];
  } catch (e) {
    saved = [];
  }
  
  if (saved.length === 0) {
    savedTbody.innerHTML = `
      <tr class="empty-backlinks-row">
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum backlink salvo na lista ainda. Faça uma análise acima e clique em "Salvar" para começar a gerenciar.
        </td>
      </tr>
    `;
    return;
  }
  
  savedTbody.innerHTML = '';
  saved.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <code style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--primary);">${item.anchorText}</code>
      </td>
      <td>
        <strong style="color: #fff;">${item.domain}</strong>
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-outline" onclick="deleteSavedBacklink(${idx})" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); padding: 6px 12px; font-size: 12px;">Remover</button>
      </td>
    `;
    savedTbody.appendChild(row);
  });
}


// ==========================================
// SAFIRA AI CHATBOT AGENT INTEGRATION
// ==========================================

let safiraHistory = [];

function toggleSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('active');
    backdrop.classList.toggle('active');
  }
}

function openSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeSafiraChat() {
  const sidebar = document.getElementById('safira-chat-sidebar');
  const backdrop = document.getElementById('safira-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('active');
    backdrop.classList.remove('active');
  }
}

function formatSafiraMessage(text) {
  // Safe escape
  let cleanText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Format code blocks
  cleanText = cleanText.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Format inline code
  cleanText = cleanText.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Format bold
  cleanText = cleanText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

  // Format lists & paragraphs
  const lines = cleanText.split('\n');
  let inList = false;
  let formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        formattedLines.push('<ul>');
        inList = true;
      }
      formattedLines.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      if (line !== '') {
        formattedLines.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) {
    formattedLines.push('</ul>');
  }

  return formattedLines.join('\n');
}

async function sendSafiraMessage(userText) {
  if (!userText.trim()) return;

  const chatMessages = document.getElementById('safira-messages');
  
  // Render user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'safira-message user';
  userBubble.innerHTML = `<p>${userText}</p>`;
  chatMessages.appendChild(userBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Render typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'safira-typing';
  typingIndicator.id = 'safira-typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save in history
  safiraHistory.push({ role: 'user', text: userText });

  try {
    const response = await fetch('/api/safira/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userText,
        history: safiraHistory.slice(0, -1), // Send previous history
        userEmail: State.user ? State.user.email : null,
        geminiApiKey: State.credentials ? State.credentials.geminiApiKey : null
      })
    });

    const data = await response.json();
    
    // Remove typing indicator
    const indicator = document.getElementById('safira-typing-indicator');
    if (indicator) indicator.remove();

    if (data.success && data.message) {
      let replyText = data.message;
      
      // Save model reply in history
      safiraHistory.push({ role: 'model', text: replyText });
      
      // Look for [[ACTION: ...]]
      let actionMatch = replyText.match(/\[\[ACTION:\s*([\s\S]*?)\s*\]\]/);
      let actionObj = null;
      if (actionMatch) {
        try {
          actionObj = JSON.parse(actionMatch[1]);
          // Clean the action text from response message
          replyText = replyText.replace(/\[\[ACTION:\s*[\s\S]*?\s*\]\]/g, '').trim();
        } catch (e) {
          console.error('Failed to parse action json:', e);
        }
      }

      // Render assistant bubble
      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'safira-message assistant';
      assistantBubble.innerHTML = formatSafiraMessage(replyText);
      chatMessages.appendChild(assistantBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Execute action if matched
      if (actionObj) {
        await executeSafiraAction(actionObj);
      }
    } else {
      throw new Error(data.error || 'Erro ao processar resposta.');
    }
  } catch (err) {
    console.error('Safira Chat Error:', err);
    // Remove typing indicator
    const indicator = document.getElementById('safira-typing-indicator');
    if (indicator) indicator.remove();

    const errorBubble = document.createElement('div');
    errorBubble.className = 'safira-message assistant';
    errorBubble.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    errorBubble.innerHTML = `<p style="color: var(--danger);">⚠️ Erro: Desculpe, não consegui processar sua requisição agora. Por favor, tente novamente.</p>`;
    chatMessages.appendChild(errorBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

async function executeSafiraAction(action) {
  console.log('Safira requested action:', action);
  
  const chatMessages = document.getElementById('safira-messages');
  const badge = document.createElement('div');
  badge.className = 'safira-action-badge';
  badge.innerHTML = `⚙️ Executando: <strong>${action.type.toUpperCase()}</strong>...`;
  chatMessages.appendChild(badge);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    switch (action.type) {
      case 'navigate':
        if (action.params && action.params.target) {
          showView(action.params.target);
          badge.innerHTML = `✓ Navegado para a seção: ${action.params.target}`;
        }
        break;

      case 'backup':
        const backupSelect = document.getElementById('backup-select-site');
        const repoName = (action.params && action.params.repoName) || (backupSelect ? backupSelect.value : '');
        if (!repoName) {
          badge.style.color = 'var(--danger)';
          badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          badge.innerHTML = `⚠️ Erro: Selecione um site antes de fazer backup.`;
          break;
        }
        badge.innerHTML = `💾 Iniciando Backup Neto Salva para ${repoName}...`;
        
        const res = await fetch('/api/neto-salva/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: repoName,
            description: action.params && action.params.description ? action.params.description : 'Backup via assistente Safira',
            githubToken: State.credentials.githubToken,
            userEmail: State.user.email
          })
        });
        const backupData = await res.json();
        if (backupData.success) {
          badge.innerHTML = `✓ Backup Neto Salva realizado! Tag: ${backupData.tagName || 'Sucesso'}`;
          if (typeof loadBackupsList === 'function') loadBackupsList(repoName);
        } else {
          throw new Error(backupData.error);
        }
        break;

      case 'silo':
        const siloSelect = document.getElementById('silo-select-site');
        const siloRepo = (action.params && action.params.repoName) || (siloSelect ? siloSelect.value : '');
        const siloNiche = (action.params && action.params.niche) || 'Micro-nicho';
        if (!siloRepo) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Repositório não especificado para reestruturação SILO.`;
          break;
        }
        badge.innerHTML = `📐 Reestruturando ${siloRepo} em SILO...`;
        showView('siloStructure');
        const sRes = await fetch('/api/restructure-silo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: siloRepo,
            niche: siloNiche,
            githubToken: State.credentials.githubToken,
            geminiApiKey: State.credentials.geminiApiKey,
            userEmail: State.user.email
          })
        });
        const sData = await sRes.json();
        if (sData.success) {
          badge.innerHTML = `✓ Arquitetura SILO gerada com sucesso para ${siloRepo}!`;
        } else {
          throw new Error(sData.error);
        }
        break;

      case 'google-position':
        if (!action.params || !action.params.domain || !action.params.keyword) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio e palavra-chave necessários.`;
          break;
        }
        badge.innerHTML = `🔍 Analisando posição de "${action.params.keyword}" para ${action.params.domain}...`;
        showView('sitePosition');
        const pRes = await fetch('/api/check-google-position', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            keyword: action.params.keyword,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const pData = await pRes.json();
        if (pData.success) {
          badge.innerHTML = `✓ Palavra-chave encontrada na Posição #${pData.position} no Google.`;
        } else {
          throw new Error(pData.error);
        }
        break;

      case 'backlinks':
        if (!action.params || !action.params.domain) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Domínio de destino necessário.`;
          break;
        }
        badge.innerHTML = `🔗 Analisando backlinks de ${action.params.domain}...`;
        showView('backlinkTracker');
        const bRes = await fetch('/api/analyze-backlinks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: action.params.domain,
            geminiApiKey: State.credentials.geminiApiKey
          })
        });
        const bData = await bRes.json();
        if (bData.success) {
          badge.innerHTML = `✓ Análise finalizada. Encontrados ${bData.backlinks ? bData.backlinks.length : 0} backlinks relevantes.`;
        } else {
          throw new Error(bData.error);
        }
        break;

      case 'generate-single':
        if (!action.params || !action.params.theme) {
          badge.style.color = 'var(--danger)';
          badge.innerHTML = `⚠️ Erro: Tema do artigo em falta.`;
          break;
        }
        badge.innerHTML = `✍️ Preenchendo campos de geração para o tema: ${action.params.theme}...`;
        showView('newSite');
        const themeInput = document.getElementById('new-site-niche');
        const descInput = document.getElementById('new-site-description');
        if (themeInput) themeInput.value = action.params.theme;
        if (descInput && action.params.themeDescription) descInput.value = action.params.themeDescription;
        badge.innerHTML = `✓ Campos preenchidos na seção Criar Blog.`;
        break;

      case 'add-panel':
        showView('multiGenerator');
        setTimeout(() => {
          if (typeof mpAddPanel === 'function') {
            mpAddPanel();
            badge.innerHTML = `✓ Novo painel criado na aba Artigos em Lote!`;
          } else {
            badge.style.color = 'var(--danger)';
            badge.innerHTML = `⚠️ Função multi-painel não encontrada.`;
          }
        }, 300);
        break;

      default:
        badge.style.color = 'var(--danger)';
        badge.innerHTML = `⚠️ Ação não suportada: ${action.type}`;
    }
  } catch (err) {
    console.error('Safira action error:', err);
    badge.style.color = 'var(--danger)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    badge.innerHTML = `⚠️ Falha ao executar ação: ${err.message}`;
  }
}

function sendSafiraSuggestion(text) {
  const input = document.getElementById('safira-chat-input');
  if (input) {
    input.value = text;
    const form = document.getElementById('safira-chat-form');
    if (form) {
      // Dispatch submit event
      const event = new Event('submit', { cancelable: true });
      form.dispatchEvent(event);
    }
  }
}

function tourClearAllHighlights() {
  document.querySelectorAll('.tour-highlight').forEach(el => {
    el.classList.remove('tour-highlight');
  });
  document.querySelectorAll('.tour-arrow-indicator').forEach(el => {
    el.remove();
  });
}

window.tourClearAllHighlights = tourClearAllHighlights;

function tourHighlightElement(selector, arrowText, position = 'top') {
  tourClearAllHighlights();
  
  const element = document.querySelector(selector);
  if (!element) return;
  
  element.classList.add('tour-highlight');
  
  const indicator = document.createElement('div');
  indicator.className = `tour-arrow-indicator arrow-${position}`;
  indicator.innerText = arrowText;
  document.body.appendChild(indicator);
  
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  let indicatorLeft = 0;
  let indicatorTop = 0;
  
  if (position === 'top') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.top + scrollTop - 45;
  } else if (position === 'bottom') {
    indicatorLeft = rect.left + rect.width / 2 + scrollLeft;
    indicatorTop = rect.bottom + scrollTop + 15;
  } else if (position === 'left') {
    indicatorLeft = rect.left + scrollLeft - 150; // offset width approx
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  } else if (position === 'right') {
    indicatorLeft = rect.right + scrollLeft + 15;
    indicatorTop = rect.top + rect.height / 2 + scrollTop - 15;
  }
  
  indicator.style.left = `${indicatorLeft}px`;
  indicator.style.top = `${indicatorTop}px`;
  
  // Refine position dynamically after dimensions are known
  setTimeout(() => {
    if (position === 'top' || position === 'bottom') {
      indicator.style.left = `${rect.left + rect.width / 2 + scrollLeft - indicator.offsetWidth / 2}px`;
    } else if (position === 'left') {
      indicator.style.left = `${rect.left + scrollLeft - indicator.offsetWidth - 15}px`;
    }
  }, 50);
}

window.tourHighlightElement = tourHighlightElement;

function addSafiraSystemMessage(htmlContent) {
  const chatMessages = document.getElementById('safira-messages');
  if (!chatMessages) return;
  const bubble = document.createElement('div');
  bubble.className = 'safira-message assistant';
  bubble.style.maxWidth = '100%';
  bubble.style.width = '100%';
  bubble.innerHTML = htmlContent;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = 0;
}

window.comeceRapidoState = {
  active: false,
  step: 1,
  selectedMacro: null,
  selectedSub: null,
  selectedMicro: null,
  createdBlog: false,
  generatedTitles: false,
  structuredSilo: false,
  trackedPosition: false,
  backedUp: false
};

function startComeceRapidoJourney() {
  closeSafiraChat();
  
  window.comeceRapidoState = {
    active: true,
    step: 1,
    selectedMacro: null,
    selectedSub: null,
    selectedMicro: null,
    createdBlog: false,
    generatedTitles: false,
    structuredSilo: false,
    trackedPosition: false,
    backedUp: false
  };
  
  showView('niche');
  
  setTimeout(() => {
    showSafiraComicBubble('.macro-card', 1);
  }, 300);
}

window.startComeceRapidoJourney = startComeceRapidoJourney;

function showSafiraComicBubble(selector, stepIndex) {
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
  
  tourClearAllHighlights();
  
  const element = document.querySelector(selector);
  if (!element) return;
  
  element.classList.add('tour-highlight');
  
  let title = "Escolha do Nicho";
  let text = "Selecione o nicho do seu blog. Use as categorias abaixo para explorar micro nichos já validados antes de prosseguir.";
  let position = "bottom";
  
  if (stepIndex === 1) {
    if (!window.comeceRapidoState.selectedMacro) {
      title = "Escolha do Nicho";
      text = "Selecione o nicho do seu blog. Clique em um dos cards de macro nichos recomendados para prosseguir.";
      position = "bottom";
    } else if (window.comeceRapidoState.selectedMacro && !window.comeceRapidoState.selectedSub) {
      title = "Escolha a Especialidade";
      text = `Ótima escolha! Você selecionou o macro nicho <strong>${window.comeceRapidoState.selectedMacro.name}</strong>. Agora clique em uma especialidade ao lado.`;
      position = "right";
    } else if (window.comeceRapidoState.selectedSub && !window.comeceRapidoState.selectedMicro) {
      title = "Selecione o Micro Nicho";
      text = `Especialidade <strong>${window.comeceRapidoState.selectedSub.name}</strong> selecionada! Clique no botão <strong>'⚡ Escolher este Nicho e Criar Blog'</strong> no card correspondente ao lado.`;
      position = "top";
    }
  } else if (stepIndex === 2) {
    title = "Criar Blog";
    text = `Preenchi os campos de Tema, Descrição e Repositório automaticamente com ideias sobre <strong>${window.comeceRapidoState.selectedMicro ? window.comeceRapidoState.selectedMicro.name : 'seu nicho'}</strong>. Clique no botão de confirmação indicado para colocar seu blog no ar!`;
    position = "top";
  } else if (stepIndex === 3) {
    title = "Estrutura Silo";
    text = `Configurei o nicho como <strong>'${window.comeceRapidoState.selectedMicro ? window.comeceRapidoState.selectedMicro.name : 'seu nicho'}'</strong>. Clique no botão de planejamento para estruturar seu site em formato SILO para ranquear no Google!`;
    position = "top";
  } else if (stepIndex === 4) {
    title = "Gerador em Lote & Máquina Infinita";
    if (window.comeceRapidoState.generatedTitles) {
      text = `<strong>Sensacional!</strong> Os títulos já foram inseridos no seu painel. Agora, clique no botão <strong>'♾️ Máquina Infinita'</strong> para abrir o painel integrado do Colab. Copie o código, cole no seu Google Colab com <strong>Ctrl+V</strong> e execute. A URL será <strong>preenchida automaticamente</strong> aqui e então você poderá gerar seus artigos em lote!`;
      position = "top";
    } else {
      text = `Defini a palavra semente como <strong>'${window.comeceRapidoState.selectedMicro ? window.comeceRapidoState.selectedMicro.name : 'seu nicho'}'</strong>. Clique em <strong>'🔍 Gerar Ideias de Títulos'</strong>. Em seguida, usaremos a <strong>Máquina Infinita</strong> para publicar artigos em lote sem bloqueios!`;
      position = "bottom";
    }
  } else if (stepIndex === 5) {
    title = "Logar na Colab";
    text = "Para que a integração com o Google Colab funcione de forma 100% automatizada e sem bloqueios, clique no botão <strong>'🔓 Logar no Colab (Plug & Play)'</strong> e faça login com sua conta Google na Colab para continuar.";
    position = "top";
  } else if (stepIndex === 6) {
    title = "Cura e Otimização de Imagens";
    text = "Na aba de <strong>Imagens</strong>, você pode gerenciar capas e rodar a varredura automática. O blog recém-criado já vem pré-selecionado! Clique no botão <strong>'Corrigir Imagens Quebradas & Placeholders'</strong> para varrer o blog e preencher capas genéricas com imagens reais de alta qualidade e otimizadas via Pexels.";
    position = "top";
  } else if (stepIndex === 7) {
    title = "Neto Salva (Backup)";
    text = "<strong>O Neto Salva é essencial!</strong> Ele protege seu trabalho contra qualquer perda de dados, garantindo que seu progresso esteja seguro e editável na nuvem. Clique no botão indicado para fazer o backup de segurança!";
    position = "top";
  }
  
  const bubble = document.createElement('div');
  bubble.id = 'safira-hq-bubble';
  bubble.className = `safira-hq-bubble arrow-${position}`;
  
  bubble.innerHTML = `
    <div class="safira-hq-avatar">💎</div>
    <div class="safira-hq-bubble-title">Safira</div>
    <div class="safira-hq-bubble-step">Etapa ${stepIndex} de 7 — ${title}</div>
    <div class="safira-hq-bubble-text">${text}</div>
    <div class="safira-hq-buttons">
      ${stepIndex > 1 ? `<button class="safira-hq-btn safira-hq-btn-prev" onclick="advanceComeceRapidoComic(${stepIndex - 1})">◀ Voltar</button>` : '<div></div>'}
      ${stepIndex < 7 
        ? `<button class="safira-hq-btn safira-hq-btn-next" onclick="advanceComeceRapidoComic(${stepIndex + 1})">Avançar ▶</button>`
        : `<button class="safira-hq-btn safira-hq-btn-next" onclick="finishComeceRapidoComic()">Finalizar 🎉</button>`
      }
      <button class="safira-hq-btn safira-hq-btn-close" onclick="closeComeceRapidoComic()" title="Encerrar Guia">✕</button>
    </div>
  `;
  
  document.body.appendChild(bubble);
  
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  let bubbleLeft = rect.left + rect.width / 2 + scrollLeft;
  let bubbleTop = rect.bottom + scrollTop + 15;
  
  if (position === 'top') {
    bubbleTop = rect.top + scrollTop - 200;
  } else if (position === 'left') {
    bubbleLeft = rect.left + scrollLeft - 340;
    bubbleTop = rect.top + rect.height / 2 + scrollTop - 80;
  } else if (position === 'right') {
    bubbleLeft = rect.right + scrollLeft + 15;
    bubbleTop = rect.top + rect.height / 2 + scrollTop - 80;
  }
  
  bubble.style.left = `${bubbleLeft}px`;
  bubble.style.top = `${bubbleTop}px`;
  
  setTimeout(() => {
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    
    if (position === 'top') {
      bubble.style.left = `${rect.left + rect.width / 2 + scrollLeft - bubbleWidth / 2}px`;
      bubble.style.top = `${rect.top + scrollTop - bubbleHeight - 15}px`;
    } else if (position === 'bottom') {
      bubble.style.left = `${rect.left + rect.width / 2 + scrollLeft - bubbleWidth / 2}px`;
      bubble.style.top = `${rect.bottom + scrollTop + 15}px`;
    } else if (position === 'left') {
      bubble.style.left = `${rect.left + scrollLeft - bubbleWidth - 15}px`;
      bubble.style.top = `${rect.top + rect.height / 2 + scrollTop - bubbleHeight / 2}px`;
    } else if (position === 'right') {
      bubble.style.left = `${rect.right + scrollLeft + 15}px`;
      bubble.style.top = `${rect.top + rect.height / 2 + scrollTop - bubbleHeight / 2}px`;
    }
    
    bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);

  const arrowIndicator = document.createElement('div');
  arrowIndicator.className = `tour-arrow-indicator arrow-${position}`;
  arrowIndicator.innerText = "AQUI ➔";
  document.body.appendChild(arrowIndicator);

  if (position === 'top') {
    arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
    arrowIndicator.style.top = `${rect.top + scrollTop - 35}px`;
  } else if (position === 'bottom') {
    arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
    arrowIndicator.style.top = `${rect.bottom + scrollTop + 10}px`;
  }
  
  setTimeout(() => {
    if (position === 'top' || position === 'bottom') {
      arrowIndicator.style.left = `${rect.left + rect.width / 2 + scrollLeft - arrowIndicator.offsetWidth / 2}px`;
    }
  }, 50);
}

window.showSafiraComicBubble = showSafiraComicBubble;

function advanceComeceRapidoComic(step) {
  const currentStep = window.comeceRapidoState.step;
  
  if (step > currentStep) {
    if (currentStep === 1 && !window.comeceRapidoState.selectedMicro) {
      const textEl = document.querySelector('.safira-hq-bubble-text');
      if (textEl) {
        textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve escolher um micro nicho e clicar em <strong>'⚡ Escolher este Nicho e Criar Blog'</strong> no card para prosseguir!`;
      }
      return;
    }
    if (currentStep === 2 && !window.comeceRapidoState.createdBlog) {
      const textEl = document.querySelector('.safira-hq-bubble-text');
      if (textEl) {
        textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve clicar no botão <strong>'⚡ Site 100% Online e Seguro'</strong> para criar seu blog antes de prosseguir!`;
      }
      return;
    }
    if (currentStep === 3 && !window.comeceRapidoState.structuredSilo) {
      const textEl = document.querySelector('.safira-hq-bubble-text');
      if (textEl) {
        textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve clicar no botão <strong>'⚡ Planejar e Estruturar SILO'</strong> para estruturar o site antes de prosseguir!`;
      }
      return;
    }
    if (currentStep === 4 && !window.comeceRapidoState.generatedTitles) {
      const textEl = document.querySelector('.safira-hq-bubble-text');
      if (textEl) {
        textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve clicar no botão <strong>'Gerar Ideias de Títulos'</strong> para buscar títulos por IA antes de prosseguir!`;
      }
      return;
    }
    if (currentStep === 7 && !window.comeceRapidoState.backedUp) {
      const textEl = document.querySelector('.safira-hq-bubble-text');
      if (textEl) {
        textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve clicar no botão <strong>'Criar Ponto de Restauração'</strong> para realizar o backup antes de finalizar!`;
      }
      return;
    }
  }

  window.comeceRapidoState.step = step;

  if (step === 1) {
    showView('niche');
    setTimeout(() => {
      let sel = '.macro-card';
      if (window.comeceRapidoState.selectedMacro) sel = '.sub-card';
      if (window.comeceRapidoState.selectedSub) sel = '.btn-select-micro-niche';
      showSafiraComicBubble(sel, 1);
    }, 300);
  } else if (step === 2) {
    showView('newSite');
    setTimeout(() => {
      showSafiraComicBubble('#wizard-submit-btn', 2);
    }, 300);
  } else if (step === 3) {
    showView('siloStructure');
    setTimeout(() => {
      populateSiloSites();
      const select = document.getElementById('silo-select-site');
      if (select && State.sites.length > 0) {
        select.value = State.sites[State.sites.length - 1].repoName;
      }
      const siloNiche = document.getElementById('silo-niche');
      if (siloNiche && window.comeceRapidoState.selectedMicro) {
        siloNiche.value = window.comeceRapidoState.selectedMicro.name;
      }
      showSafiraComicBubble('#btn-analyze-silo', 3);
    }, 300);
  } else if (step === 4) {
    showView('multiGenerator');
    setTimeout(() => {
      // Preenche palavra semente se selecionada anteriormente
      const keywordInput = document.getElementById('multi-seed-keyword');
      if (keywordInput && window.comeceRapidoState.selectedMicro) {
        keywordInput.value = window.comeceRapidoState.selectedMicro.name;
      }
      
      // Pre-select the last created blog
      const lastSite = State.sites.length > 0 ? State.sites[State.sites.length - 1] : null;
      if (lastSite) {
        const multiSelectSite = document.getElementById('multi-select-site');
        if (multiSelectSite) {
          multiSelectSite.value = lastSite.repoName;
          multiSelectSite.dispatchEvent(new Event('change'));
        }
        const cnBlogSelect = document.getElementById('cn-blog-select');
        if (cnBlogSelect) {
          cnBlogSelect.value = lastSite.repoName;
          if (typeof cnOnBlogChange === 'function') cnOnBlogChange();
        }
      }
      
      if (window.comeceRapidoState.generatedTitles) {
        // Fill titles into the new textareas
        const listItems = document.querySelectorAll('#titles-list li');
        if (listItems.length > 0) {
          const titles = Array.from(listItems).map(li => li.textContent.trim());
          
          const bulkTitles = document.getElementById('bulk-titles');
          if (bulkTitles) {
            bulkTitles.value = titles.join('\n');
            bulkTitles.dispatchEvent(new Event('input'));
          }
          
          const cnTopics = document.getElementById('cn-topics');
          if (cnTopics) {
            cnTopics.value = titles.join('\n');
            if (typeof cnCountTopics === 'function') cnCountTopics();
          }
        }
        showSafiraComicBubble('#colabNinjaBtn', 4);
      } else {
        showSafiraComicBubble('#btn-get-ideas', 4);
      }
    }, 300);
  } else if (step === 5) {
    showView('multiGenerator');
    setTimeout(() => {
      // Abre o painel do Colab se estiver fechado
      var panel = document.getElementById('colabNinjaPanel');
      if (panel && panel.style.display === 'none') {
        if (typeof toggleColabPanel === 'function') toggleColabPanel();
      }
      showSafiraComicBubble('#cn-login-colab-btn', 5);
    }, 300);
  } else if (step === 6) {
    showView('imagesPanel');
    setTimeout(() => {
      const select = document.getElementById('images-blog-select');
      const lastSite = State.sites.length > 0 ? State.sites[State.sites.length - 1] : null;
      if (select && lastSite) {
        select.value = lastSite.repoName;
        select.dispatchEvent(new Event('change'));
      }
      showSafiraComicBubble('#btn-auto-heal-images', 6);
    }, 300);
  } else if (step === 7) {
    showView('netoSalva');
    setTimeout(() => {
      populateBackupSites();
      const select = document.getElementById('backup-select-site');
      if (select && State.sites.length > 0) {
        select.value = State.sites[State.sites.length - 1].repoName;
        loadBackups(select.value);
      }
      const bkpDesc = document.getElementById('backup-description');
      if (bkpDesc && window.comeceRapidoState.selectedMicro) {
        bkpDesc.value = `Backup automático - ${window.comeceRapidoState.selectedMicro.name}`;
      }
      showSafiraComicBubble('#btn-create-backup', 7);
    }, 300);
  }
}

window.advanceComeceRapidoComic = advanceComeceRapidoComic;

function triggerConfetti() {
  if (typeof confetti === 'function') {
    launchConfetti();
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = launchConfetti;
    document.head.appendChild(script);
  }
}

function launchConfetti() {
  const duration = 6 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 }
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

function finishComeceRapidoComic() {
  const currentStep = window.comeceRapidoState.step;
  if (currentStep === 7 && !window.comeceRapidoState.backedUp) {
    const textEl = document.querySelector('.safira-hq-bubble-text');
    if (textEl) {
      textEl.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">⚠️ Atenção:</span> Você deve clicar no botão <strong>'Criar Ponto de Restauração'</strong> para realizar o backup antes de finalizar!`;
    }
    return;
  }

  tourClearAllHighlights();
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
  
  openSafiraChat();
  triggerConfetti();
  
  const chatMessages = document.getElementById('safira-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  
  const lastSite = State.sites && State.sites.length > 0 ? State.sites[State.sites.length - 1] : null;
  const blogUrl = lastSite ? lastSite.deployUrl : '';
  let blogLinkHtml = '';
  if (blogUrl) {
    blogLinkHtml = `
      <div style="margin: 20px 0 15px 0;">
        <p style="font-size: 0.9rem; color: #fff; margin-bottom: 8px;">✨ O seu blog já está prontinho para ser visitado!</p>
        <a href="${blogUrl}" target="_blank" class="safira-hq-btn" style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff !important;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.95rem;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(16, 185, 129, 0.6)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 15px rgba(16, 185, 129, 0.4)';">
          🚀 Ver Meu Blog no Ar Agora!
        </a>
      </div>
    `;
  }
  
  addSafiraSystemMessage(`
    <div style="text-align: center; padding: 10px;">
      <h3 style="font-size: 1.3rem; margin-bottom: 10px; background: linear-gradient(135deg, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎉 PARABÉNS! VOCÊ CONCLUIU O COMECE RÁPIDO! 🚀</h3>
      <p style="font-size: 0.95rem; color: #fff; margin-bottom: 15px;">Seu blog premium está 100% online, planejado e seguro!</p>
      
      ${blogLinkHtml}
      
      <div style="font-size: 3rem; margin: 15px 0;">🥳💎🎈</div>
      <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-muted); text-align: left;">
        Você percorreu todas as etapas da criação de um império de sites afiliados com a Safira:
        <br><br>
        ✅ <strong>Nicho Validado:</strong> Escolha inteligente baseada em dados reais.
        <br>
        ✅ <strong>Blog Premium:</strong> Fabricado do zero e online em tempo recorde.
        <br>
        ✅ <strong>Estrutura SILO:</strong> Totalmente modelada no padrão de alta relevância do Google.
        <br>
        --
        ✅ <strong>Artigos Multi-Painel:</strong> Gere artigos para múltiplos blogs simultaneamente com painéis independentes.
        <br>
        ✅ <strong>Neto Salva:</strong> Cópia de segurança ativada e segura na nuvem.
      </p>
      <p style="font-size: 0.95rem; margin-top: 20px; font-weight: bold; color: #10b981;">Você está totalmente pronto para dominar seu nicho! Bons negócios! 💸🔥</p>
    </div>
  `);
}

window.finishComeceRapidoComic = finishComeceRapidoComic;

function closeComeceRapidoComic() {
  tourClearAllHighlights();
  const existingBubble = document.getElementById('safira-hq-bubble');
  if (existingBubble) existingBubble.remove();
  window.comeceRapidoState.active = false;
}

window.closeComeceRapidoComic = closeComeceRapidoComic;

// SETUP LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-safira-btn');
  const closeBtn = document.getElementById('safira-close-btn');
  const floatingBtn = document.getElementById('safira-floating-trigger');
  const comeceBtn = document.getElementById('comece-rapido-trigger');
  const backdrop = document.getElementById('safira-backdrop');
  const chatForm = document.getElementById('safira-chat-form');
  const chatInput = document.getElementById('safira-chat-input');

  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); openSafiraChat(); });
  if (closeBtn) closeBtn.addEventListener('click', closeSafiraChat);
  if (floatingBtn) floatingBtn.addEventListener('click', toggleSafiraChat);
  if (comeceBtn) comeceBtn.addEventListener('click', startComeceRapidoJourney);
  if (backdrop) backdrop.addEventListener('click', closeSafiraChat);

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageText = chatInput.value.trim();
      if (messageText) {
        chatInput.value = '';
        sendSafiraMessage(messageText);
      }
    });
  }

  // Hook suggestions
  const sugLego = document.getElementById('safira-sug-lego');
  const sugBackup = document.getElementById('safira-sug-backup');
  const sugSilo = document.getElementById('safira-sug-silo');
  const sugSeo = document.getElementById('safira-sug-seo');

  if (sugLego) sugLego.addEventListener('click', () => sendSafiraSuggestion('Como o Agente Lego funciona?'));
  if (sugBackup) sugBackup.addEventListener('click', () => sendSafiraSuggestion('Fazer backup Neto Salva'));
  if (sugSilo) sugSilo.addEventListener('click', () => sendSafiraSuggestion('Quero reestruturar o silo de um dos meus blogs'));
  if (sugSeo) sugSeo.addEventListener('click', () => sendSafiraSuggestion('Como verificar meu posicionamento no Google?'));
});

// --- NICHE SELECTOR ENGINE ---

let selectedMacro = null;
let selectedSub = null;
let selectedMicro = null;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initNicheSelector() {
  selectedMacro = null;
  selectedSub = null;
  selectedMicro = null;
  
  // Reset navigation steps
  updateNicheSteps(1);
  renderNicheStep1();
}

function updateNicheSteps(step) {
  // Update indicators
  const label = document.getElementById('niche-step-label');
  if (label) label.textContent = `Passo ${step} de 4`;
  
  // Progress tracker classes
  for (let i = 1; i <= 4; i++) {
    const progStep = document.getElementById(`prog-step-${i}`);
    if (progStep) {
      if (i === step) {
        progStep.classList.add('active');
      } else {
        progStep.classList.remove('active');
      }
    }
  }

  // Display/Hide steps content
  document.getElementById('niche-step-1').style.display = step === 1 ? 'block' : 'none';
  document.getElementById('niche-step-2').style.display = step === 2 ? 'block' : 'none';
  document.getElementById('niche-step-3').style.display = step === 3 ? 'block' : 'none';
  document.getElementById('niche-step-4').style.display = step === 4 ? 'block' : 'none';
}

function renderNicheStep1() {
  const container = document.getElementById('macro-niche-list');
  if (!container) return;
  
  // Select at least 12 random macro niches each time the user enters
  const shuffledMacros = shuffleArray(NicheData.macro).slice(0, 12);
  
  container.innerHTML = shuffledMacros.map(macro => `
    <div class="macro-card" data-id="${macro.id}">
      <div class="macro-card-icon">${macro.icon}</div>
      <h4>${macro.name}</h4>
      <p>${macro.desc}</p>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.macro-card').forEach(card => {
    card.addEventListener('click', () => {
      const macroId = card.getAttribute('data-id');
      selectedMacro = NicheData.macro.find(m => m.id === macroId);
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.selectedMacro = selectedMacro;
      }
      updateNicheSteps(2);
      renderNicheStep2();
    });
  });
}

function renderNicheStep2() {
  const container = document.getElementById('sub-niche-list');
  const title = document.getElementById('sub-niche-title');
  if (!container || !selectedMacro) return;
  
  if (title) title.textContent = `Macro Nicho: ${selectedMacro.name} → Selecione uma Especialidade:`;

  // Select 8 random sub-niches from the macro pool
  const shuffledSubs = shuffleArray(selectedMacro.subs).slice(0, 8);

  container.innerHTML = shuffledSubs.map(sub => `
    <div class="sub-card" data-id="${sub.id}">
      <div class="sub-card-icon">${sub.icon}</div>
      <div class="sub-card-info">
        <h4>${sub.name}</h4>
        <p>${sub.desc}</p>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.sub-card').forEach(card => {
    card.addEventListener('click', () => {
      const subId = card.getAttribute('data-id');
      selectedSub = selectedMacro.subs.find(s => s.id === subId);
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.selectedSub = selectedSub;
      }
      updateNicheSteps(3);
      renderNicheStep3();
    });
  });
}

function renderNicheStep3() {
  const container = document.getElementById('micro-niche-list');
  const title = document.getElementById('micro-niche-title');
  if (!container || !selectedSub) return;

  if (title) title.textContent = `Especialidade: ${selectedSub.name} → Escolha uma ideia de Micro Nicho:`;

  // Show all 4 micro-niches in the selected sub-niche
  container.innerHTML = selectedSub.micros.map((micro, index) => `
    <div class="micro-niche-card" data-index="${index}">
      <div>
        <h4>${micro.name}</h4>
        <p>${micro.desc}</p>
      </div>
      <span class="select-badge">Ver Análise & Cases →</span>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.micro-niche-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      selectedMicro = selectedSub.micros[idx];
      if (window.comeceRapidoState && window.comeceRapidoState.active) {
        window.comeceRapidoState.selectedMicro = selectedMicro;
      }
      updateNicheSteps(4);
      renderNicheStep4();
      if (typeof ASMR !== 'undefined') {
        ASMR.playSparkleSweep();
        triggerSuccessConfetti();
      }
    });
  });
}

function renderNicheStep4() {
  const container = document.getElementById('micro-niche-detail-container');
  const title = document.getElementById('micro-detail-title');
  if (!container || !selectedMicro) return;

  if (title) title.textContent = `Análise do Micro Nicho: ${selectedMicro.name}`;

  container.innerHTML = `
    <div class="micro-card">
      <div class="micro-card-header">
        <div class="micro-card-title">
          <h4>${selectedMicro.name}</h4>
          <span class="micro-card-lucrative-badge">🔥 Lucratividade Validada</span>
        </div>
      </div>
      
      <p class="micro-card-description">${selectedMicro.desc}</p>
      
      <div class="micro-card-details-grid">
        <div class="micro-detail-panel">
          <h5>💸 Estratégia de Monetização</h5>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">${selectedMicro.lucratividade}</p>
          <h5>🎯 Dicas e Palavras-chave</h5>
          <ul>
            ${selectedMicro.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
        
        <div class="micro-detail-panel micro-case-study">
          <h5>🇺🇸 Caso de Sucesso Americano Real</h5>
          <p style="font-size: 0.85rem; color: var(--text-main); font-weight: bold; margin-bottom: 8px;">
            Blog de Referência: <span style="color: var(--secondary); font-size: 1rem;">${selectedMicro.caseStudy.site}</span>
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
            <strong>Resultado Real Estimado:</strong> <span class="case-metric">${selectedMicro.caseStudy.earnings}</span>
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
            <strong>Estratégia Utilizada:</strong> ${selectedMicro.caseStudy.strategy}
          </p>
        </div>
      </div>

      <div style="text-align: right;">
        <button type="button" class="btn btn-primary btn-select-micro-niche">
          ⚡ Selecionar este Nicho e Criar Blog
        </button>
      </div>
    </div>
  `;

  // Attach event listener to finalize button
  container.querySelector('.btn-select-micro-niche').addEventListener('click', () => {
    selectNicheAndRedirect(selectedMicro);
  });
}

function selectNicheAndRedirect(micro) {
  if (window.comeceRapidoState && window.comeceRapidoState.active) {
    window.comeceRapidoState.selectedMacro = selectedMacro;
    window.comeceRapidoState.selectedSub = selectedSub;
    window.comeceRapidoState.selectedMicro = micro;
  }

  // Fill the Create Blog Wizard Form fields
  if (el.siteTheme) {
    el.siteTheme.value = 'custom';
    el.siteTheme.dispatchEvent(new Event('change'));
  }
  
  if (el.siteCustomTheme) {
    el.siteCustomTheme.value = micro.name;
    el.siteCustomTheme.dispatchEvent(new Event('input')); // Generate repository slug
  }
  
  if (el.siteDescription) {
    el.siteDescription.value = `Um blog premium focado em reviews, tutoriais e análises sinceras sobre ${micro.name.toLowerCase()}, ajudando entusiastas a tomarem decisões de compra inteligentes com base em dados de qualidade.`;
  }

  // Auto-select the ideal color palette for the chosen niche macro category
  if (typeof selectedMacro !== 'undefined' && selectedMacro && selectedMacro.id) {
    const macroId = selectedMacro.id;
    const mapping = {
      'health': 'mint',
      'gardening': 'emerald',
      'finance': 'gold',
      'diet': 'emerald',
      'beauty': 'rose',
      'parenting': 'rose',
      'lifestyle': 'fuchsia',
      'decor': 'amber',
      'cooking': 'orange',
      'pets': 'orange',
      'home': 'amber',
      'travel': 'ocean',
      'sports': 'crimson',
      'hobbies': 'teal',
      'tech': 'indigo',
      'education': 'indigo',
      'productivity': 'indigo',
      'business': 'dark'
    };
    const idealPalette = mapping[macroId] || 'dark';
    const radio = document.querySelector(`input[name="color-palette"][value="${idealPalette}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
      // Sync active class styling on parent label
      document.querySelectorAll('.palette-option').forEach(opt => opt.classList.remove('active'));
      const parentLabel = radio.closest('.palette-option');
      if (parentLabel) parentLabel.classList.add('active');
    }
  }
  
  showToast(`Nicho "${micro.name}" selecionado com sucesso!`, 'success');
  
  // Transition smoothly to Create Blog tab
  showView('newSite');
}

// Wire up Back Buttons in DOMContentLoaded step
document.addEventListener('DOMContentLoaded', () => {
  const backToStep1 = document.getElementById('btn-back-to-step1');
  const backToStep2 = document.getElementById('btn-back-to-step2');
  const backToStep3 = document.getElementById('btn-back-to-step3');
  
  if (backToStep1) {
    backToStep1.addEventListener('click', () => {
      updateNicheSteps(1);
    });
  }
  
  if (backToStep2) {
    backToStep2.addEventListener('click', () => {
      updateNicheSteps(2);
    });
  }

  // Handle manual palette changes to sync active class on labels
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'color-palette') {
      document.querySelectorAll('.palette-option').forEach(opt => opt.classList.remove('active'));
      const parentLabel = e.target.closest('.palette-option');
      if (parentLabel) parentLabel.classList.add('active');
    }
  });
});

// ============================================================================
// SAFIRA ONBOARDING MODAL LOGIC
// ============================================================================

function openSafiraOnboarding() {
  const safiraModal = document.getElementById('safira-onboarding-modal');
  if (!safiraModal) return;
  // Pre-fill if exists
  document.getElementById('onboarding-github-token').value = State.credentials.githubToken || '';
  document.getElementById('onboarding-gemini-token').value = State.credentials.geminiApiKey || '';
  document.getElementById('onboarding-vercel-token').value = State.credentials.vercelToken || '';
  
  changeSafiraStep(0);
  safiraModal.classList.remove('hidden');
}

function closeSafiraOnboarding() {
  const safiraModal = document.getElementById('safira-onboarding-modal');
  if (safiraModal) safiraModal.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const safiraCloseBtn = document.getElementById('close-onboarding-btn');
  const btnOnboardingYes = document.getElementById('btn-onboarding-yes');
  const btnOnboardingNo = document.getElementById('btn-onboarding-no');
  const btnFinishOnboarding = document.getElementById('btn-finish-onboarding');

  if (safiraCloseBtn) safiraCloseBtn.addEventListener('click', closeSafiraOnboarding);

  if (btnOnboardingNo) {
    btnOnboardingNo.addEventListener('click', async () => {
      await completeOnboardingOnly();
      closeSafiraOnboarding();
    });
  }

  if (btnOnboardingYes) {
    btnOnboardingYes.addEventListener('click', () => {
      changeSafiraStep(1);
    });
  }

  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nextStep = e.target.getAttribute('data-next');
      changeSafiraStep(parseInt(nextStep, 10));
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prevStep = e.target.getAttribute('data-prev');
      changeSafiraStep(parseInt(prevStep, 10));
    });
  });

  if (btnFinishOnboarding) {
    btnFinishOnboarding.addEventListener('click', async () => {
      if (btnFinishOnboarding.disabled) return;
      
      const githubToken = document.getElementById('onboarding-github-token').value.trim();
      let geminiApiKey = document.getElementById('onboarding-gemini-token').value.trim();
      const vercelToken = document.getElementById('onboarding-vercel-token').value.trim();
      const pexelsKey = localStorage.getItem('pexels_api_key') || '';
      if (pexelsKey && geminiApiKey) {
        geminiApiKey = geminiApiKey + '|||' + pexelsKey;
      }
      
      btnFinishOnboarding.disabled = true;
      btnFinishOnboarding.innerHTML = 'Salvando... ⏳';
      changeSafiraStep('loading');

      try {
        const response = await fetch('/api/save-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: State.user.email,
            githubToken: githubToken,
            vercelToken: vercelToken,
            vercelTeamId: State.credentials.vercelTeamId || "",
            geminiApiKey: geminiApiKey,
            onboardingComplete: true
          })
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Erro ao salvar configurações.');
        }

        State.user = result.user;
        localStorage.setItem('saas_user', JSON.stringify(State.user));
        State.credentials = {
          githubToken: State.user.githubToken || "",
          vercelToken: State.user.vercelToken || "",
          vercelTeamId: State.user.vercelTeamId || "",
          geminiApiKey: State.user.geminiApiKey || ""
        };
        
        // Update form settings just in case
        el.setGithubToken.value = State.credentials.githubToken || '';
        el.setVercelToken.value = State.credentials.vercelToken || '';
        
        let displayGeminiKey = State.credentials.geminiApiKey || '';
        let displayPexelsKey = localStorage.getItem('pexels_api_key') || '';
        if (displayGeminiKey.includes('|||')) {
          const parts = displayGeminiKey.split('|||');
          displayGeminiKey = parts[0];
          displayPexelsKey = parts[1] || displayPexelsKey;
        }
        el.setGeminiKey.value = displayGeminiKey;
        if (displayPexelsKey) {
          localStorage.setItem('pexels_api_key', displayPexelsKey);
        }
        if (el.setPexelsKey) {
          el.setPexelsKey.value = displayPexelsKey;
        }

        showToast('Configuração inicial concluída com sucesso!', 'success');
        closeSafiraOnboarding();
      } catch (err) {
        console.error(err);
        showToast(`Falha ao salvar: ${err.message}`, 'error');
        btnFinishOnboarding.disabled = false;
        btnFinishOnboarding.innerHTML = 'Finalizar & Salvar ✅';
        changeSafiraStep(3); // volta para o passo final
      }
    });
  }
});

function changeSafiraStep(stepIndex) {
  document.querySelectorAll('.safira-step').forEach(el => el.classList.remove('active', 'hidden'));
  document.querySelectorAll('.safira-step').forEach((el, index) => {
    if (el.id === `safira-step-${stepIndex}` || (stepIndex === 'loading' && el.id === 'safira-step-loading')) {
      el.classList.add('active');
    } else {
      el.classList.add('hidden');
    }
  });
}

async function completeOnboardingOnly() {
  try {
    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: State.user.email,
        githubToken: State.credentials.githubToken || "",
        vercelToken: State.credentials.vercelToken || "",
        vercelTeamId: State.credentials.vercelTeamId || "",
        geminiApiKey: State.credentials.geminiApiKey || "",
        onboardingComplete: true
      })
    });
    const result = await response.json();
    if (response.ok && result.user) {
      State.user = result.user;
      localStorage.setItem('saas_user', JSON.stringify(State.user));
    }
  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================================
   ASMR & SATISFYING EFFECTS SYSTEM
   ========================================================================== */

// Programmatic CSS Injection for satisfying visual effects
(function injectASMRStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Satisfying UI Ripple Emitter */
    .asmr-ripple {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0) 70%);
      pointer-events: none;
      transform: translate(-50%, -50%) scale(0);
      animation: asmrRippleAnim 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      z-index: 99999;
    }
    @keyframes asmrRippleAnim {
      to {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
      }
    }

    /* Floating Bubble Pops */
    .asmr-bubble {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.6) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(99, 102, 241, 0.8) 100%);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35), inset -2px -2px 6px rgba(255,255,255,0.25);
      animation: asmrBubbleAnim var(--duration, 0.6s) cubic-bezier(0.25, 1, 0.5, 1) forwards;
      z-index: 99999;
    }
    @keyframes asmrBubbleAnim {
      0% {
        transform: translate(-50%, -50%) scale(0.2);
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) scale(var(--size));
        opacity: 0;
      }
    }

    /* Screen Confetti */
    .asmr-confetti {
      position: fixed;
      width: 12px;
      height: 12px;
      background-color: var(--color);
      top: -15px;
      left: var(--x);
      border-radius: var(--radius);
      pointer-events: none;
      z-index: 100000;
      animation: asmrConfettiAnim var(--duration) cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes asmrConfettiAnim {
      to {
        transform: translateY(105vh) rotate(var(--rotate)) translateX(var(--wobble));
      }
    }

    /* Quick Click Confetti */
    .asmr-click-confetti {
      position: absolute;
      pointer-events: none;
      z-index: 100000;
      animation: asmrClickConfettiAnim var(--duration) cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes asmrClickConfettiAnim {
      0% {
        transform: translate(0, 0) scale(0) rotate(0deg);
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translate(var(--tx), var(--ty)) scale(1) rotate(360deg);
        opacity: 0;
      }
    }

    /* Visual Fireworks Emitter */
    .asmr-firework-particle {
      position: absolute;
      width: var(--size);
      height: var(--size);
      background: var(--color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 100000;
      box-shadow: 0 0 10px var(--color);
      animation: asmrFirework var(--duration) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
    @keyframes asmrFirework {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      80% {
        opacity: 0.8;
      }
      100% {
        transform: translate(var(--tx), var(--ty)) scale(0.1);
        opacity: 0;
      }
    }

    /* Satisfying tactile scale classes for elements */
    .btn, .macro-card, .sub-card, .micro-niche-card, .palette-option, .nav-link, .auth-tab {
      transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }

    /* Meditating Ninjinha Loading Animation */
    .ninjinha-container {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 24px auto;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: ninjinhaFloat 2.2s ease-in-out infinite;
    }
    @keyframes ninjinhaFloat {
      0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
      50% { transform: translateY(-14px) scaleY(0.96) rotate(3deg); }
    }

    .ninjinha-body {
      position: relative;
      width: 60px;
      height: 60px;
      background: #0f172a;
      border: 3px solid #6366f1;
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }

    .ninjinha-headband {
      position: absolute;
      top: 10px;
      left: -3px;
      width: 66px;
      height: 10px;
      background: #ef4444;
      border-radius: 2px;
      z-index: 3;
    }

    .headband-tail-1, .headband-tail-2 {
      position: absolute;
      right: -8px;
      top: 2px;
      width: 12px;
      height: 6px;
      background: #ef4444;
      border-radius: 2px;
      transform-origin: left center;
    }
    .headband-tail-1 {
      transform: rotate(15deg);
      animation: tailWave1 1s ease-in-out infinite alternate;
    }
    .headband-tail-2 {
      transform: rotate(-15deg);
      top: 6px;
      animation: tailWave2 1.2s ease-in-out infinite alternate;
    }
    @keyframes tailWave1 {
      to { transform: rotate(35deg) scaleX(1.1); }
    }
    @keyframes tailWave2 {
      to { transform: rotate(-35deg) scaleX(1.1); }
    }

    .ninjinha-face-mask {
      position: absolute;
      width: 44px;
      height: 18px;
      background: #e2e8f0;
      border-radius: 4px;
      top: 22px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      z-index: 4;
    }

    .ninjinha-eyes {
      position: relative;
      width: 32px;
      height: 6px;
      display: flex;
      justify-content: space-between;
    }
    .ninjinha-eyes::before, .ninjinha-eyes::after {
      content: '';
      width: 10px;
      height: 4px;
      background: #0f172a;
      border-radius: 2px;
      transform: rotate(10deg);
      animation: ninjinhaBlink 4s infinite;
    }
    .ninjinha-eyes::after {
      transform: rotate(-10deg);
    }
    @keyframes ninjinhaBlink {
      0%, 95%, 100% { transform: scaleY(1) rotate(var(--rot, 10deg)); }
      97% { transform: scaleY(0.1) rotate(var(--rot, 10deg)); }
    }
    .ninjinha-eyes::before { --rot: 8deg; }
    .ninjinha-eyes::after { --rot: -8deg; }

    .ninjinha-meditation-ring {
      position: absolute;
      width: 80px;
      height: 14px;
      border: 2px solid rgba(168, 85, 247, 0.4);
      border-radius: 50%;
      bottom: 8px;
      animation: ringSpin 4s linear infinite, ringPulse 2s ease-in-out infinite;
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
      z-index: 1;
    }
    @keyframes ringSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.25); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
})();

// Web Audio API Sound Synthesizer (No assets needed!)
window.ASMR = {
  ctx: null,
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  playPop() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  },
  
  playTick() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.02);
  },
  
  playWhoosh() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
  },
  
  playSuccess() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // Harmonious chord notes: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.50);
    });
  },
  
  playTink() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  },

  playAmbientMusic() {
    this.resume();
    if (!this.ctx) return;
    
    this.stopAmbientMusic();
    
    this.ambientNodes = [];
    const now = this.ctx.currentTime;
    
    // Create 3 shared filters to save massive browser resources and prevent stuttering
    const arpeggioFilter = this.ctx.createBiquadFilter();
    arpeggioFilter.type = 'lowpass';
    arpeggioFilter.frequency.setValueAtTime(900, now); 
    arpeggioFilter.connect(this.ctx.destination);
    this.ambientNodes.push(arpeggioFilter);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(600, now);
    bassFilter.connect(this.ctx.destination);
    this.ambientNodes.push(bassFilter);

    const violinFilter = this.ctx.createBiquadFilter();
    violinFilter.type = 'lowpass';
    violinFilter.frequency.setValueAtTime(800, now);
    violinFilter.Q.setValueAtTime(1.5, now);
    violinFilter.connect(this.ctx.destination);
    this.ambientNodes.push(violinFilter);
    
    // A bouncy happy major scale progression: C Major -> G Major -> Am -> F Major arpeggiated
    const chords = [
      [261.63, 329.63, 392.00, 523.25], 
      [196.00, 246.94, 293.66, 392.00], 
      [220.00, 261.63, 329.63, 440.00], 
      [174.61, 220.00, 261.63, 349.23]  
    ];

    const bassNotes = [130.81, 98.00, 110.00, 87.31]; // C3, G2, A2, F2
    const violinNotes = [659.25, 493.88, 523.25, 440.00]; // E5, B4, C5, A4
    
    const playHappyArpeggio = (freqs, timeOffset) => {
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.20; 
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + timeOffset + delay);
        
        gain.gain.setValueAtTime(0, now + timeOffset + delay);
        gain.gain.linearRampToValueAtTime(0.035, now + timeOffset + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + delay + 0.6);
        
        osc.connect(gain);
        gain.connect(arpeggioFilter);
        this.ambientNodes.push(osc);
        
        osc.start(now + timeOffset + delay);
        osc.stop(now + timeOffset + delay + 0.65);
      });
    };

    const playViolinPad = (freq, timeOffset, duration, volume, destFilter) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + timeOffset);
      
      // Vibrato (LFO)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 5.5; 
      lfoGain.gain.value = 1.2;   
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(volume, now + timeOffset + 0.4); 
      gain.gain.setValueAtTime(volume, now + timeOffset + duration - 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + duration);
      
      osc.connect(gain);
      gain.connect(destFilter);
      
      this.ambientNodes.push(osc);
      this.ambientNodes.push(lfo);
      
      lfo.start(now + timeOffset);
      osc.start(now + timeOffset);
      
      lfo.stop(now + timeOffset + duration);
      osc.stop(now + timeOffset + duration);
    };
    
    // Success theme music starting after 96 seconds (bar 60 to 180)
    const successChords = [
      [293.66, 369.99, 440.00, 587.33], // D4, F#4, A4, D5
      [220.00, 277.18, 329.63, 440.00], // A3, C#4, E4, A4
      [246.94, 293.66, 369.99, 493.88], // B3, D4, F#4, B4
      [196.00, 246.94, 293.66, 392.00]  // G3, B3, D4, G4
    ];
    const successBassNotes = [146.83, 110.00, 123.47, 98.00]; // D3, A2, B2, G2
    const successViolinNotes = [739.99, 659.25, 587.33, 493.88]; // F#5, E5, D5, B4

    const playSuccessArpeggio = (freqs, timeOffset) => {
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.15; 
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + timeOffset + delay);
        
        gain.gain.setValueAtTime(0, now + timeOffset + delay);
        gain.gain.linearRampToValueAtTime(0.04, now + timeOffset + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + delay + 0.5);
        
        osc.connect(gain);
        gain.connect(arpeggioFilter);
        this.ambientNodes.push(osc);
        
        osc.start(now + timeOffset + delay);
        osc.stop(now + timeOffset + delay + 0.55);
      });
    };

    let offset = 0;
    // Pre-schedule 180 bars (approx 288 seconds of high quality music)
    for (let i = 0; i < 180; i++) {
      if (i < 60) {
        // Main cheerful arpeggios (Ninjinha music)
        playHappyArpeggio(chords[i % chords.length], offset);
        
        // Introduce warm cello strings after 6.4 seconds (cycle 1+)
        if (i >= 4) {
          playViolinPad(bassNotes[i % 4], offset, 1.5, 0.012, bassFilter);
        }
        
        // Introduce high vibrato violins after 12.8 seconds (cycle 2+)
        if (i >= 8) {
          playViolinPad(violinNotes[i % 4], offset, 1.5, 0.008, violinFilter);
        }
        
        // Introduce an octave soaring counterpoint violin after 25.6 seconds (cycle 4+)
        if (i >= 16) {
          playViolinPad(violinNotes[i % 4] * 2, offset + 0.3, 1.2, 0.004, violinFilter);
        }
      } else {
        // Success-themed Music (triumphant and upbeat)
        playSuccessArpeggio(successChords[i % successChords.length], offset);
        
        // Warm epic horns/pads
        playViolinPad(successBassNotes[i % 4], offset, 1.5, 0.015, bassFilter);
        playViolinPad(successViolinNotes[i % 4], offset, 1.5, 0.01, violinFilter);
        
        // A soaring high counterpoint/trumpet note
        if (i % 2 === 0) {
          playViolinPad(successViolinNotes[i % 4] * 1.5, offset + 0.2, 1.0, 0.005, violinFilter);
        }
      }
      
      offset += 1.6; 
    }
  },
  
  stopAmbientMusic() {
    if (this.ambientNodes) {
      this.ambientNodes.forEach(node => {
        try { node.disconnect(); } catch(e) {}
        try { node.stop(); } catch(e) {}
      });
      this.ambientNodes = [];
    }
  },

  playKeyboardClack() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.015);
    
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.015);
  },

  playSparkleSweep() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.04;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.22);
    });
  },

  playApplause() {
    this.resume();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Create a 150ms buffer of white noise
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // Schedule 65 individual handclaps over 2.2 seconds for realistic audience clap
    for (let i = 0; i < 65; i++) {
      const clapTime = now + Math.random() * 2.2;
      
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900 + Math.random() * 700;
      filter.Q.value = 2.5;
      
      const gain = this.ctx.createGain();
      const elapsed = clapTime - now;
      let maxGain = 0.06 + Math.random() * 0.08;
      
      // Applause fade curve
      if (elapsed < 0.4) {
        maxGain *= (elapsed / 0.4);
      } else if (elapsed > 1.5) {
        maxGain *= ((2.2 - elapsed) / 0.7);
      }
      
      gain.gain.setValueAtTime(0, clapTime);
      gain.gain.linearRampToValueAtTime(maxGain, clapTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.12);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      source.start(clapTime);
    }
  },

  playCashRegister() {
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // 1. Mechanical Clack & Drawer Slide Noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(600, now);
    noiseFilter.Q.setValueAtTime(2, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // Mechanical key spring clack
    const clack = this.ctx.createOscillator();
    const clackGain = this.ctx.createGain();
    clack.type = 'triangle';
    clack.frequency.setValueAtTime(120, now);
    clack.frequency.exponentialRampToValueAtTime(40, now + 0.04);
    clackGain.gain.setValueAtTime(0.15, now);
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clack.connect(clackGain);
    clackGain.connect(this.ctx.destination);
    clack.start(now);
    clack.stop(now + 0.04);

    // 2. Brass Register Bell Ring ("DING!")
    const bellDelay = 0.045;
    const partials = [
      { freq: 2093, gain: 0.08, decay: 0.8 }, // C7
      { freq: 2637, gain: 0.04, decay: 0.5 }, // E7
      { freq: 3136, gain: 0.03, decay: 0.4 }, // G7
      { freq: 4186, gain: 0.015, decay: 0.2 } // C8
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now + bellDelay);
      
      // Fast pitch vibrato to simulate authentic physical metallic ring texture
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 14; 
      lfoGain.gain.value = 12;  
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(p.gain, now + bellDelay + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + bellDelay + p.decay);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      lfo.start(now + bellDelay);
      osc.start(now + bellDelay);
      
      lfo.stop(now + bellDelay + p.decay);
      osc.stop(now + bellDelay + p.decay);
    });
  }
};

// Satisfying Ripple Effect Generator
function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'asmr-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  // Set random size range
  const size = Math.random() * 80 + 70;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Satisfying Bubble Pops Emitter
function triggerBubbleBurst(x, y, count = 8, color = null) {
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'asmr-bubble';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    
    const size = Math.random() * 15 + 8;
    bubble.style.setProperty('--size', `${size / 10}`);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 60 + 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - (Math.random() * 30); // Drift slightly upwards
    
    bubble.style.setProperty('--dx', `${dx}px`);
    bubble.style.setProperty('--dy', `${dy}px`);
    bubble.style.setProperty('--duration', `${Math.random() * 0.3 + 0.3}s`);
    
    if (color) {
      bubble.style.background = `radial-gradient(circle at 35% 35%, #fff 0%, ${color}66 50%, ${color} 100%)`;
    }
    
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 600);
  }
}

// Confetti System for Success (now color-shifting stars and sparkles!)
window.triggerSuccessConfetti = function() {
  const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ffd700'];
  const count = 90;
  const icons = ['✨', '★', '💎', '🌸', '⚡'];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'asmr-confetti';
    
    const x = Math.random() * 100;
    const duration = Math.random() * 2.2 + 1.8;
    const rotate = Math.random() * 360 + 360;
    const wobble = Math.random() * 100 - 50;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isSpecial = Math.random() > 0.4;
    
    confetti.style.setProperty('--x', `${x}vw`);
    confetti.style.setProperty('--duration', `${duration}s`);
    confetti.style.setProperty('--rotate', `${rotate}deg`);
    confetti.style.setProperty('--wobble', `${wobble}px`);
    
    if (isSpecial) {
      confetti.textContent = icons[Math.floor(Math.random() * icons.length)];
      confetti.style.fontSize = `${Math.random() * 12 + 10}px`;
      confetti.style.background = 'none';
      confetti.style.color = color;
      confetti.style.textShadow = `0 0 10px ${color}`;
    } else {
      confetti.style.setProperty('--color', color);
      confetti.style.setProperty('--radius', Math.random() > 0.5 ? '2px' : '50%');
    }
    
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), duration * 1000);
  }
};

// ============================================================================
// IMAGES PANEL AND AUTO-HEALER FUNCTIONALITY
// ============================================================================

const DEFAULT_ORG = 'efeitodigitalcontato-ops';

window.populateImagesSites = function() {
  const select = document.getElementById('images-blog-select');
  if (!select) return;
  
  if (!State.sites || State.sites.length === 0) {
    select.innerHTML = '<option value="">-- Nenhum blog encontrado --</option>';
    return;
  }

  select.innerHTML = '<option value="">-- Selecione o Blog --</option>';
  State.sites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site.repoName;
    opt.textContent = site.repoName.replace('afiliados-blog-', '').toUpperCase();
    select.appendChild(opt);
  });
};

window.loadBlogArticlesForImages = async function() {
  const blog = document.getElementById('images-blog-select').value;
  const grid = document.getElementById('articles-images-grid');
  if (!grid) return;

  if (!blog) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">Selecione um blog acima para carregar a lista de artigos.</div>';
    return;
  }

  grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-main); padding:40px;"><span class="spinner" style="width:24px; height:24px; display:inline-block; margin-right:8px;"></span> Carregando artigos do GitHub...</div>';

  try {
    const gitToken = State.credentials.githubToken;
    const response = await fetch(`/api/blog-articles?blog=${blog}&githubToken=${gitToken}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao carregar artigos.');
    }

    if (data.articles.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">Nenhum artigo encontrado neste blog.</div>';
      return;
    }

    grid.innerHTML = '';
    data.articles.forEach(article => {
      const isPlaceholder = !article.heroImage || article.heroImage.includes('placeholder') || article.heroImage.includes('recommended-bike');
      const card = document.createElement('div');
      card.className = 'sub-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '12px';
      card.style.border = isPlaceholder ? '1px dashed #ef4444' : '1px solid var(--border-color)';
      card.style.padding = '16px';
      card.style.borderRadius = '12px';
      card.style.backgroundColor = 'rgba(255,255,255,0.01)';

      const thumbUrl = article.heroImage ? (article.heroImage.startsWith('/') ? `https://raw.githubusercontent.com/${DEFAULT_ORG}/${blog}/main/public${article.heroImage}` : article.heroImage) : '';

      card.innerHTML = `
        <div style="position:relative; width:100%; height:140px; border-radius:8px; overflow:hidden; background:#111;">
          <img src="${thumbUrl || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23222%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2210%22>Sem Imagem</text></svg>'}" 
               id="img-preview-${article.slug}" 
               style="width:100%; height:100%; object-fit:cover;"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23222%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ef4444%22 font-size=%228%22>Erro Carregamento (404)</text></svg>'\">
          ${isPlaceholder ? `<span style="position:absolute; top:8px; left:8px; background:#ef4444; color:#fff; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:4px;">Placeholder</span>` : ''}
        </div>
        <div style="font-weight:bold; font-size:0.95rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${article.title}">${article.title}</div>
        <div style="font-size:0.8rem; color:var(--text-muted); font-family:monospace; word-break:break-all;">Hero: ${article.heroImage || 'Nenhuma'}</div>
        
        <div style="display:flex; gap:8px; margin-top:auto;">
          <input type="text" id="custom-img-url-${article.slug}" class="form-control" style="flex:1; padding:8px; font-size:0.8rem;" placeholder="Nova URL de Imagem">
          <button class="btn btn-outline" onclick="updateArticleImageManual('${article.slug}')" style="padding:8px 12px; font-size:0.8rem;">Salvar</button>
        </div>
        
        <button class="btn btn-sm" onclick="autoSearchPexelsSingle('${article.slug}', '${article.title.replace(/'/g, "\\'")}')" style="width:100%; background:rgba(99,102,241,0.1); color:var(--primary); border:1px solid rgba(99,102,241,0.2); font-weight:bold; font-size:0.8rem; padding:8px; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;">
          🔍 Autobuscar no Pexels
        </button>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--danger); padding:40px;">Erro ao carregar artigos: ${err.message}</div>`;
  }
};

window.updateArticleImageManual = async function(slug) {
  const blog = document.getElementById('images-blog-select').value;
  const imageUrl = document.getElementById(`custom-img-url-${slug}`).value.trim();

  if (!imageUrl) {
    showToast('Insira uma URL de imagem válida.', 'warning');
    return;
  }

  showToast('Iniciando envio e atualização...', 'info');

  try {
    const gitToken = State.credentials.githubToken;
    const response = await fetch('/api/update-article-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blog, slug, imageUrl, githubToken: gitToken })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao salvar imagem.');
    }

    showToast('Imagem de destaque atualizada com sucesso!', 'success');
    
    const previewImg = document.getElementById(`img-preview-${slug}`);
    if (previewImg) {
      previewImg.src = data.heroImage.startsWith('/') ? `https://raw.githubusercontent.com/${DEFAULT_ORG}/${blog}/main/public${data.heroImage}` : data.heroImage;
    }
  } catch (err) {
    console.error(err);
    showToast(`Erro ao atualizar imagem: ${err.message}`, 'error');
  }
};

window.autoSearchPexelsSingle = async function(slug, title) {
  const pexelsKey = localStorage.getItem('pexels_api_key');
  if (!pexelsKey) {
    showToast('Chave de API do Pexels não configurada. Configure nas Configurações.', 'warning');
    return;
  }

  showToast(`Buscando imagem para "${title}"...`, 'info');

  try {
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(title)}&per_page=1&locale=pt-BR`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: pexelsKey }
    });
    if (!res.ok) throw new Error('Falha ao conectar na API do Pexels.');

    const data = await res.json();
    const imageUrl = data.photos?.[0]?.src?.large;

    if (!imageUrl) {
      showToast('Nenhuma imagem encontrada no Pexels para este título.', 'warning');
      return;
    }

    const input = document.getElementById(`custom-img-url-${slug}`);
    if (input) input.value = imageUrl;
    
    await updateArticleImageManual(slug);
  } catch (err) {
    console.error(err);
    showToast(`Erro ao buscar Pexels: ${err.message}`, 'error');
  }
};

window.autoHealBlogImages = async function() {
  const blog = document.getElementById('images-blog-select').value;
  const pexelsKey = localStorage.getItem('pexels_api_key');

  if (!blog) {
    showToast('Selecione um blog primeiro.', 'warning');
    return;
  }
  if (!pexelsKey) {
    showToast('Insira sua Chave de API do Pexels nas Configurações.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-auto-heal-images');
  const progressContainer = document.getElementById('image-heal-progress-container');
  const progressBar = document.getElementById('image-heal-progress-bar');
  const percentageText = document.getElementById('image-heal-percentage');
  const statusText = document.getElementById('image-heal-status-text');
  const logs = document.getElementById('image-heal-logs');

  btn.disabled = true;
  progressContainer.style.display = 'block';
  logs.textContent = '🔍 Iniciando varredura...\n';
  progressBar.style.width = '0%';
  percentageText.textContent = '0%';

  try {
    const gitToken = State.credentials.githubToken;
    const response = await fetch(`/api/blog-articles?blog=${blog}&githubToken=${gitToken}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao buscar artigos do blog.');
    }

    const pending = data.articles.filter(a => {
      return !a.heroImage || a.heroImage.includes('placeholder') || a.heroImage.includes('recommended-bike');
    });

    logs.textContent += `📊 Total de posts encontrados: ${data.articles.length}\n`;
    logs.textContent += `🚨 Posts com placeholder/sem imagem: ${pending.length}\n`;

    if (pending.length === 0) {
      logs.textContent += `✓ Tudo pronto! Todos os artigos já possuem imagens válidas.\n`;
      btn.disabled = false;
      statusText.textContent = 'Varredura concluída!';
      return;
    }

    let successCount = 0;
    for (let i = 0; i < pending.length; i++) {
      const article = pending[i];
      const stepPct = Math.round(((i + 1) / pending.length) * 100);
      statusText.textContent = `Corrigindo (${i + 1}/${pending.length}): ${article.title}`;
      logs.textContent += `\n👉 [${i+1}/${pending.length}] Corrigindo: "${article.title}"...\n`;
      
      try {
        logs.textContent += `  🔍 Pesquisando imagem no Pexels...\n`;
        const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(article.title)}&per_page=1&locale=pt-BR`;
        const searchRes = await fetch(searchUrl, { headers: { Authorization: pexelsKey } });
        if (!searchRes.ok) throw new Error('API do Pexels retornou erro.');
        
        const searchData = await searchRes.json();
        const imageUrl = searchData.photos?.[0]?.src?.large;
        
        if (!imageUrl) {
          logs.textContent += `  ⚠️ Nenhuma foto encontrada no Pexels.\n`;
          continue;
        }

        logs.textContent += `  📥 Baixando e enviando para o GitHub...\n`;
        const updateRes = await fetch('/api/update-article-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blog, slug: article.slug, imageUrl, githubToken: gitToken })
        });
        
        const updateData = await updateRes.json();
        if (!updateRes.ok || !updateData.success) {
          throw new Error(updateData.error || 'Falha ao salvar.');
        }

        logs.textContent += `  ✅ Sucesso! Imagem atualizada.\n`;
        successCount++;
      } catch (err) {
        logs.textContent += `  ❌ Erro: ${err.message}\n`;
      }

      progressBar.style.width = `${stepPct}%`;
      percentageText.textContent = `${stepPct}%`;
      logs.scrollTop = logs.scrollHeight;

      await new Promise(r => setTimeout(r, 1500));
    }

    logs.textContent += `\n🏁 FIM! Corrigidos ${successCount} de ${pending.length} artigos com sucesso.\n`;
    statusText.textContent = 'Concluído!';
    loadBlogArticlesForImages();
  } catch (err) {
    console.error(err);
    logs.textContent += `\n❌ Erro Geral: ${err.message}\n`;
    statusText.textContent = 'Erro durante a varredura';
  } finally {
    btn.disabled = false;
  }
};

// Visual Fireworks Emitter
function triggerFireworks(x, y) {
  const colors = ['#ff0055', '#00ffcc', '#ffcc00', '#ff00ff', '#00ff00', '#a855f7', '#6366f1'];
  const particleCount = 24;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'asmr-firework-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
    const speed = Math.random() * 100 + 60;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--color', color);
    particle.style.setProperty('--size', `${Math.random() * 6 + 4}px`);
    particle.style.setProperty('--duration', `${Math.random() * 0.4 + 0.4}s`);
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

// Quick Click Confetti/Party Emojis
function triggerClickConfetti(x, y) {
  const icons = ['🎉', '🥳', '✨', '⭐', '💥', '💵', '🚀', '🌈'];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'asmr-click-confetti';
    item.textContent = icons[Math.floor(Math.random() * icons.length)];
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 90 + 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40; 
    const duration = Math.random() * 0.6 + 0.4;
    
    item.style.setProperty('--tx', `${tx}px`);
    item.style.setProperty('--ty', `${ty}px`);
    item.style.setProperty('--duration', `${duration}s`);
    item.style.fontSize = `${Math.random() * 10 + 12}px`;
    
    document.body.appendChild(item);
    setTimeout(() => item.remove(), duration * 1000);
  }
}

// Global Click Event Interceptor for all interactive items
document.addEventListener('click', (e) => {
  const target = e.target.closest('button, a, .macro-card, .sub-card, .micro-niche-card, .palette-option, input[type="submit"], input[type="button"], .nav-link, .auth-tab, [onclick]');
  
  if (target) {
    const text = (target.textContent || '').trim().toLowerCase();
    const id = (target.id || '').toLowerCase();
    const isLink = target.tagName === 'A' && !target.classList.contains('btn');
    
    // 1. Play ASMR sounds and visual effects based on button context
    if (target.classList.contains('macro-card') || target.classList.contains('sub-card') || target.classList.contains('micro-niche-card') || target.classList.contains('palette-option')) {
      // Selection Cards
      ASMR.playPop();
      triggerBubbleBurst(e.pageX, e.pageY, 18, '#a855f7');
    } else if (text.includes('copiar') || id.includes('copy') || text.includes('code')) {
      // Copy actions get the cash register money chime + quick confetti
      ASMR.playCashRegister();
      triggerClickConfetti(e.pageX, e.pageY);
      triggerBubbleBurst(e.pageX, e.pageY, 12, '#10b981');
    } else if (text.includes('gerar') || text.includes('criar') || text.includes('salvar') || text.includes('restaurar') || id.includes('submit') || target.type === 'submit') {
      // Major actions: Sparkle Sweep + Applause + Fireworks + Confetti
      ASMR.playSparkleSweep();
      ASMR.playApplause();
      triggerFireworks(e.pageX, e.pageY);
      triggerClickConfetti(e.pageX, e.pageY);
      triggerBubbleBurst(e.pageX, e.pageY, 15, '#ffd700');
    } else if (isLink || target.classList.contains('nav-link') || target.classList.contains('auth-tab')) {
      // Standard links & navigation tabs
      ASMR.playTick();
      triggerBubbleBurst(e.pageX, e.pageY, 6, '#6366f1');
    } else if (text.includes('cancelar') || text.includes('voltar') || text.includes('limpar') || text.includes('fechar') || id.includes('cancel') || id.includes('close')) {
      // Negative / cancel / back actions: whoosh + red bubble burst
      ASMR.playWhoosh();
      triggerBubbleBurst(e.pageX, e.pageY, 10, '#ef4444');
    } else {
      // Default buttons: Tink + quick bubbles
      ASMR.playTink();
      triggerBubbleBurst(e.pageX, e.pageY, 10, '#a855f7');
    }
    
    // 2. Play tactile elastic scale animation
    const originalTransform = target.style.transform;
    target.style.transform = 'scale(0.92)';
    setTimeout(() => {
      target.style.transform = originalTransform;
    }, 120);
 
    // 3. Emit ripple visual effect
    createRipple(e.pageX, e.pageY);
  }
});

// Key clack sounds on input typing
document.addEventListener('input', (e) => {
  if (e.target.matches('input[type="text"], input[type="password"], input[type="email"], input[type="url"], textarea')) {
    if (typeof ASMR !== 'undefined') {
      ASMR.playKeyboardClack();
    }
  }
});


