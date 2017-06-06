import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';

@Component({
    selector: 'page-photo',
    templateUrl: 'photo.html'
})
export class PhotoPage {
    @ViewChild('fileInput') fileInput;
    check: Boolean = false;
    item: any;

    constructor(public navCtrl: NavController, navParams: NavParams, items: Items, private camera: Camera) {
        this.item = navParams.get('item');
        console.log(this.item);
    }

    fromGallery() {
        this.fileInput.nativeElement.click();
    }

    fromCamera() {
        const options: CameraOptions = {
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(options).then((imageData) => {
            // imageData is either a base64 encoded string or a file URI
            // If it's base64:
            let base64Image = 'data:image/jpeg;base64,' + imageData;
            this.item.photo.push(base64Image);
        }, (err) => {
            // Handle error
        });
    }

    processWebImage(event) {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
            let imageData = (readerEvent.target as any).result;
            this.item.photo.push(imageData);
        };

        reader.readAsDataURL(event.target.files[0]);
    }
    selectPhoto(i) {
        this.check = !this.check;
    }
}
