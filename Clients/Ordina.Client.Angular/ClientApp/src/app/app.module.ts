import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { OAuthModule } from 'angular-oauth2-oidc';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AppComponent } from './app.component';
import { AppRouterModule } from './app.routes';
import { HomeComponent } from './home/home.component';
import { ValuesComponent } from './values/values.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ValuesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRouterModule,
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer: {
        sendAccessToken: true,
        allowedUrls: ['https://localhost:44344/api']
      }
    }),
    NgxPermissionsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
