import { Injectable, setTestabilityGetter } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Sync {
    SYNC_KEY: string = "Sync";
    private syncSubject = new Subject<boolean>();

    constructor(public storage: Storage, public http: Http, public api: Api) {
    }

    addOperation(op: Operation) {
        return this.storage.get(this.SYNC_KEY).then(ops => {
            if (ops == null || ops == undefined)
                ops = [];
            ops.push(op);
            console.log(ops, 'insertOperation');
            return this.storage.set(this.SYNC_KEY, ops);
        })
    }

    updateOperation(id: any, body: any) {
        return this.storage.get(this.SYNC_KEY).then(ops => {
            if (ops == null || ops == undefined)
                return;
            ops.forEach(op => {
                if (op.id == id) {
                    op.body = body;
                }
            });
            console.log(ops, 'updateOperation');
            return this.storage.set(this.SYNC_KEY, ops);
        })
    }

    syncOperation() {
        console.log('syncoperation');
        return this.storage.get(this.SYNC_KEY).then(ops => {
            console.log(ops, 'Operations to be synced');
            if (ops == null || ops == undefined)
                return false;

            var promises = [];

            let self = this;
            setTimeout(function () {
                ops.forEach(operation => {
                    if (operation.name == Operation.PRACTICA) {
                        if (operation.type == Operation.INSERT) {
                            console.log(operation, 'Practica Insert');
                            promises.push(self.api.postInsertItem(operation.body));
                        }
                        if (operation.type == Operation.UPDATE) {
                            console.log(operation, 'Practica Update');
                            promises.push(self.api.postUpdateItem(operation.body));
                        }
                    }
                    if(operation.name == Operation.LAVO) {
                        console.log(operation, 'Lavo operation');
                        promises.push(self.api.postLovo(operation.item, operation.date, operation.secs));
                    }
                });

                Promise.all(promises).then(res => {
                    console.log(res, 'sync response for all operations');
                    self.setSynced(true);
                }).catch(err => {
                    console.log(err, 'sync post error');
                    self.setSynced(true);
                });

                self.storage.remove(self.SYNC_KEY);

            }, 10000);

            return true;
        })
    }

    setSynced(val) {
        this.syncSubject.next(val);
    }

    syncListner(): Observable<boolean> {
        this.syncSubject = new Subject<boolean>();
        return this.syncSubject.asObservable();
    }

    unsubscribe() {
        this.syncSubject.unsubscribe();
    }
}

export class Operation {
    static PRACTICA: String = "Practica";
    static LAVO: String = "Lavo";
    static FOTO: String = "Foto";

    static INSERT: String = "insert";
    static UPDATE: String = "update";

    id: any;
    name: String;
    type: String;
    body: any;
}
