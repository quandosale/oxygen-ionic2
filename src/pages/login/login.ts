import { Component } from '@angular/core';
import { NavController, ToastController, Loading, AlertController } from 'ionic-angular';
import { NetState } from '../../providers/network';
import { MainPage } from '../../pages/pages';
import { ListMasterPage } from '../../pages/list-master/list-master';
import { User } from '../../providers/user';

import { LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from '../../providers/settings';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { email: string, username: string, password: string } = {
    email: 'test@example.com',
    username: '',
    password: ''
  };

  // Our translated text strings
  private loginErrorString: string;
  loader: Loading;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService,
    public settingsService: Settings,
    public alertCtrl: AlertController,
    private connection: NetState) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  // Attempt to login in through our User service
  doLogin() {

    let confirm = this.alertCtrl.create({
      title: 'Error',
      message: '',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });

    if (this.connection.isAvailable()) {
      this.loader = this.loadingCtrl.create({
        content: "Signing in..."
      });
      this.loader.present();

      this.user.login(this.account.username, this.account.password).then(res => {
        this.loader.dismiss();
        if (res) {
          this.settingsService.setAuth(this.account.username, this.account.password).then(res => {
            this.navCtrl.setRoot(ListMasterPage)
          });
        } else {
          confirm.setMessage('Invalid username or password');
          confirm.present();
        }
      })
    } else {
      confirm.setMessage('Please make sure network is available');
      confirm.present();
    }
  }
}
