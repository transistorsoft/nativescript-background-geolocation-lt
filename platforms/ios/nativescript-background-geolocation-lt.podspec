Pod::Spec.new do |s|
  s.name = "nativescript-background-geolocation-lt"
  s.version = "1.0.1"
  s.summary = "Background Geolocation for NativeScript"
  s.author = "Chris Scott, Transistor Software"
  s.homepage = "https://github.com/transistorsoft/nativescript-background-geolocation-lt"
  s.platform = :ios, "8.0"
  s.libraries = 'sqlite3', 'z'
  s.vendored_frameworks = "TSLocationManager.framework"
  s.license = {:type => "MIT"}
  s.source = { :path => "../../node_modules/nativescript-background-geolocation-lt/platforms/ios" }
  s.dependency "CocoaLumberjack", "~> 3.0.0"
end
