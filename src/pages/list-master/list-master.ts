import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ItemCreatePage } from '../item-create/item-create';
import { TabsWrapperPage } from '../tabs-wrapper/tabs-wrapper';

import { Items } from '../../providers/providers';
import { Item } from '../../models/item';

import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];

  constructor(public plt: Platform, public navCtrl: NavController, public items: Items, public modalCtrl: ModalController, public alertCtrl: AlertController, private backgroundMode: BackgroundMode, private toastCtrl: ToastController) {
    this.items.load().then(res => {
      this.currentItems = res;
    });
    this.backgroundMode.enable();
    localStorage.setItem('exitOnceAgain', '0');

    this.plt.registerBackButtonAction(() => {
      this.onBack();
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
  onBack() {
    this.presentToast();
    if(localStorage.getItem('exitOnceAgain') == '1') {
      this.plt.exitApp();
    } else {
      setTimeout(function() {
        localStorage.setItem('exitOnceAgain', '0');
      }, 3000);
    }
    localStorage.setItem('exitOnceAgain', '1');
  } 
  presentToast() {
    let toast = this.toastCtrl.create({
      message: 'Press back button again to exit',
      duration: 3000
    });
    toast.present();
  }
}
