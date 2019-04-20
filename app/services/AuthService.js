import BackendService from './BackendService'
import firebase from 'nativescript-plugin-firebase'
import {backendService} from "../main";

export default class AuthService extends BackendService {

    async loginFacebook() {
        const result = await firebase.login({
            type: firebase.LoginType.FACEBOOK
        })
        backendService.token = result.uid;
        backendService.photo = result.photoURL;
        return JSON.stringify(result);
    }

    async loginGoogle() {
        const result = await firebase.login({
            type: firebase.LoginType.GOOGLE
        })
        backendService.token = result.uid;
        backendService.photo = result.photoURL;
        return JSON.stringify(result);
    }

    async logout() {
        backendService.token = "";
        return firebase.logout();
    }
}