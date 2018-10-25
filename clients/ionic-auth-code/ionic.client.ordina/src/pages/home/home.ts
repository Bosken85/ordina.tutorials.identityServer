import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  token: any;
  constructor(public navCtrl: NavController, private auth: AuthServiceProvider) {
    this.token = this.auth.getAccessTokenJson();
  }

}
