import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  token: any;
  userInfo: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
    debugger;
    this.token = this.auth.getAccessTokenJson();
  }

  loadUserInfo() {
    this.auth.getUserInfo().then(result => this.userInfo = result);
  }

  reload() {
    this.auth.waitAuthenticated().then(result => {
      if(result) {
        this.token = this.auth.getAccessTokenJson()
      }
    });
  }

  logout(){
    this.auth.signout();
  }

}
