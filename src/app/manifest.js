/**
 * src/app/manifest.js
 * 
 * Purpose:
 * Configures the Web App Manifest for Resume Mill.
 * Sets the display mode to 'standalone' to allow users to install the web app
 * on their devices, opening it in fullscreen-like app windows.
 */

export default function manifest() {
  return {
    name: 'Resume Mill',
    short_name: 'ResumeMill',
    description: 'Free ATS-Friendly Resume Builder & Portfolio Generator',
    start_url: '/',
    display: 'standalone', // Opens in standalone fullscreen app window when installed
    background_color: '#faf9f6',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
