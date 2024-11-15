import { createMemoryHistory, createRouter } from 'vue-router'
import { type IStaticMethods } from 'flyonui/flyonui'
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const routes = [{ path: '/', component: () => import('../pages/iconspage.vue') }]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

router.afterEach((_to, _from, failure) => {
  if (!failure) {
    setTimeout(() => {
      window.HSStaticMethods.autoInit()
    }, 100)
  }
})

export default router
