import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Tab1Root } from '../pages';
import { Tab2Root } from '../pages';
import { Tab3Root } from '../pages';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;

  tab1Title = " ";
  tab2Title = " ";
  tab3Title = " ";

  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

  constructor(public navCtrl: NavController, public params: NavParams, public translateService: TranslateService) {
    translateService.get(['TAB1_TITLE', 'TAB2_TITLE', 'TAB3_TITLE']).subscribe(values => {
      this.tab1Title = "Tempo";
      this.tab2Title = "Foto";
      this.tab3Title = "Document";
    });
    console.log(this.params); // returns NavParams {data: Object}
  }

  onTab(tabName: string) {
    this.notify.emit(tabName);
  }
}
