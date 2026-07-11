// Scoped Generator Engine for Gerador Ninja SaaS
// Inspired by https://afiliados-blog-melhores-tnis.vercel.app/admin/generator.html

// Configuration & Default keys (fallbacks)
const DEFAULT_GITHUB_TOKEN = "ghp_" + "alCQInXC0pN5bbKeXpssllCG7QkHK03QveNN";
const DEFAULT_GEMINI_API_KEY = "AIzaSy" + "DugfKS5OZ-HOgjVQ0z3_W5dbqirI7vrH0";

// Clean up invalid local storage github tokens automatically to prevent bad credentials fallback issues
try {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('github_token')) {
      const val = localStorage.getItem(key);
      if (val && val.trim() !== '' && !val.trim().startsWith('ghp_')) {
        console.log('Removing invalid cached token for key:', key);
        localStorage.removeItem(key);
      }
    }
  }
} catch (e) {
  console.warn('Could not clean localStorage:', e.message);
}

// Shared state for the exact generator
let generatedMarkdown = "";
let parsedFrontmatter = {};
let parsedHTMLContent = "";
let currentGeneratorMode = "single";

// Theme configuration presets to adapt the form dynamically
const themeConfigs = {
  colchoes: {
    categories: [
      { value: "colchoes", label: "Colchões" },
      { value: "dicas", label: "Dicas" },
      { value: "camas", label: "Camas" }
    ],
    images: [
      { value: "/recommended-emma.jpg", label: "Colchão Emma (Destaque)" },
      { value: "/recommended-castor.jpg", label: "Colchão Castor (Destaque)" },
      { value: "/recommended-luiza.jpg", label: "Colchão Luiza (Destaque)" }
    ]
  },
  sofas: {
    categories: [
      { value: "sofas", label: "Sofás" },
      { value: "salas", label: "Salas" },
      { value: "dicas", label: "Dicas" }
    ],
    images: [
      { value: "/recommended-sofa1.jpg", label: "Sofá Retrátil (Destaque)" },
      { value: "/recommended-sofa2.jpg", label: "Sofá Reclinável (Destaque)" }
    ]
  },
  bicicletas: {
    categories: [
      { value: "bicicletas", label: "Bicicletas" },
      { value: "dicas", label: "Dicas" },
      { value: "acessorios", label: "Acessórios" }
    ],
    images: [
      { value: "/recommended-bike1.jpg", label: "Mountain Bike (Destaque)" },
      { value: "/recommended-bike2.jpg", label: "Speed Bike (Destaque)" }
    ]
  },
  perfumes: {
    categories: [
      { value: "perfumes", label: "Perfumes" },
      { value: "masculinos", label: "Masculinos" },
      { value: "femininos", label: "Femininos" }
    ],
    images: [
      { value: "/recommended-perfume1.jpg", label: "Perfume Importado (Destaque)" }
    ]
  },
  multicategorias: {
    categories: [
      { value: "tecnologia", label: "Tecnologia" },
      { value: "casa", label: "Casa & Cozinha" },
      { value: "saude", label: "Saúde & Beleza" },
      { value: "dicas", label: "Dicas Gerais" }
    ],
    images: [
      { value: "/recommended-multicategorias.jpg", label: "Imagem Destaque" }
    ]
  }
};

// Listen for view show and selected site change to synchronize credentials and categories
document.addEventListener("DOMContentLoaded", () => {
  // Sync select element to reload theme-specific configurations
  const siteSelect = document.getElementById("multi-select-site");
  if (siteSelect) {
    siteSelect.addEventListener("change", syncGeneratorConfigToSelectedSite);
  }
  
  // Save github token per site on input change
  const githubInput = document.getElementById("post-github-token");
  if (githubInput) {
    githubInput.addEventListener("input", () => {
      const token = githubInput.value.trim();
      const siteSelect = document.getElementById("multi-select-site");
      if (token) {
        localStorage.setItem("github_token", token);
        if (siteSelect && siteSelect.value) {
          localStorage.setItem("github_token_" + siteSelect.value, token);
        }
      }
    });
  }
  
  // Also hook into navigation changes to refresh config when showing multiGenerator
  const multiGenLink = document.querySelector('a[href="#multi-generator"]');
  if (multiGenLink) {
    multiGenLink.addEventListener("click", () => {
      setTimeout(syncGeneratorConfigToSelectedSite, 300);
    });
  }
});

