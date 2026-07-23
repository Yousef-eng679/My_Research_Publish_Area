# UI/UX Guidelines
## Personal Publishing Platform (Blogs, Papers, Books)

This document establishes the UI/UX design system, visual identity, and interaction principles for the Personal Publishing Platform. It serves as a strict design reference for implementation to ensure a cohesive, premium, and reading-optimized experience.

---

## 1. Core Concept: "Digital Library meets Modern Cyber-Minimalism"

The platform is designed to look and feel like a modern, curated digital archive. It shuns generic blog aesthetics in favor of a premium, immersive dark interface that treats words, formulas, and publications as first-class artifacts. 

- **Primary Mode:** Dark Mode by default.
- **Color Temperature:** Cool, deep slate-blacks paired with rich organic dark greens and clean, high-contrast light-white typography.
- **Core Aesthetic:** Immersive, clean, high-end, utilizing subtle glows ("lighting effects") and micro-animations to feel alive without distracting from long-form reading.

---

## 2. Color Palette & Lighting

We use a carefully tuned dark color palette that avoids pure `#000000` (which causes eye strain) and instead relies on deep forest-tinged grays and rich slate tones.

| Variable / Token | Hex Code | Visual Role | Tailwind Equivalent / Usage |
| :--- | :--- | :--- | :--- |
| **bg-base** | `#080c09` | Main background (deep black-green) | `bg-[#080c09]` |
| **bg-surface** | `#111612` | Cards, sidebars, secondary panels | `bg-[#111612]` |
| **bg-hover** | `#18201a` | Active/hovered elements | `bg-[#18201a]` |
| **border-muted** | `#1e2920` | Subtle structural division lines | `border-[#1e2920]` |
| **text-primary** | `#f3f4f6` | Headings, titles, primary text | `text-gray-100` |
| **text-body** | `#d1d5db` | Long-form reading paragraphs | `text-gray-300` |
| **text-secondary**| `#9ca3af` | Metadata, dates, secondary labels | `text-gray-400` |
| **green-accent** | `#10b981` | Action elements, highlights, links | `text-emerald-500` / `bg-emerald-500` |
| **green-glow** | `#34d399` | Cyber-lighting, soft radial shadows | `text-emerald-400` / neon shadows |
| **green-dark** | `#064e3b` | Deep container backgrounds, status indicators | `bg-emerald-900/30` |

### Lighting & Glow Effects (The "Glow" Token)
To make the dark interface feel premium, we apply a "light beam" or "glow" effect in key areas:
- **Card Spotlight:** On hover, cards should display a subtle radial gradient highlight following the cursor (or centered at the top of the card).
  ```css
  background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.06), transparent 40%);
  ```
- **Text Glow:** Important accents (like active nav items or a featured tag) should use a subtle text-shadow glow:
  ```css
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.4);
  ```
- **Accent Lines:** Borders under headers or surrounding featured cards can have an ultra-thin glowing gradient border that fades out:
  ```css
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  ```

---

## 3. Typography & Reading Metrics

Reading comfort is the highest priority. The interface features a dual-typography setup tailored to different content modes.

### Font Families
- **UI Chrome & Sans-Serif:** **Inter** or **Geist Sans** (clean, geometric, highly legible at small sizes)
  - Usage: Nav bars, metadata, search, cards, abstract snippets, buttons.
- **Reading & Serif:** **Lora** or **Source Serif 4** (classic, elegant serif with clear letterforms)
  - Usage: Book chapters and research paper body copy.
- **Code & Monospace:** **Fira Code** or **Geist Mono**
  - Usage: Citations, DOI indicators, inline code, and syntax blocks.

### Reading Geometry (The "Golden Measure")
- **Line Length (Measure):** Strictly capped between **65 to 75 characters per line** (`max-w-2xl` or `max-w-3xl` with generous padding) for reading body copy.
- **Line Height (Leading):**
  - Sans-serif UI / Blogs: `leading-relaxed` (1.6)
  - Serif Papers / Books: `leading-loose` (1.75 to 1.8) for optimal tracking.
- **Font Size:**
  - Base body text: `text-lg` (18px) or `text-[17px]` for serif content.
  - Headings: Bold, distinct sizes with generous margin-top to separate sections logically.

---

## 4. Interaction & Micro-Animations

Animations should be functional, reinforcing spatial layouts and state changes. **Avoid flashy or distracting entrance animations.**

- **Page Transitions:** Soft fade-in-up (`opacity` and `translate-y`) when switching between routes.
- **Card Hovers:**
  - Scale up slightly (`scale-[1.015]`) with a smooth, cubic-bezier transition (`transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)`).
  - Shift shadow from a soft dark-green bloom to a slightly sharper highlight.
- **Collapsible Panels (TOC / Sidebars):**
  - Smooth height slide transitions.
  - Sidebar toggling moves with a spring animation (`transition-transform duration-300 ease-out`).
- **Scroll Progress Indicator:** A custom thin horizontal bar at the top of the chapter/paper view that advances as the user scrolls, rendered in `#10b981` with a slight blur glow (`shadow-[0_0_8px_#10b981]`).
- **Interactive Copy Action:** "Cite this" copy buttons pulse green and display a temporary "Copied!" checkmark with an elastic spring animation.

---

