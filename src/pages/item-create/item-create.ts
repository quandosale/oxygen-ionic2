import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { LoadingController, Loading } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';

import { Items } from '../../providers/providers';
import { Item } from '../../models/item';


@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html'
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: Item;
  editMode: Boolean = false;
  loader: Loading;
  form: FormGroup;

  submittedTarga: Boolean = false;

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, formBuilder: FormBuilder, public camera: Camera, public items: Items) {
    this.form = formBuilder.group({
      Targa: ['', Validators.required],
      Marca: ['', Validators.required],
      Modello: ['', Validators.required],
      Nome: ['', Validators.required],
      Cognome: ['', Validators.required]
    });
    this.item = new Item();

    if (navParams.get('item')) {
      this.item = navParams.get('item');
      console.log(this.item);
      this.editMode = true;
    }

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewDidLoad() {

  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 96,
        targetHeight: 96
      }).then((data) => {
        this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + data });
      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {

      let imageData = (readerEvent.target as any).result;
      this.form.patchValue({ 'profilePic': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['profilePic'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss({ res: false });
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { return; }

    this.loader = this.loadingCtrl.create({
      content: "Saving..."
    });
    this.loader.present();
    if (!this.editMode) {
      this.items.add(this.item)
        .then(res => {
          this.loader.dismiss();
          console.log(res, 'added');
          this.viewCtrl.dismiss(res);
        });
    } else {
      this.items.edit(this.item).then(res => {
        this.loader.dismiss();
        this.viewCtrl.dismiss(res);
      })
    }
  }

  submitTarga() {
    if (this.item.Targa) {
      var targa = this.item.Targa;
      this.item = new Item();
      this.item.Targa = targa;
      
      this.loader = this.loadingCtrl.create({
        content: "New customer. I'm seeking in the master database"
      });
      this.loader.present();
      this.items.submitTarga(this.item.Targa).then(res => {
        if(res) {
          this.item.Marca = res.Marca || "";
          this.item.Modello = res.Modello || "";
          this.item.Cognome = res.Cognome || "";
          this.item.Nome = res.Nome || "";
        }
        this.loader.dismiss();
        this.submittedTarga = true;
      })
    }
  }
}