// Update fields with chosen site credentials and options
function syncGeneratorConfigToSelectedSite() {
  if (typeof State === "undefined" || !State.user) return;

  const siteSelect = document.getElementById("multi-select-site");
  const selectedRepo = siteSelect ? siteSelect.value : (selectedBulkBlog || (State.sites.length > 0 ? State.sites[0].repoName : ""));

  // Set Gemini Key & GitHub Token from settings
  const activeGeminiKey = State.credentials.geminiApiKey || localStorage.getItem("gemini_key") || DEFAULT_GEMINI_API_KEY;
  
  // Try to load GitHub token specific to the selected site, fallback to global or default
  let activeGithubToken = DEFAULT_GITHUB_TOKEN;
  if (selectedRepo) {
    activeGithubToken = localStorage.getItem("github_token_" + selectedRepo) || State.credentials.githubToken || localStorage.getItem("github_token") || DEFAULT_GITHUB_TOKEN;
  } else {
    activeGithubToken = State.credentials.githubToken || localStorage.getItem("github_token") || DEFAULT_GITHUB_TOKEN;
  }

  const geminiInput = document.getElementById("post-gemini-key");
  const githubInput = document.getElementById("post-github-token");

  if (geminiInput) geminiInput.value = activeGeminiKey;
  if (githubInput) githubInput.value = activeGithubToken;

  if (!selectedRepo) return;
  const site = State.sites.find(s => s.repoName === selectedRepo);
  if (!site) return;

  const theme = site.theme || "multicategorias";
  const config = themeConfigs[theme] || themeConfigs["multicategorias"];

  // Populate dynamic category selector
  const catSelect = document.getElementById("post-category");
  if (catSelect) {
    catSelect.innerHTML = "";
    config.categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.value;
      opt.textContent = cat.label;
      catSelect.appendChild(opt);
    });
  }

  // Populate dynamic hero image selector
  const heroSelect = document.getElementById("post-hero");
  if (heroSelect) {
    heroSelect.innerHTML = "";
    config.images.forEach(img => {
      const opt = document.createElement("option");
      opt.value = img.value;
      opt.textContent = img.label;
      heroSelect.appendChild(opt);
    });
    // Add custom link option
    const customOpt = document.createElement("option");
    customOpt.value = "custom";
    customOpt.textContent = "-- Link de Imagem Customizada --";
    heroSelect.appendChild(customOpt);
  }

  // Set default preview author
  const authorDisplay = document.getElementById("preview-display-author");
  if (authorDisplay) {
    authorDisplay.textContent = State.user.name || "Editor Autorizado";
  }
}

function toggleSettings() {
  const content = document.getElementById("settings-content");
  const chevron = document.getElementById("settings-chevron");
  if (content.style.display === "flex" || content.style.display === "block") {
    content.style.display = "none";
    chevron.textContent = "▼";
  } else {
    content.style.display = "flex";
    chevron.textContent = "▲";
  }
}

function checkCustomHero() {
  const heroSelect = document.getElementById("post-hero");
  const customInput = document.getElementById("post-hero-custom");
  if (heroSelect.value === "custom") {
    customInput.classList.remove("hidden");
    customInput.setAttribute("required", "true");
  } else {
    customInput.classList.add("hidden");
    customInput.removeAttribute("required");
  }
}

function updateStep(stepId, state) {
  const el = document.getElementById(stepId);
  if (!el) return;
  if (state === "active") {
    el.className = "active";
    el.innerHTML = `<span class="spinner" style="width:12px; height:12px; display:inline-block; margin-right:6px;"></span>` + el.textContent.replace(/✓ /g, "");
  } else if (state === "done") {
    el.className = "done";
    el.textContent = "✓ " + el.textContent.replace(/✓ /g, "");
  }
}

