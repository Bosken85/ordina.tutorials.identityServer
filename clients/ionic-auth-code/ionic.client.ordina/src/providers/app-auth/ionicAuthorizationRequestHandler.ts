import { AuthorizationError, AuthorizationRequest, AuthorizationRequestHandler, AuthorizationRequestResponse, AuthorizationResponse, AuthorizationServiceConfiguration, BasicQueryStringUtils, Crypto, DefaultCrypto, LocalStorageBackend, LocationLike, StorageBackend, StringMap } from "@openid/appauth";
import { IonicBrowserProvider } from "./IonicAppBrowser";

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

export const BUILT_IN_PARAMETERS = ['redirect_uri', 'client_id', 'response_type', 'state', 'scope'];

/**
 * Represents an AuthorizationRequestHandler which uses a standard
 * redirect based code flow.
 */
export class IonicAuthorizationRequestHandler extends AuthorizationRequestHandler {
    constructor(
        // use the provided storage backend
        // or initialize local storage with the default storage backend which
        // uses window.localStorage
        private ionicAppBrowserProvider: IonicBrowserProvider,
        public storageBackend: StorageBackend = new LocalStorageBackend(),
        public locationLike: LocationLike = window.location,
        utils = new BasicQueryStringUtils(),
        crypto: Crypto = new DefaultCrypto()) {
        super(utils, crypto);
    }

    performAuthorizationRequest(
        configuration: AuthorizationServiceConfiguration,
        request: AuthorizationRequest) {
        const handle = this.crypto.generateRandom(10);

        // before you make request, persist all request related data in local storage.
        const persisted = Promise.all([
            this.storageBackend.setItem(AUTHORIZATION_REQUEST_HANDLE_KEY, handle),
            // Calling toJson() adds in the code & challenge when possible
            request.toJson().then(
                result =>
                    this.storageBackend.setItem(authorizationRequestKey(handle), JSON.stringify(result))),
            this.storageBackend.setItem(
                authorizationServiceConfigurationKey(handle), JSON.stringify(configuration.toJson())),
        ]);

        persisted.then(async () => {
            // make the redirect request
            let url = this.buildRequestUrl(configuration, request);
            console.log('Making a request to ', request, url);
            this.ionicAppBrowserProvider.ShowWindow(url);
        });
    }

    /**
     * Attempts to introspect the contents of storage backend and completes the
     * request.
     */
    protected async completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null> {
        // TODO(rahulrav@): handle authorization errors.
        const handle = await this.storageBackend.getItem(AUTHORIZATION_REQUEST_HANDLE_KEY);
        if (!handle) {
            return null;
        }
        let authRequestKey = await this.storageBackend.getItem(authorizationRequestKey(handle))
        let json = await JSON.parse(authRequestKey);

        const request = new AuthorizationRequest(json);

        let response = await this.storageBackend.getItem(AUTHORIZATION_RESPONSE_KEY);
        let parts = response.split('#');

        if (parts.length !== 2) {
            throw new Error("Invalid auth repsonse string");
        }

        // check redirect_uri and state
        //Get the info from the calback URL
        let hash = parts[1];
        let queryParams = this.utils.parseQueryString(hash);

        let state: string | undefined = queryParams['state'];
        let code: string | undefined = queryParams['code'];
        let error: string | undefined = queryParams['error'];

        console.log('Potential authorization request ', queryParams, state, code, error);

        let shouldNotify = state === request.state;
        let authorizationResponse: AuthorizationResponse | null = null;
        let authorizationError: AuthorizationError | null = null;
        if (shouldNotify) {
            if (error) {
                // get additional optional info.
                let errorUri = queryParams['error_uri'];
                let errorDescription = queryParams['error_description'];
                authorizationError = new AuthorizationError({
                    error: error,
                    error_description: errorDescription,
                    error_uri: errorUri,
                    state: state
                });
            } else {
                authorizationResponse = new AuthorizationResponse({ code: code, state: state });
            }

            let tasks = new Array<Promise<any>>()
            {
                this.storageBackend.removeItem(AUTHORIZATION_REQUEST_HANDLE_KEY),
                this.storageBackend.removeItem(authorizationRequestKey(handle)),
                this.storageBackend.removeItem(authorizationServiceConfigurationKey(handle))
            };

            await Promise.all(tasks);

            return <AuthorizationRequestResponse>{
                request: request,
                response: authorizationResponse,
                error: authorizationError
            }
        } else {
            console.log('Mismatched request (state and request_uri) dont match.');
            return Promise.resolve(null);
        }
    }

    protected buildRequestUrl(
        configuration: AuthorizationServiceConfiguration,
        request: AuthorizationRequest) {
        // build the query string
        // coerce to any type for convenience
        let requestMap: StringMap = {
            'redirect_uri': request.redirectUri,
            'client_id': request.clientId,
            'response_type': request.responseType,
            'state': request.state,
            'scope': request.scope
        };

        // copy over extras
        if (request.extras) {
            for (let extra in request.extras) {
                if (request.extras.hasOwnProperty(extra)) {
                    // check before inserting to requestMap
                    if (BUILT_IN_PARAMETERS.indexOf(extra) < 0) {
                        requestMap[extra] = request.extras[extra];
                    }
                }
            }
        }

        let query = this.utils.stringify(requestMap);
        let baseUrl = configuration.authorizationEndpoint;
        let url = `${baseUrl}?${query}`;
        return url;
    }
}