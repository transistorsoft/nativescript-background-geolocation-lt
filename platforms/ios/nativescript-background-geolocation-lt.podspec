Pod::Spec.new do |s|
  s.name = "nativescript-background-geolocation-lt"
  s.version = "1.0.0"
  s.summary = "Background Geolocation for NativeScript"
  s.author = 'Chris Scott, Transistor Software'
  s.homepage = "https://github.com/transistorsoft/nativescript-background-geolocation-lt"
  s.platform = :ios, '8.0'
  s.libraries = 'sqlite3'
  s.vendored_frameworks = 'platforms/ios/TSLocationManager.framework'
end
