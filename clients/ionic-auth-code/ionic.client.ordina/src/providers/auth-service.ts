import { Injectable } from '@angular/core';
import { AuthorizationNotifier, AuthorizationRequest, BaseTokenRequestHandler, DefaultCrypto, GRANT_TYPE_AUTHORIZATION_CODE, GRANT_TYPE_REFRESH_TOKEN, LocalStorageBackend, StorageBackend, TokenRequest, TokenResponse } from '@openid/appauth';
import { AngularRequestor } from './app-auth/angularRequestor';
import { EndSessionRequest } from './app-auth/endSessionRequest';
import { IonicAppBrowserProvider } from './app-auth/IonicAppBrowser';
import { IonicAuthorizationRequestHandler } from './app-auth/ionicAuthorizationRequestHandler';
import { IonicAuthorizationServiceConfiguration } from './app-auth/IonicAuthorizationServiceConfiguration';
import { IonicEndSessionHandler } from './app-auth/ionicEndSessionRequestHandler';

const OpenIDConnectURL = "https://localhost:44385";
const ClientId = "ionic-auth-code";
const Scopes = "openid offline_access profile";
const RedirectUri = "ordinaionic://profile";
//URL Example: com.my.app://token
const EndSessionRedirectUri = "ordinaionic://home";
//this should be different from redirectURI

//CONST values (magic strings):
const TOKEN_RESPONSE_KEY = "token_response";
const AUTHORIZATION_RESPONSE_KEY = "auth_response";

const nowInSeconds = () => Math.round(new Date().getTime() / 1000);

@Injectable()
export class AuthServiceProvider {

    authCompletedReject: (reason?: any) => void;
    authCompletedResolve: (value?: boolean | PromiseLike<boolean>) => void;
    public authCompletedTask: Promise<boolean>;

    private authFinishedCallback: Function;
    private authLogOutCallback: Function;
    private discoveryTask: Promise<IonicAuthorizationServiceConfiguration>;
    private tokenHandler: BaseTokenRequestHandler;
    private storageBackend: StorageBackend;
    private tokenResponse: TokenResponse;

    private code: string;
    private code_verifier: string;

    private authorizationHandler: IonicAuthorizationRequestHandler;
    private endSessionHandler: IonicEndSessionHandler;
    private notifier: AuthorizationNotifier;

    private configuration: IonicAuthorizationServiceConfiguration;

    constructor(private requestor: AngularRequestor, private ionicBrowserView: IonicAppBrowserProvider) {
        this.storageBackend = new LocalStorageBackend();
        this.fetchDiscovery(this.requestor);

        this.init();
    }

    private init() {

        this.notifier = new AuthorizationNotifier();
        // uses a redirect flow
        this.authorizationHandler = new IonicAuthorizationRequestHandler(this.ionicBrowserView);
        this.endSessionHandler = new IonicEndSessionHandler(this.ionicBrowserView);
        // set notifier to deliver responses
        this.authorizationHandler.setAuthorizationNotifier(this.notifier);
        // set a listener to listen for authorization responses
        this.notifier.setAuthorizationListener(async (request, response, error) => {
            console.log('Authorization request complete ', request, response, error);
            if (response) {
                this.code = response.code;
                this.code_verifier = request.internal['code_verifier'];
                await this.getTokensFlow();
            }
        });
    }

    private resetAuthCompletedPromise() {
        this.authCompletedTask = new Promise<boolean>((resolve, reject) => {
            this.authCompletedResolve = resolve;
            this.authCompletedReject = reject;
        });
    }

    private async getTokensFlow() {
        try {
            await this.requestAccessToken();

            if (this.isAuthenticated()) {
                this.authFinishedCallback()
            }
        } catch (error) {
            this.authCompletedReject(error);
        }
    }

    public async signin() {
        await this.discoveryTask;

        this.tryLoadTokenResponseAsync();

        try {
            if (this.tokenResponse && this.tokenResponse.isValid()) {
                this.requestWithRefreshToken();
                //called auth finished callback again to push back to main page 
                this.authFinishedCallback();
            } else {
                this.requestAuthorizationToken();
            }
        } catch (error) {
            this.authCompletedReject(error);
        }
    }

    public async startupAsync(signInCallback: Function, signOutCallback: Function) {
        this.authFinishedCallback = signInCallback;
        this.authLogOutCallback = signOutCallback;
        await this.tryLoadTokenResponseAsync();
    }

    public AuthorizationCallback(url: string) {
        if ((url).indexOf(RedirectUri) === 0) {
            this.ionicBrowserView.CloseWindow();
            this.storageBackend.setItem(AUTHORIZATION_RESPONSE_KEY, url).catch(error => {
                this.authCompletedReject(error);
            }).then(x => {
                this.authorizationHandler.completeAuthorizationRequestIfPossible().catch(error => {
                    this.authCompletedReject(error);
                });
            });

        } else if ((url).indexOf(EndSessionRedirectUri) === 0) {

            this.ionicBrowserView.CloseWindow();
            this.storageBackend.clear()
                .then(() => this.resetAuthCompletedPromise())
                .then(() => {
                    delete this.tokenResponse;
                    delete this.code_verifier;

                    this.authLogOutCallback();
                })
                .catch(error => {
                    this.authCompletedReject(error);
                });
        }
    }

