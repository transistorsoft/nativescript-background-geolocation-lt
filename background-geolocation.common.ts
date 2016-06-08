import * as app from 'application';

export class AbstractBackgroundGeolocation {
  protected listeners: any;
  protected locationManager: any;
  protected state: any;
  protected enabled: boolean;
  protected isMoving: boolean;

  constructor() {
    this.listeners = {
      location: [],
      http: [],
      motionchange: []
    };
  }
}
