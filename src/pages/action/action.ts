import { isSuccess } from '@angular/http/src/http_utils';
import { Items } from '../../providers/items';
import { Component } from '@angular/core';
import { NavController, ViewController, AlertController, LoadingController, Loading } from 'ionic-angular';

declare var $: any;

@Component({
  selector: 'page-action',
  templateUrl: 'action.html'
})
export class ActionPage {
  photoes: Array<any>;
  loading: Loading;

  constructor(public viewCtrl: ViewController, public items: Items, public alertCtrl: AlertController, public loadingCtrl: LoadingController, ) {
    this.photoes = viewCtrl.getNavParams().get('photoes');
  }

  tag() {

    this.viewCtrl.dismiss();
  }
  delete() {
    let confirm = this.alertCtrl.create({
      title: 'Warning',
      message: 'Do you want to delete fotos?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loading = this.loadingCtrl.create({ content: 'Deleting...' });
            this.loading.present();

            this.items.deletePhoto(this.photoes).then(res => {

              $('#refresh_photolist').trigger("click");
              this.loading.dismiss();
            }).catch(err => {
              this.loading.dismiss();
            })
          }
        }
      ]
    });
    confirm.present();
    this.viewCtrl.dismiss();
  }
}
