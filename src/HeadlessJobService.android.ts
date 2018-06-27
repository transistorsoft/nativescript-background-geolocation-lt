import {BackgroundGeolocation} from "./background-geolocation";

@JavaProxy("com.transistorsoft.backgroundgeolocation.HeadlessJobService")
class HeadlessJobService extends android.app.job.JobService {
  public onStartJob(params:android.app.job.JobParameters):boolean {
    console.log('[BackgroundGeolocationHeadlessJobService] - onStartJob');
    let extras = params.getExtras();
    let event = extras.getString('event');
    let data = JSON.parse(extras.getString('params'));

    BackgroundGeolocation.invokeHeadlessTask({name: event, params: data}, () => {      
      this.jobFinished(params, false);
    });

    return true;
  }
  public onStopJob(params:android.app.job.JobParameters):boolean {
    this.jobFinished(params, false);
    return true;
  }
}

