import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, Config } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { CardsPage } from '../pages/cards/cards';
import { ContentPage } from '../pages/content/content';
import { FirstRunPage } from '../pages/pages';
import { ListMasterPage } from '../pages/list-master/list-master';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { MenuPage } from '../pages/menu/menu';
import { SearchPage } from '../pages/search/search';
import { SettingsPage } from '../pages/settings/settings';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { WelcomePage } from '../pages/welcome/welcome';
import { ImgcacheService } from '../global/services';
import { Settings } from '../providers/providers';

import { TranslateService } from '@ngx-translate/core'

@Component({
  templateUrl: 'app.component.html'
})
export class MyApp {
  rootPage: Component;

  @ViewChild(Nav) nav: Nav;

  pages: any[] = [
    // { title: 'Tutorial', component: TutorialPage },
    // { title: 'Welcome', component: WelcomePage },
    // { title: 'Tabs', component: TabsPage },
    // { title: 'Cards', component: CardsPage },
    // { title: 'Content', component: ContentPage },
    // { title: 'Login', component: LoginPage },
    // { title: 'Signup', component: SignupPage },
    // { title: 'Map', component: MapPage },
    // { title: 'Master Detail', component: ListMasterPage },
    // { title: 'Menu', component: MenuPage },
    // { title: 'Settings', component: SettingsPage },
    // { title: 'Search', component: SearchPage }
  ]

  constructor(public imgcacheService: ImgcacheService, private translate: TranslateService, private platform: Platform, private settings: Settings, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    this.initTranslate();
  }

  ngOnInit() {
    let self = this;
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // initialize imgCache library and set root
      this.imgcacheService.initImgCache().then(() => {
        this.settings.getAuth().then(auth => {
          if (auth)
            self.rootPage = ListMasterPage;
          else
            self.rootPage = FirstRunPage;
        })
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');

    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    let self = this;
    this.settings.clearAuth().then(res => {
      this.nav.setRoot(LoginPage);
    })
  }
  gotoPracticaList(ID: number) {
    this.nav.setRoot(ListMasterPage, {
      statoID: ID
    });
  }
}
