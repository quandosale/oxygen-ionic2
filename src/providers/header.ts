import { Headers } from '@angular/http';

export const contentHeaders = new Headers();

contentHeaders.append('Content-Type', 'form/multipart');
contentHeaders.append('Access-Control-Allow-Origin', '*');