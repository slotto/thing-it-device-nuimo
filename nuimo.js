module.exports = {
    metadata: {
        family: 'nuimo',
        plugin: 'nuimo',
        label: 'Nuimo Device',
        manufacturer: '',
        discoverable: true,
        additionalSoftware: [],
        actorTypes: [],
        sensorTypes: [],
        services: [],
        events: [
            {
                id: "swipeleft",
                label: "Swipe Left"
            }, {
                id: "swiperight",
                label: "Swipe Right"
            }, {
                id: "swipeup",
                label: "Swipe Up"
            }, {
                id: "swipedown",
                label: "Swipe Down"
            }, {
                id: "touchleft",
                label: "Touch left"
            }, {
                id: "touchright",
                label: "Touch Right"
            }, {
                id: "touchtop",
                label: "Touch Up"
            }, {
                id: "touchbottom",
                label: "Touch Bottom"
            }, {
                id: "flyleft",
                label: "Fly Left"
            }, {
                id: "flyright",
                label: "Fly Right"
            }

        ],
        state: [
            {
                id: "initialized", label: "Initialized",
                type: {
                    id: "boolean"
                }
            }, {
                id: "uuid", label: "UUID",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                id: "batteryLevel", label: "Battery Level",
                type: {
                    id: "integer"
                },
                defaultValue: "100"
            }, {
                id: "rssi", label: "Signal strength",
                type: {
                    id: "integer"
                },
                defaultValue: "-100"
            }, {
                id: "button", label: "Button",
                type: {
                    id: "boolean"
                }
            }, {
                id: "rotate", label: "Rotate",
                type: {
                    id: "integer"
                },
                defaultValue: "0"
            }, {
                id: "distance", label: "Distance",
                type: {
                    id: "integer"
                },
                defaultValue: "0"
            }, {}
        ],
        configuration: [
            {
                id: "rotationSpeed",
                label: "Rotation Speed",
                type: {
                    id: "integer"
                },
                defaultValue: "0"
            }
        ]
    },
    create: function () {
        return new Nuimo();
    }
    ,
    discovery: function () {
        return new NuimoDiscovery();
    }
}
;

var q = require('q');
var NuimoDevice;
var welcomeMessage = [
    1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1
];

/**
 *
 * @constructor
 */

//TODO IMPLEMENT
function NuimoDiscovery() {
    /**
     *
     * @param options
     */
    NuimoDiscovery.prototype.start = function () {
        this.objects = [];

        if (this.node.isSimulated()) {
            this.timer = setInterval(function () {
            }.bind(this), 20000);
        } else {
            this.logLevel = 'debug';
        }
    };

    /**
     *
     * @param options
     */
    NuimoDiscovery.prototype.stop = function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
    };
}


/**
 *
 * @constructor
 */
