import { Sync } from '../../providers/sync';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Loading, ModalController, NavController, NavParams } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ItemCreatePage } from '../item-create/item-create';
import { TabsWrapperPage } from '../tabs-wrapper/tabs-wrapper';
import { Item } from '../../models/item';
import { Items, NetState } from '../../providers/providers';
import { TimerManager, Timer } from '../../providers/timer';


declare var $: any;

@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage implements OnInit {
  currentItems: Item[];
  itemsFiltered: Item[] = [];
  loader: Loading;
  statoID: number = 3;
  isSearching: Boolean = false;
  filterString: string = "";
  timerList: any;
  counterList: any = {};

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
    private timerManager: TimerManager,
    private toastCtrl: ToastController,
    private connection: NetState) {

    if (this.navParams.get('statoID')) this.statoID = this.navParams.get('statoID')

    setInterval(() => {
      for (var lavoID in this.counterList) {
        if (this.counterList.hasOwnProperty(lavoID) && this.timerList[lavoID]) {
          if (this.timerList[lavoID].state == Timer.PLAYING)
            this.counterList[lavoID] += 1000;
        }
      }
    }, 1000);
  }



  ionViewDidLoad() {
    this.itemsFiltered = this.currentItems.slice();
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
    this.counterList = {};
    localStorage.setItem('exitOnceAgain', '0');
    this.plt.registerBackButtonAction(() => {
      this.onBack();
    });

    this.timerList = this.timerManager.getTimerList();
    for (var lavoID in this.timerList) {
      if (this.timerList.hasOwnProperty(lavoID)) {
        var element = this.timerList[lavoID];
        this.counterList[lavoID] = this.timerManager.getTotalTime(Number.parseInt(lavoID));
      }
    }
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
    if (!arg) {
      this.filterString = "";
      this.itemsFiltered = this.currentItems.slice()
    }
    this.isSearching = !this.isSearching;
    if (this.isSearching) {
      this.itemsFiltered = [];
      $('#searchbox').focus();
    }
  }

  getFilteredItems(filter) {
    this.itemsFiltered = [];
    if (!this.connection.isAvailable()) {
      this.itemsFiltered = this.currentItems.filter(item => {
        const targa = item.Targa.toLowerCase();
        if (targa.indexOf(filter.toLowerCase()) == -1)
          return false;
        return true;
      })
    } else {
      this.loader = this.loadingCtrl.create({
        content: "Loading..."
      });
      this.loader.present();
      this.items.searchItem(filter).then(res => {
        this.itemsFiltered = res;
        this.loader.dismiss();
      });
    }
  }

  search() {
      this.getFilteredItems(this.filterString);
  }

  filterChange(e) {
    if (e != '') {
      this.getFilteredItems(e);
    }
    if (e == '')
      this.itemsFiltered = this.currentItems.slice()
  }

  getCounter(item: Item) {
    if (item.Lavorazione) {
      const lavoID = item.Lavorazione.ID;
      if (!this.counterList[lavoID])
        return null;
      return this.formatCounter(this.counterList[lavoID] + this.items.totalTime[lavoID]);
    } else
      return null;
  }

  formatCounter(counter) {
    var date = new Date(1970, 0, 1);
    date.setSeconds(Math.round(counter / 1000));
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }

  isPlaying(item) {
    const lavoID = item.Lavorazione.ID;
    if (this.timerList[lavoID].state == Timer.PLAYING)
      return true;
    return false;
  }

  getBackgroundColor(item: Item) {
    if (item.Lavorazione) {
      const lavoID = item.Lavorazione.ID;
      if (this.getCounter(item))
        return '#d1f1da';
    }
    return 'white';
  }
}
