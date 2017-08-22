import { API_URL, SERVER_NAME } from '../../common';
import { Settings } from '../../../providers/settings';
import { Component, Input, OnInit } from '@angular/core';

/**
 * Component in charge of lazy load images and cache them
 */
@Component({
  selector: 'lazy-img',
  template: `
  <div text-center [ngClass]="{ 'placeholder': placeholderActive }">
    <img [inputSrc]="thumbnail" lazy-load (loaded)="placeholderActive = false" *ngIf="action"/>
    <img [inputSrc]="thumbnail" [imageViewer]="server_url + inputSrc.Url"  lazy-load (loaded)="placeholderActive = false" *ngIf="!action && thumbnailReady"/>
  </div>
  `
})
export class LazyImgComponent {

  @Input() inputSrc: any;
  @Input() isDocument: any;
  @Input() action: any = null;

  public placeholderActive: boolean = true;
  thumbnail: string;

  thumbnailReady: boolean = false;

  constructor(private settings: Settings) {
  }
  ngOnInit() {
    if (this.isDocument) {
      this.thumbnailReady = true;
      if (!this.inputSrc.IsImage) {
        this.thumbnail = SERVER_NAME +  this.inputSrc.Url.replace('.pdf', '_thumb.jpg?height=200&width=200&mode=crop');
      }
      else
        this.thumbnail = SERVER_NAME + this.inputSrc.Url + '?height=200&width=200&mode=crop';
    } else {
      this.settings.getAuth().then(auth => {
        this.thumbnail = API_URL + `PraticaImmagineGetThumb?ID=${this.inputSrc.ID}&width=200&&height=200&mode=crop&user=${auth.user}&key=${auth.key}`;
        this.thumbnailReady = true;
      })
    }
  }
}
