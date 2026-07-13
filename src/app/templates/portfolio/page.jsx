/**
 * src/app/templates/portfolio/page.jsx
 * 
 * Purpose:
 * Renders the Portfolio Templates placeholder page.
 * Displays preview options and information about lightweight, static website packages
 * that users can export to deploy on GitHub Pages, Vercel, or Netlify.
 */

import { Code, Monitor, LayoutGrid } from 'lucide-react';
import styles from '../templates.module.css';

export const metadata = {
  title: 'Portfolio Templates | Resume Mill',
  description: 'Explore fully-responsive developer website templates ready to be downloaded as static HTML/CSS files.',
};

export default function PortfolioTemplatesPage() {
  return (
    <div className={styles.templatesWrapper}>
      <div className="container">
        
        {/* Page header conveying values */}
        <header className={styles.headerSection}>
          <h1 className={styles.title}>
            Portfolio <span>Templates</span>
          </h1>
          <p className={styles.description}>
            Interactive, lightweight, responsive website designs. Fill in your details and instantly download a complete deployment-ready code package as a ZIP.
          </p>
        </header>

        {/* Templates grid layout showing placeholder designs */}
        <div className={styles.grid}>
          {/* Template 1 */}
          <div className={styles.placeholderCard}>
            <div className={styles.iconContainer}>
              <Monitor size={28} />
            </div>
            <h3 className={styles.cardTitle}>Minimal Terminal</h3>
            <p className={styles.cardText}>
              A retro developer command-line interface simulation. Features interactive custom bash commands, system prompts, and styling.
            </p>
            <span className={`${styles.badge} ${styles.primaryBadge}`}>Active Default</span>
          </div>

          {/* Template 2 */}
          <div className={styles.placeholderCard}>
            <div className={styles.iconContainer}>
              <Code size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className={styles.cardTitle}>Glassmorphism Modern</h3>
            <p className={styles.cardText}>
              Stunning modern UI style built with glossy floating cards, rich gradient backgrounds, custom animations, and layout flows.
            </p>
            <span className={`${styles.badge} ${styles.accentBadge}`}>Coming Soon</span>
          </div>

          {/* Template 3 */}
          <div className={styles.placeholderCard}>
            <div className={styles.iconContainer}>
              <LayoutGrid size={28} />
            </div>
            <h3 className={styles.cardTitle}>Classic Developer Grid</h3>
            <p className={styles.cardText}>
              A highly functional structure showcasing project screens, tags, social links, resume timelines, and contact details cleanly.
            </p>
            <span className={styles.badge}>Coming Soon</span>
          </div>
        </div>

      </div>
    </div>
  );
}
