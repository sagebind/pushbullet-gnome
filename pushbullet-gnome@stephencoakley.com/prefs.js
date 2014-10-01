const Gtk = imports.gi.Gtk;
const Config = imports.misc.config;

const Pushbullet = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Pushbullet.imports.settings;


let settings;

function init() {
    settings = new Settings.Settings("org.gnome.shell.extensions.pushbullet");
}

function buildPrefsWidget() {
    let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10, spacing: 10});

    let label = new Gtk.Label({label: "Pushbullet API Key", xalign: 0 });
    frame.add(label);

    let entry = new Gtk.Entry();
    entry.text = settings.get_string("api-key");
    frame.add(entry);
    entry.connect("changed", function(entry) {
        settings.set_string("api-key", entry.text);
    });

    frame.show_all();
    return frame;
}
