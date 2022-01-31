// import CoachDetail from './pages/coaches/CoachDetail.vue';
// import CoachesList from './pages/coaches/CoachesList.vue';
// import CoachRegistration from './pages/coaches/CoachRegistration.vue';
// import ContactCoach from './pages/requests/ContactCoach.vue';
// import RequestsReceived from './pages/requests/RequestsReceived.vue';
// import UserAuth from './pages/auth/UserAuth.vue';
// import NotFound from './pages/NotFound.vue';
import store from './store/index';
import { createRouter, createWebHistory } from 'vue-router';

const CoachDetail = () => import('./pages/coaches/CoachDetail.vue');
const CoachesList = () => import('./pages/coaches/CoachesList.vue');
const CoachRegistration = () => import('./pages/coaches/CoachRegistration.vue');
const ContactCoach = () => import('./pages/requests/ContactCoach.vue');
const RequestsReceived = () => import('./pages/requests/RequestsReceived.vue');
const UserAuth = () => import('./pages/auth/UserAuth.vue');
const NotFound = () => import('./pages/NotFound.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/coaches' },
    { path: '/coaches', component: CoachesList },
    {
      name: 'coach-detail',
      props: true,
      path: '/coaches/:id',
      component: CoachDetail,
      children: [
        {
          path: 'contact',
          component: ContactCoach,
          name: 'contact-coach',
        },
      ],
    },
    {
      path: '/register',
      component: CoachRegistration,
      meta: { requiresAuth: true },
    },
    { path: '/auth', component: UserAuth, meta: { requiresUnAuth: true } },
    {
      path: '/requests',
      component: RequestsReceived,
      meta: { requiresAuth: true },
    },
    { path: '/:notFound(.*)', component: NotFound },
  ],
});

store.dispatch('autoLogin').then(() => {
  router.beforeEach(function (to, _, next) {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
      next('/auth');
    } else if (to.meta.requiresUnAuth && store.getters.isAuthenticated) {
      next('/coaches');
    } else {
      next();
    }
  });
});

export default router;
