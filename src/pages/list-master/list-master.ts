import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { ItemCreatePage } from '../item-create/item-create';
import { TabsWrapperPage } from '../tabs-wrapper/tabs-wrapper';

import { Items } from '../../providers/providers';

import { Item } from '../../models/item';

@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];

  constructor(public navCtrl: NavController, public items: Items, public modalCtrl: ModalController, public alertCtrl: AlertController) {
    this.items.load().then(res => {
      this.currentItems = res;
    });
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    // let addModal = this.modalCtrl.create(ItemCreatePage);
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     this.items.add(item);
    //   }
    // })
    // addModal.present();
    this.navCtrl.push(ItemCreatePage, {
    });
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push(TabsWrapperPage, {
      item: item
    });
  }

  deleteItem(item) {
    let confirm = this.alertCtrl.create({
      title: 'Delete this practica?',
      message: 'Are you sure to delete this practica?\nYou won\'t be able to revert this action again.',
      buttons: [
        {
          text: 'Delete',
          handler: () => {
            this.items.delete(item);
          }
        },
        {
          text: 'Cancel',
          handler: () => {
            
          }
        }
      ]
    });
    confirm.present();
  }
}
