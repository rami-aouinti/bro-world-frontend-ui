import animate from "tailwindcss-animate";
import { setupInspiraUI } from "@inspira-ui/plugins";

export default {
  darkMode: "selector",
  safelist: ["dark"],
  prefix: "",
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./content/**/*.{md,mdx,json,yml,yaml}",
    "./lib/**/*.{js,ts,vue}",
    "./plugins/**/*.{js,ts}",
    "./stores/**/*.{js,ts}",
    "./utils/**/*.{js,ts}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      "max-xl": { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      "max-lg": { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      "max-md": { max: "767px" },
      // => @media (max-width: 767px) { ... }

      "max-sm": { max: "639px" },
      // => @media (max-width: 639px) { ... }

      "min-xl": { min: "1280px" },
      // => @media (min-width: 1280px) { ... }

      "min-lg": { min: "1024px" },
      // => @media (min-width: 1024px) { ... }

      "min-md": { min: "768px" },
      // => @media (min-width: 768px) { ... }

      "min-sm": { min: "640px" },
      // => @media (min-width: 640px) { ... },
      xl: { min: "1280px" },
      // => @media (min-width: 1280px) { ... }

      lg: { min: "1024px" },
      // => @media (min-width: 1024px) { ... }

      md: { min: "768px" },
      // => @media (min-width: 768px) { ... }

      sm: { min: "640px" },
      // => @media (min-width: 640px) { ... }
    },
    fontFamily: {
      heading: [
        "Space Grotesk",
        "Plus Jakarta Sans",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ],
      sans: [
        "Plus Jakarta Sans",
        "Space Grotesk",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ],
      mono: [
        "JetBrains Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
    extend: {
      fontSize: {
        h1: [
          "var(--v-text-h1-size)",
          {
            lineHeight: "var(--v-text-h1-line-height)",
            letterSpacing: "var(--v-text-h1-letter-spacing)",
            fontWeight: "var(--v-text-h1-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        h2: [
          "var(--v-text-h2-size)",
          {
            lineHeight: "var(--v-text-h2-line-height)",
            letterSpacing: "var(--v-text-h2-letter-spacing)",
            fontWeight: "var(--v-text-h2-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        h3: [
          "var(--v-text-h3-size)",
          {
            lineHeight: "var(--v-text-h3-line-height)",
            letterSpacing: "var(--v-text-h3-letter-spacing)",
            fontWeight: "var(--v-text-h3-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        h4: [
          "var(--v-text-h4-size)",
          {
            lineHeight: "var(--v-text-h4-line-height)",
            letterSpacing: "var(--v-text-h4-letter-spacing)",
            fontWeight: "var(--v-text-h4-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        h5: [
          "var(--v-text-h5-size)",
          {
            lineHeight: "var(--v-text-h5-line-height)",
            letterSpacing: "var(--v-text-h5-letter-spacing)",
            fontWeight: "var(--v-text-h5-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        h6: [
          "var(--v-text-h6-size)",
          {
            lineHeight: "var(--v-text-h6-line-height)",
            letterSpacing: "var(--v-text-h6-letter-spacing)",
            fontWeight: "var(--v-text-h6-weight)",
            fontFamily: "var(--v-font-family-display)",
          },
        ],
        "body-1": [
          "var(--v-text-body-1-size)",
          {
            lineHeight: "var(--v-text-body-1-line-height)",
            fontWeight: "var(--v-text-body-1-weight, 400)",
            fontFamily: "var(--v-font-family-base)",
          },
        ],
        "body-2": [
          "var(--v-text-body-2-size)",
          {
            lineHeight: "var(--v-text-body-2-line-height)",
            fontWeight: "var(--v-text-body-2-weight, 400)",
            fontFamily: "var(--v-font-family-base)",
          },
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "2xl": "calc(var(--radius) + 8px)",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
  },

  plugins: [animate, setupInspiraUI],
};
