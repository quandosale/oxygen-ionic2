import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';

import { ActionPage } from '../action/action';
import { ItemCreatePage } from '../item-create/item-create';

@Component({
  selector: 'page-tabs-wrapper',
  templateUrl: 'tabs-wrapper.html'
})
export class TabsWrapperPage {

  protected tabTitle: string = "";
  item: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController) { 
    this.item = navParams.get('item');
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
}
