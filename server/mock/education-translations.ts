import type { Category, Exercise, Lesson } from "~/types/education";

interface OptionTranslations {
  [key: string]: string;
}

interface LessonTranslations {
  [lessonId: string]: Partial<Pick<Lesson, "title" | "content">>;
}

interface QuizTranslations {
  [questionId: string]: {
    question?: string;
    options?: OptionTranslations;
  };
}

interface ExerciseTranslations {
  [exerciseId: string]: {
    question?: string;
    options?: OptionTranslations;
  };
}

interface CourseTranslations {
  [courseId: string]: {
    title?: string;
    description?: string;
    lessons?: LessonTranslations;
    quiz?: QuizTranslations;
  };
}

interface CategoryTranslations {
  [categoryId: string]: Partial<Pick<Category, "title" | "description">>;
}

interface EducationTranslations {
  categories?: CategoryTranslations;
  courses?: CourseTranslations;
  exercises?: ExerciseTranslations;
}

export const educationTranslationsByLocale: Record<string, EducationTranslations> = {
  en: {
    categories: {
      "cat-web": {
        title: "Web Development",
        description: "Modern frameworks for building web applications.",
      },
      "cat-data": {
        title: "Data Science",
        description: "Data analysis, modelling, and storytelling.",
      },
      "cat-product": {
        title: "Product Leadership",
        description: "Frameworks to align product, design, and operations.",
      },
    },
    courses: {
      "c-nuxt-basics": {
        title: "Nuxt 3 — Foundations",
        description: "Learn Nuxt 3 fundamentals: project setup, routing, and data fetching.",
        lessons: {
          "nuxt-l1": {
            title: "Initialize a project",
            content: "<p>Use <code>npx nuxi init</code> to scaffold your Nuxt 3 application.</p>",
          },
          "nuxt-l2": {
            title: "Pages & Routing",
            content:
              "<p>Create files inside the <code>pages/</code> directory to generate routes automatically.</p>",
          },
          "nuxt-l3": {
            title: "Data Fetching",
            content:
              "<p>Learn <code>useAsyncData</code> and <code>$fetch</code> to retrieve data on the server or client.</p>",
          },
          "nuxt-l4": {
            title: "Deployment",
            content:
              "<p>Build your app with <code>nuxt build</code> and deploy it to your preferred platform.</p>",
          },
        },
        quiz: {
          "nuxt-q1": {
            question: "Which command creates a new Nuxt 3 project?",
          },
          "nuxt-q2": {
            question: "Which directory automatically generates routes?",
            options: {
              a: "src/routes",
              b: "pages",
              c: "app",
              d: "router",
            },
          },
          "nuxt-q3": {
            question: "Which composable retrieves asynchronous data?",
            options: {
              a: "useState",
              b: "useAsyncData",
              c: "useFetchData",
              d: "useLazy",
            },
          },
          "nuxt-q4": {
            question: "Which file centralises the Nuxt configuration?",
            options: {
              a: "nuxt.config.ts",
              b: "nuxt.json",
              c: "app.config.ts",
              d: "package.json",
            },
          },
          "nuxt-q5": {
            question: "How do you share a layout between multiple pages?",
            options: {
              a: "Create a layout component in components/",
              b: "Create a file inside layouts/",
              c: "Use middleware/",
              d: "Configure the router manually",
            },
          },
          "nuxt-q6": {
            question: "Which command prepares the app for deployment?",
            options: {
              a: "nuxt dev",
              b: "nuxt build",
              c: "nuxt preview",
              d: "nuxt test",
            },
          },
          "nuxt-q7": {
            question: "How do you access public runtime configuration?",
            options: {
              a: "process.env",
              b: "useRuntimeConfig().public",
              c: "window.env",
              d: "nuxt.env",
            },
          },
          "nuxt-q8": {
            question: "Which module helps manage global state?",
            options: {
              a: "Vuex",
              b: "Pinia",
              c: "Redux",
              d: "MobX",
            },
          },
          "nuxt-q9": {
            question: "Which directive renders a component only on the client?",
            options: {
              a: "<client-only>",
              b: "v-client",
              c: "<no-ssr>",
              d: "v-ssr",
            },
          },
          "nuxt-q10": {
            question: "Which directory contains serverless APIs in Nuxt 3?",
            options: {
              a: "server/api",
              b: "api",
              c: "functions",
              d: "lambda",
            },
          },
        },
      },
      "c-vuetify-ui": {
        title: "Vuetify 3 — UI Essentials",
        description: "Build modern interfaces with Vuetify 3 components.",
        lessons: {
          "vuetify-l1": {
            title: "Installation & Configuration",
            content: "<p>Install Vuetify 3 with the official Nuxt plugin and configure themes.</p>",
          },
          "vuetify-l2": {
            title: "Responsive Layouts",
            content:
              "<p>Use <code>v-container</code>, <code>v-row</code>, and <code>v-col</code> to build adaptive grids.</p>",
          },
          "vuetify-l3": {
            title: "Interactive Components",
            content: "<p>Explore buttons, lists, dialogs, and snackbars to enrich your UI.</p>",
          },
          "vuetify-l4": {
            title: "Customization",
            content: "<p>Create custom themes and override Sass variables.</p>",
          },
        },
        quiz: {
          "vuetify-q1": {
            question: "Which component defines a responsive grid?",
            options: {
              a: "v-grid",
              b: "v-container",
              c: "v-layout",
              d: "v-responsive",
            },
          },
          "vuetify-q2": {
            question: "Which property enables the dark theme?",
            options: {
              a: "app.theme",
              b: "theme.dark",
              c: "theme.default",
              d: "v-app.dark",
            },
          },
          "vuetify-q3": {
            question: "Which component displays a modal dialog?",
            options: {
              a: "v-dialog",
              b: "v-modal",
              c: "v-window",
              d: "v-overlay",
            },
          },
          "vuetify-q4": {
            question: "How do you render a Material Design icon?",
            options: {
              a: "Use <v-icon icon='mdi:home' />",
              b: "Import the font via CDN",
              c: "Use <i class='mdi mdi-home'></i>",
              d: "All of the answers",
            },
          },
          "vuetify-q5": {
            question: "Which component creates a button with a dropdown menu?",
            options: {
              a: "v-menu",
              b: "v-dropdown",
              c: "v-toolbar",
              d: "v-list",
            },
          },
          "vuetify-q6": {
            question: "Which prop enables ripples on a button?",
            options: {
              a: "ripple",
              b: "waves",
              c: "effect",
              d: "touch",
            },
          },
          "vuetify-q7": {
            question: "Which component shows a linear progress bar?",
            options: {
              a: "v-progress-linear",
              b: "v-progress",
              c: "v-loader",
              d: "v-bar",
            },
          },
          "vuetify-q8": {
            question: "Which directive renders a component only on the client?",
            options: {
              a: "<client-only>",
              b: "v-client",
              c: "<lazy-hydrate>",
              d: "v-lazy",
            },
          },
          "vuetify-q9": {
            question: "How can you customise a component globally?",
            options: {
              a: "via the style prop",
              b: "by overriding Sass variables",
              c: "by modifying the DOM",
              d: "by importing an external CSS",
            },
          },
          "vuetify-q10": {
            question: "Which component displays a temporary message?",
            options: {
              a: "v-alert",
              b: "v-snackbar",
              c: "v-chip",
              d: "v-banner",
            },
          },
        },
      },
      "c-data-visual": {
        title: "Data Visualisation with Python",
        description: "Work with pandas and create clear visualisations.",
        lessons: {
          "data-l1": {
            title: "Set up the environment",
            content: "<p>Install pandas, seaborn, and matplotlib to create your charts.</p>",
          },
          "data-l2": {
            title: "Explore a DataFrame",
            content:
              "<p>Use <code>head()</code>, <code>describe()</code>, and <code>info()</code> to understand the structure of your data.</p>",
          },
          "data-l3": {
            title: "Create visualisations",
            content: "<p>Generate charts with seaborn to explore your variables.</p>",
          },
          "data-l4": {
            title: "Tell a story",
            content:
              "<p>Combine multiple charts and add annotations to guide the narrative.</p>",
          },
        },
        quiz: {
          "data-q1": {
            question: "Which library loads a CSV file into a DataFrame?",
            options: {
              a: "numpy",
              b: "pandas",
              c: "matplotlib",
              d: "plotly",
            },
          },
          "data-q2": {
            question: "Which method shows the first five rows?",
            options: {
              a: "first()",
              b: "head()",
              c: "peek()",
              d: "sample()",
            },
          },
          "data-q3": {
            question: "Which chart compares the distribution of two numeric variables?",
            options: {
              a: "Histogram",
              b: "Box plot",
              c: "Heatmap",
              d: "Pie chart",
            },
          },
          "data-q4": {
            question: "Which seaborn function creates a scatter plot?",
            options: {
              a: "scatterplot",
              b: "lineplot",
              c: "barplot",
              d: "histplot",
            },
          },
          "data-q5": {
            question: "How do you save a matplotlib figure?",
            options: {
              a: "plt.export('plot.pdf')",
              b: "plt.save('plot.png')",
              c: "plt.savefig('plot.png')",
              d: "plt.snapshot('plot.png')",
            },
          },
          "data-q6": {
            question: "Which parameter adds a title to a seaborn figure?",
            options: {
              a: "title",
              b: "label",
              c: "caption",
              d: "heading",
            },
          },
          "data-q7": {
            question: "Which pandas function merges two DataFrames on a shared key?",
            options: {
              a: "join",
              b: "merge",
              c: "concat",
              d: "combine",
            },
          },
          "data-q8": {
            question: "Which chart highlights the share of categories?",
            options: {
              a: "Pie chart",
              b: "Histogram",
              c: "Scatter",
              d: "Line",
            },
          },
          "data-q9": {
            question: "Which method removes rows with missing values?",
            options: {
              a: "dropna",
              b: "clean",
              c: "remove",
              d: "dropnull",
            },
          },
          "data-q10": {
            question: "Which chart type shows a time-based trend?",
            options: {
              a: "Bar chart",
              b: "Line chart",
              c: "Scatter",
              d: "Pie chart",
            },
          },
        },
      },
      "c-product-ops": {
        title: "Product Ops & Team Rituals",
        description: "Structure product–design collaboration and orchestrate predictable launches.",
        lessons: {
          "prod-l1": {
            title: "Governance framework",
            content:
              "<p>Draft a product charter that clarifies roles, responsibilities, and decision-making.</p>",
          },
          "prod-l2": {
            title: "Ritual calendar",
            content:
              "<p>Sequence weekly stand-ups, monthly reviews, and quarterly retrospectives.</p>",
          },
          "prod-l3": {
            title: "Data-driven steering",
            content:
              "<p>Connect product metrics and team health through a shared dashboard.</p>",
          },
          "prod-l4": {
            title: "Feedback loops",
            content:
              "<p>Set up customer and internal feedback channels to iterate without friction.</p>",
          },
          "prod-l5": {
            title: "Launch plan",
            content:
              "<p>Orchestrate comms, support, and impact measurement before and after go-live.</p>",
          },
        },
        quiz: {
          "prod-q1": {
            question: "Which artefact clarifies who decides what for the product?",
            options: {
              a: "A product RACI matrix",
              b: "An incident report",
              c: "A Kanban board",
              d: "A customer survey",
            },
          },
          "prod-q2": {
            question: "Which ritual aligns vision and execution mid-term?",
            options: {
              a: "The daily stand-up",
              b: "The monthly roadmap review",
              c: "The on-call rotation",
              d: "The design critique",
            },
          },
          "prod-q3": {
            question: "Which metric links product usage and team health?",
            options: {
              a: "Number of open tickets",
              b: "Service uptime",
              c: "Segmented NPS score",
              d: "Time spent in meetings",
            },
          },
          "prod-q4": {
            question: "Which channel supports ongoing customer feedback?",
            options: {
              a: "Quarterly surveys",
              b: "An asynchronous user panel",
              c: "Release notes",
              d: "A retro timeline",
            },
          },
          "prod-q5": {
            question: "Which deliverable secures a cross-team launch?",
            options: {
              a: "A three-year roadmap",
              b: "An aligned communication plan",
              c: "An onboarding guide",
              d: "A groomed backlog",
            },
          },
          "prod-q6": {
            question: "What should you do after a retrospective?",
            options: {
              a: "Archive the actions",
              b: "Schedule follow-ups",
              c: "Change tooling",
              d: "Invite the entire company",
            },
          },
        },
      },
    },
    exercises: {
      "nuxt-ex1": {
        question: "Which command initialises a Nuxt 3 project?",
        options: {
          a: "npx nuxi init",
          b: "npm init nuxt",
        },
      },
      "nuxt-ex2": {
        question: "True or false: Nuxt 3 only works with Yarn.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "nuxt-ex3": {
        question: "Which folder creates a /blog route?",
        options: {
          a: "pages/blog.vue",
          b: "routes/blog.vue",
        },
      },
      "nuxt-ex4": {
        question: "True or false: useAsyncData can run on the server.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "nuxt-ex5": {
        question: "Which command generates the production build?",
        options: {
          a: "nuxt dev",
          b: "nuxt build",
        },
      },
      "vuetify-ex1": {
        question: "Which Nuxt plugin installs Vuetify 3?",
        options: {
          a: "@nuxtjs/vuetify",
          b: "vite-plugin-vuetify",
        },
      },
      "vuetify-ex2": {
        question: "True or false: v-container applies horizontal padding.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "vuetify-ex3": {
        question: "Which component renders a list with actions?",
        options: {
          a: "v-list",
          b: "v-table",
        },
      },
      "vuetify-ex4": {
        question: "True or false: you can define multiple Vuetify themes.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "data-ex1": {
        question: "Which command installs pandas?",
        options: {
          a: "pip install pandas",
          b: "npm install pandas",
        },
      },
      "data-ex2": {
        question: "True or false: describe() returns statistics for numeric columns.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "data-ex3": {
        question: "Which seaborn function draws a line chart?",
        options: {
          a: "lineplot",
          b: "barplot",
        },
      },
      "data-ex4": {
        question: "True or false: you can add multiple plots to the same figure.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "data-ex5": {
        question: "Which method drops rows with missing values?",
        options: {
          a: "dropna",
          b: "fillna",
        },
      },
      "prod-ex1": {
        question: "Which document formalises product decision rights?",
        options: {
          a: "A RACI matrix",
          b: "A press release",
        },
      },
      "prod-ex2": {
        question: "True or false: a cadence plan maps recurring rituals.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "prod-ex3": {
        question: "Which metric monitors delivery predictability?",
        options: {
          a: "Lead time",
          b: "Twitter followers",
        },
      },
      "prod-ex4": {
        question: "True or false: a feedback log captures qualitative insights.",
        options: {
          true: "True",
          false: "False",
        },
      },
      "prod-ex5": {
        question: "Which checklist secures a launch hand-off?",
        options: {
          a: "Runbook",
          b: "Moodboard",
        },
      },
    },
  },
};
