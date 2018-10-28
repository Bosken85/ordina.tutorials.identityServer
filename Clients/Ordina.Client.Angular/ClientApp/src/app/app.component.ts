import { Component } from '@angular/core';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { filter } from 'rxjs/operators';
import { authConfig } from './auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private oauthService: OAuthService,
    private permissionsService: NgxPermissionsService,
    private rolesService: NgxRolesService) {
    this.configureAuth();
    this.configureRoles();
    if (this.isAuthenticated()) {
      this.readPermissions();
    }
  }

  private configureAuth() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();

    // Optional
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.events.subscribe(e => {
      // tslint:disable-next-line:no-console
      console.log('oauth/oidc event', e);
    });

    this.oauthService.events
      .pipe(filter(e => e.type === 'session_terminated'))
      .subscribe(e => {
        // tslint:disable-next-line:no-console
        this.permissionsService.flushPermissions();
        console.log('Your session has been terminated!');
      });

    this.oauthService.events
      .pipe(filter(e => e.type === 'token_received'))
      .subscribe(async e => {
        await this.oauthService.loadUserProfile();
        this.readPermissions();
      });
  }

  private configureRoles() {
    this.rolesService.addRole('NCORE_EMPLOYEE', ['canReadValues', 'isNCore']);
  }

  private readPermissions() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) { return null; }
    const role: string = claims['role'];
    const unit: string = claims['unit'];

    if (role === 'Employee') {
      this.permissionsService.addPermission('canReadValues');
    }

    if (unit === 'NCore') {
      this.permissionsService.addPermission('isNCore');
    }
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken();
  }
}
