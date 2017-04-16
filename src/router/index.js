import Vue from 'vue'
import Router from 'vue-router'
import frontpage from '@/components/frontpage'
import buyList from '@/components/buy-list'
// import sellList from '@/components/buy-list'
import profile from '@/components/profile'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/buy',
      name: 'Osta kirja',
      component: buyList
    },
    {
      path: '/sell',
      name: 'Myy kirja',
      component: buyList
    },
    {
      path: '/profiles',
      name: 'Profiili',
      component: profile
    },
    {
      path: '/frontpage',
      name: 'Etusivu',
      component: frontpage
    }
  ]
})
