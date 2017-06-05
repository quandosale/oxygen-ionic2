import { Component } from '@angular/core';
import { NavController, NavParams,PopoverController  } from 'ionic-angular'; 

import {ActionPage} from '../action/action';

@Component({
  selector: 'page-tabs-wrapper',
  templateUrl: 'tabs-wrapper.html'
})
export class TabsWrapperPage {

  protected tabTitle: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController) {}

  onTabChange(tabTitle: string) {
    this.tabTitle = tabTitle;
  }
  presentPopover() {
    let popover = this.popoverCtrl.create(ActionPage);
    popover.present();
  }
}
