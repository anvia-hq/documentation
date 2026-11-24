<script setup lang="ts">
// Replaces VitePress's VPDocAsideOutline (aliased in .vitepress/config.ts).
// Draws one continuous track through the headings that bends inward for
// nested levels; the lit portion runs down to the heading being read.
import { getScrollOffset, onContentUpdated, useData } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import {
  getHeaders,
  resolveTitle,
  type MenuItem
} from 'vitepress/dist/client/theme-default/composables/outline'

interface FlatItem {
  title: string
  link: string
  depth: number
  element: HTMLElement
}

interface Metric {
  top: number
  bottom: number
  x: number
}

const INDENT = 18
const TRACK_X = 4
const GAP = 3

const { frontmatter, theme } = useData()

const items = shallowRef<FlatItem[]>([])
const metrics = ref<Metric[]>([])
const activeIndex = ref(0)
const list = ref<HTMLElement>()

function flatten(headers: MenuItem[], depth = 0, out: FlatItem[] = []) {
  for (const header of headers) {
    out.push({ title: header.title, link: header.link, depth, element: header.element })
    flatten(header.children ?? [], depth + 1, out)
  }
  return out
}

function measure() {
  const el = list.value
  if (!el) return
  metrics.value = [...el.querySelectorAll<HTMLElement>('.outline-link')].map((link, index) => ({
    top: link.offsetTop,
    bottom: link.offsetTop + link.offsetHeight,
    x: TRACK_X + Math.min(items.value[index]?.depth ?? 0, 2) * INDENT
  }))
}

const trackPath = computed(() => {
  const points = metrics.value
  if (!points.length) return ''
  let d = `M${points[0].x} ${points[0].top + GAP}`
  points.forEach((point, index) => {
    if (index > 0) {
      const prev = points[index - 1]
      const start = prev.bottom - GAP
      const end = point.top + GAP
      if (prev.x === point.x) {
        d += ` L${point.x} ${end}`
      } else {
        const mid = (start + end) / 2
        d += ` C${prev.x} ${mid} ${point.x} ${mid} ${point.x} ${end}`
      }
    }
    d += ` L${point.x} ${point.bottom - GAP}`
  })
  return d
})

const trackHeight = computed(() => metrics.value.at(-1)?.bottom ?? 0)
const trackWidth = computed(() => Math.max(TRACK_X, ...metrics.value.map((point) => point.x)) + 4)
const activePoint = computed(() => metrics.value[activeIndex.value])

function absoluteTop(element: HTMLElement | null) {
  let top = 0
  while (element && element !== document.body) {
    top += element.offsetTop
    element = element.offsetParent as HTMLElement | null
  }
  return element ? top : Number.NaN
}

function updateActive() {
  const list = items.value
  if (!list.length) return
  const scrollY = window.scrollY
  if (Math.abs(scrollY + window.innerHeight - document.body.offsetHeight) < 1) {
    activeIndex.value = list.length - 1
    return
  }
  const threshold = scrollY + getScrollOffset() + 4
  let next = 0
  list.forEach((item, index) => {
    const top = absoluteTop(item.element)
    if (!Number.isNaN(top) && top <= threshold) next = index
  })
  activeIndex.value = next
}

let frame = 0
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(updateActive)
}

let resizeObserver: ResizeObserver | undefined

onContentUpdated(async () => {
  items.value = flatten(getHeaders(frontmatter.value.outline ?? theme.value.outline))
  activeIndex.value = 0
  await nextTick()
  measure()
  updateActive()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  resizeObserver = new ResizeObserver(measure)
  if (list.value) resizeObserver.observe(list.value)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
})
</script>

<template>
  <nav
    aria-labelledby="doc-outline-aria-label"
    class="VPDocAsideOutline AnviaOutline"
    :class="{ 'has-outline': items.length > 0 }"
  >
    <div id="doc-outline-aria-label" class="outline-title" aria-level="2" role="heading">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" /></svg>
      {{ resolveTitle(theme) }}
    </div>

    <div class="outline-body">
      <svg
        class="track"
        :width="trackWidth"
        :height="trackHeight"
        :viewBox="`0 0 ${trackWidth} ${trackHeight}`"
        aria-hidden="true"
      >
        <path class="track-dim" :d="trackPath" />
      </svg>
      <div class="track-lit" :style="{ height: `${(activePoint?.bottom ?? 0) - GAP}px` }" aria-hidden="true">
        <svg :width="trackWidth" :height="trackHeight" :viewBox="`0 0 ${trackWidth} ${trackHeight}`">
          <path :d="trackPath" />
        </svg>
      </div>
      <span
        v-if="activePoint"
        class="track-dot"
        :style="{ transform: `translate(${activePoint.x}px, ${activePoint.bottom - GAP}px)` }"
        aria-hidden="true"
      />

      <ul ref="list" class="outline-list">
        <li v-for="(item, index) in items" :key="item.link">
          <a
            class="outline-link"
            :class="{ read: index <= activeIndex, active: index === activeIndex }"
            :href="item.link"
            :style="{ paddingLeft: `${TRACK_X + 15 + Math.min(item.depth, 2) * INDENT}px` }"
            :title="item.title"
          >
            {{ item.title }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.AnviaOutline {
  display: none;
}

.AnviaOutline.has-outline {
  display: block;
}

.outline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  line-height: 32px;
}

.outline-title svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
}

.outline-body {
  position: relative;
}

.track,
.track-lit {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.track path,
.track-lit path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.track-dim {
  stroke: var(--vp-c-divider);
}

.track-lit {
  overflow: hidden;
  transition: height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.track-lit path {
  stroke: var(--vp-c-text-1);
}

.track-dot {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--vp-c-text-1);
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.outline-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.outline-link {
  display: block;
  overflow: hidden;
  padding-top: 5px;
  padding-bottom: 5px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.outline-link:hover,
.outline-link.read {
  color: var(--vp-c-text-1);
}

@media (prefers-reduced-motion: reduce) {
  .track-lit,
  .track-dot {
    transition: none;
  }
}
</style>
