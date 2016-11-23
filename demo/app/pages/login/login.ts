var frameModule = require("ui/frame");

exports.onLoaded = function(args) {

    var nav = {
        moduleName: "pages/map/map-page",
        clearHistory: true,
        transition: {
            name: "fade",
            duration: 1000,
            curve: "easeIn"
        }
    };
    console.log('------------ LoginPage redirecting ---------------');
    setTimeout(function() {
        frameModule.topmost().navigate(nav);
    }, 1000);
}