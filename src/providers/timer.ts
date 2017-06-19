import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class Timer {

    private counterSubject = new Subject<Number>();
    private timer;

    constructor() {
    }

    timerListner(): Observable<Number> {
        this.resetCounter();
        this.counterSubject = new Subject<Number>();
        return this.counterSubject.asObservable();
    }

    unsubscribe() {
        clearInterval(this.timer);
        console.log('unsubscribe');
        this.counterSubject.unsubscribe();
    }

    start() {
        localStorage.setItem('timer_working', '1');
        let self = this;
        this.timer = setInterval(function () {
            self.incCounter();
            self.counterSubject.next(self.getCounter());
        }, 1000);
    }

    pause() {
        clearInterval(this.timer);
    }

    stop() {
        localStorage.setItem('timer_working', '0');
        clearInterval(this.timer);
        this.resetCounter();
        this.counterSubject.next(this.getCounter());
    }

    resetCounter() {
        localStorage.setItem('counter', '0');
    }

    incCounter() {
        let counter = localStorage.getItem('counter');
        let newVal = +counter + 1;
        localStorage.setItem('counter', '' + newVal);
    }

    getCounter() {
        return +localStorage.getItem('counter');
    }
}
