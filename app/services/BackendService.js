import { getString, setString } from 'tns-core-modules/application-settings'

const tokenKey = "token";
const photoKey = "photo";

/**
 * Parent service class. Has common configs and methods.
 */
export default class BackendService {
  
  isLoggedIn() {
    return !!getString(tokenKey);
  }

  get token() {
    return getString(tokenKey);
  }

  set token(newToken) {
    setString(tokenKey, newToken);
  }

  get photo() {
    return getString(photoKey);
  }

  set photo(newPhoto) {
    setString(photoKey, newPhoto);
  }
  
}