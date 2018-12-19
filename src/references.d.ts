/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />

declare module android {
  module app {
    export module job {
      export class JobService extends android.app.Service {
        public onStartJob(params:android.app.job.JobParameters):boolean;
        public onStopJob(params:android.app.job.JobParameters):boolean;
        public jobFinished(params:android.app.job.JobParameters, wantsReschedule:boolean);
      }
      export class JobParameters {
        public getExtras():android.os.PersistableBundle;
      }
    }
  }
  module os {
    export class PersistableBundle extends java.lang.Object implements android.os.Parcelable, java.lang.Cloneable {
      public getString(key: string): string;
      public describeContents(): number;
      public writeToParcel(parcel: android.os.Parcel, flags: number): void;
    }
  }
}