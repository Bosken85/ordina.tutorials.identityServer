import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(private authService: AuthServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LandingPage');
  }

  login(){
    this.authService.signin();
  }
}
