import { Component, ViewChild, OnInit } from '@angular/core';
import { Loading, ModalController, NavController } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
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
export class ListMasterPage implements OnInit {
  currentItems: Item[];
  loader: Loading;

  constructor(public loadingCtrl: LoadingController, public plt: Platform, public navCtrl: NavController, public items: Items, public modalCtrl: ModalController, public alertCtrl: AlertController, private backgroundMode: BackgroundMode, private toastCtrl: ToastController) {

  }

  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      content: "Loading..."
    });
    this.loader.present();

    this.items.load().then(res => {
      this.currentItems = res;
      this.loader.dismiss();
    });
    this.backgroundMode.enable();
  }
  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  ionViewWillEnter() {
    localStorage.setItem('exitOnceAgain', '0');
    console.log('list-master', 'ionViewWillEnter');
    this.plt.registerBackButtonAction(() => {
      this.onBack();
    });
  }
  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    // this.navCtrl.push(ItemCreatePage, {
    // });
    let modal = this.modalCtrl.create(ItemCreatePage);
    modal.onDidDismiss(data => {
      if (data.success)
        this.currentItems.unshift(data.data);
    })
    modal.present();
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
    console.log('onback', 'list-master');
    this.presentToast();
    if (localStorage.getItem('exitOnceAgain') == '1') {
      this.plt.exitApp();
    } else {
      setTimeout(function () {
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
