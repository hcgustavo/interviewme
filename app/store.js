import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'nativescript-plugin-firebase';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser: (state, user) => {
      state.user = user;
    }
  },
  actions: {
    fetchCurrentUser({commit}) {
      firebase.getCurrentUser()
      .then(user => {
        commit('setUser', user);
      })
      .catch(error => {
        console.log("Error fetching current user: " + error);
      })
    }
  }
});
