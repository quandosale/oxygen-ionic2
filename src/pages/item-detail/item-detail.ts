import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  mode: Boolean = false;

  constructor(public navCtrl: NavController, navParams: NavParams, items: Items) {
    this.item = navParams.get('item');
    console.log(this.item);
  }
  play() {
    console.log('play');
    this.mode = true;
  }
  pause() {
    console.log('pause');
  }
  stop() {
    console.log('stop');
    this.mode = false;
  }
}