    public async waitAuthenticated() {
        await this.authCompletedTask;

        if (this.tokenResponse.accessToken && this.tokenResponse.refreshToken) {
            if (this.shouldRefresh()) {
                //TODO: Refresh token
                await this.requestWithRefreshToken();
            }

            return this.isAuthenticated()
        } else {
            return false;
        }
    }

    public async signout() {
        await this.discoveryTask;

        let id_token = this.tokenResponse.idToken;
        let request = new EndSessionRequest(id_token, EndSessionRedirectUri);
        this.endSessionHandler.performEndSessionRequest(this.configuration, request);
    }

    private async requestAuthorizationToken() {

        this.resetAuthCompletedPromise();
        await this.discoveryTask;

        // create a request
        const requestOptions = {
            client_id: ClientId,
            redirect_uri: RedirectUri,
            scope: Scopes,
            response_type: AuthorizationRequest.RESPONSE_TYPE_CODE + " id_token",
            state: undefined,
            extras: {
                'access_type': 'offline',
                'nonce': this.generateNonce()
            }
        };
        let request = new AuthorizationRequest(requestOptions, new DefaultCrypto(), true);

        // make the authorization request
        this.authorizationHandler.performAuthorizationRequest(this.configuration, request);
    }

    private async requestAccessToken() {
        await this.discoveryTask;

        this.tokenHandler = new BaseTokenRequestHandler(this.requestor);

        let request: TokenRequest | null = null;

        if (this.code) {
            // use the code to make the token request.
            request = new TokenRequest({
                client_id: ClientId,
                redirect_uri: RedirectUri,
                grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
                code: this.code,
                refresh_token: undefined,
                extras: {
                    code_verifier: this.code_verifier
                }
            });
            this.tokenHandler.performTokenRequest(this.configuration, request).then(async response => {
                await this.saveTokenResponse(response);
                this.authCompletedResolve();
            }).catch(error => this.authCompletedReject(error));
        }
    }

    private async requestWithRefreshToken() {
        this.resetAuthCompletedPromise();
        await this.discoveryTask;

        this.tokenHandler = new BaseTokenRequestHandler(this.requestor);

        let request: TokenRequest = null;

        if (this.tokenResponse) {
            request = new TokenRequest({
                client_id: ClientId,
                redirect_uri: RedirectUri,
                grant_type: GRANT_TYPE_REFRESH_TOKEN,
                code: undefined,
                refresh_token: this.tokenResponse.refreshToken,
                extras: {}
            });

            let response = await this.tokenHandler.performTokenRequest(this.configuration, request);
            await this.saveTokenResponse(response);

            console.log("Trying to resolve authcompleted..");
            this.authCompletedResolve();
            console.log("Resolved authcompleted!");
        }
    }

    public isAuthenticated() {
        var res = this.tokenResponse ? this.tokenResponse.isValid() : false;
        return res;
    }

    public shouldRefresh() {
        if (this.tokenResponse != null) {
            if (this.tokenResponse.expiresIn) {
                let now = nowInSeconds();
                let timeSinceIssued = now - this.tokenResponse.issuedAt;

                if (timeSinceIssued > this.tokenResponse.expiresIn / 2) {
                    return true;
                }

                return false;
            } else {
                return true;
            }
        }

        return true;
    }

    public getAuthorizationHeaderValue() {
        return this.tokenResponse && this.tokenResponse.isValid ? `${this.tokenResponse.tokenType} ${this.tokenResponse.accessToken}` : "";
    }


    private async fetchDiscovery(requestor: AngularRequestor) {
        try {
            this.discoveryTask = IonicAuthorizationServiceConfiguration.fetchFromIssuer(OpenIDConnectURL, requestor);
            let response = await this.discoveryTask;
            this.configuration = response;

        } catch (error) {
            //If discovery doesn't work, this is the place to set the endpoints manually
            throw error;
        }
    }

    //UTILS:
    private async saveTokenResponse(response: TokenResponse) {
        this.tokenResponse = response;
        await this.storageBackend.setItem(TOKEN_RESPONSE_KEY, JSON.stringify(this.tokenResponse.toJson()));
    }

    private generateNonce(): string {
        return Math.floor(Math.random() * 100000).toString();
    }

    private async tryLoadTokenResponseAsync(): Promise<TokenResponse> {
        let item = await this.storageBackend.getItem(TOKEN_RESPONSE_KEY);

        if (item) {
            this.tokenResponse = new TokenResponse(JSON.parse(item));
        }

        return this.tokenResponse;
    }

    //test class only, dont have in actual app
    public getAccessTokenJson(): string {
        return JSON.stringify(this.tokenResponse);
    }
}