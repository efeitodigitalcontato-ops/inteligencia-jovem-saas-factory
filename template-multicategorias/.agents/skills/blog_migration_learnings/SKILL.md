---
name: blog-migration-learnings
description: Guidelines and optimized scripts for migrating high-volume blogs, performing native GDI+ image compression, setting up Astro pagination, and deploying large-scale static sites to Vercel.
---

# Blog Migration and Speed Optimization Playbook

Use this playbook when migrating large blogs (e.g., from WordPress backups), re-branding sites, optimizing web vitals, or managing high-volume static pages.

---

## 🛠️ 1. Re-branding CSS & Theme Variables
- **Global Settings**: Locate the root CSS file (often in `src/layouts/Layout.astro` or `index.css`) and update color palettes, typography, shadow utilities, and brand headers.
- **Component Auditing**: Search for structural leaks. Check header and footer metadata, privacy policies, contact pages, and page titles to ensure all legacy text is removed.

---

## 📦 2. Large Database Post Recovery
- **Bulk Extraction**: Extract post rows from `.sql` backups and output to Markdown files using custom JS scripts.
- **Unique Slugs**: Truncate slugs (max 80 chars) to prevent Windows MAX_PATH errors. Always append the unique post ID (e.g., `slug-123.md`) to avoid routing conflicts.
- **Content Formatting Clean-up**: Posts migrated from WordPress often contain content enfolded in code blocks (e.g., beginning with ` ```html ` and ending with ` ``` `). Strip these outer backtick wrappers from the post body and clean description frontmatter metadata to allow pages to render normally.

---

## ⚡ 3. Performance Optimization (PageSpeed Insights)

### Image Compression (Native PowerShell)
When native Node packages like `sharp` take too long to compile or fail due to security policies on Windows, execute a native PowerShell script to compress files. This uses `.NET` `System.Drawing` to avoid file locks and compress PNGs/JPEGs to 80% quality JPEGs:

```powershell
Add-Type -AssemblyName System.Drawing
# Scan and compress all images > 150KB to JPEG temp path, then replace the original
# (Clone bitmap or save to temp file to bypass GDI+ read-lock issues)
```

After compressing, run a script to search all Markdown posts and replace path extensions (`.png` -> `.jpg`) for files that were converted.

### Eliminate CLS (Cumulative Layout Shift)
- Define explicit `width` and `height` attributes on all layout and product `<img>` elements.
- Add `decoding="async"` to all images.

### Optimize LCP (Largest Contentful Paint)
- The main hero image of the post/page should have `fetchpriority="high"` and `loading="eager"`.
- All other secondary/sidebar images should have `loading="lazy"`.

---

## 🗂️ 4. Listing Scale & Astro Pagination
- Do not render all posts on the homepage. Limit listing pages to exactly **10 items per page**.
- Replace `src/pages/index.astro` with a dynamic route `src/pages/[...page].astro` and use Astro's native `paginate()` helper inside `getStaticPaths`.
- **CRITICAL**: Delete the old static `index.astro` file to prevent static route resolution collisions during build time.
- Implement a pagination navbar using `page.url.prev`, `page.url.next`, `page.currentPage`, and `page.lastPage`.

---

## 🚀 5. High-Volume Deployments (Vercel)
- When uploading projects with more than 15,000 files (like blogs with thousands of posts and uploads), Vercel's API may throw file count limit errors.
- Solve this by deploying with tarball compression:
  `npx vercel --archive=tgz --prod`

---

## 🧰 6. Starter Kit de Novos Temas (Templating)
Ao criar um novo site/tema a partir de um banco WP, não crie scripts do zero. Copie os scripts base do diretório de templates localizado em `C:\Users\Randerson\.gemini\antigravity\scratch\migration-tools\`:
- `parse_db_template.js` (Extração limpa do SQL)
- `create_markdowns_template.js` (Geração de .md com frontmatter limpo)
- `compress_images_template.ps1` (Compressão de imagens nativa com GDI+)
Ajuste os diretórios nos scripts copiados e execute-os em ordem.