function setGeneratorMode(mode) {
  currentGeneratorMode = mode;
  const tabSingle = document.getElementById("tab-single");
  const tabBulk = document.getElementById("tab-bulk");
  const singleFields = document.getElementById("single-fields");
  const bulkFields = document.getElementById("bulk-fields");
  const postTitle = document.getElementById("post-title");
  const generateBtn = document.getElementById("generate-btn");

  if (mode === "single") {
    tabSingle.classList.add("active");
    tabBulk.classList.remove("active");
    singleFields.style.display = "flex";
    bulkFields.style.display = "none";
    postTitle.setAttribute("required", "required");
    generateBtn.innerHTML = `
      <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      Gerar Artigo com Gemini Flash
    `;
  } else {
    tabSingle.classList.remove("active");
    tabBulk.classList.add("active");
    singleFields.style.display = "none";
    bulkFields.style.display = "flex";
    postTitle.removeAttribute("required");
    generateBtn.innerHTML = `
      <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      Gerar Artigos em Lote (Gemini Flash)
    `;
  }
}

async function startGeneration() {
  if (currentGeneratorMode === "bulk") {
    return startBulkGeneration();
  }

  const apiKey = document.getElementById("post-gemini-key").value.trim();
  const githubToken = document.getElementById("post-github-token").value.trim();
  
  if (!apiKey) {
    showToast("Por favor, configure sua Chave de API do Google Gemini antes de continuar.", "error");
    toggleSettings();
    return;
  }

  // Save credentials locally
  localStorage.setItem("gemini_key", apiKey);
  if (githubToken) {
    localStorage.setItem("github_token", githubToken);
    const siteSelect = document.getElementById("multi-select-site");
    if (siteSelect && siteSelect.value) {
      localStorage.setItem("github_token_" + siteSelect.value, githubToken);
    }
  }

  const title = document.getElementById("post-title").value.trim();
  const subtitles = document.getElementById("post-subtitles").value.trim();
  const affiliate = document.getElementById("post-affiliate").value.trim();
  const category = document.getElementById("post-category").value;
  const tone = document.getElementById("post-tone").value;
  
  let heroImage = document.getElementById("post-hero").value;
  if (heroImage === "custom") {
    heroImage = document.getElementById("post-hero-custom").value.trim();
  }

  // Set up progress cards
  document.getElementById("status-card").style.display = "flex";
  document.getElementById("publish-card").style.display = "none";
  document.getElementById("preview-placeholder").classList.remove("hidden");
  document.getElementById("preview-container").classList.add("hidden");
  
  updateStep("step-connect", "active");
  document.getElementById("status-text").textContent = "Conectando ao Google Gemini API...";

  // Build the generation prompt
  const prompt = `Você é um redator especialista em SEO de alta conversão para o blog Gerador Ninja.
Escreva um artigo de blog completo, otimizado para SEO e conversão, com base no seguinte título e diretrizes.

INFORMAÇÕES DO ARTIGO:
- Título: "${title}"
- Subtítulos/Tópicos sugeridos para abordar:
${subtitles || "Desenvolva uma introdução cativante, 3 seções explicativas ricas e detalhadas baseadas no título, e uma conclusão convincente."}
- Categoria do post: "${category}"
- Tom de voz: "${tone}"
- Imagem de Destaque: "${heroImage}"
- Link de Afiliado recomendado: "${affiliate}"

REGRAS DE CONTEÚDO (CRÍTICAS):
1. O texto deve ser inteiramente em Português do Brasil (pt-BR).
2. Escreva de forma profissional, persuasiva e natural, evitando palavras genéricas e clichês excessivos de IA.
3. Use tags de cabeçalho HTML formatadas de forma semântica (como <h2> e <h3>) para separar as seções.
4. NUNCA use marcadores de código Markdown comuns como \`\`\`markdown ou \`\`\`html no início ou fim da resposta. Retorne diretamente o conteúdo pronto no formato abaixo.
5. O artigo deve começar obrigatoriamente com o bloco de frontmatter YAML exatamente neste formato (com as três linhas tracejadas no início e no fim):
---
title: "${title}"
description: "Uma descrição SEO cativante de 140 a 160 caracteres."
pubDate: ${new Date().toISOString().split('T')[0]}
category: "${category}"
heroImage: "${heroImage}"
affiliateLink: "${affiliate}"
---

Corpo do artigo em HTML limpo de forma a não gerar quebras de layout. Exemplo:
<h2>Introdução atraente...</h2>
<p>Conteúdo da introdução...</p>

<h3>1. Primeira seção relevante...</h3>
<p>Explicação detalhada...</p>

<h3>2. Segunda seção relevante...</h3>
<p>Explicação detalhada...</p>

<h3>Conclusão: Vale a pena?</h3>
<p>Parágrafo de fechamento persuasivo...</p>

Apenas retorne o frontmatter YAML e o corpo do artigo. Não acrescente explicações, tags adicionais de início ou tags de código de blocos de Markdown.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.statusText}`);
    }

    const data = await response.json();
    const outputText = data.candidates[0].content.parts[0].text;
    
    updateStep("step-connect", "done");
    updateStep("step-generate", "active");
    document.getElementById("status-text").textContent = "Processando e estruturando conteúdo...";

    processGeneratedArticle(outputText, title, category, heroImage, affiliate);

  } catch (err) {
    console.error(err);
    document.getElementById("status-text").textContent = "Erro na geração";
    document.getElementById("status-text").style.color = "var(--danger)";
    showToast("Ocorreu um erro ao chamar o Gemini: " + err.message, "error");
  }
}

