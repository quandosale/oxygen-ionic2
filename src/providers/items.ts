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
  private selectedDocumentSubject = new Subject<Array<any>>();
  private selected: Number = 0;
  private actionSubject = new Subject<any>();
  private refreshSubject = new Subject<any>();
  private action: any = null;

  private ITEMS_KEY: string = 'items';
  private PHOTOS_KEY: string = 'photoes';
  private DOCUMENTS_KEY: string = 'documents';
  public items: Array<Item[]> = [[], [], [], [], [], []];
  public totalTime: any = {};

  constructor(private sync: Sync, private connection: NetState, private file: File, public storage: Storage, public http: Http, public api: Api, public settings: Settings) {
    this.items = [[], [], [], [], [], []];
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
            this.items[statoID] = data;
            this.storage.set(this.ITEMS_KEY, this.items);
            if (statoID == 4) {
              return this._loadTotalTime(this.items[statoID], auth).then(res => data);
            }
            else
              return data;
          })
          .catch(err => [])
      })
    } else {
      return this.storage.get(this.ITEMS_KEY).then(res => {
        console.log(res, 'offline');
        if (res == undefined || res == null) {
          this.items = [[], [], [], [], [], []];
          return [];
        }
        this.items = res;
        if (!this.items[statoID])
          this.items[statoID] = [];
        return this.items[statoID];
      })
    }
  }

  _loadTotalTime(items: Array<Item>, auth) {
    var promises = [];
    items.forEach(item => {
      auth.LavorazioneID = item.Lavorazione.ID;
      promises.push(
        this.api.get('MarcaturaList', auth).toPromise()
      )
    });
    return Promise.all(promises).then(res => {
      var marcaList = res.map(x => x.json().data).filter(e => e.length != 0);
      marcaList.forEach(marca => {
        this.totalTime[marca[0].LavorazioneID] = 0;
        marca.forEach(element => {
          this.totalTime[marca[0].LavorazioneID] += element.TempoTotale;
        });
      });
      return true;
    })
  }

  searchItem(keyword: string) {
    if(this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        auth.RicercaLibera = keyword;
        return this.api.get('PraticaList', auth)
          .toPromise()
          .then(res => {
            let data = res.json().data;
            return data;
          })
      })
    }
  }

  add(item: any) {
    item.Targa = item.Targa.toUpperCase();
    if (this.connection.isAvailable()) {
      return this.api.postInsertItem(item).then(res => {
        if (!this.items[1]) this.items[1] = [];

        this.items[1].unshift(item);
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

      if (!this.items[1]) this.items[1] = [];

      this.items[1].unshift(item);
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

  MarcaturaInsert(item: any, startDate: Date, endDate: Date) {
    console.log(this.totalTime[item.Lavorazione.ID]);
    this.totalTime[item.Lavorazione.ID] += (endDate.getTime() - startDate.getTime());
    console.log(this.totalTime[item.Lavorazione.ID]);
    if (this.connection.isAvailable()) {
      return this.api.MarcaturaInsert(item, startDate, endDate).then(res => {
        console.log(res, "MarcaturaInsert");
        return res;
      })
    } else {
      let operation = new Operation();
      operation.name = Operation.MARCATURA;
      operation.body = {
        item: item,
        startDate: startDate,
        endDate: endDate
      }
      return this.sync.addOperation(operation);
    }
  }


  MarcaturaList(item: any) {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        console.log(auth, 'auth');
        auth.LavorazioneID = item.Lavorazione.ID;
        return this.api.get('MarcaturaList', auth)
          .toPromise()
          .then(res => {
            let data = res.json().data;
            console.log(data);
            return data;
          })
          .catch(err => [])
      })
    } else {
      // return this.storage.get(this.ITEMS_KEY).then(res => {
      //   console.log(res, 'offline');
      //   if (res == undefined || res == null)
      //     return [];
      //   this.items = res[statoID];
      //   return this.items;
      // })
    }
  }

  submitTarga(targa: String) {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        auth.targa = targa;
        return this.api.get("VeicoloAnagraficaList", auth)
          .toPromise()
          .then(res => {
            let data = res.json().data;
            if (data.length != 0)
              return data[0];
            else {
              auth.tipoVeicolo = 1;
              return this.api.get('TargaGet', auth)
                .toPromise()
                .then(res => {
                  var data = JSON.parse(res.json().message);
                  
                  return {
                    Marca: data.nome_marca,
                    Modello: data.nome_modello
                  };
                })
            }
          })
      })
    } else {
      return Promise.resolve(false);
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

  

  deleteDocument(photoes: Array<any>) {
    return this.settings.getAuth().then(auth => {
      let promises = [];
      photoes.forEach(photoID => {
        let data = {
          user: auth.user,
          key: auth.key,
          ID: photoID
        };
        let promise = $.post("http://oxygen2.ilcarrozziere.it/Api/PraticaDocumentoRemove", data)
          .done(res => res).fail(err => err);
        promises.push(promise);
      });
      return Promise.all(promises);
    });
  }

  addDocument(item: any, document: any) {
    var practicaID = item.ID;
    if (this.connection.isAvailable()) {
      return this.api.postDocument(item, document).then(res => {
        this.storage.get(this.PHOTOS_KEY).then(documentsData => {
          if (documentsData == null || documentsData == undefined)
            documentsData = {};
          if (documentsData[practicaID] == undefined)
            documentsData[practicaID] = [];
          console.log(res, 'addDocument');
          res.data.forEach(photo => {
            documentsData[practicaID].push({
              ID: photo.ID,
              Url: photo.Url
            })
          });

          this.storage.set(this.DOCUMENTS_KEY, documentsData);
        })
        return res;
      });
    } else {
      let op = new Operation();
      op.name = Operation.DOCUMENT;
      op.type = Operation.INSERT;
      op.body = {
        item: item,
        document: document
      };
      this.sync.addOperation(op);

      if (practicaID == undefined) practicaID = item.created_at;
      this.storage.get(this.PHOTOS_KEY).then(documentsData => {
        if (documentsData == null || documentsData == undefined)
          documentsData = {};
        if (documentsData[practicaID] == undefined)
          documentsData[practicaID] = [];
        documentsData[practicaID].push({
          Url: document,
          local: true
        });

        this.storage.set(this.DOCUMENTS_KEY, documentsData);
      })
      return Promise.resolve({
        data: [{
          Url: document,
          local: true
        }]
      })
    }
  }

  getDocuments(practicaID) {
    if (this.connection.isAvailable()) {
      return this.settings.getAuth().then(auth => {
        var url = `http://oxygen2.ilcarrozziere.it/Api/PraticaDocumentoList?user=${auth.user}&key=${auth.key}&PraticaID=${practicaID}`;
        return $.post(url)
          .done(res => {
            console.log(res, 'document');
            this.storage.get(this.DOCUMENTS_KEY).then(documentsData => {
              if (documentsData == null || documentsData == undefined)
                documentsData = {};
              documentsData[practicaID] = res.data.map(document => {
                return {
                  ID: document.ID,
                  Url: document.Url,
                  IsImage: document.IsImage
                }
              });
              this.storage.set(this.DOCUMENTS_KEY, documentsData);
            })
            return res;
          })
          .fail(err => {
            console.log(err);
            return err;
          });
      })
    } else {
      return this.storage.get(this.DOCUMENTS_KEY).then(documentsData => {
        if (documentsData == undefined || documentsData == null)
          return { data: [] };
        let result;
        result = documentsData[practicaID] ? documentsData[practicaID] : [];
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
  setSelectedDocuments(documentsSelected) {
    this.selectedDocumentSubject.next(documentsSelected);
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
  selectedDocumentListner(): Observable<Array<any>> {
    this.selectedDocumentSubject = new Subject<Array<any>>();
    return this.selectedDocumentSubject.asObservable();
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
    this.selectedDocumentSubject.unsubscribe();
    this.actionSubject.unsubscribe();
    this.refreshSubject.unsubscribe();
  }
}
