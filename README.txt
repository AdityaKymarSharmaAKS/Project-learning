STUDENT HUB — FIREFLY + RISING PARTICLE UPGRADE

WHAT THIS UPDATE DOES
- Keeps the existing dark purple / Solo Leveling theme and current page structure.
- Adds tiny glowing fireflies around every visible link, button, card, resource row, tab and keyboard-accessible control.
- Fireflies gently hover around the edge of each target instead of forming one fixed cluster.
- Moving the mouse or a finger near a firefly makes it dart away, then drift back to its target.
- Clicking a button, link or card makes its nearby fireflies scatter outward like a small swarm, with a brief mana burst.
- A separate stream of small glowing motes continuously rises from the bottom to the top of the screen. These motes also move away from the pointer and then resume rising.
- Newly rendered subject and resource cards are detected automatically.
- No external libraries, dependencies, framework or full-screen loader are added.

FILES CHANGED
- css/style.css — puts the transparent particle canvas above the page without blocking clicks.
- js/particle-field.js — firefly swarms, pointer repulsion, click scattering and upward-moving motes.

INSTALL THE SMALL PATCH (RECOMMENDED FOR AN EXISTING HOST)
1. Upload studenthub-firefly-animation-patch.zip to your website.
2. Extract it into the same folder that contains index.html (for example, /htdocs/).
3. Allow it to replace css/style.css and js/particle-field.js.
4. Keep your existing app.js, data.js, admin.js, HTML pages and assets.
5. Confirm all four pages include this script in their <head>:
   <script defer src="js/particle-field.js"></script>
   The supplied Student Hub HTML pages already include it.
6. Open the website and hard-refresh with Ctrl + Shift + R.

VERCEL DEPLOYMENT
- studenthub-firefly-upgraded-vercel.zip contains the complete static site with index.html at the ZIP root.
- Extract/upload its contents at the Vercel project root, or set the Root Directory to the folder containing index.html.
- Use Framework Preset: Other, Build Command: empty, Output Directory: .

BEHAVIOUR NOTES
- Desktop: two small fireflies per visible target. Small screens: one per target to reduce rendering load.
- The target list includes normal links, buttons, role=button controls, cards and dynamically inserted subject/resource cards.
- Internal page navigation waits about 390 ms so the click scatter can be seen. External links, downloads, new-tab links, email/phone links and in-page anchors are not delayed.
- The canvas uses pointer-events: none, so it cannot block mouse, touch, keyboard or normal control actions.
- Reduced-motion preferences use fewer, slower particles and shorter scatter effects.
