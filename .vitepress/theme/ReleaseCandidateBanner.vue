<script setup lang="ts">
const isReleaseCandidate = __DOCS_VERSION_CONFIG__.channel === 'rc'
const currentUrl = __DOCS_VERSION_CONFIG__.currentUrl
</script>

<template>
  <aside
    v-if="isReleaseCandidate"
    class="docs-rc-banner"
    aria-label="Release candidate documentation notice"
  >
    <span>You’re viewing Anvia Core v1 release-candidate documentation.</span>
    <a :href="currentUrl">View the current v0.x docs</a>
  </aside>
</template>

<style scoped>
.docs-rc-banner {
  position: fixed;
  inset: 0 0 auto;
  z-index: 31;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 44px;
  padding: 0 20px;
  background: #17351f;
  color: #eaf9ee;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
}

.docs-rc-banner a {
  color: #7df09f;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgb(125 240 159 / 45%);
  text-underline-offset: 3px;
}

.docs-rc-banner a:hover {
  text-decoration-color: currentColor;
}

.docs-rc-banner a:focus-visible {
  border-radius: 3px;
  outline: 2px solid #7df09f;
  outline-offset: 3px;
}

@media (max-width: 479px) {
  .docs-rc-banner {
    gap: 6px;
    padding: 0 10px;
    font-size: 11px;
  }
}
</style>
