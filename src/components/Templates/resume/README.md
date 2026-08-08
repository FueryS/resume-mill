# Resume Templates Architecture & Style Guide

This document describes the structure, formatting rules, design principles, and maximum input length constraints followed by all templates in ResumeMill. Use this guide when creating new templates or editing existing ones.

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

---

## 6. Sub-Category Grouping Design Standards & Approaches
Sub-category grouping allows users to categorize entries (Work Experience, Projects, Education, Skills, Certifications, Achievements) under named sub-headings (e.g., *"Frontend"*, *"Cloud Infrastructure"*).

To give users a clear visual indication of group membership, templates employ combinations of three standardized design approaches:

### The 3 Core Visual Grouping Approaches:
1. **Approach 1: Python-style Indentation**
   * Items that **do not** belong to a group (ungrouped) are rendered flush with standard section margins (sharing exact alignment with group headings).
   * Items that **do** belong to a group are indented (`margin-left: 14px; padding-left: 12px;`), visually nesting them under their group title like code inside Python blocks.
2. **Approach 2: Subtle Background Tint / Card Box**
   * Grouped items receive a subtle background color tint (`background-color: rgba(0, 0, 0, 0.025); border-radius: 4px; border-left: 2px solid #374151;`) that is slightly darker/different than the primary page background to cleanly enclose the group.
3. **Approach 3: Dashed Group Container Line**
   * A light, thin dashed border line (`border-left: 1.5px dashed <accent-color>`) runs down the left edge of the grouped items wrapper. The line thickness is kept thin (`1.5px`) and color light so users do not mistake group boundaries for section dividers.

---

### Template Grouping Specifications:
* **Red / Timeline Template (`Timeline_Page.jsx`):**
  * **Combination:** **Approach 3 (Dashed Line) + Approach 1 (Python Indentation)**
  * **Styling:** Group title in bold red (`#dc2626`). Grouped items are indented with a thin red dashed left border (`border-left: 1.5px dashed rgba(220, 38, 38, 0.4); margin-left: 14px; padding-left: 12px;`). Ungrouped items remain flush at root margin.
* **Modern Template (`Modern_Page.jsx`):**
  * **Combination:** **Approach 1 (Python Indentation) + Approach 3 (Thin Indigo Dashed Border)**
  * **Styling:** Group title in indigo (`#4f46e5`). Grouped items indented with a thin indigo dashed border (`border-left: 1.5px dashed rgba(79, 70, 229, 0.35); margin-left: 14px; padding-left: 12px;`).
* **Elegant Template (`Elegant_Page.jsx`):**
  * **Combination:** **Approach 1 (Python Indentation) + Approach 2 (Subtle Background Tint)**
  * **Styling:** Grouped items indented and wrapped in a subtle dark tint box (`background-color: rgba(0, 0, 0, 0.025); border-left: 2px solid #374151; border-radius: 4px; padding: 8px 12px;`).
* **Creative Template (`Creative_Page.jsx`):**
  * **Combination:** **Approach 1 (Python Indentation) + Approach 3 (Thin Slate/White Dashed Line)**
  * **Styling:** Main column items indented with slate dashed border (`border-left: 1.5px dashed rgba(148, 163, 184, 0.45); margin-left: 14px;`). Dark sidebar skills indented with subtle translucent white border (`border-left: 1.5px dashed rgba(255, 255, 255, 0.25);`).

---

## 7. Maximum Input Character & Word Count Limits

Each template presents text differently (font sizes, column widths, line heights, sidebars). To prevent text from overflowing, wrapping into messy multi-line blocks, or breaking template page aesthetics, input fields must enforce maximum character limits.

### Standard Field Maximum Character Limits:

| Input Field | Max Characters | Max Words (Approx) | Purpose / Visual Constraint |
| :--- | :--- | :--- | :--- |
| **Full Name** (`personal.fullName`) | **50 chars** | ~6 - 8 words | Prevents main header from wrapping into 3+ awkward lines |
| **Job Title / Role** (`personal.role`) | **60 chars** | ~8 - 10 words | Fits cleanly on a single subtitle line below full name |
| **Email Address** (`personal.email`) | **50 chars** | 1 email | Ensures contact info bar remains single-line |
| **Phone Number** (`personal.phone`) | **25 chars** | ~2 - 3 words | Standard format with country extensions |
| **Location** (`personal.location`) | **45 chars** | ~4 - 6 words | City, State, Country display |
| **Web Links / URLs** (`github`, `linkedin`, etc.) | **70 chars** | ~1 URL | Prevents URL strings from overflowing container width |
| **Professional Summary** (`personal.summary`) | **500 chars** | ~75 words (~4-5 lines) | Prevents summary from dominating Page 1 |
| **Company / Organization Name** | **60 chars** | ~8 - 10 words | Fits header line alongside employment dates |
| **Position / Role Title** | **60 chars** | ~8 - 10 words | Fits header line alongside company name |
| **Date Strings** (`startDate`, `endDate`, `date`) | **25 chars** | ~2 - 4 words | e.g., `"Jun 2024 - Present"` or `"2021 - 2023"` |
| **Project Name** (`projects.name`) | **50 chars** | ~6 - 8 words | Keeps project header clean and readable |
| **Technologies Used** (`projects.technologies`) | **85 chars** | ~10 - 12 tech tags | Fits on 1-2 lines below project title |
| **Item Description** (`experience`, `projects`) | **350 chars** per item | ~50 words (~3 bullet lines) | Prevents individual cards from exceeding page bounds |
| **Institution Name** (`education.institution`) | **65 chars** | ~8 - 10 words | Fits education header line alongside dates |
| **Degree / Field of Study** (`education.degree`) | **75 chars** | ~10 - 12 words | Fits degree header line alongside institution |
| **Skill Name** (`skills.name`) | **35 chars** | ~4 - 5 words | Prevents skill pills from stretching full page width |
| **Sub-Category Group Name** (`group`) | **40 chars** | ~4 - 5 words | Keeps sub-category titles clean and concise |
| **Language Name & Level** | **35 chars** | ~4 words | Fits 2-column language grid layout |

---

### Template-Specific Capacity Specifications:

1. **Modern Template (`Modern_Page.jsx`):**
   * Single-column full-width layout.
   * **Summary Limit:** `500 chars` max.
   * **Project Description Limit:** `350 chars` per project.
   * **Skill Name Limit:** `35 chars` max per pill (fits 3-4 pills per line).

2. **Timeline Red Template (`Timeline_Page.jsx`):**
   * Single-column layout with left vertical timeline border axis.
   * **Summary Limit:** `450 chars` max.
   * **Project Description Limit:** `300 chars` per project (prevents text from crowding the red left border axis).
   * **Sub-Group Title Limit:** `35 chars` max.

3. **Elegant Template (`Elegant_Page.jsx`):**
   * Executive serif centered layout with subtle background tint group boxes.
   * **Summary Limit:** `550 chars` max (justified text formatting).
   * **Project Description Limit:** `350 chars` per project.
   * **Group Tint Box:** Maximum `4 items` per group container before triggering page partitioner.

4. **Creative Template (`Creative_Page.jsx`):**
   * Dual-column layout (Dark Left Sidebar + Light Right Main Content).
   * **Sidebar Fields (Contact Info, Skills, Spoken Languages, Education):**
     * **Strict Width Limit:** `30 chars` per line to prevent horizontal overflow outside the dark sidebar.
   * **Main Column Fields (Summary, Experience, Projects):**
     * **Summary Limit:** `400 chars` max.
     * **Project Description Limit:** `300 chars` per project.
