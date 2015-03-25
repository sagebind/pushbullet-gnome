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
        let lastChecked = settings.get_double("last-checked");

        apiClient.getPushes(lastChecked, function(response) {
            if (response.error) {
                notifications.showNotePush({ title: "Error", body: response.error.message });
            }
            else {
                let i = 0, n = response.pushes.length - 1, m = settings.get_int("max-push-count");
                while (i <= n && i < m) {
                    notifications.showPush(response.pushes[n - i]);
                    i++;
                }

                // update last checked timestamp
                settings.set_double("last-checked", Math.ceil(response.pushes[n - i - 1].modified));
            }
            scheduleCheck(settings.get_int("check-frequency") * 1000);
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

    // init last checked timestamp if this is our first time enabled
    if (settings.get_double("last-checked") == 0) {
        settings.set_double("last-checked", (GLib.get_real_time() / 1000000) - 86400);
    }

    if (settings.get_string("api-key") != "") {
        apiClient.setApiKey(settings.get_string("api-key"));
        scheduleCheck(1);
    }
}

/**
 * Disbales the extension features.
 */
function disable() {
    notifications.unregister();

    if (_timeoutId != 0) {
        MainLoop.source_remove(_timeoutId);
        _timeoutId = 0;
    }
}
