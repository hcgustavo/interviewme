import Vue from 'nativescript-vue'
import Login from './components/Login'
import Main from './components/Main'
import store from './store';
import BackendService from './services/BackendService'
import AuthService from './services/AuthService'
import firebase from 'nativescript-plugin-firebase'

import VueDevtools from 'nativescript-vue-devtools'

export const backendService = new BackendService()
export const authService = new AuthService()

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$authService = authService

firebase.init({
  onAuthStateChanged: data => {
    if(data.loggedIn) {
      backendService.token = data.user.uid;
      store.commit('setUser', data.user);
      Vue.prototype.$navigateTo(Main, {clearHistory: true});
    } else {
      backendService.token = "";
      Vue.prototype.$navigateTo(Login, {clearHistory: true});
    }
  }
}).then(instance => {
  console.log("firebase.init done");
})
  .catch(error => {
    console.log(`firebase.init error: ${error}`);
  })


new Vue({
  store,
  render(h) {
    return h('frame', [
      h(backendService.isLoggedIn() ? Main : Login)
    ])
  }
}).$start()
