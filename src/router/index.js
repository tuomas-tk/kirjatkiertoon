import Vue from 'vue'
import Router from 'vue-router'
import { EventBus } from '../EventBus'

import frontpage from '@/components/frontpage'
import buyList from '@/components/buy-list'
import boughtList from '@/components/bought-list'
import sellList from '@/components/sell-list'
import sellNew from '@/components/sell-new'
import profile from '@/components/profile'
import adminBookList from '@/components/admin/book-list'
import superConsole from '@/components/super'
import login from '@/components/login'
import logout from '@/components/logout'
import auth from '@/api/auth'

Vue.use(Router)

var router = new Router({
  routes: [
    {
      path: '/',
      name: 'frontpage',
      component: frontpage
    },
    {
      path: '/buy',
      name: 'buyList',
      component: buyList,
      meta: { requiresAuthLevel: 1 }
    },
    {
      path: '/buy/bought',
      name: 'boughtList',
      component: boughtList,
      meta: { requiresAuthLevel: 1 }
    },
    {
      path: '/buy/bought/:id',
      name: 'boughtSingle',
      component: boughtList,
      meta: { requiresAuthLevel: 1 }
    },
    {
      path: '/buy/:id',
      name: 'buySingle',
      component: buyList,
      meta: { requiresAuthLevel: 1 }
    },
    {
      path: '/sell',
      name: 'sellList',
      component: sellList,
      meta: { requiresAuthLevel: 2 }
    },
    {
      path: '/sell/new',
      name: 'sellNew',
      component: sellNew,
      meta: { requiresAuthLevel: 2 }
    },
    {
      path: '/sell/:id',
      name: 'sellSingle',
      component: sellList,
      meta: { requiresAuthLevel: 2 }
    },
    {
      path: '/profile',
      name: 'profile',
      component: profile,
      meta: { requiresAuthLevel: 1 }
    },
    {
      path: '/books',
      name: 'adminBookList',
      component: adminBookList,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/manage',
      name: 'adminBookList',
      component: adminBookList,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/super',
      name: 'super',
      component: superConsole,
      meta: { requiresAuthLevel: 42 }
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/logout',
      name: 'logout',
      component: logout
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log('FR: ' + from.fullPath)
  console.log('TO: ' + to.fullPath)

  console.log('[ROUTER] Current AUTH-level: ' + auth.status)
  EventBus.$emit('setLoading', true)
  EventBus.$emit('hideNavigation')

  auth.checkAuth()
  .then(() => {
    if (to.meta.requiresAuthLevel != null && to.meta.requiresAuthLevel > auth.status) {
      console.log('Unsufficient AUTH-level (' + auth.status + ')')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      ga('set', 'userId', auth.id)
      ga('set', 'dimension1', auth.status)
      ga('set', 'page', to.fullPath)
      ga('send', 'pageview')
      next()
    }
  })
  .catch(error => {
    if (error === 500) {
      console.log('SERVER ERROR')
      next(false)
    } else if (to.meta.requiresAuthLevel != null) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  })
  .then(() => {
    EventBus.$emit('setLoading', false)
  })
})

export default router
