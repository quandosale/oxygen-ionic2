import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoadingController, Loading, } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';

declare var $: any;

@Component({
    selector: 'page-photo',
    templateUrl: 'photo.html'
})
export class PhotoPage {
    url: any;
    @ViewChild('fileInput') fileInput;
    selectedPhotoes: Array<any>;
    check: Array<any>;
    item: any;
    loader: Loading;
    photoes: Array<any> = [];
    server_url: string = 'http://oxygen2.ilcarrozziere.it';

    constructor(public loadingCtrl: LoadingController, private imagePicker: ImagePicker, public navCtrl: NavController, private navParams: NavParams, private items: Items, private camera: Camera) {
        this.item = navParams.get('item');
        console.log(this.item);
    }

    ngOnInit() {
        this.check = [];
        this.selectedPhotoes = [];
        this.loader = this.loadingCtrl.create({
            content: "Loading..."
        });
        this.loader.present();
        this.items.getPhotoes(this.item.ID).then(res => {
            this.loader.dismiss();
            this.photoes = res.data;

            console.log(res, 'getPhotoes result');
            this.photoes.map(photo => {
                photo.Url = photo.Url.replace(/\\/g, '/');
                this.check.push(false);
            })
        }).catch(err => {
            console.log(err);
            this.loader.dismiss();
        });
    }

    fromGallery() {
        this.imagePicker.getPictures({
            maximumImagesCount: 1
        }).then((results) => {
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI1: ' + results[i]);
                this.loader = this.loadingCtrl.create({
                    content: "Saving..."
                });
                this.loader.present();
                this.items.addPhoto(this.item, results[i]).then(res => {
                    console.log(res);
                    let newPhoto = res.data[0];
                    newPhoto.Url.replace(/\\/g, '/');
                    this.photoes.push(newPhoto);
                    this.loader.dismiss();
                }).catch((err) => {
                    this.loader.dismiss();
                });
            }
        }, (err) => { });

        // this.fileInput.nativeElement.click();
    }

    fromCamera() {
        const options: CameraOptions = {
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(options).then((imageData) => {
            this.loader = this.loadingCtrl.create({
                content: "Saving..."
            });
            this.loader.present();
            this.items.addPhoto(this.item, imageData).then(res => {
                console.log(res);
                let newPhoto = res.data[0];
                newPhoto.Url.replace(/\\/g, '/');
                console.log(newPhoto, 'addPhoto');
                this.photoes.push(newPhoto);
                console.log(this.photoes);
                this.loader.dismiss();
            }).catch((err) => {
                this.loader.dismiss();
            });
            // imageData is either a base64 encoded string or a file URI
            // If it's base64:
            // console.log(imageData);
            // let base64Image = 'data:image/jpeg;base64,' + imageData;
            // if (this.item.photo == undefined)
            //     this.item.photo = [];
            // this.item.photo.push(base64Image);

        }, (err) => {
            // Handle error
        });
    }

    processWebImage(event) {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {
            console.log(event.target.files[0], 'processWebImage');
            this.items.addPhoto(this.item, event.target.files[0]);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    selectPhoto(photo, i) {
        this.check[i] = !this.check[i];
        if (this.check[i]) {
            this.selectedPhotoes.push(photo.ID);
        } else {
            this.selectedPhotoes.splice(this.selectedPhotoes.indexOf(photo.ID), 1);
        }
        this.items.setSelectedPhotoes(this.selectedPhotoes);
    }
    refresh() {
        this.check = [];
        console.log(this.selectedPhotoes, this.photoes);
        this.selectedPhotoes.forEach(selID => {
            var i = 0;
            this.photoes.forEach(photo => {
                this.check.push(false);
                if (selID == photo.ID) {
                    this.check.splice(0, 1);
                    this.photoes.splice(i, 1)
                }
                i++;
            })
        })
        this.selectedPhotoes = [];
        this.items.setSelectedPhotoes(this.selectedPhotoes);
    }
}