function Nuimo() {
    /**
     *
     */



    Nuimo.prototype.start = function () {
        var deferred = q.defer();

        this.logLevel = 'debug';
        this.state.rotate = 0;

        try {
            this.logDebug("Simulated: " + this.isSimulated());

            if (this.isSimulated()) {
                this.logDebug("Starting Nuimo in simulated mode.");
                this.state.initialized = true;
                deferred.resolve();
            } else {


                //################################################
                this.logDebug("Starting Nuimo in non-simulated mode.");
                //this.logDebug(this.configuration);

                if (!NuimoDevice) {
                    NuimoDevice = require("nuimojs");
                }
                this.nuimo = new NuimoDevice;
                this.scan();
                deferred.resolve();

                //################################################
                this.state.initialized = false;


                //Nuimo = require("nuimojs");
                //this.nuimo = new Nuimo();


                /*
                 this.nuimo.on("discover", (device) => {

                 this.logDebug(`Discovered Nuimo (${device.uuid})`);

                 device.on("connect", () => {

                 this.state.initialized = true;
                 this.state.uuid = device.uuid;
                 this.logDebug("Nuimo connected" + this.state.uuid);

                 this.setDisplay([
                 1, 1, 1, 1, 1, 1, 1, 1, 1,
                 1, 0, 0, 0, 0, 0, 0, 0, 1,
                 1, 0, 1, 1, 1, 0, 1, 0, 1,
                 1, 0, 0, 1, 0, 0, 1, 0, 1,
                 1, 0, 0, 1, 0, 0, 1, 0, 1,
                 1, 0, 0, 1, 0, 0, 1, 0, 1,
                 1, 0, 0, 1, 0, 0, 1, 0, 1,
                 1, 0, 0, 0, 0, 0, 0, 0, 1,
                 1, 1, 1, 1, 1, 1, 1, 1, 1
                 ], 255, 500, true, false);


                 });

                 device.on("disconnect", () => {
                 this.logDebug("Nuimo disconnected");
                 this.state.initialized = false;
                 this.publishStateChange();
                 });

                 device.on("batteryLevelChange", (level) => {
                 this.logDebug(`Battery level changed to ${level}%`);
                 this.state.batteryLevel = level;
                 this.publishStateChange();
                 });

                 device.on("rssiChange", (rssi) => {
                 this.logDebug(`Signal strength (RSSI) changed to ${rssi}`);
                 this.state.rssi = rssi;
                 //this.publishStateChange();
                 });

                 device.on("press", () => {
                 this.logDebug("Button pressed");
                 this.state.button = true;
                 this.publishStateChange();
                 });

                 device.on("release", () => {
                 this.logDebug("Button released");
                 this.state.button = false;
                 this.publishStateChange();
                 });


                 device.on("swipe", (direction) => {
                 switch (direction) {
                 case (Nuimo.Swipe.LEFT):
                 this.logDebug("Swiped left");
                 this.publishEvent("swipeleft");
                 break;
                 case (Nuimo.Swipe.RIGHT):
                 this.logDebug("Swiped right");
                 this.publishEvent("swiperight");
                 break;
                 case (Nuimo.Swipe.UP):
                 this.logDebug("Swiped up");
                 this.publishEvent("swipeup");
                 break;
                 case (Nuimo.Swipe.DOWN):
                 this.logDebug("Swiped down");
                 this.publishEvent("swipedown");
                 break;
                 }
                 });

                 device.on("touch", (direction) => {
                 switch (direction) {
                 case (Nuimo.Area.LEFT):
                 this.logDebug("Touched left");
                 this.publishEvent("touchleft");
                 break;

                 case (Nuimo.Area.RIGHT):
                 this.logDebug("Touched right");
                 this.publishEvent("touchright");
                 break;

                 case (Nuimo.Area.TOP):
                 this.logDebug("Touched top");
                 this.publishEvent("touchtop");
                 break;

                 case (Nuimo.Area.BOTTOM):
                 this.logDebug("Touched bottom");
                 this.publishEvent("touchbottom");
                 break;
                 }
                 });

                 device.on("rotate", (amount) => {
                 //this.logDebug(`Rotated by ${amount}`);

                 let newRotate = this.state.rotate + amount;

                 if (newRotate < 0) {
                 newRotate = 0;
                 }

                 if (newRotate > 2730) {
                 newRotate = 2730;
                 }

                 this.state.rotate = newRotate;
                 this.publishStateChange();
                 this.logDebug(`State.rotate: ${this.state.rotate}`);

                 });

                 device.on("fly", (direction, speed) => {
                 switch (direction) {
                 case (Nuimo.Fly.LEFT):
                 this.logDebug(`Flew left by speed ${speed}`);
                 this.publishEvent("flyleft");
                 break;
                 case (Nuimo.Fly.RIGHT):
                 this.logDebug(`Flew right by speed ${speed}`);
                 this.publishEvent("flyright");
                 break;
                 }

                 });

                 device.on("detect", (distance) => {
                 this.logDebug(`Detected hand at distance ${distance}`);
                 this.state.distance = distance;
                 this.publishStateChange();
                 //TODO Schould that be an Event? hence it is countinously triggerd as long as an hand is detected and then will stuck at the last value
                 });

                 device.connect();

                 deferred.resolve();
                 }
                 );
                 */
                //this.nuimo.scan();
            }


        } catch (error) {
            deferred.reject(error);
        }

        return deferred.promise;
    }

}

/**
 *
 */
//TODO
Nuimo.prototype.stop = function () {
    var deferred = q.defer();

    if (this.isSimulated()) {
        this.logDebug("Stopping Nuimo in simulated mode.");
    } else {
        /*this.adapter.release
         .then(function () {
         deferred.resolve();
         }.bind(this))
         .fail(function (e) {
         this.logError(e);
         deferred.reject(e);
         }.bind(this));
         */
    }

    deferred.resolve();

    return deferred.promise;
};

/**
 *
 */
//TODO
Nuimo.prototype.setDisplay = function (matrix, brightness, time, onionSkinning, builtinMatrix) {
    var deferred = q.defer();

    if (this.isSimulated()) {
        this.logDebug("Something useful");
    } else {
        this.device.setLEDMatrix(matrix, brightness, time, {
            onionSkinning: onionSkinning,
            builtinMatrix: builtinMatrix
        });
        deferred.resolve();
    }
    return deferred.promise;
};

/**
 *
 */
Nuimo.prototype.getState = function () {
    return {};
};

/**
 *
 */
Nuimo.prototype.setState = function () {
};


Nuimo.prototype.connect = function () {

    this.device.connect();

    this.device.on("connect", () => {

        this.state.initialized = true;
        this.state.uuid = this.device.uuid;
        this.logDebug("Nuimo connected and welcome message send");

        this.setDisplay(welcomeMessage, 10, 5000, true, false);


    });
};

Nuimo.prototype.scan = function () {
    this.logDebug("Scanning for Nuimo started");

    this.nuimo.on("discover", (device) => {
        this.device = device;

        /*this.nuimo.on('disconnect', function () {
         this.logDebug('\nDisconnected.');
         this.scan();
         }.bind(this));
         */
        this.connect();

    });

    this.nuimo.scan();
};

