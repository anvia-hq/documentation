<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const isOpen = ref(false)
const source = ref('')
const description = ref('')
const closeButton = ref<HTMLButtonElement | null>(null)

let trigger: HTMLImageElement | null = null
let previousOverflow = ''

function openImage(image: HTMLImageElement) {
  trigger = image
  source.value = image.currentSrc || image.src
  description.value = image.alt
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  isOpen.value = true

  nextTick(() => closeButton.value?.focus())
}

function closeImage() {
  if (!isOpen.value) return

  isOpen.value = false
  document.documentElement.style.overflow = previousOverflow
  trigger?.focus()
}

function keepDialogFocus(event: KeyboardEvent) {
  event.preventDefault()
  closeButton.value?.focus()
}

function imageFromEvent(event: Event) {
  const target = event.target

  if (!(target instanceof HTMLImageElement) || !target.closest('.vp-doc')) {
    return null
  }

  return target
}

function handleClick(event: MouseEvent) {
  const image = imageFromEvent(event)
  if (!image) return

  event.preventDefault()
  openImage(image)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeImage()
    return
  }

  if (event.key !== 'Enter' && event.key !== ' ') return

  const image = imageFromEvent(event)
  if (!image) return

  event.preventDefault()
  openImage(image)
}

function prepareImages() {
  document.querySelectorAll<HTMLImageElement>('.vp-doc img').forEach((image) => {
    if (image.dataset.imageDialog === 'true') return

    image.dataset.imageDialog = 'true'
    image.tabIndex = 0
    image.setAttribute('role', 'button')
    image.setAttribute(
      'aria-label',
      image.alt ? `Open image: ${image.alt}` : 'Open image in dialog',
    )
  })
}

let observer: MutationObserver | undefined

onMounted(() => {
  prepareImages()
  observer = new MutationObserver(prepareImages)
  observer.observe(document.body, { childList: true, subtree: true })
  document.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('click', handleClick)
  document.removeEventListener('keydown', handleKeydown)
  document.documentElement.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <Transition name="image-dialog">
      <div
        v-if="isOpen"
        class="docs-image-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="description || 'Image preview'"
        @click.self="closeImage"
        @keydown.tab="keepDialogFocus"
      >
        <button
          ref="closeButton"
          class="docs-image-dialog__close"
          type="button"
          aria-label="Close image preview"
          @click="closeImage"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <figure class="docs-image-dialog__content">
          <img :src="source" :alt="description" />
          <figcaption v-if="description">{{ description }}</figcaption>
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.docs-image-dialog {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(20px, 4vw, 64px);
  background: rgb(0 0 0 / 78%);
  backdrop-filter: blur(10px);
}

.docs-image-dialog__content {
  display: flex;
  max-width: min(1920px, 94vw);
  max-height: calc(100vh - 80px);
  margin: 0;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.docs-image-dialog__content img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 120px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  object-fit: contain;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 80px rgb(0 0 0 / 45%);
}

.docs-image-dialog__content figcaption {
  color: rgb(255 255 255 / 76%);
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}

.docs-image-dialog__close {
  position: fixed;
  top: 18px;
  right: 18px;
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 10px;
  place-items: center;
  color: #fff;
  background: rgb(255 255 255 / 10%);
  cursor: pointer;
  font: inherit;
  font-size: 26px;
  line-height: 1;
  transition: background-color 180ms ease, transform 180ms ease;
}

.docs-image-dialog__close:hover {
  background: rgb(255 255 255 / 18%);
}

.docs-image-dialog__close:active {
  transform: scale(0.94);
}

.docs-image-dialog__close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.image-dialog-enter-active,
.image-dialog-leave-active {
  transition: opacity 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.image-dialog-enter-active .docs-image-dialog__content,
.image-dialog-leave-active .docs-image-dialog__content {
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 200ms ease;
}

.image-dialog-enter-from,
.image-dialog-leave-to {
  opacity: 0;
}

.image-dialog-enter-from .docs-image-dialog__content,
.image-dialog-leave-to .docs-image-dialog__content {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .image-dialog-enter-active,
  .image-dialog-leave-active,
  .image-dialog-enter-active .docs-image-dialog__content,
  .image-dialog-leave-active .docs-image-dialog__content {
    transition-duration: 1ms;
  }
}
</style>
