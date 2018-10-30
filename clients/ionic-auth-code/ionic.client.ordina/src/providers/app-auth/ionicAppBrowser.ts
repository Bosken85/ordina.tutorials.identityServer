import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { SafariViewController, SafariViewControllerOptions } from '@ionic-native/safari-view-controller';

@Injectable()
export class IonicBrowserProvider {
  private inAppLogin: InAppBrowserObject;

  constructor(private inAppBrowser: InAppBrowser, private safariViewController: SafariViewController) { }

  public ShowWindow(url: string)  {
    this.safariViewController.isAvailable().then(async available => {
      if(available) {
        await this.safariViewController.show({
          url: url,
          enterReaderModeIfAvailable: true,
        }).toPromise();
      } else {
        this.inAppLogin = this.inAppBrowser.create(url, '_system', {
          location: 'no',
          zoom: 'no',
          clearcache: 'yes',
          clearsessioncache: 'yes'
        });
        this.inAppLogin.show();
      }
    });
  }

  public CloseWindow() {
    return this.safariViewController.isAvailable().then(async available => {
      if(available) {
        await this.safariViewController.hide();
      } else if(this.inAppBrowser) {
        this.inAppLogin.close();
      }
    });
  }
}
