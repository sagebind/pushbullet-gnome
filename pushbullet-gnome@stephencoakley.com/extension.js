const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const MainLoop = imports.mainloop;

const Pushbullet = imports.misc.extensionUtils.getCurrentExtension();
const Notifications = Pushbullet.imports.notifications;
const PushbulletApi = Pushbullet.imports.pushbulletApi;
const Settings = Pushbullet.imports.settings;


let settings, notifications, apiClient, _timeoutId;

function scheduleCheck(timeout) {
    if (_timeoutId != 0) {
        MainLoop.source_remove (_timeoutId);
    }

    _timeoutId = MainLoop.timeout_add(timeout, function() {
        apiClient.getPushes(function(response) {
            if (!response.error) {
                for (var i = 0; i < 1; i++) {
                    notifications.showPush(response.pushes[i]);
                }
            }
            scheduleCheck(60000);
        });
    });
}

function init() {
}

function enable() {
    settings = new Settings.Settings("org.gnome.shell.extensions.pushbullet");
    apiClient = new PushbulletApi.ApiClient();

    notifications = new Notifications.NotificationSource();
    notifications.register();

    if (settings.get_string("api-key") != "") {
        apiClient.setApiKey(settings.get_string("api-key"));
        scheduleCheck(1000);
    }
}

function disable() {
    notifications.unregister();

    if (_timeoutId != 0) {
        Mainloop.source_remove(_timeoutId);
        _timeoutId = 0;
    }
}
