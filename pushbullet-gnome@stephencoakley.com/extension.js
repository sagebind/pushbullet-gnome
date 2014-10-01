const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Main = imports.ui.main;
const MainLoop = imports.mainloop;

const Pushbullet = imports.misc.extensionUtils.getCurrentExtension();
const Notifications = Pushbullet.imports.notifications;
const PushbulletApi = Pushbullet.imports.pushbulletApi;
const Settings = Pushbullet.imports.settings;


let settings, notifications, apiClient, _timeoutId;

/**
 * Schedues a check for new notifications.
 *
 * @param Number timeout
 * The number of milliseconds to from now to schedule the check at.
 */
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

/**
 * Initializes the extension.
 *
 * @param Object metadata
 * The metadata of the extension.
 */
function init(metadata) {
    // thanks Philipp Hoffmann
    let theme = Gtk.IconTheme.get_default();
    theme.append_search_path(metadata.path + "/icons");
}

/**
 * Enables the extension features.
 */
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

/**
 * Disbales the extension features.
 */
function disable() {
    notifications.unregister();

    if (_timeoutId != 0) {
        Mainloop.source_remove(_timeoutId);
        _timeoutId = 0;
    }
}
