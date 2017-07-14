import { Operation, Sync } from './sync';
import { NetState } from './network';
import { variable } from '@angular/compiler/src/output/output_ast';
import { Settings } from './settings';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
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
  private actionSubject = new Subject<any>();
  private refreshSubject = new Subject<any>();
  private action: any = null;

  private ITEMS_KEY: string = 'items';
  private PHOTOS_KEY: string = 'photoes';
  public items: Array<Item[]> = [[], [], [], [], [], []];

  constructor(private sync: Sync, private connection: NetState, private file: File, public storage: Storage, public http: Http, public api: Api, public settings: Settings) {
    this.items = [];
  }

  query(params?: any) {
    return this.api.get('/items', params)
      .map(resp => resp.json());
  }

  load(statoID: number) {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        console.log(auth, 'auth');
        auth.statoID = statoID;
        return this.api.get('PraticaList', auth)
          .toPromise()
          .then(res => {
            let data = res.json().data;
            this.items[statoID]= data;
            this.storage.set(this.ITEMS_KEY, this.items);
            return data;
          })
          .catch(err => [])
      })
    } else {
      return this.storage.get(this.ITEMS_KEY).then(res => {
        console.log(res, 'offline');
        if (res == undefined || res == null)
          return [];
        this.items = res[statoID];
        return this.items;
      })
    }
  }

  add(item: any) {
    item.Targa = item.Targa.toUpperCase();
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
    item.Targa = item.Targa.toUpperCase();

    if (this.connection.isAvailable()) {
      this.storage.set(this.ITEMS_KEY, this.items);
      return this.api.postUpdateItem(item);
    } else {
      this.storage.set(this.ITEMS_KEY, this.items);
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
    if (this.connection.isAvailable()) {
      return this.api.postLovo(item, date, secs).then(res => {
        item.Lavorazione = res.data;
        this.storage.set(this.ITEMS_KEY, this.items);
        return res;
      })
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
    var practicaID = item.ID;
    if (this.connection.isAvailable()) {
      return this.api.postPhoto(item, photo).then(res => {
        this.storage.get(this.PHOTOS_KEY).then(photoesData => {
          if (photoesData == null || photoesData == undefined)
            photoesData = {};
          if (photoesData[practicaID] == undefined)
            photoesData[practicaID] = [];
          console.log(res, 'addphoto');
          res.data.forEach(photo => {
            photoesData[practicaID].push({
              ID: photo.ID,
              Url: photo.Url
            })
          });

          this.storage.set(this.PHOTOS_KEY, photoesData);
        })
        return res;
      });
    } else {
      let op = new Operation();
      op.name = Operation.FOTO;
      op.type = Operation.INSERT;
      op.body = {
        item: item,
        photo: photo
      };
      this.sync.addOperation(op);

      if (practicaID == undefined) practicaID = item.created_at;
      this.storage.get(this.PHOTOS_KEY).then(photoesData => {
        if (photoesData == null || photoesData == undefined)
          photoesData = {};
        if (photoesData[practicaID] == undefined)
          photoesData[practicaID] = [];
        photoesData[practicaID].push({
          Url: photo,
          local: true
        });

        this.storage.set(this.PHOTOS_KEY, photoesData);
      })
      return Promise.resolve({
        data: [{
          Url: photo,
          local: true
        }]
      })
    }
  }

  getPhotoes(practicaID) {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        var url = `http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineList?user=${auth.user}&key=${auth.key}&PraticaID=${practicaID}`;
        return $.post(url)
          .done(res => {
            this.storage.get(this.PHOTOS_KEY).then(photoesData => {
              if (photoesData == null || photoesData == undefined)
                photoesData = {};
              photoesData[practicaID] = res.data.map(photo => {
                return {
                  ID: photo.ID,
                  Url: photo.Url
                }
              });
              this.storage.set(this.PHOTOS_KEY, photoesData);
            })
            return res;
          })
          .fail(err => {
            console.log(err);
            return err;
          });
      })
    } else {
      return this.storage.get(this.PHOTOS_KEY).then(photoesData => {
        if (photoesData == undefined || photoesData == null)
          return { data: [] };
        let result;
        result = photoesData[practicaID] ? photoesData[practicaID] : [];
        return { data: result };
      })
    }
  }

  // delete(item: Item) {
  //   var itemId = this.items.indexOf(item);
  //   this.items.splice(itemId, 1);
  //   return this.storage.set(this.ITEMS_KEY, this.items);
  // }

  deleteAll() {
    this.items = [];
    return this.storage.set(this.ITEMS_KEY, this.items);
  }

  setSelectedPhotoes(photoesSelected) {
    this.selectedPhotoSubject.next(photoesSelected);
  }
  setAction(action) {
    this.actionSubject.next(action);
  }
  setRefresh() {
    this.refreshSubject.next(true);
  }

  selectedPhotoListner(): Observable<Array<any>> {
    this.selectedPhotoSubject = new Subject<Array<any>>();
    return this.selectedPhotoSubject.asObservable();
  }
  actionListner(): Observable<any> {
    this.actionSubject = new Subject<any>();
    return this.actionSubject.asObservable();
  }
  refreshListner(): Observable<any> {
    this.refreshSubject = new Subject<any>();
    return this.refreshSubject.asObservable();
  }

  unsubscribe() {
    this.selectedPhotoSubject.unsubscribe();
    this.actionSubject.unsubscribe();
    this.refreshSubject.unsubscribe();
  }
}