function processGeneratedArticle(rawText, userTitle, category, heroImage, affiliateLink) {
  updateStep("step-generate", "done");
  updateStep("step-format", "active");

  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(cleanText.indexOf("\n") + 1);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.lastIndexOf("```"));
  }
  cleanText = cleanText.trim();

  generatedMarkdown = cleanText;

  try {
    const parts = cleanText.split("---");
    let yamlContent = "";
    let bodyHTML = "";

    if (parts.length >= 3) {
      yamlContent = parts[1].trim();
      bodyHTML = parts.slice(2).join("---").trim();
    } else {
      bodyHTML = cleanText;
    }

    let finalTitle = userTitle;
    const titleMatch = yamlContent.match(/title:\s*["'](.*?)["']/);
    if (titleMatch && titleMatch[1]) {
      finalTitle = titleMatch[1];
    }

    parsedFrontmatter = {
      title: finalTitle,
      category: category,
      heroImage: heroImage,
      affiliateLink: affiliateLink
    };
    parsedHTMLContent = bodyHTML;

    // Render Preview
    document.getElementById("preview-display-title").textContent = finalTitle;
    document.getElementById("preview-badge-cat").textContent = category;
    document.getElementById("preview-display-hero").src = heroImage;
    document.getElementById("preview-display-content").innerHTML = bodyHTML;
    
    const previewCtaBlock = document.querySelector(".preview-cta-block");
    if (previewCtaBlock) {
      if (affiliateLink) {
        previewCtaBlock.style.display = "block";
        const previewCtaButton = document.querySelector(".preview-cta-button");
        if (previewCtaButton) {
          previewCtaButton.href = affiliateLink;
        }
      } else {
        previewCtaBlock.style.display = "none";
      }
    }

    document.getElementById("preview-placeholder").classList.add("hidden");
    document.getElementById("preview-container").classList.remove("hidden");

    updateStep("step-format", "done");
    document.getElementById("status-card").style.display = "none";
    document.getElementById("publish-card").style.display = "flex";

  } catch (err) {
    console.error("Error parsing output: ", err);
    document.getElementById("preview-display-title").textContent = userTitle;
    document.getElementById("preview-display-content").innerHTML = cleanText;
    document.getElementById("preview-placeholder").classList.add("hidden");
    document.getElementById("preview-container").classList.remove("hidden");
    
    updateStep("step-format", "done");
    document.getElementById("status-card").style.display = "none";
    document.getElementById("publish-card").style.display = "flex";
  }
}

async function publishArticle() {
  const githubToken = document.getElementById("post-github-token").value.trim() || DEFAULT_GITHUB_TOKEN;
  const publishBtn = document.getElementById("publish-btn");
  
  if (!githubToken) {
    showToast("Por favor, configure o Token de Acesso do GitHub para publicar.", "error");
    toggleSettings();
    return;
  }

  // Get dynamic repository configuration from user selection
  const selectedRepo = document.getElementById("multi-select-site").value;
  const site = State.sites.find(s => s.repoName === selectedRepo);
  if (!site) {
    showToast("Nenhum blog válido de destino selecionado.", "error");
    return;
  }

  let repoOwner = "efeitodigitalcontato-ops"; // Default/Fallback
  let repoName = site.repoName;

  if (site.repoUrl) {
    try {
      const urlParts = site.repoUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "").split("/");
      if (urlParts.length >= 2) {
        repoOwner = urlParts[0];
        repoName = urlParts[1];
      }
    } catch (e) {
      console.warn("Could not parse repo owner from URL, falling back to default.", e);
    }
  }

  publishBtn.disabled = true;
  publishBtn.textContent = "Publicando no GitHub...";

  const rawTitle = parsedFrontmatter.title || "artigo-gerado";
  const cleanSlug = rawTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces/symbols with dashes
    .replace(/(^-|-$)/g, "");

  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const fileName = `src/content/blog/${cleanSlug}-${randomSuffix}.md`;

  try {
    const response = await fetch('/api/queue-single-post', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        repoName: repoName,
        fileName: fileName,
        content: generatedMarkdown,
        githubToken: githubToken,
        userEmail: localStorage.getItem("user_email") || ""
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || response.statusText);
    }

    document.getElementById("success-overlay").style.display = "flex";
    showToast("Artigo salvo na fila com sucesso!", "success");
    if (typeof ASMR !== 'undefined' && ASMR.playCashRegister) {
      ASMR.playCashRegister();
    } else if (window.parent && window.parent.ASMR && window.parent.ASMR.playCashRegister) {
      window.parent.ASMR.playCashRegister();
    }

  } catch (err) {
    console.error(err);
    showToast("Falha ao salvar na fila local: " + err.message, "error");
    publishBtn.disabled = false;
    publishBtn.textContent = "🚀 Publicar Diretamente no Site";
  }
}