## 5. UI Layout for Content Types

```
  +-------------------------------------------------------------+
  |  LOGO   [Blog]  [Papers]  [Books]  [Topics]    (Search)  *  |  <- Nav Bar (Blur & Border Bottom)
  +-------------------------------------------------------------+
  |                                                             |
  |                        [ MAIN BODY ]                        |
  |                                                             |
  +-------------------------------------------------------------+
```

### 5.1 Common Interface Chrome
- **Header:** Sticky, backdrop-blur (`backdrop-blur-md bg-[#080c09]/80`) with a bottom border color of `#1e2920`. Active links are highlighted in `#f3f4f6` with a tiny under-dot or bottom line in `#10b981`.
- **Footer:** Minimalist. Copyright, social links, RSS, and a subtle glowing green badge indicating status ("System Online", "All Systems Statically Compiled").

---

### 5.2 Blog Post Interface (`/blog` and `/blog/[slug]`)
- **Feed Layout:** Staggered list with featured posts spanning full width, and secondary posts in a grid.
- **Metadata Badges:** Topics styled as rounded badges with a very subtle green border (`border-[#1e2920] bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30`).
- **Body Copy:** Sans-serif or Serif (user's preference, default to Serif if over 1000 words). Highly legible with minimal visual decorations.

---

### 5.3 Research Paper Interface (`/papers/[slug]`)
Academic papers require high density of information without feeling cluttered.

- **Split Screen Layout (Desktop):**
  - **Left Column (width ~25%):** Floating, interactive Table of Contents. Highlights the active section based on scroll position (using Intersection Observer). Includes a PDF download button and DOI identifier.
  - **Center Column (width ~60%):** The main paper.
  - **Right Column (width ~15%):** Inline footnote references or quick-cite buttons.
- **The Abstract Block:** Enclosed in a styled frame with a subtle top border glow, featuring a larger font size (`text-lg` or `text-xl`) and italicized serif.
- **Interactive Citations (Bibliography):**
  - Clicking a citation anchor (e.g., `[Smith 2024]`) smoothly scrolls to the Bibliography section.
  - Hovering over a citation anchor opens a small tooltip card showing the citation details (title, authors, year) with a micro-fade animation.
- **"Cite This" Component:** A card styled like a terminal printout (monospace text, dark green border) containing pre-formatted APA/MLA/BibTeX snippets. Clicking a snippet copies it instantly to the clipboard, with the button flashing green to indicate success.

```
+-----------------------------------------------------------------+
| TOC Sidebar              ABSTRACT CARD                          |
| [1. Introduction]        (Premium bordered container with      |
| [2. Methodology]          subtle top border green glow)        |
| [3. Results]                                                    |
|                          -------------------------------------  |
| Cite Paper:              BODY TEXT                              |
| [ APA / MLA / BIB ]      Beautiful, high-contrast Serif font.   |
| (Copy to Clipboard)      65-75 chars wide measure.              |
+-----------------------------------------------------------------+
```

---

### 5.4 Book Shelf & Chapter Reader (`/books` and `/books/[slug]/[chapter]`)
Books represent serialized, linear reading.

- **Book Shelf Cover Grid:**
  - Books are displayed as 3D-styled physical covers with depth shadows.
  - On hover, the cover slightly rotates/lifts towards the viewer to simulate picking up a physical book.
  - Grid elements display the book's progress (e.g., "50% Read" or "Unread") in a mini progress bar under the cover.
- **Chapter Reader Layout:**
  - **Left Sidebar:** List of all chapters. Draft chapters are greyed out with a lock icon and "Coming Soon" tooltip. The active chapter has a green left-border indicator.
  - **Main Area:** Clean, distraction-free reading window. No headers or footers in reading mode (fade out on scroll, fade in on hover/move mouse up).
  - **Navigation:** Prominent but elegant "Previous Chapter" and "Next Chapter" navigation cards at the bottom of the content. On hover, they reveal a snippet of the next chapter's title.

---

## 6. Accessibility & Usability (NFR constraints)

- **Color Contrast:** Ensure text has a contrast ratio of at least 4.5:1 against the dark background. Use `#d1d5db` (Gray 300) or lighter for body text.
- **Reduced Motion:** Wrap all dynamic transitions and spotlight scripts in a check for user preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
  ```
- **Keyboard Navigation:** Collapsible panels, TOC sidebars, and citations must be fully focusable and keyboard navigable (`tabindex="0"`, custom focus rings using `focus-visible:ring-2 focus-visible:ring-emerald-500`).
- **Reading Accommodations:** Provide a small sticky font-size control panel (`A- / A+`) in the margin of books/papers so users can adjust typography scale.

---

## 7. Next Steps for Implementation

During execution, use these UI guidelines to implement pages:
1. **`index.css` & Tailwind Config:** Declare custom hex codes as CSS variables and map them to Tailwind names (`bg-base`, `bg-surface`, `text-body`, `accent-green`, etc.). Set up `fontFamily` configurations for Sans/Serif.
2. **Global Components:** Implement the blur-filter navbar and minimal footer.
3. **Typography Classes:** Create utility classes for `.serif-reading` to enforce the golden measure (65-75 chars) and line height.
4. **Lighting utility:** Build a custom hook for the pointer-based glow highlight effect for premium cards.
