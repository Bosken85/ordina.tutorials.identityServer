import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { SafariViewController, SafariViewControllerOptions } from '@ionic-native/safari-view-controller';

@Injectable()
export class IonicBrowserProvider {
  private inAppLogin: InAppBrowserObject;

  constructor(private inAppBrowser: InAppBrowser, private safariViewController: SafariViewController) { }

  public ShowWindow(url: string) {
    this.safariViewController.isAvailable().then(available => {
      if(available) {
        let optionSafari: SafariViewControllerOptions = {
          url: url,
          enterReaderModeIfAvailable: true,
        }
        await this.safariViewController.show(optionSafari).toPromise();
      } else {
        let options: InAppBrowserOptions = {
          location: 'no',
          zoom: 'no',
          clearcache: 'yes',
          clearsessioncache: 'yes'
        }
  
        this.inAppLogin = this.inAppBrowser.create(url, '_system', options);
        this.inAppLogin.show();
      }
    });
  }

  public CloseWindow() {
    this.safariViewController.isAvailable().then(available => {
      if(available) {
        await this.safariViewController.hide().toPromise();
      } else {
        this.inAppLogin.close();
      }
    });
  }
}
