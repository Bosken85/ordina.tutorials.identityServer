import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent {
  loginFailed = false;
  userProfile: object;


  get givenName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) { return null; }
    return claims['given_name'];
  }

  get familyName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) { return null; }
    return claims['family_name'];
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidIdToken();
  }

  constructor(private oauthService: OAuthService) {
  }

  login() {
    this.oauthService.initImplicitFlow('/some-state;p1=1;p2=2');
    // the parameter here is optional. It's passed around and can be used after logging in
  }

  logout() {
    this.oauthService.logOut();
  }

  async loadUserProfile(): Promise<void> {
    const up = await this.oauthService.loadUserProfile();
    this.userProfile = up;
  }

  testSilentRefresh() {
    this.oauthService
      .silentRefresh()
      .then(info => console.log('refresh ok', info))
      .catch(err => console.error('refresh error', err));
  }

  set requestAccessToken(value: boolean) {
    this.oauthService.requestAccessToken = value;
    localStorage.setItem('requestAccessToken', '' + value);
  }

  get requestAccessToken() {
    return this.oauthService.requestAccessToken;
  }

  get id_token() {
    return this.oauthService.getIdToken();
  }

  get access_token() {
    return this.oauthService.getAccessToken();
  }

  get id_token_expiration() {
    return this.oauthService.getIdTokenExpiration();
  }

  get access_token_expiration() {
    return this.oauthService.getAccessTokenExpiration();
  }
}
