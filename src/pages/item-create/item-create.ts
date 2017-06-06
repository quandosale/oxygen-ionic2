import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NavController, ViewController, NavParams } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';

import { Items } from '../../providers/providers';


@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html'
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: any;
  editMode: Boolean = false;

  form: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, formBuilder: FormBuilder, public camera: Camera, public items: Items) {
    this.form = formBuilder.group({
      targa: ['', Validators.required],
      marca: ['', Validators.required],
      modello: ['', Validators.required],
      nome: ['', Validators.required],
      cognome: ['', Validators.required]
    });
    this.item = {
      targa: '',
      marca: '',
      modello: '',
      nome: '',
      cognome: ''
    };
    if (navParams.get('item')) {
      this.item = navParams.get('item');
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
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { return; }
    if (!this.editMode) {
      this.item.photo = [];
      this.items.add(this.item).then(res => {
        this.viewCtrl.dismiss(this.form.value);
      });
    } else {
      this.items.edit(this.item).then(res => {
        this.viewCtrl.dismiss(this.form.value);
      })
    }
  }
}
