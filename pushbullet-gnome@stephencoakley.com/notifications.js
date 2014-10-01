const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const St = imports.gi.St;

const Pushbullet = imports.misc.extensionUtils.getCurrentExtension();


/**
 * The notification source for Pushbullet notifications.
 */
const NotificationSource = new Lang.Class({
    Name: "NotificationSource",
    Extends: MessageTray.Source,

    _init: function() {
        this.parent("Pushbullet", "pushbullet");
    },

    /**
     * Registers the source in the UI.
     */
    register: function() {
        Main.messageTray.add(this);
    },

    /**
     * Unregisters the source in the UI.
     */
    unregister: function() {
        Main.messageTray.remove(this);
    },

    showPush: function(push) {
        if (push.type == "note") {
            this.showNotePush(push);
        }
        else if (push.type == "link") {
            this.showLinkPush(push);
        }
        else if (push.type == "address") {
            this.showAddressPush(push);
        }
        else if (push.type == "checklist") {
            this.showChecklistPush(push);
        }
        else if (push.type == "file") {
            this.showFilePush(push);
        }
    },

    showNotePush: function(push) {
        let notification = new MessageTray.Notification(this, push.title, push.body);
        this.notify(notification);
    },

    showLinkPush: function(push) {
        let notification = new MessageTray.Notification(this, push.title, push.url);
        this.notify(notification);
    },

    showAddressPush: function(push) {},

    showChecklistPush: function(push) {},

    showFilePush: function(push) {
        let notification = new MessageTray.Notification(this, push.file_name, push.body);

        try {
            notification.addButton('default', "Download File");
            notification.connect('action-invoked', Lang.bind(this, this.openFile, push.file_url));
        }
        catch(e) {
            let button = new St.Button({ can_focus: true });
            button.add_style_class_name('notification-button');
            button.label = "Download File";
            notification.addButton(button, Lang.bind(this, this.openFile, push.file_url));
        }

        this.notify(notification);
    },

    openFile: function(file_url) {
        GLib.spawn_command_line_async("xdg-open \"" + file_url + "\"");
    }
});
