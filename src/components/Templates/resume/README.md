# Resume Templates Architecture & Style Guide

This document describes the structure, formatting rules, and design principles followed by all templates in ResumeMill. Use this guide when creating new templates or editing existing ones.

---

## 1. Dimensional Layout & Spacing
All resumes are formatted to render as pixel-perfect A4 physical sheets. To ensure absolute parity between the web preview and printed PDFs, follow these dimensional constraints:
* **Width:** `794px` (exactly 210mm in standard 96 DPI screen layouts).
* **Height:** `1123px` (exactly 297mm in standard 96 DPI screen layouts).
* **Positioning:** Every page container must be styled with `position: relative; overflow: hidden; background-color: #ffffff; box-sizing: border-box;`.
* **Margins:** Maintain at least `0.75in` (approx `72px`) padding around outer boundaries for professional whitespace.

---

## 2. Strict Conditional Rendering (No Placeholders)
Templates must be dynamic and hide empty sections cleanly. Follow these guidelines:
* **Hiding Entire Sections:** If a list is empty or personal summary is missing, hide the entire section (headings and dividers included).
  ```javascript
  const hasExperience = experience && experience.some(e => e.company || e.role);
  {hasExperience && (
    <section className={styles.sectionBlock}>
      <h2>Experience</h2>
      {/* ... */}
    </section>
  )}
  ```
* **No Hardcoded Fallbacks:** Do not display fallback strings like `"Role"` or `"Institution"`. If a field is empty, do not render it.
* **Conditional Separators:** Never render dangling commas, pipes, or bullets. Render separators only if both values exist:
  ```javascript
  {edu.degree && edu.institution && <span className={styles.separator}>, </span>}
  ```

---

## 3. Printable Link Formats (`showFullUrls` Prop)
Resumes must remain functional when printed on physical paper. Therefore, all template components must accept the `showFullUrls` boolean prop and utilize the `formatDisplayUrl` helper:
```javascript
const formatDisplayUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/^(https?:\/\/)?(www\.)?/, '') // Strips protocols and subdomains
    .replace(/\/$/, ''); // Strips trailing slashes
};
```
* **Active Mode:** When `showFullUrls` is `true`, replace friendly click-labels like `"GitHub"` or `"Live Demo"` with clean, readable URL routes (e.g. `github.com/myusername`).
* **Passive Mode:** When `showFullUrls` is `false`, render standard short labels.
* **Conditional Repository Labels:** If both frontend and backend repository links are provided, distinguish them as `"Front Repo"` and `"Back Repo"`. If only one repository link is provided, avoid using `"Front"` or `"Back"` qualifiers and label it simply as `"Repo"`, `"Code"`, or `"Repository"` depending on the template's style guidelines.

---

## 4. Clickable PDF Capturing
Our PDF export uses `html2canvas` to render pixel-perfect screenshots into A4 pages in `jsPDF`. Because images lose HTML click handlers, interactive links are added using `pdf.link(x, y, w, h, { url })` annotations.
To make this work:
* Render actual `<a>` anchor tags inside your templates with a valid `href`.
* The exporter reads coordinates of these anchors relative to their page bounds:
  $$\text{Scale X} = \frac{210\text{ mm}}{794\text{ px}} \approx 0.26448$$
  $$\text{Scale Y} = \frac{297\text{ mm}}{1123\text{ px}} \approx 0.26447$$
* It automatically registers click regions at those exact coordinates in the generated PDF.

---

## 5. CSS Scoping & Accents
* **CSS Modules:** Styles are co-located in `src/components/Templates/resume/ResumeTemplates.module.css`. Wrap styles under template-specific classes (e.g. `.modern`, `.elegant`, `.creative`, `.timeline`) to prevent cross-template leakage.
* **Typography:** Use modern, readable system fonts. Ensure Georgia is used for executive layouts and clean sans-serif for modern layouts.
* **Semantic HTML:** Use semantic HTML tags (`header`, `footer`, `section`, `article`, `h1`-`h4`) for easy SEO crawling.
* **Watermark:** Respect the `showWatermark` prop, rendering the watermark only if `true` inside a absolute block in the bottom-right corner of the page.
