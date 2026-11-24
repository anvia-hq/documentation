<script setup lang="ts">
// Replaces VitePress's VPNavBar (aliased in .vitepress/config.ts) with a
// two-row header: brand, search, and actions on top; section tabs below.
import { useData, withBase } from 'vitepress'
import { VPNavBarSearch } from 'vitepress/theme-without-fonts'
import { computed } from 'vue'
import VPNavBarHamburger from 'vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue'

defineProps<{ isScreenOpen: boolean }>()
defineEmits<{ (e: 'toggle-screen'): void }>()

interface NavLink {
  text: string
  link: string
}

const { isDark, page, theme } = useData()

const tabs = computed<NavLink[]>(() =>
  (theme.value.nav ?? []).filter((item: Partial<NavLink>): item is NavLink => typeof item.link === 'string')
)

function sectionOf(link: string) {
  return link.replace(/^\/+/, '').replace(/index$/, '')
}

// The longest matching section wins; pages outside every section (such as
// guide/) belong to the root tab.
const activeLink = computed(() => {
  const path = page.value.relativePath
  let match = ''
  let matchLink = tabs.value.find((tab) => sectionOf(tab.link) === '')?.link ?? ''
  for (const tab of tabs.value) {
    const section = sectionOf(tab.link)
    if (section && path.startsWith(section) && section.length > match.length) {
      match = section
      matchLink = tab.link
    }
  }
  return matchLink
})

const githubLink = computed(
  () => theme.value.socialLinks?.find((social: { icon: unknown }) => social.icon === 'github')?.link
)
</script>

<template>
  <div class="VPNavBar AnviaNavBar" :class="{ 'screen-open': isScreenOpen }">
    <div class="nav-row">
      <a class="brand" :href="withBase('/')" aria-label="Anvia documentation home">
        <img class="wordmark" :src="withBase('/anvia-wordmark.png')" alt="Anvia" width="76" height="16" />
      </a>

      <div class="search-slot">
        <VPNavBarSearch class="search" />
      </div>

      <div class="actions">
        <slot name="nav-bar-content-before" />
        <a class="action-link" :href="withBase('/packages/changelog')">Changelog</a>
        <a v-if="githubLink" class="action-link" :href="githubLink" target="_blank" rel="noreferrer">
          <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.7-2.8 5.7-5.5 6 .5.4.9 1.1.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
            />
          </svg>
          <span>GitHub</span>
        </a>
        <a class="cta" :href="withBase('/guide/getting-started')">
          <span>Get started</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5" /></svg>
        </a>
        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="isDark = !isDark"
        >
          <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
          </svg>
        </button>
        <slot name="nav-bar-content-after" />
        <VPNavBarHamburger class="hamburger" :active="isScreenOpen" @click="$emit('toggle-screen')" />
      </div>
    </div>

    <nav class="tab-row" aria-label="Documentation sections">
      <a
        v-for="tab in tabs"
        :key="tab.link"
        class="tab"
        :class="{ active: tab.link === activeLink }"
        :aria-current="tab.link === activeLink ? 'page' : undefined"
        :href="withBase(tab.link)"
      >
        {{ tab.text }}
      </a>
    </nav>
  </div>
</template>

<style scoped>
.AnviaNavBar {
  position: relative;
  /* VPNav disables pointer events for its overlay; re-enable them here. */
  pointer-events: auto;
  border-bottom: 1px solid var(--line);
  background-color: var(--surface-overlay);
  backdrop-filter: blur(15px);
  white-space: nowrap;
}

.nav-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  height: 64px;
  padding: 0 8px 0 24px;
}

.brand {
  display: flex;
  align-items: center;
  height: 100%;
}

.wordmark {
  width: 76px;
  height: auto;
  filter: brightness(0);
}

.dark .wordmark {
  filter: brightness(0) invert(1);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 4px;
  border-radius: 8px;
  color: var(--vp-c-text-1);
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--surface-hover);
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.search-slot {
  display: flex;
  justify-content: flex-end;
}

.search-slot :deep(.VPNavBarSearch) {
  flex: 0 1 400px;
  justify-content: flex-end;
  padding-left: 0;
}


.actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-link,
.cta {
  display: none;
}

.tab-row {
  display: none;
}

@media (min-width: 768px) {
  .nav-row {
    grid-template-columns: 1fr minmax(0, 400px) 1fr;
    gap: 24px;
    padding: 0 var(--docs-layout-inset);
  }

  .search-slot {
    justify-content: center;
  }

  .search-slot :deep(.VPNavBarSearch) {
    flex: 1 1 auto;
  }

  .search-slot :deep(#local-search) {
    width: 100%;
  }

  .actions {
    justify-content: flex-end;
    gap: 8px;
  }

  .tab-row {
    display: flex;
    gap: 28px;
    height: 48px;
    padding: 0 var(--docs-layout-inset);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tab-row::-webkit-scrollbar {
    display: none;
  }
}

@media (min-width: 960px) {
  .action-link,
  .cta {
    display: inline-flex;
  }
}

.action-link {
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.2s, background-color 0.2s;
}

.action-link:hover {
  background-color: var(--surface-hover);
}

.github-icon {
  width: 16px;
  height: 16px;
}

.cta {
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  padding: 7px 12px 7px 14px;
  border-radius: 8px;
  background-color: var(--docs-accent-soft);
  color: var(--docs-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: background-color 0.2s;
}

.cta:hover {
  background-color: var(--docs-accent-softer);
}

.cta svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.tab:hover {
  color: var(--vp-c-text-1);
}

.tab.active {
  color: var(--docs-accent);
}

.tab.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background-color: var(--docs-accent);
  content: '';
}
</style>
