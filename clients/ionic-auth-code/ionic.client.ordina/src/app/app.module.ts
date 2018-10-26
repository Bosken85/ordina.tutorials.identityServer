import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularRequestor } from '../providers/app-auth/angularRequestor';
import { IonicAppBrowserProvider } from '../providers/app-auth/IonicAppBrowser';
import { AuthServiceProvider } from '../providers/auth-service';
import { MyApp } from './app.component';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    InAppBrowser,
    SafariViewController,
    IonicAppBrowserProvider,
    AngularRequestor,
    AuthServiceProvider
  ]
})
export class AppModule { }
