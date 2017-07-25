import { Component, Input, OnInit } from '@angular/core';

/**
 * Component in charge of lazy load images and cache them
 */
@Component({
  selector: 'lazy-img',
  template: `
  <div text-center [ngClass]="{ 'placeholder': placeholderActive }">
    <img [inputSrc]="thumbnail" lazy-load (loaded)="placeholderActive = false" *ngIf="action"/>
    <img [inputSrc]="thumbnail" [imageViewer]="server_url + inputSrc.Url"  lazy-load (loaded)="placeholderActive = false" *ngIf="!action"/>
  </div>
  `
})
export class LazyImgComponent {

  @Input() inputSrc: any;
  @Input() isDocument: any;
  @Input() action: any = null;
  server_url: string = 'http://oxygen2.ilcarrozziere.it';

  public placeholderActive: boolean = true;
  thumbnail: string;

  constructor() {
  }
  ngOnInit() {
    if(this.isDocument) {
      if(!this.inputSrc.IsImage) 
        this.thumbnail = this.server_url + '/' + this.inputSrc.Url.replace('.pdf', '_thumb.jpg?height=300&width=300&mode=crop');
      else
        this.thumbnail = 'http://oxygen2.ilcarrozziere.it/' + this.inputSrc.Url + '?height=300&width=300&mode=crop';
      return;
    }
    this.thumbnail = `http://oxygen2.ilcarrozziere.it/Api/PraticaImmagineGet?ID=${this.inputSrc.ID}&width=300&&height=300&mode=crop&user=fabio&key=fabio`;
  }
}
