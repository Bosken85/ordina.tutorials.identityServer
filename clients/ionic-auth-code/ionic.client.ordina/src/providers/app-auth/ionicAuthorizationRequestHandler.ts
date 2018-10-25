import { BasicQueryStringUtils, DefaultCrypto, LocalStorageBackend, RedirectRequestHandler, StorageBackend } from "@openid/appauth";
import { IonicAppBrowserProvider } from "./IonicAppBrowser";


/** key for authorization request. */
const authorizationRequestKey =
    (handle: string) => {
        return `${handle}_appauth_authorization_request`;
    }

/** key for authorization service configuration */
const authorizationServiceConfigurationKey =
    (handle: string) => {
        return `${handle}_appauth_authorization_service_configuration`;
    }

/** key in local storage which represents the current authorization request. */
const AUTHORIZATION_REQUEST_HANDLE_KEY = 'appauth_current_authorization_request';
export const AUTHORIZATION_RESPONSE_KEY = "auth_response";

export class IonicAuthorizationRequestHandler extends RedirectRequestHandler {

    constructor(
        // use the provided storage backend
        // or initialize local storage with the default storage backend which
        // uses window.localStorage
        public locationLike: IonicAppBrowserProvider,
        public storageBackend: StorageBackend = new LocalStorageBackend(),
        utils = new BasicQueryStringUtils(),
        crypto = new DefaultCrypto(),
    ) {
        super(storageBackend, utils, locationLike, crypto);
    }
}