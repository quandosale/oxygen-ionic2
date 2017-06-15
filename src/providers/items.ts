import { Operation, Sync } from './sync';
import { NetState } from './network';
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
  public items: Item[];

  constructor(private sync: Sync, private connection: NetState, private transfer: Transfer, private file: File, public storage: Storage, public http: Http, public api: Api, public settings: Settings) {
    this.items = [];
  }

  query(params?: any) {
    return this.api.get('/items', params)
      .map(resp => resp.json());
  }

  load() {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        console.log(auth, 'auth');
        return this.api.get('PraticaList', auth)
          .toPromise()
          .then(res => {
            let data = res.json().data;
            this.items = data;
            this.storage.set(this.ITEMS_KEY, data);
            return data;
          })
          .catch(err => [])
      })
    } else {
      return this.storage.get(this.ITEMS_KEY).then(res => {
        if (res == undefined || res == null)
          return [];
        this.items = res;
        return res;
      })
    }
  }

  add(item: any) {
    if (this.connection.isAvailable()) {
      return this.api.postInsertItem(item).then(res => {
        if (res.success) {
          this.items.unshift(res.data);
        }
        this.storage.set(this.ITEMS_KEY, this.items);
        return res;
      });
    } else {
      item.created_at = new Date().getTime();
      let operation = new Operation();

      operation.id = item.created_at;
      operation.name = Operation.PRACTICA;
      operation.type = Operation.INSERT;
      operation.body = item;

      this.items.unshift(item);
      this.storage.set(this.ITEMS_KEY, this.items);

      this.sync.addOperation(operation);

      return Promise.resolve({
        success: true,
        data: item
      });
    }
  }

  edit(item: any) {
    console.log(item, 'edit');

    if (this.connection.isAvailable()) {
      this.storage.set(this.ITEMS_KEY, this.items);
      return this.api.postUpdateItem(item);
    } else {
      if (item.ID == undefined) {
        this.sync.updateOperation(item.created_at, item);
      } else {
        let operation = new Operation();
        operation.name = Operation.PRACTICA;
        operation.type = Operation.UPDATE;
        operation.body = item;

        this.sync.addOperation(operation);
      }
      return Promise.resolve(true);
    }
  }

  addLavo(item: any, date: Date, secs: Number) {
    if(this.connection.isAvailable()) {
      return this.api.postLovo(item, date, secs).then(res => {        
          item.Lavorazione = res.data;
          this.storage.set(this.ITEMS_KEY, this.items);
          return res;
      })
    } else {
      if(item.ID == undefined) {

      } else {
        let operation = new Operation();
        operation.name = Operation.LAVO;
        operation.body = {
          item: item,
          date: date,
          secs: secs
        }
        return this.sync.addOperation(operation);
      }
    }
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
