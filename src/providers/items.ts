import { variable } from '@angular/compiler/src/output/output_ast';
import { contentHeaders } from './header';
import { Settings } from './settings';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Api } from './api';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';

declare var $: any;

@Injectable()
export class Items {
  photoes: Array<any>;
  private selectedPhotoSubject = new Subject<Array<any>>();
  private selected: Number = 0;

  private ITEMS_KEY: string = 'items';
  private items: Item[];

  constructor(private transfer: Transfer, private file: File, public storage: Storage, public http: Http, public api: Api, public settings: Settings) {
    this.items = [];
  }

  query(params?: any) {
    return this.api.get('/items', params)
      .map(resp => resp.json());
  }

  load() {
    return this.settings.getAuth().then(auth => {
      console.log(auth, 'auth');
      return this.api.get('PraticaList', auth)
        .toPromise()
        .then(res => {
          console.log(res);
          return res.json().data
        })
        .catch(err => [])
    })
    // return this.http.get('http://oxygen2.ilcarrozziere.it/Api/PraticaList?user=fabio&key=fabio').toPromise()
    //   .then(res => {return res.json().data;});
    // return this.storage.get(this.ITEMS_KEY).then(res => {
    //   this.items = res;
    //   if (res == null)
    //     this.items = [];
    //   console.log('load item', res);
    //   return this.items;
    // })
  }

  add(item: any) {
    console.log(item);
    return this.settings.getAuth().then(auth => {
      item.user = auth.user;
      item.key = auth.key;
      return $.post("http://oxygen2.ilcarrozziere.it/Api/PraticaInsert", item)
        .done(res => {
          return res;
        })
        .fail(err => {
          return err;
        });
    });
    // return this.settings.getAuth().then(auth => {
    //   item.user = auth.user;
    //   item.key = auth.key;
    //   return this.api.post('PraticaInsert', item)
    //     .toPromise()
    //     .then(res => {
    //       let newItem = res.json().data;
    //       console.log(newItem);
    //       this.items.push(newItem);
    //       return true;
    //     })
    //     .catch(err => false)
    // });
    // this.items.push(item);
    // return this.storage.set(this.ITEMS_KEY, this.items);
  }

  addLavo(item: any, date: Date, secs: Number) {
    return this.settings.getAuth().then(auth => {
      var url = "http://oxygen2.ilcarrozziere.it/Api/LavorazioneInsert";
      var data = {
        user: auth.user,
        key: auth.key,
        IdPratica: item.ID,
        DataInizioLavorazione: date.toISOString(),
        TempoLavorazione: secs,
        ID: ''
      }
      if (item.Lavorazione != null) {
        url = "http://oxygen2.ilcarrozziere.it/Api/LavorazioneUpdate";
        data.ID = item.Lavorazione.ID;
      }
      return $.post(url, data)
        .done(res => {
          return res;
        })
        .fail(err => {
          console.log(err);
          return err;
        });
    });
  }

  edit(item: any) {
    console.log(item);
    return this.settings.getAuth().then(auth => {
      item.user = auth.user;
      item.key = auth.key;
      return $.post("http://oxygen2.ilcarrozziere.it/Api/PraticaUpdate", item)
        .done(res => {
          return res;
        })
        .fail(err => {
          return err;
        });
    });
    // var itemId = this.items.indexOf(item);
    // this.items.splice(itemId, 1);
    // this.items.splice(itemId, 0, item);
    // return this.storage.set(this.ITEMS_KEY, this.items);
  }

  deletePhoto(photoes: Array<any>) {
    return this.settings.getAuth().then(auth => {
      let promises = [];
      photoes.forEach(photoID => {
        let data = {
          user: auth.user,
          key: auth.key,
          ID: photoID
        };
        let promise = $.post("http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineRemove", data)
          .done(res => res).fail(err => err);
        promises.push(promise);
      });
      return Promise.all(promises);
    });
  }

  addPhoto(item: any, photo: any) {
    const fileTransfer: TransferObject = this.transfer.create();

    return this.settings.getAuth().then(auth => {
      item.user = auth.user;
      item.key = auth.key;

      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: '1.jpg',
        headers: {},
        params: {
          user: auth.user,
          key: auth.key,
          PraticaID: item.ID
        }
      }
      console.log(photo);
      return fileTransfer.upload(photo, 'http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineAdd', options)
        .then((data) => {
          return JSON.parse(data.response);
        }, (err) => {
          console.log(err);
          return err;
        })
      // return $.post("http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineAdd", item)
      //   .done(res => {
      //     console.log(res);
      //     return res;
      //   })
      //   .fail(err => {
      //     return err;
      //   });
    })
  }

  getPhotoes(practicaID) {
    console.log('getPhotoes err');
    return this.settings.getAuth().then(auth => {
      var url = `http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineList?user=${auth.user}&key=${auth.key}&PraticaID=${practicaID}`;
      return $.post(url)
        .done(res => {
          return res;
        })
        .fail(err => {
          console.log(err);
          return err;
        });
    })
  }

  delete(item: Item) {
    var itemId = this.items.indexOf(item);
    this.items.splice(itemId, 1);
    return this.storage.set(this.ITEMS_KEY, this.items);
  }

  deleteAll() {
    this.items = [];
    return this.storage.set(this.ITEMS_KEY, this.items);
  }

  setSelectedPhotoes(photoesSelected) {
    this.selectedPhotoSubject.next(photoesSelected);
  }

  selectedPhotoListner(): Observable<Array<any>> {
    this.selectedPhotoSubject = new Subject<Array<any>>();
    return this.selectedPhotoSubject.asObservable();
  }

  unsubscribe() {
    this.selectedPhotoSubject.unsubscribe();
  }
}