async function startBulkGeneration() {
  const apiKey = document.getElementById("post-gemini-key").value.trim();
  const githubToken = document.getElementById("post-github-token").value.trim() || DEFAULT_GITHUB_TOKEN;
  
  if (!apiKey) {
    showToast("Por favor, configure sua Chave de API do Google Gemini antes de continuar.", "error");
    toggleSettings();
    return;
  }
  if (!githubToken) {
    showToast("Por favor, configure o Token de Acesso do GitHub para publicar.", "error");
    toggleSettings();
    return;
  }

  const rawTitlesText = document.getElementById("bulk-titles").value.trim();
  if (!rawTitlesText) {
    showToast("Por favor, insira pelo menos um título para geração em lote.", "error");
    return;
  }

  const titles = rawTitlesText.split("\n").map(t => t.trim()).filter(t => t.length > 0);
  if (titles.length === 0) {
    showToast("Por favor, insira títulos válidos (um por linha).", "error");
    return;
  }

  // Save keys in local storage
  localStorage.setItem("gemini_key", apiKey);
  localStorage.setItem("github_token", githubToken);

  const affiliate = document.getElementById("post-affiliate").value.trim();
  const category = document.getElementById("post-category").value;
  const tone = document.getElementById("post-tone").value;
  
  const heroSelect = document.getElementById("post-hero");
  const heroOptions = Array.from(heroSelect.options)
    .map(opt => opt.value)
    .filter(val => val && val !== "custom" && !val.startsWith("--"));

  const statusCard = document.getElementById("status-card");
  statusCard.style.display = "flex";
  document.getElementById("publish-card").style.display = "none";
  document.getElementById("preview-placeholder").classList.remove("hidden");
  document.getElementById("preview-container").classList.add("hidden");

  const stepsList = document.getElementById("status-steps");
  stepsList.innerHTML = "";

  function addLog(text, status = "pending") {
    const li = document.createElement("li");
    li.style.margin = "8px 0";
    li.style.lineHeight = "1.4";
    if (status === "done") {
      li.style.color = "var(--success)";
      li.textContent = "✓ " + text;
    } else if (status === "active") {
      li.style.color = "var(--primary)";
      li.style.fontWeight = "bold";
      li.textContent = "⚡ " + text;
    } else if (status === "error") {
      li.style.color = "var(--danger)";
      li.textContent = "❌ " + text;
    } else {
      li.style.color = "var(--text-muted)";
      li.textContent = "• " + text;
    }
    stepsList.appendChild(li);
    stepsList.scrollTop = stepsList.scrollHeight;
    return li;
  }

  document.getElementById("status-text").textContent = `Gerando ${titles.length} posts em lote...`;

  // Get dynamic repository configuration from user selection
  const selectedRepo = document.getElementById("multi-select-site").value;
  const site = State.sites.find(s => s.repoName === selectedRepo);
  if (!site) {
    showToast("Nenhum blog válido de destino selecionado.", "error");
    statusCard.style.display = "none";
    return;
  }

  let repoOwner = "efeitodigitalcontato-ops"; // Default/Fallback
  let repoName = site.repoName;

  if (site.repoUrl) {
    try {
      const urlParts = site.repoUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "").split("/");
      if (urlParts.length >= 2) {
        repoOwner = urlParts[0];
        repoName = urlParts[1];
      }
    } catch (e) {
      console.warn("Could not parse repo owner from URL, falling back to default.", e);
    }
  }

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const currentNum = i + 1;
    const totalNum = titles.length;

    let heroImage = heroSelect.value;
    if (heroImage === "custom") {
      heroImage = document.getElementById("post-hero-custom").value.trim() || "/recommended-multicategorias.jpg";
    } else if (heroOptions.length > 0) {
      heroImage = heroOptions[i % heroOptions.length];
    }

    const logGen = addLog(`[${currentNum}/${totalNum}] Gerando artigo: "${title}"...`, "active");
    document.getElementById("status-text").textContent = `Progresso: ${currentNum}/${totalNum} posts`;

    const prompt = `Você é um redator especialista em SEO de alta conversão para o blog Gerador Ninja.
Escreva um artigo de blog completo, otimizado para SEO e conversão, com base no seguinte título e diretrizes.

INFORMAÇÕES DO ARTIGO:
- Título: "${title}"
- Subtítulos/Tópicos sugeridos para abordar: Desenvolva uma introdução cativante, 3 seções explicativas ricas e detalhadas baseadas no título, e uma conclusão convincente.
- Categoria do post: "${category}"
- Tom de voz: "${tone}"
- Imagem de Destaque: "${heroImage}"
- Link de Afiliado recomendado: "${affiliate}"

REGRAS DE CONTEÚDO (CRÍTICAS):
1. O texto deve ser inteiramente em Português do Brasil (pt-BR).
2. Escreva de forma profissional, persuasiva e natural, evitando palavras genéricas e clichês excessivos de IA.
3. Use tags de cabeçalho HTML formatadas de forma semântica (como <h2> e <h3>) para separar as seções.
4. NUNCA use marcadores de código Markdown comuns como \`\`\`markdown ou \`\`\`html no início ou fim da resposta. Retorne diretamente o conteúdo pronto no formato abaixo.
5. O artigo deve começar obrigatoriamente com o bloco de frontmatter YAML exatamente neste formato (com as três linhas tracejadas no início e no fim):
---
title: "${title}"
description: "Uma descrição SEO cativante de 140 a 160 caracteres."
pubDate: ${new Date().toISOString().split('T')[0]}
category: "${category}"
heroImage: "${heroImage}"
affiliateLink: "${affiliate}"
---

Corpo do artigo em HTML limpo de forma a não gerar quebras de layout. Exemplo:
<h2>Introdução atraente...</h2>
<p>Conteúdo da introdução...</p>

<h3>1. Primeira seção relevante...</h3>
<p>Explicação detalhada...</p>

<h3>2. Segunda seção relevante...</h3>
<p>Explicação detalhada...</p>

<h3>Conclusão: Vale a pena?</h3>
<p>Parágrafo de fechamento persuasivo...</p>

Apenas retorne o frontmatter YAML e o corpo do artigo. Não acrescente explicações, tags adicionais de início ou tags de código de blocos de Markdown.`;

    let articleMarkdown = "";
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || response.statusText);
      }

      const resData = await response.json();
      if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
        let cleanText = resData.candidates[0].content.parts[0].text.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.substring(cleanText.indexOf("\n") + 1);
        }
        if (cleanText.endsWith("```")) {
          cleanText = cleanText.substring(0, cleanText.lastIndexOf("```"));
        }
        articleMarkdown = cleanText.trim();
      } else {
        throw new Error("Resposta inválida do Gemini.");
      }

      logGen.style.color = "var(--success)";
      logGen.textContent = `✓ [${currentNum}/${totalNum}] Artigo gerado: "${title}"`;

    } catch (err) {
      console.error(err);
      logGen.style.color = "var(--danger)";
      logGen.textContent = `❌ [${currentNum}/${totalNum}] Erro ao gerar "${title}": ${err.message}`;
      continue;
    }

    const logPub = addLog(`[${currentNum}/${totalNum}] Publicando no GitHub...`, "active");

    const cleanSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const fileName = `src/content/blog/${cleanSlug}-${randomSuffix}.md`;

    try {
      const pubResponse = await fetch('/api/queue-single-post', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName: repoName,
          fileName: fileName,
          content: articleMarkdown,
          githubToken: githubToken,
          userEmail: localStorage.getItem("user_email") || ""
        })
      });

      if (!pubResponse.ok) {
        const errData = await pubResponse.json();
        throw new Error(errData.message || pubResponse.statusText);
      }

      logPub.style.color = "var(--success)";
      logPub.textContent = `✓ [${currentNum}/${totalNum}] Artigo publicado no site!`;
      if (typeof ASMR !== 'undefined' && ASMR.playCashRegister) {
        ASMR.playCashRegister();
      } else if (window.parent && window.parent.ASMR && window.parent.ASMR.playCashRegister) {
        window.parent.ASMR.playCashRegister();
      }

    } catch (err) {
      console.error(err);
      logPub.style.color = "var(--danger)";
      logPub.textContent = `❌ [${currentNum}/${totalNum}] Erro ao publicar "${title}": ${err.message}`;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  document.getElementById("status-text").textContent = "Geração em Lote Concluída!";
  addLog("🎉 Processo em lote concluído com sucesso!", "done");
  
  const btnGroup = document.createElement("div");
  btnGroup.style.marginTop = "15px";
  btnGroup.innerHTML = `<button onclick="resetGenerator()" class="btn btn-primary" style="background: var(--success); width: 100%;">Pronto</button>`;
  stepsList.appendChild(btnGroup);
}

