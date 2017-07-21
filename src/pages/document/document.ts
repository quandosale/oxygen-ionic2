import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoadingController, Loading, } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { ListMasterPage } from '../list-master/list-master';
import { Items } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { PhotoViewer } from '@ionic-native/photo-viewer';
declare var $: any;

@Component({
    selector: 'page-document',
    templateUrl: 'document.html'
})
export class DocumentPage {
    url: any;
    @ViewChild('fileInput') fileInput;
    action: any = null;
    selectedDocuments: Array<any>;
    check: Array<any>;
    item: any;
    loader: Loading;
    documents: Array<any> = [];
    server_url: string = 'http://oxygen2.ilcarrozziere.it';

    constructor(private iab: InAppBrowser, private documentViewer: PhotoViewer, public loadingCtrl: LoadingController, private imagePicker: ImagePicker, public navCtrl: NavController, private navParams: NavParams, private items: Items, private camera: Camera) {
        this.item = navParams.get('item');
        console.log(this.item);
        this.items.actionListner().subscribe(res => {
            this.action = res;
        })
        this.items.refreshListner().subscribe((res) => { console.log('refreshListner'); this.refresh() })
    }

    ngOnInit() {
        this.check = [];
        this.selectedDocuments = [];
        this.loader = this.loadingCtrl.create({
            content: "Loading..."
        });
        this.loader.present();
        let id = this.item.ID;
        if (id == undefined) id = this.item.created_at;
        this.items.getDocuments(id).then(res => {
            this.loader.dismiss();
            this.documents = res.data;

            console.log(res, 'getDocuments result');
            this.documents.map(document => {
                document.Url = document.Url.replace(/\\/g, '/');
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
                this.items.addDocument(this.item, results[i]).then(res => {
                    console.log(res);
                    let newDocument = res.data[0];
                    newDocument.Url.replace(/\\/g, '/');
                    this.documents.unshift(newDocument);
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
            this.items.addDocument(this.item, imageData).then(res => {
                console.log(res);
                let newDocument = res.data[0];
                newDocument.Url.replace(/\\/g, '/');
                console.log(newDocument, 'addDocument');
                this.documents.unshift(newDocument);
                console.log(this.documents);
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
            this.items.addDocument(this.item, event.target.files[0]);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    selectDocument(document, i) {
        if(!document.IsImage) return;
        this.check[i] = !this.check[i];
        if (this.check[i]) {
            this.selectedDocuments.push(document.ID);
        } else {
            this.selectedDocuments.splice(this.selectedDocuments.indexOf(document.ID), 1);
        }
        this.items.setSelectedDocuments(this.selectedDocuments);
    }
    refresh() {
        this.check = [];
        console.log('refresh');
        this.selectedDocuments.forEach(selID => {
            var i = 0;
            this.documents.forEach(document => {
                this.check.push(false);
                if (selID == document.ID) {
                    this.check.splice(0, 1);
                    this.documents.splice(i, 1)
                }
                i++;
            })
        })
        this.selectedDocuments = [];
        this.items.setSelectedDocuments(this.selectedDocuments);

        this.items.getDocuments(this.item.ID).then(res => {
            this.loader.dismiss();
            this.documents = res.data;

            console.log(res, 'getDocuments result');
            this.documents.map(document => {
                document.Url = document.Url.replace(/\\/g, '/');
                this.check.push(false);
            })
        }).catch(err => {
            console.log(err);
            this.loader.dismiss();
        });
    }
    openPDF(url) {
        const browser = this.iab.create('http://oxygen2.ilcarrozziere.it//_Private/Pratica\\96\\Documenti\\191\\R8mi.pdf');
        browser.show();
    }
}
