import { Component, OnInit, Output } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController, LoadingController, Loading } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ListMasterPage } from '../list-master/list-master';
import { Items, Timer } from '../../providers/providers';

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage implements OnInit {
  item: any;
  mode: Boolean = false;
  counterSubscription: any;
  loading: Loading;

  counter: Number;
  counterText: String = '00:00:00';
  startTime: Date;

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, navParams: NavParams, public items: Items, public timer: Timer, public alertCtrl: AlertController) {
    this.item = navParams.get('item');
  }

  ngOnInit() {
    this.counterSubscription = this.timer.timerListner().subscribe(counter => {
      this.counterText = this.formatCounter(counter);
      this.counter = counter;
    })
  }

  play() {
    if (this.timer.getCounter() == 0) {
      console.log()
    }
    this.startTime = new Date();
    this.timer.start();
    this.mode = true;
  }
  pause() {
    this.timer.pause();
    this.mode = false;
  }
  stop() {
    this.timer.pause();
    let confirm = this.alertCtrl.create({
      title: 'Want to save this?',
      message: 'Do you want to save this?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this._stop();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loading = this.loadingCtrl.create({ content: 'Saving...' });
            this.loading.present();
            this.items.addLavo(this.item, this.startTime, this.counter).then((res) => {
              this.loading.dismiss();
            });
            this._stop();
          }
        }
      ]
    });
    confirm.present();
  }
  _stop() {
    this.timer.stop();
    this.mode = false;
  }

  ngOnDestroy() {
    this.timer.unsubscribe();
  }
  formatCounter(counter) {
    var date = new Date(1970, 0, 1);
    date.setSeconds(counter);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }
}
