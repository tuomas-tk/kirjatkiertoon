import Vue from 'vue'
import Router from 'vue-router'
import { EventBus } from '../EventBus'

import frontpage from '@/components/frontpage'
import buyList from '@/components/buy-list'
import boughtList from '@/components/bought-list'
import sellList from '@/components/sell-list'
import sellNew from '@/components/sell-new'
import profile from '@/components/profile'
import adminReceive from '@/components/admin/receive'
import adminDeliver from '@/components/admin/deliver'
import adminBookList from '@/components/admin/book-list'
import adminUserList from '@/components/admin/user-list'
import superConsole from '@/components/super'
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
      meta: { requiresAuthLevel: 2 }
    },
    {
      path: '/buy/bought/:id',
      name: 'boughtSingle',
      component: boughtList,
      meta: { requiresAuthLevel: 2 }
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
      meta: { requiresAuthLevel: 5 }
    },
    {
      path: '/sell/new',
      name: 'sellNew',
      component: sellNew,
      meta: { requiresAuthLevel: 5 }
    },
    {
      path: '/sell/:id',
      name: 'sellSingle',
      component: sellList,
      meta: { requiresAuthLevel: 5 }
    },
    {
      path: '/profile',
      name: 'profile',
      component: profile,
      meta: { requiresAuthLevel: 2 }
    },
    {
      path: '/admin/receive',
      name: 'adminReceive',
      component: adminReceive,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/admin/deliver',
      name: 'adminDeliver',
      component: adminDeliver,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/admin/books',
      name: 'adminBookList',
      component: adminBookList,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/admin/books/:id',
      name: 'adminBookSingle',
      component: adminBookList,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/admin/users',
      name: 'adminUserList',
      component: adminUserList,
      meta: { requiresAuthLevel: 10 }
    },
    {
      path: '/manage',
      name: 'adminManage',
      component: profile,
      meta: { requiresAuthLevel: 15 }
    },
    {
      path: '/super',
      name: 'super',
      component: superConsole,
      meta: { requiresAuthLevel: 42 }
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
        path: '/',
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
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      ga('set', 'userId', null)
      ga('set', 'dimension1', null)
      ga('set', 'page', to.fullPath)
      ga('send', 'pageview')
      next()
    }
  })
  .then(() => {
    EventBus.$emit('setLoading', false)
  })
})

export default router
