import { Component, OnInit, Output } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController, LoadingController, Loading } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { ListMasterPage } from '../list-master/list-master';
import { Items, Timer, TimerManager } from '../../providers/providers';

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage implements OnInit {
  item: any;
  mode: string = 'notStarted';
  loading: Loading;

  counter: number;
  counterText: String = '00:00:00';
  startTime: Date;

  isTempoAvailable: Boolean = false;
  practicaTypeList = ['', 'Aperta', 'Prenotata', 'Accettata', 'In lavorazione', 'Ultimata', 'Consegnata'];
  practicaType: String;

  lavoID: number;
  timer: Timer;

  counterTimer: any;

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, navParams: NavParams, public items: Items, public timerManager: TimerManager, public alertCtrl: AlertController) {
    this.item = navParams.get('item');
    if (this.item.Lavorazione)
      if (this.item.Lavorazione.StatoID == 4) { this.isTempoAvailable = true; this.lavoID = this.item.Lavorazione.ID; }
      else this.practicaType = this.practicaTypeList[this.item.Lavorazione.StatoID];
    else
      this.practicaType = this.practicaTypeList[1];
  }

  ngOnInit() {
    console.log(this.items.totalTime[this.lavoID], 'totaltime');
    if(!this.items.totalTime[this.lavoID]) this.items.totalTime[this.lavoID] = 0;
    this.counter = this.timerManager.getTotalTime(this.lavoID) + this.items.totalTime[this.lavoID];
    this.timer = this.timerManager.getTimerByLavoID(this.lavoID);
    if (this.timer) {
      if (this.timer.state == Timer.PLAYING) {
        this.mode = "started";
        this.startCounter();
      }
      if (this.timer.state == Timer.PASUED)
        this.mode = "paused";
    }
  }

  ngOnDestroy() {
    this.stopCounter();
  }

  play() {
    this.timerManager.play(this.lavoID);
    this.mode = 'started';
    this.startCounter();
  }
  pause() {
    this.timerManager.pause(this.lavoID);
    this.stopCounter();
    this.mode = 'paused';
  }
  stop() {
    this.timerManager.pause(this.lavoID);
    this.stopCounter();
    let confirm = this.alertCtrl.create({
      title: 'Want to save this?',
      message: 'Do you want to save this?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this._stop();
            this.counter = this.timerManager.getTotalTime(this.lavoID) + this.items.totalTime[this.lavoID];
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.loading = this.loadingCtrl.create({ content: 'Saving...' });
            this.loading.present();
            this.items.MarcaturaInsert(this.item, this.timerManager.getTimerByLavoID(this.lavoID).startTime, new Date()).then((res) => {
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
    this.mode = 'notStarted';
    return this.timerManager.stop(this.lavoID);
  }

  formatCounter(counter) {
    var date = new Date(1970, 0, 1);
    date.setSeconds(Math.round(counter / 1000));
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }

  startCounter() {
    var self = this;
    this.counterTimer = setInterval(() => {
      self.counter += 1000;
    }, 1000);
  }

  stopCounter() {
    clearInterval(this.counterTimer);
  }
}
