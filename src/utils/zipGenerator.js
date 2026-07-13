import JSZip from 'jszip';

export async function generatePortfolioZip(data) {
  const zip = new JSZip();

  const fullName = data.personal?.fullName || 'John Doe';
  const role = data.personal?.role || 'Software Engineer';
  const email = data.personal?.email || '';
  const phone = data.personal?.phone || '';
  const github = data.personal?.github || '';
  const linkedin = data.personal?.linkedin || '';
  const summary = data.personal?.summary || '';

  // Generate experiences HTML list
  const experiencesHtml = (data.experience || [])
    .map(
      (exp) => `
      <div class="timeline-item">
        <div class="timeline-header">
          <span class="timeline-date">${exp.startDate} - ${exp.endDate || (exp.current ? 'Present' : '')}</span>
          <h3 class="timeline-title">${escapeHtml(exp.role)}</h3>
          <span class="timeline-company">${escapeHtml(exp.company)}</span>
        </div>
        <p class="timeline-desc">${escapeHtml(exp.description || '').replace(/\n/g, '<br>')}</p>
      </div>`
    )
    .join('');

  // Generate projects HTML grid
  const projectsHtml = (data.projects || [])
    .map(
      (proj) => `
      <div class="project-card">
        <h3 class="project-title">${escapeHtml(proj.name)}</h3>
        <p class="project-desc">${escapeHtml(proj.description || '')}</p>
        <div class="project-tags">
          ${(proj.technologies || '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
            .map((tech) => `<span class="project-tag">${escapeHtml(tech)}</span>`)
            .join('')}
        </div>
        ${
          proj.link
            ? `<a href="${escapeHtml(proj.link)}" target="_blank" class="project-link">View Project &rarr;</a>`
            : ''
        }
      </div>`
    )
    .join('');

  // Generate skills HTML tags
  const skillsHtml = (data.skills || [])
    .map((skill) => `<span class="skill-tag">${escapeHtml(typeof skill === 'string' ? skill : skill.name)}</span>`)
    .join('');

  // 1. Generate index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fullName)} | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container nav-container">
      <a href="#" class="logo">${escapeHtml(fullName)}</a>
      <nav class="nav">
        <a href="#about" class="nav-link">About</a>
        <a href="#experience" class="nav-link">Experience</a>
        <a href="#projects" class="nav-link">Projects</a>
        <a href="#skills" class="nav-link">Skills</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container hero-container">
      <div class="hero-content">
        <span class="hero-badge">Available for opportunities</span>
        <h1 class="hero-title">Hi, I'm <span>${escapeHtml(fullName)}</span></h1>
        <p class="hero-role">${escapeHtml(role)}</p>
        <p class="hero-desc">${escapeHtml(summary)}</p>
        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary">Get In Touch</a>
          <a href="#projects" class="btn btn-secondary">View Work</a>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="section">
    <div class="container">
      <h2 class="section-title">About Me</h2>
      <p class="about-text">
        I am a dedicated ${escapeHtml(role)} committed to building high-quality software solutions. With a focus on performance, responsive design, and user experience, I aim to write clean code that solves real-world problems.
      </p>
      <div class="contact-details-grid">
        ${email ? `<div class="detail-item"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>` : ''}
        ${phone ? `<div class="detail-item"><strong>Phone:</strong> <span>${escapeHtml(phone)}</span></div>` : ''}
        ${github ? `<div class="detail-item"><strong>GitHub:</strong> <a href="${escapeHtml(github)}" target="_blank">${escapeHtml(github)}</a></div>` : ''}
        ${linkedin ? `<div class="detail-item"><strong>LinkedIn:</strong> <a href="${escapeHtml(linkedin)}" target="_blank">${escapeHtml(linkedin)}</a></div>` : ''}
      </div>
    </div>
  </section>

  <!-- Experience Section -->
  ${
    experiencesHtml
      ? `
  <section id="experience" class="section bg-alt">
    <div class="container">
      <h2 class="section-title">Work Experience</h2>
      <div class="timeline">
        ${experiencesHtml}
      </div>
    </div>
  </section>`
      : ''
  }

  <!-- Projects Section -->
  ${
    projectsHtml
      ? `
  <section id="projects" class="section">
    <div class="container">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </div>
  </section>`
      : ''
  }

  <!-- Skills Section -->
  ${
    skillsHtml
      ? `
  <section id="skills" class="section bg-alt">
    <div class="container">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-container">
        ${skillsHtml}
      </div>
    </div>
  </section>`
      : ''
  }

  <!-- Contact Section -->
  <section id="contact" class="section">
    <div class="container text-center">
      <h2 class="section-title">Let's Connect</h2>
      <p class="contact-subtitle">Interested in collaborating or just want to chat? Send me a message!</p>
      
      <form id="contactForm" class="contact-form">
        <div class="form-group">
          <input type="text" id="name" placeholder="Your Name" required>
        </div>
        <div class="form-group">
          <input type="email" id="email" placeholder="Your Email" required>
        </div>
        <div class="form-group">
          <textarea id="message" placeholder="Your Message" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-submit">Send Message</button>
      </form>
      <div id="formStatus" class="form-status"></div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(fullName)}. Built with Resume Mill.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. Generate style.css
  const cssContent = `/* Google Fonts Import in HTML */
:root {
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --accent: #F97316;
  --bg-primary: #FAF9F6;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F3F4F6;
  --text-main: #1F2937;
  --text-muted: #6B7280;
  --border-color: #E5E7EB;
  
  --font-sans: 'Outfit', sans-serif;
  --font-base: 'Plus Jakarta Sans', sans-serif;
  
  --radius-md: 12px;
  --radius-lg: 20px;
  
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-base);
  color: var(--text-main);
  background-color: var(--bg-primary);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  color: var(--text-main);
  font-weight: 700;
}

a {
  color: var(--primary);
  text-decoration: none;
}

.container {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

/* Header & Nav */
.header {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 15px 0;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 20px;
  color: var(--text-main);
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  font-weight: 600;
  font-size: 14.5px;
  color: var(--text-muted);
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary);
}

/* Hero Section */
.hero {
  padding: 100px 0 80px 0;
  display: flex;
  align-items: center;
  min-height: 60vh;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 800px;
}

.hero-badge {
  background-color: rgba(79, 70, 229, 0.08);
  color: var(--primary);
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(79, 70, 229, 0.1);
  display: inline-block;
}

.hero-title {
  font-size: 48px;
  line-height: 1.15;
  margin-bottom: 10px;
  font-weight: 800;
}

.hero-title span {
  color: var(--primary);
}

.hero-role {
  font-size: 22px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 20px;
  font-family: var(--font-sans);
}

.hero-desc {
  font-size: 16px;
  color: var(--text-muted);
  margin-bottom: 30px;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 15px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14.5px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-tertiary);
}

/* Sections */
.section {
  padding: 80px 0;
}

.bg-alt {
  background-color: #FFFFFF;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 40px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--accent);
  border-radius: 99px;
}

.about-text {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 800px;
  margin-bottom: 30px;
}

.contact-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 800px;
}

.detail-item {
  font-size: 14.5px;
}

/* Timeline/Experience */
.timeline {
  position: relative;
  max-width: 800px;
  border-left: 2px solid var(--border-color);
  padding-left: 30px;
  margin-left: 10px;
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -37px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--primary);
  border: 2px solid #FFFFFF;
}

.timeline-header {
  margin-bottom: 10px;
}

.timeline-date {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  display: block;
}

.timeline-title {
  font-size: 18px;
  font-weight: 700;
  margin: 2px 0;
}

.timeline-company {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.timeline-desc {
  font-size: 14.5px;
  color: var(--text-muted);
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.project-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.project-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.project-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.project-tag {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.project-link {
  font-size: 14px;
  font-weight: 600;
}

/* Skills */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 800px;
}

.skill-tag {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
}

/* Contact Form */
.contact-subtitle {
  color: var(--text-muted);
  margin-bottom: 30px;
}

.contact-form {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background-color: #FFFFFF;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary);
}

.btn-submit {
  padding: 14px;
  font-size: 15px;
}

.form-status {
  margin-top: 15px;
  font-size: 14px;
  font-weight: 600;
}

/* Footer */
.footer {
  border-top: 1px solid var(--border-color);
  padding: 30px 0;
  background-color: var(--bg-secondary);
  margin-top: 60px;
  font-size: 13.5px;
  color: var(--text-muted);
}

.footer-container {
  display: flex;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  .contact-details-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .nav-container {
    flex-direction: column;
    gap: 15px;
  }
}
`;

  // 3. Generate script.js
  const jsContent = `// Dynamic portfolio script
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      formStatus.innerText = 'Sending message...';
      formStatus.style.color = 'var(--primary)';

      // Mock contact submission delay
      setTimeout(() => {
        formStatus.innerText = \`Thank you \${name}! Your message has been sent successfully (Mocked submission).\`;
        formStatus.style.color = 'green';
        contactForm.reset();
      }, 1000);
    });
  }
});
`;

  // Write content to zip
  zip.file('index.html', htmlContent);
  zip.file('style.css', cssContent);
  zip.file('script.js', jsContent);

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
