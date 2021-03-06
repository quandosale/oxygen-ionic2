import { Items } from './items';
import { Sync } from './sync';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Platform } from 'ionic-angular';
import { Network } from '@ionic-native/network';

declare var navigator: any;
declare var Connection: any;

@Injectable()
export class NetState {

    _isConnected: Boolean = true;
    duplicateSync: Boolean = false;

    constructor(private sync: Sync, private network: Network, private platform: Platform) {
        console.log('connection');
        let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
            this._isConnected = false;
            console.log('network was disconnected :-(');
        });
        let connectSubscription = this.network.onConnect().subscribe(() => {
            this._isConnected = true;
            console.log('network connected!', this.network.type);

            if(this.duplicateSync) return;
            this.duplicateSync = true;
            let self = this;
            setTimeout(function() {
                self.duplicateSync = false;
            }, 10000);
            this.sync.syncOperation().then(res => {
                console.log('sync result', res);
            })
        });

    }

    isAvailable() {
        // this.platform.ready().then(() => {
        //     console.log(navigator.onLine);
        // });
        console.log(navigator.onLine, 'net status');
        return navigator.onLine;
    }
}
