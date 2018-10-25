import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Nav, Platform } from 'ionic-angular';
import { HomePage } from '../pages/home/home';
import { AuthServiceProvider } from '../providers/auth-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  @ViewChild(Nav) nav: Nav;

  constructor(private platform: Platform,private statusBar: StatusBar,private splashScreen: SplashScreen, private authService: AuthServiceProvider) {
    this.initApp();
  }

  initApp() {
    this.platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();

      (<any>window).handleOpenURL = (url) => {        
        this.authService.AuthorizationCallback(url);        
      };

      await this.authService.startupAsync(signin => {
        //Register the callback for when authService has tried handling signin
        this.nav.setRoot('HomePage');   
      }, signout => {
        this.nav.setRoot('ProfilePage');
      });

      // await this.authService.waitAuthenticated();

      if (this.authService.isAuthenticated()) {
        //If we are already authenticated (ie has valid token in storage) we can just go ahead into the application
        this.rootPage = 'HomePage';
      } else {
          //This shows the signin/unauthorized page, because we are not signed in.
          //We could trigger the oidc signin instead
          await this.authService.signin();
          this.rootPage = 'ProfilePage';
      }

      this.splashScreen.hide();
    });
  }
}

