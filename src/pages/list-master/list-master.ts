import { Sync } from '../../providers/sync';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Loading, ModalController, NavController, NavParams } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ItemCreatePage } from '../item-create/item-create';
import { TabsWrapperPage } from '../tabs-wrapper/tabs-wrapper';

import { Items } from '../../providers/providers';
import { Item } from '../../models/item';

declare var $:any;

@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage implements OnInit {
  currentItems: Item[];
  itemsFiltered: Item[] = [];
  loader: Loading;
  statoID: number = 1;
  isSearching: Boolean = false;
  filterString: string = "";

  practicaType = ['', 'Aperta', 'Prenotata', 'In lavorazione', 'Ultimata', 'Consegnata'];

  constructor(public navParams: NavParams, 
    public sync: Sync, 
    public loadingCtrl: LoadingController, 
    public plt: Platform, 
    public navCtrl: NavController, 
    public items: Items, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController, 
    private backgroundMode: BackgroundMode, 
    private toastCtrl: ToastController) {

    if (this.navParams.get('statoID')) this.statoID = this.navParams.get('statoID')
  }

  ngOnInit() {
    this.currentItems = [];
    this.itemsFiltered = [];
    this.loader = this.loadingCtrl.create({
      content: "Loading..."
    });
    this.loader.present();

    this.items.load(this.statoID).then(res => {
      this.currentItems = res;
      this.itemsFiltered = this.currentItems.slice();
      this.loader.dismiss();
    });
    this.backgroundMode.enable();

    this.sync.syncListner().subscribe(res => {
      let syncloader = this.loadingCtrl.create({
        content: "Syncing..."
      });
      syncloader.present();
      this.items.load(this.statoID).then(res => {
        this.currentItems = res;
        syncloader.dismiss();
      });
    })
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
      if (data.success && this.statoID == 1) {
        this.currentItems.unshift(data.data);
        this.itemsFiltered = this.currentItems.slice();
      }
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

  // deleteItem(item) {
  //   let confirm = this.alertCtrl.create({
  //     title: 'Delete this practica?',
  //     message: 'Are you sure to delete this practica?\nYou won\'t be able to revert this action again.',
  //     buttons: [
  //       {
  //         text: 'Delete',
  //         handler: () => {
  //           this.items.delete(item);
  //         }
  //       },
  //       {
  //         text: 'Cancel',
  //         handler: () => {

  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }

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

  searchToggle(arg: Boolean) {
    if(!arg) {
      this.filterString = "";
      this.itemsFiltered = this.currentItems.slice()
    }
    this.isSearching = !this.isSearching;
    if(this.isSearching) {
      $('#searchbox').focus();
    }
  }

  getFilteredItems(filter) {
    this.itemsFiltered = [];
    
    this.itemsFiltered = this.currentItems.filter(item => {
      const targa = item.Targa.toLowerCase();
      if(targa.indexOf(filter.toLowerCase()) == -1)
        return false;
      return true;
    })
  }

  filterChange(e) {
    if (e != '') {
      this.getFilteredItems(e);
    }
    if(e == '')
      this.itemsFiltered = this.currentItems.slice()
  }
}
