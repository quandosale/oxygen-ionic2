import { Injectable, setTestabilityGetter } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

declare var navigator: any;

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
            var promisesForNewItem = [];
            var operationsForNewItem = [];

            let self = this;
            setTimeout(function () {
                if (!navigator.onLine)
                    return;
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
                    if (operation.name == Operation.LAVO) {
                        console.log(operation, 'Lavo operation');
                        if (operation.body.item.ID != undefined)
                            promises.push(self.api.postLovo(operation.body.item, operation.body.date, operation.body.secs));
                        else
                            operationsForNewItem.push(operation);
                    }
                    if (operation.name == Operation.FOTO) {
                        console.log(operation, 'Foto operation');
                        if (operation.body.item.ID != undefined)
                            promises.push(self.api.postPhoto(operation.body.item, operation.body.photo));
                        else
                            operationsForNewItem.push(operation);
                    }
                });
                console.log(operationsForNewItem, 'operationsForNewItem');
                Promise.all(promises).then(res => {
                    console.log(res, 'sync response for all operations');
                    var promisesForNewItems = [];
                    res.forEach(resObj => {
                        var data = resObj.data;
                        console.log(data);
                        operationsForNewItem.forEach(op => {
                            console.log(op);
                            if (data.created_at == op.body.item.created_at) {
                                op.body.item.ID = data.ID;
                                if (op.name == Operation.LAVO)
                                    promisesForNewItems.push(self.api.postLovo(op.body.item, op.body.date, op.body.secs));
                                if (op.name == Operation.FOTO)
                                    promisesForNewItems.push(self.api.postPhoto(op.body.item, op.body.photo));
                            }
                        });
                    });
                    self.storage.remove(self.SYNC_KEY);
                    console.log(operationsForNewItem, 'second sync for lavo is ready');
                    Promise.all(promisesForNewItems).then(res => {
                        self.setSynced(true);
                    }).catch(err => {
                        self.setSynced(true);
                    })
                }).catch(err => {
                    console.log(err, 'sync post error');
                    self.setSynced(true);
                });


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
