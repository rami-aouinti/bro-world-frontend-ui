<template>
  <div class="education-sidebar d-flex flex-column gap-6">
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
    >
      <section aria-labelledby="education-sidebar-overview">
        <h2
          id="education-sidebar-overview"
          class="text-h6 font-weight-semibold mb-2"
        >
          {{ overviewTitle }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          {{ overviewDescription }}
        </p>

        <ul
          class="education-sidebar__stats"
          :aria-label="overviewTitle"
        >
          <li
            v-for="item in stats"
            :key="item.label"
            class="education-sidebar__stat"
          >
            <div class="education-sidebar__stat-icon" aria-hidden="true">
              <v-icon
                :icon="item.icon"
                size="24"
              />
            </div>
            <div class="education-sidebar__stat-body">
              <span class="education-sidebar__stat-value">{{ item.value }}</span>
              <span class="education-sidebar__stat-label text-body-2 text-medium-emphasis">
                {{ item.label }}
              </span>
            </div>
          </li>
        </ul>
      </section>
    </SidebarCard>

    <SidebarCard
      class="text-card-foreground px-3 py-2"
      glow
    >
      <section aria-labelledby="education-sidebar-featured">
        <h2
          id="education-sidebar-featured"
          class="text-h6 font-weight-semibold mb-2"
        >
          {{ featuredTitle }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ featuredDescription }}
        </p>

        <ul
          v-if="categories.length"
          class="education-sidebar__categories"
        >
          <li
            v-for="category in categories"
            :key="category.id"
            class="education-sidebar__category"
          >
            <NuxtLink
              :to="category.to"
              class="education-sidebar__category-link"
            >
              <span class="education-sidebar__category-title">{{ category.title }}</span>
              <span class="education-sidebar__category-meta text-body-2 text-medium-emphasis">
                {{ category.meta }}
              </span>
            </NuxtLink>
          </li>
        </ul>
        <p
          v-else
          class="text-body-2 text-medium-emphasis mb-0"
        >
          {{ featuredEmpty }}
        </p>
      </section>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";

type SidebarStat = {
  icon: string;
  value: string;
  label: string;
};

type SidebarCategory = {
  id: string;
  title: string;
  meta: string;
  to: string;
};

defineProps<{
  overviewTitle: string;
  overviewDescription: string;
  stats: SidebarStat[];
  featuredTitle: string;
  featuredDescription: string;
  featuredEmpty: string;
  categories: SidebarCategory[];
}>();
</script>

<style scoped>
.education-sidebar__stats {
  display: grid;
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.education-sidebar__stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: color-mix(in srgb, hsl(var(--primary) / 0.16) 40%, transparent);
}

.education-sidebar__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: color-mix(in srgb, hsl(var(--primary) / 0.2) 35%, transparent);
  color: hsl(var(--primary));
}

.education-sidebar__stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
}

.education-sidebar__categories {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.education-sidebar__category {
  margin: 0;
}

.education-sidebar__category-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  text-decoration: none;
  background: color-mix(in srgb, hsl(var(--primary) / 0.12) 30%, transparent);
  transition: background 0.2s ease, transform 0.2s ease;
}

.education-sidebar__category-link:hover,
.education-sidebar__category-link:focus-visible {
  background: color-mix(in srgb, hsl(var(--primary) / 0.2) 40%, transparent);
  transform: translateY(-2px);
}

.education-sidebar__category-title {
  font-weight: 600;
}
</style>
