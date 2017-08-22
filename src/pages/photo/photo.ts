import { API_URL } from '../../global/common';
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoadingController, Loading, } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';
import { PhotoViewer } from '@ionic-native/photo-viewer';
declare var $: any;

@Component({
    selector: 'page-photo',
    templateUrl: 'photo.html'
})
export class PhotoPage {
    url: any;
    @ViewChild('fileInput') fileInput;
    action: any = null;
    selectedPhotoes: Array<any>;
    check: Array<any>;
    item: any;
    loader: Loading;
    photoes: Array<any> = [];
    server_url: string = API_URL;

    constructor(private photoViewer: PhotoViewer, public loadingCtrl: LoadingController, private imagePicker: ImagePicker, public navCtrl: NavController, private navParams: NavParams, private items: Items, private camera: Camera) {
        this.item = navParams.get('item');
        console.log(this.item);
        this.items.actionListner().subscribe(res => {
            this.action = res;
        })
        this.items.refreshListner().subscribe((res) => { console.log('refreshListner'); this.refresh() })
    }

    ngOnInit() {
        this.check = [];
        this.selectedPhotoes = [];
        this.loader = this.loadingCtrl.create({
            content: "Loading..."
        });
        this.loader.present();
        let id = this.item.ID;
        if (id == undefined) id = this.item.created_at;
        this.items.getPhotoes(id).then(res => {
            this.loader.dismiss();
            this.photoes = res.data;

            console.log(res, 'getPhotoes result');
            this.photoes.map(photo => {
                photo.Url = photo.Url.replace(/\\/g, '/');
                this.check.push(false);
            })
            console.log($('.local-image'), 'asdf');
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
                    this.photoes.unshift(newPhoto);
                    this.loader.dismiss();
                }).catch((err) => {
                    this.loader.dismiss();
                });
            }
        }, (err) => { });
    }

    fromCamera() {
        const options: CameraOptions = {
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            quality: 60,
            targetWidth:720,
            correctOrientation: true
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
                this.photoes.unshift(newPhoto);
                console.log(this.photoes);
                this.loader.dismiss();
            }).catch((err) => {
                this.loader.dismiss();
            });
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
        console.log('refresh');
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
}
