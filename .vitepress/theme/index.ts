import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ImageDialog from './ImageDialog.vue'
import ReleaseCandidateBanner from './ReleaseCandidateBanner.vue'
import VersionSelector from './VersionSelector.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReleaseCandidateBanner),
      'nav-bar-content-before': () => h(VersionSelector, { placement: 'navbar' }),
      'nav-screen-content-before': () => h(VersionSelector, { placement: 'mobile' }),
      'layout-bottom': () => h(ImageDialog)
    })
}
