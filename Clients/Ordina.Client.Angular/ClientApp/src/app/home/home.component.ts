import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userProfile: object;
  givenName: string;
  familyName: string;

  isAuthenticated(): boolean {
    return this.oauthService.hasValidIdToken();
  }

  constructor(private oauthService: OAuthService) {
  }

  ngOnInit(): void {
    const claims = this.oauthService.getIdentityClaims();
    if (claims) {
      this.givenName = claims['given_name'];
      this.familyName = claims['family_name'];
    }
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

  copyToClipboard(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
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
