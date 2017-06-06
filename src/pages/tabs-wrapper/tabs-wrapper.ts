import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { ActionPage } from '../action/action';
import { ItemCreatePage } from '../item-create/item-create';

@Component({
  selector: 'page-tabs-wrapper',
  templateUrl: 'tabs-wrapper.html'
})
export class TabsWrapperPage {
  @ViewChild('Navbar') navBar: any;

  protected tabTitle: string = "";
  item: any;

  constructor(public plt: Platform, public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController) {
    this.item = navParams.get('item');
  }
  ionViewDidLoad() {
    console.log(this.navBar);
    
    this.plt.registerBackButtonAction(() => {
      this.onBack();
    });

    this.navBar.backButtonClick = (e: UIEvent) => {
      this.onBack();
    }
  }
  onTabChange(tabTitle: string) {
    this.tabTitle = tabTitle;
  }
  presentPopover() {
    let popover = this.popoverCtrl.create(ActionPage);
    popover.present();
  }
  editItem() {
    // let addModal = this.modalCtrl.create(ItemCreatePage);
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     this.items.add(item);
    //   }
    // })
    // addModal.present();
    this.navCtrl.push(ItemCreatePage, {
      item: this.item
    });
  }
  onBack() {
    if(localStorage.getItem('timer_working') != '1') {
      this.navCtrl.pop();
      return;
    }
    let confirm = this.alertCtrl.create({
      title: 'Warning',
      message: 'Please stop the timer.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });
    confirm.present();
  }
}
