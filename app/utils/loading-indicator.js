const LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;

export default class MyLoadingIndicator {
    constructor() {
        this.loader = new LoadingIndicator();
    }

    show(message) {
        let options = {
            message: message,
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: false,
                max: 100,
                progressNumberFormat: "%1d/%2d",
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1
            },
        }
        this.loader.show(options);
    }

    hide() {
        this.loader.hide();
    }
}