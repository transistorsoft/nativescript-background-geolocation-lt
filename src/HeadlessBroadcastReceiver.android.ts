import {BackgroundGeolocation} from "./background-geolocation";

@JavaProxy("com.transistorsoft.backgroundgeolocation.HeadlessBroadcastReceiver")
class HeadlessBroadcastReceiver extends android.content.BroadcastReceiver {
  public onReceive(context:android.content.Context, intent:android.content.Intent) {
    let extras = intent.getExtras();
    let event = extras.getString("event");
    let params = JSON.parse(extras.getString("params"));
    
    BackgroundGeolocation.invokeHeadlessTask({name: event, params: params}, () => {
      // Do nothing for BroadcastReceiver.  This is only for JobService
    });
  }
}