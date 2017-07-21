import { Component } from '@angular/core';

@Component({
  selector: 'page-pdf-viewer',
  templateUrl: 'pdf-viewer.html'
})

export class PDFViewer {
  pdfSrc: string = 'https://vadimdez.github.io/ng2-pdf-viewer/pdf-test.pdf';
  page: number = 1;
}