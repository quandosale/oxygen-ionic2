import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoadingController, Loading, } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';
declare var $: any;

@Component({
    selector: 'page-document',
    templateUrl: 'document.html'
})
export class DocumentPage {

    constructor() {
    }

    ngOnInit() {

    }
}
