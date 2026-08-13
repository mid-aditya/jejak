// react-native-background-geolocation requires the transistorsoft tslocationmanager 3.x
// artifact which is no longer available on any public Maven repository (JCenter/Bintray
// is sunset, and 4.x is API-incompatible with this module version).
//
// The app already handles the module being unavailable (location.service.ts wraps
// BackgroundGeolocation.ready() in a try/catch and falls back to the standard
// Geolocation API), and the JS side is stubbed in the module's NativeModule.js.
// Excluding it from autolinking keeps the Android build resolvable without changing
// app behavior. Re-enable once a license + compatible tslocationmanager are available.
module.exports = {
  dependencies: {
    'react-native-background-geolocation': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
