<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { ref } from 'vue'

defineProps<{
  placement: 'navbar' | 'mobile'
}>()

const route = useRoute()
const { site } = useData()
const selectedChannel = ref<DocsChannel>(__DOCS_VERSION_CONFIG__.channel)
const isSwitching = ref(false)

const channels: Array<{ value: DocsChannel; label: string; url: string }> = [
  { value: 'current', label: 'Current (v0.x)', url: __DOCS_VERSION_CONFIG__.currentUrl },
  {
    value: 'rc',
    label: 'Release candidate (v1)',
    url: __DOCS_VERSION_CONFIG__.releaseCandidateUrl
  }
]

async function switchChannel(event: Event) {
  const nextChannel = (event.target as HTMLSelectElement).value as DocsChannel

  if (nextChannel === __DOCS_VERSION_CONFIG__.channel) return

  const targetChannel = channels.find((channel) => channel.value === nextChannel)
  if (!targetChannel) return

  isSwitching.value = true

  const targetRoot = withTrailingSlash(new URL(targetChannel.url, window.location.origin))
  const pagePath = relativePagePath(route.path, site.value.base)
  const pageUrl = new URL(pagePath, targetRoot)
  pageUrl.search = window.location.search
  pageUrl.hash = window.location.hash

  const destination = await resolveDestination(pageUrl, targetRoot)
  window.location.assign(destination.href)
}

async function resolveDestination(pageUrl: URL, fallbackUrl: URL) {
  if (pageUrl.origin !== window.location.origin || pageUrl.pathname === fallbackUrl.pathname) {
    return pageUrl
  }

  try {
    const response = await fetch(pageUrl, { method: 'HEAD', redirect: 'follow' })
    if (response.ok) return pageUrl
  } catch {
    // A different host can reject the probe while still serving the page.
    return pageUrl
  }

  return fallbackUrl
}

function withTrailingSlash(url: URL) {
  if (!url.pathname.endsWith('/')) url.pathname += '/'
  return url
}

function relativePagePath(path: string, base: string) {
  const pathWithoutBase = base !== '/' && path.startsWith(base)
    ? path.slice(base.length)
    : path

  return pathWithoutBase.replace(/^\/+/, '')
}
</script>

<template>
  <label
    class="docs-version-selector"
    :class="`docs-version-selector--${placement}`"
  >
    <span class="docs-version-selector__label">Documentation version</span>
    <span class="docs-version-selector__control">
      <select
        v-model="selectedChannel"
        :disabled="isSwitching"
        aria-label="Documentation version"
        @change="switchChannel"
      >
        <option v-for="channel in channels" :key="channel.value" :value="channel.value">
          {{ channel.label }}
        </option>
      </select>
      <span class="docs-version-selector__chevron" aria-hidden="true" />
    </span>
  </label>
</template>

<style scoped>
.docs-version-selector {
  color: var(--vp-c-text-1);
}

.docs-version-selector__label {
  display: none;
}

.docs-version-selector__control {
  position: relative;
  display: block;
}

select {
  min-width: 132px;
  height: 34px;
  padding: 0 30px 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 32px;
  appearance: none;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease;
}

select:hover {
  border-color: var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

select:disabled {
  cursor: wait;
  opacity: 0.65;
}

.docs-version-selector__chevron {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
}

.docs-version-selector--navbar {
  flex: 0 0 auto;
  margin-right: 12px;
  margin-left: 8px;
}

.docs-version-selector--mobile {
  display: none;
}

@media (max-width: 767px) {
  .docs-version-selector--navbar {
    display: block;
    margin-right: 8px;
  }

  .docs-version-selector--navbar select {
    min-width: 118px;
    max-width: 148px;
    height: 32px;
    padding-right: 26px;
    padding-left: 10px;
    font-size: 12px;
    line-height: 30px;
  }

  .docs-version-selector--mobile {
    display: block;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .docs-version-selector--mobile .docs-version-selector__label {
    display: block;
    margin-bottom: 8px;
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .docs-version-selector--mobile select {
    width: 100%;
    height: 40px;
    font-size: 14px;
  }
}
</style>
