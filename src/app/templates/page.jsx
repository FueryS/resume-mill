/**
 * src/app/templates/page.jsx
 * 
 * Purpose:
 * Redirects the base `/templates` route directly to `/templates/resume`.
 * This fulfills the requirement that clicking "Templates" opens the resume templates page
 * with "resume" preselected, keeping the routing structure clean and modular.
 */

import { redirect } from 'next/navigation';

export default function TemplatesRedirectPage() {
  // Seamless server-side redirect to the default sub-category
  redirect('/templates/resume');
}
