
export const authConfig = {
    // Url of the Identity Provider
    issuer: 'https://localhost:44385',
    // URL of the SPA to redirect the user to after login
    redirectUri: "ordinaionic://profile",
    endSessionRedirectUri: "ordinaionic://home",
    // The SPA's id. The SPA is registerd with this id at the auth-server
    clientId: 'ionic-auth-code',
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC. The 4th is a usecase-specific one
    scope: 'openid profile address roles ordina demo_api offline_access',
    TOKEN_RESPONSE_KEY: "token_response",
    AUTHORIZATION_RESPONSE_KEY: "auth_response"
};
