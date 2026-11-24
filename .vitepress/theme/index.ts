import DefaultTheme from 'vitepress/theme-without-fonts'
import { h } from 'vue'
import ImageDialog from './ImageDialog.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(ImageDialog)
    })
}
