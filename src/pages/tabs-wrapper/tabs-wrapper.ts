import { Observable } from 'rxjs/Rx';
import { Items } from '../../providers/items';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, PopoverController, ModalController, LoadingController, Loading } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { ActionPage } from '../action/action';
import { ItemCreatePage } from '../item-create/item-create';
import { NetState } from '../../providers/network';

@Component({
  selector: 'page-tabs-wrapper',
  templateUrl: 'tabs-wrapper.html'
})
export class TabsWrapperPage {
  @ViewChild('Navbar') navBar: any;

  loading: Loading;
  selectedPhotoes: Array<any> = [];
  selectedDocuments: Array<any> = [];
  protected tabTitle: string = "";
  item: any;
  action: any = null;

  netstatus: boolean = true;

  constructor(public connection: NetState, public items: Items, public modalCtrl: ModalController, public plt: Platform, public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    this.item = navParams.get('item');
  }
  ngOnInit() {
    this.items.selectedPhotoListner().subscribe(res => {
      this.selectedPhotoes = res;
      console.log(this.selectedPhotoes, 'selectedPHotoes');
    });
    this.items.selectedDocumentListner().subscribe(res => {
      this.selectedDocuments = res;
      console.log(this.selectedDocuments, 'selectedDocuments');
    });
    if (!this.connection.isAvailable()) this.netstatus = false;
  }
  ngOnDestroy() {
    this.items.unsubscribe();
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
    console.log(this.tabTitle, this.item);
    if (this.item.Lavorazione && tabTitle == "Detagglio")
      if (this.item.Lavorazione.StatoID == 4)
        this.tabTitle = "Tempo";
  }
  presentPopover() {
    let popover = this.popoverCtrl.create(ActionPage);
    popover.present();
    popover.onDidDismiss(res => {
      this.action = res;
      this.setAction(this.action);
    })
  }
  done() {
    let message = `Do you want to delete `;
    if (this.tabTitle == 'Foto') message += 'Fotos ?';
    else message += 'Documents ?';
    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: message,
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.action = null;
            this.setAction(this.action);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loading = this.loadingCtrl.create({ content: 'Deleting...' });
            this.loading.present();

            if (this.tabTitle == 'Foto') {
              this.items.deletePhoto(this.selectedPhotoes).then(res => {

                this.items.setRefresh();
                this.loading.dismiss();
              }).catch(err => {
                this.loading.dismiss();
              })
            } else {
              this.items.deleteDocument(this.selectedDocuments).then(res => {

                this.items.setRefresh();
                this.loading.dismiss();
              }).catch(err => {
                this.loading.dismiss();
              })
            }
            this.action = null;
            this.setAction(this.action);
          }
        }
      ]
    });
    confirm.present();
  }
  setAction(action) {
    this.action = action;
    this.items.setAction(action);
  }
  editItem() {
    let modal = this.modalCtrl.create(ItemCreatePage, { item: this.item });
    modal.present();
  }
  onBack() {
    console.log('onback', 'tab-wrapper');
    if (localStorage.getItem('timer_working') != '1') {
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
