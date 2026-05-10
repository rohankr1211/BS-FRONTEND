---
name: BuildSmart Core UI
colors:
  surface: '#fff8f6'
  surface-dim: '#eed5cd'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e3'
  surface-container-high: '#fde3db'
  surface-container-highest: '#f7ddd5'
  on-surface: '#261814'
  on-surface-variant: '#594139'
  inverse-surface: '#3c2d28'
  inverse-on-surface: '#ffede8'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ab3500'
  primary: '#ab3500'
  on-primary: '#ffffff'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ffb59d'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#00677e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a7cb'
  on-tertiary-container: '#003744'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#b5ebff'
  tertiary-fixed-dim: '#59d5fb'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#fff8f6'
  on-background: '#261814'
  surface-variant: '#f7ddd5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  status-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 16px
---

## Brand & Style

The design system is engineered to evoke the precision of modern architecture and the durability of industrial machinery. It is built for a professional audience that values efficiency, safety, and reliability on the job site. The brand personality is "Refined Industrial"—it feels rugged enough to be used on a tablet in a construction zone, yet sophisticated enough for a boardroom presentation.

The aesthetic utilizes a **Corporate / Modern** framework with subtle **Tactile** influences. It avoids excessive decorative elements in favor of a "form follows function" philosophy. Visual hierarchy is achieved through high-contrast status indicators and a structured, card-based layout that prioritizes information density without sacrificing legibility. The result is a UI that feels like a digital toolbelt: organized, accessible, and high-performance.

## Colors

The color palette is rooted in safety and utility. **Construction Orange** serves as the primary action color, ensuring high visibility for critical CTA buttons and primary navigational elements. **Slate Gray** provides a grounded, architectural contrast for secondary actions and structural elements.

Functional colors are mapped to industry standards:
- **Safety Green** for completed milestones and approved permits.
- **Caution Yellow** for pending inspections or low-priority alerts.
- **Alert Red** for safety violations or overdue schedules.
- **Blueprint Blue** for technical specifications and information-heavy tooltips.
- **Deep Navy** is used for text and deep structural backgrounds to maintain high legibility against the light gray body background.

## Typography

The design system exclusively uses **Inter** to ensure a systematic, utilitarian appearance that performs exceptionally well across various pixel densities. 

Headings are set with heavy weights (Bold/600+) to provide strong visual anchors in data-heavy environments. Body text scales from 14px to 16px to accommodate complex tables and detailed logs. A specialized "label-caps" style is used for metadata and table headers, providing a clear distinction between data categories and the data itself. Line heights are kept tight to allow for maximum information display on mobile screens while maintaining comfortable vertical rhythm.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile. The spacing rhythm is based on an 8px base unit, allowing for precise alignment of technical data.

- **Desktop:** 12 columns, 16px gutters, 32px side margins.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 12px gutters, 16px side margins.

Information density is high; components use "Compact" spacing by default. Cards are the primary container for all content, using a 16px internal padding to balance density with breathability. On mobile, cards expand to full-width to maximize the horizontal space for data tables and progress trackers.

## Elevation & Depth

This design system uses a logic of **Stacked Tonal Layers** to represent depth, mimicking the layering of architectural drawings or site manifests. 

- **Level 0 (Background):** #F4F6F8. The canvas for all site activities.
- **Level 1 (Cards/Containers):** Pure white (#FFFFFF) with a thin 1px border (#E2E8F0) and a very subtle ambient shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Active/Hover):** Raised state with a more pronounced shadow (0px 8px 16px rgba(44, 62, 80, 0.1)) to indicate interactivity.
- **Level 3 (Modals/Overlays):** High-depth shadows with a 20% backdrop blur on the underlying content to focus user attention on critical site alerts or form inputs.

## Shapes

The shape language is "Structural." By choosing a **Soft (0.25rem)** roundedness, we avoid the playfulness of fully rounded corners while escaping the harshness of sharp 90-degree angles. This reflects the "engineered" nature of the industry—precise but approachable.

- **Standard Buttons & Inputs:** 4px (0.25rem) border-radius.
- **Cards & Major Containers:** 8px (0.5rem) border-radius for a slightly softer container feel.
- **Status Badges:** Fully pill-shaped to differentiate them from interactive buttons.

## Components

### Buttons
Primary buttons use a solid **Construction Orange** background with white text. Secondary buttons use a **Slate Gray** outline. Buttons should have a minimum height of 44px on mobile to accommodate gloved or large hands in the field.

### Status Indicators (Badges)
Crucial for site management. They use a semi-transparent background (15% opacity) of the functional color with 100% opacity text. Example: A "Delayed" badge uses a #FFC107 tint with dark text.

### Input Fields
Inputs feature a 2px bottom border that thickens on focus, or a full 1px border in #2C3E50. Label placement is always top-aligned for clarity during rapid data entry.

### Cards
The primary organizational unit. Cards should include a header area for an icon (e.g., **FaHardHat** for labor, **FaTools** for equipment) and a clear title.

### High-Density Lists
Lists used for equipment tracking or material logs should use alternating row stripes (Zebra striping) in #F8F9FA to help the eye track across long rows of data on narrow screens.

### Icons
Use **FontAwesome** (FaHardHat, FaTools, FaCubes) for thematic consistency. Icons should be used sparingly but effectively as visual shorthand for categories like "Labor," "Materials," and "Logistics."