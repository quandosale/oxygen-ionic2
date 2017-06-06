import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

import { Api } from './api';

import { Item } from '../models/item';

@Injectable()
export class Items {
  private ITEMS_KEY: string = 'items';
  private items: Item[];

  constructor(public storage: Storage, public http: Http, public api: Api) {
    this.items = [];
    this.load();
  }

  query(params?: any) {
    return this.api.get('/items', params)
      .map(resp => resp.json());
  }

  load() {
    return this.storage.get(this.ITEMS_KEY).then(res => {
      this.items = res;
      if (res == null)
        this.items = [];
      console.log('load item', res);
      return this.items;
    })
  }

  add(item: Item) {
    console.log('add Item', item);
    this.items.push(item);
    return this.storage.set(this.ITEMS_KEY, this.items);
  }

  edit(item: Item) {
    var itemId = this.items.indexOf(item);
    this.items.splice(itemId, 1);
    this.items.splice(itemId, 0, item);
    return this.storage.set(this.ITEMS_KEY, this.items);
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
}