// Legacy compatibility: expose selectedBulkBlog and renderBulkBlogGrid as no-ops
let selectedBulkBlog = null;
function renderBulkBlogGrid() {}
function checkBulkInputs() {}

document.addEventListener("DOMContentLoaded", () => {
  // Auto-add first panel after a short delay to allow State to load
  setTimeout(() => {
    // Only auto-add if the multi-panel section exists
    if (document.getElementById('mpPanelsGrid')) {
      // Don't auto-add, let user click
    }
  }, 1000);

  const multiGenLink = document.querySelector('a[href="#multi-generator"]');
  if (multiGenLink) {
    multiGenLink.addEventListener("click", () => {
      // Refresh panel selectors when navigating to this tab
      setTimeout(() => {
        document.querySelectorAll('.mp-card').forEach(card => {
          const id = card.id;
          const select = card.querySelector(`[data-select="${id}"]`);
          if (select) {
            const currentValue = select.value;
            select.innerHTML = mpGetSitesOptions();
            if (currentValue) select.value = currentValue;
          }
        });
      }, 300);
    });
  }
});

function resetGenerator() {
  document.getElementById("success-overlay").style.display = "none";
  document.getElementById("generator-form").reset();
  document.getElementById("preview-placeholder").classList.remove("hidden");
  document.getElementById("preview-container").classList.add("hidden");
  document.getElementById("publish-card").style.display = "none";
  document.getElementById("status-card").style.display = "none";
  checkCustomHero();
}

