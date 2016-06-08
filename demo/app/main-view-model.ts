import observable = require("data/observable");
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";

require("globals");

export class HelloWorldModel extends observable.Observable {

    private _counter: number;
    private _message: string;
    private _bgGeo: BackgroundGeolocation;
    private _state: any;
    private _enabled: boolean;
    private _isMoving: boolean;
    private _locationData: string = "DEFAULT";
    get message(): string {
        return this._message;
    }
    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange("message", value)
        }
    }
    set locationData(value: string) {
        if (this._locationData !== value) {
            this._locationData = value;
            this.notifyPropertyChange("locationData", value);
        }        
    }
    get locationData(): string {
        return this._locationData;
    }
    constructor() {
        super();
        this._bgGeo = new BackgroundGeolocation();
        this.locationData = "START";

        this._bgGeo.on('location', this.onLocation, this);

        this._state = this._bgGeo.configure({
           debug: true,
           desiredAccuracy: 0,
           stationaryRadius: 25,
           distanceFilter: 50,
           activityRecognitionInterval: 10000,
           url: 'http://localhost:8080/locations',
           autoSync: true
        });

        this._enabled = this._state.enabled;
        this._isMoving = this._state.isMoving;

        // Initialize default values.
        this._counter = 42;
        this.updateMessage();
    }

    public onToggleEnabled() {
        this._enabled = !this._enabled;
        if (this._enabled) {
            this._bgGeo.start();
        } else {
            this._bgGeo.stop();
        }
    }

    public onChangePace() {
        this._isMoving = !this._isMoving;
        this._bgGeo.changePace(this._isMoving);
    }

    public onGetCurrentPosition() {
        console.log('getCurrentPosition');

    }
    private updateMessage() {
        if (this._counter <= 0) {
            this.message = "Hoorraaay! You unlocked the NativeScript clicker achievement!";
        } else {
            this.message = this._counter + " taps left";
        }
    }

    public onTap() {
        this._counter--;
        this.updateMessage();
    }

    private onLocation(location:any) {
        console.log('---------------- location: ', location);

        this.locationData = JSON.stringify(location, null, 2);


    }
}