import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class TimerManager {
    timerList: any;

    constructor() {
        this.timerList = {};
    }

    newTimer(lavoID: number) {
        var timer = new Timer(lavoID);
        this.timerList[lavoID] = timer;
    }

    getTimerByLavoID(lavoID: number): Timer {
        return this.timerList[lavoID];
    }

    getTimerList(): any {
        return this.timerList;
    }

    remove(lavoID: number) {
        delete this.timerList[lavoID];
    }

    removeAll() {
        this.timerList = {};
    }

    pause(lavoID: number) {
        this.timerList[lavoID].state = Timer.PASUED;
        var timeToInc = new Date().getTime() - this.timerList[lavoID].startTime.getTime();
        this.timerList[lavoID].totalTime += timeToInc;
    }

    play(lavoID: number) {
        if(!this.timerList[lavoID]) 
            this.timerList[lavoID] = new Timer(lavoID);

        this.timerList[lavoID].state = Timer.PLAYING;
        this.timerList[lavoID].startTime = new Date();
    }

    getTotalTime(lavoID: number): number {
        if(!this.timerList[lavoID])
            return 0;
        if(this.timerList[lavoID].state == Timer.PASUED)
            return this.timerList[lavoID].totalTime;
        var timeToInc = new Date().getTime() - this.timerList[lavoID].startTime.getTime();
        return timeToInc + this.timerList[lavoID].totalTime;
    }

    // Returns the total elapsed time
    stop(lavoID: number): number {
        var res;
        var timeToInc = new Date().getTime() - this.timerList[lavoID].startTime.getTime();
        res = this.timerList[lavoID].totalTime + timeToInc;
        
        delete this.timerList[lavoID];
        return res;
    }
}

export class Timer {
    static PASUED: number = 0;
    static PLAYING: number = 1;
    static STOPPED: number = 2;

    constructor(lavoID: number) {
        this.LavorazioneID = lavoID;
        this.startTime = new Date();
        this.state = Timer.PLAYING;
        this.totalTime = 0;
    }

    public LavorazioneID: number;
    public startTime: Date;
    public totalTime: number;
    public state: number;
}