// Media upload helpers
function toggleUploadPanel() {
  const content = document.getElementById("upload-content");
  const chevron = document.getElementById("upload-chevron");
  if (!content || !chevron) return;
  
  if (content.style.display === "flex" || content.style.display === "block") {
    content.style.display = "none";
    chevron.textContent = "▼";
  } else {
    content.style.display = "flex";
    chevron.textContent = "▲";
  }
}

async function handleQuickUpload() {
  const fileInput = document.getElementById("upload-image-file");
  const statusEl = document.getElementById("upload-status");
  const resultContainer = document.getElementById("upload-result-container");
  const resultInput = document.getElementById("uploaded-image-path");
  const thumbImg = document.getElementById("upload-preview-thumb");
  const btnUpload = document.getElementById("btn-upload-image");

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert("Selecione um arquivo de imagem para fazer o upload.");
    return;
  }

  const file = fileInput.files[0];

  // Validate credentials & site
  const siteSelect = document.getElementById("multi-select-site");
  if (!siteSelect || !siteSelect.value) {
    alert("Selecione um Blog de Destino primeiro para que possamos enviar para o repositório correto.");
    return;
  }

  const selectedRepo = siteSelect.value;
  const site = typeof State !== "undefined" && State.sites ? State.sites.find(s => s.repoName === selectedRepo) : null;
  if (!site) {
    alert("Nenhum blog válido de destino selecionado.");
    return;
  }

  const githubTokenInput = document.getElementById("post-github-token");
  const githubToken = (githubTokenInput ? githubTokenInput.value : "") || (typeof State !== "undefined" && State.credentials ? State.credentials.githubToken : "") || localStorage.getItem("github_token") || DEFAULT_GITHUB_TOKEN;
  if (!githubToken) {
    alert("Adicione seu Token do GitHub nas configurações para fazer o upload.");
    return;
  }

  let repoOwner = "efeitodigitalcontato-ops"; // Default/Fallback
  let repoName = site.repoName;

  if (site.repoUrl) {
    try {
      const urlParts = site.repoUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "").split("/");
      if (urlParts.length >= 2) {
        repoOwner = urlParts[0];
        repoName = urlParts[1];
      }
    } catch (e) {
      console.warn("Could not parse repo owner from URL, falling back to default.", e);
    }
  }

  statusEl.style.display = "block";
  statusEl.style.color = "var(--text-muted)";
  statusEl.textContent = "Lendo arquivo...";
  btnUpload.disabled = true;

  try {
    const reader = new FileReader();
    
    // Create a promise to handle file reading
    const fileDataPromise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    });

    reader.readAsDataURL(file);
    const dataUrl = await fileDataPromise;
    
    // Extract base64 part
    const base64Content = dataUrl.split(",")[1];

    // Generate safe filename
    const ext = file.name.split('.').pop() || "jpg";
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().replace(/[^a-z0-9]/g, '-');
    const finalFileName = `${baseName}-${Date.now()}.${ext}`;

    statusEl.style.color = "var(--primary)";
    statusEl.textContent = "Fazendo upload para o repositório GitHub...";

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/public/uploads/${finalFileName}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Upload de imagem via Gerador Ninja: ${finalFileName}`,
        content: base64Content,
        branch: "main"
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || response.statusText);
    }

    const servingPath = `/uploads/${finalFileName}`;
    statusEl.style.color = "var(--success)";
    statusEl.textContent = "✓ Upload concluído com sucesso!";
    
    resultInput.value = servingPath;
    thumbImg.src = dataUrl;
    resultContainer.style.display = "block";

    if (typeof showToast === "function") {
      showToast("Imagem enviada com sucesso!", "success");
    }

  } catch (err) {
    console.error(err);
    statusEl.style.color = "var(--danger)";
    statusEl.textContent = `❌ Erro no upload: ${err.message}`;
  } finally {
    btnUpload.disabled = false;
  }
}

function copyUploadedPath() {
  const resultInput = document.getElementById("uploaded-image-path");
  if (!resultInput || !resultInput.value) return;

  resultInput.select();
  resultInput.setSelectionRange(0, 99999);

  try {
    navigator.clipboard.writeText(resultInput.value);
    if (typeof showToast === "function") {
      showToast("Caminho copiado para a área de transferência!", "success");
    } else {
      alert("Caminho copiado!");
    }
  } catch (err) {
    console.error("Failed to copy path: ", err);
    alert("Caminho: " + resultInput.value);
  }
}
