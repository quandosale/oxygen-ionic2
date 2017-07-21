import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Settings } from './settings';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { Device } from '@ionic-native/device';
declare var $: any;
/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'http://oxygen2.ilcarrozziere.it/Api';

  constructor(public http: Http, public settings: Settings, private transfer: Transfer, private device: Device) {
  }

  get(endpoint: string, params?: any, options?: RequestOptions) {
    if (!options) {
      options = new RequestOptions();
    }

    // Support easy query params for GET requests
    if (params) {
      let p = new URLSearchParams();
      for (let k in params) {
        p.set(k, params[k]);
      }
      // Set the search field if we have params and don't already have
      // a search field set in options.
      options.search = !options.search && p || options.search;
    }

    return this.http.get(this.url + '/' + endpoint, options);
  }

  post(endpoint: string, body: any, options?: RequestOptions) {
    console.log(body);
    return this.http.post(this.url + '/' + endpoint, body, options);
  }

  put(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }

  delete(endpoint: string, options?: RequestOptions) {
    return this.http.delete(this.url + '/' + endpoint, options);
  }

  patch(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put(this.url + '/' + endpoint, body, options);
  }


  postInsertItem(item) {
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
  }
  postUpdateItem(item) {
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
  }

  postLovo(item: any, date: Date, secs: Number) {
    console.log(item.ID, 'postLovo')
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

  MarcaturaInsert(item: any, startDate: Date, endDate: Date) {
    var uuid = this.device.uuid || "unknown";
    console.log(uuid, 'uuid');
    return this.settings.getAuth().then(auth => {
      var url = "http://oxygen2.ilcarrozziere.it/Api/MarcaturaInsert";
      var data = {
        user: auth.user,
        key: auth.key,
        LavorazioneID: item.Lavorazione.ID,
        DataFine: endDate.toISOString(),
        DataInizio: startDate.toISOString(),
        DeviceID: uuid,
        Operatore: auth.user
      }
      return $.post(url, data)
        .done(res => {
          return res
        })
        .fail(err => {
          console.log(err);
          return err;
        })
    })
  }

  postPhoto(item, photo) {
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
    })
  }

  postDocument(item, document) {
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
      console.log(document);
      return fileTransfer.upload(document, 'http://oxygen2.ilcarrozziere.it/Api/PraticaDocumentoAdd', options)
        .then((data) => {
          return JSON.parse(data.response);
        }, (err) => {
          console.log(err);
          return err;
        })
    })
  }
}
