const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GioSSS = Gio.SettingsSchemaSource;
const Lang = imports.lang;


const Settings = new Lang.Class({
    Name: "Settings",
    Extends: Gio.Settings,

    _init: function(schema) {
        let extension = ExtensionUtils.getCurrentExtension();
        schema = schema || extension.metadata['settings-schema'];

        // check if this extension was built with "make zip-file", and thus
        // has the schema files in a subfolder
        // otherwise assume that extension has been installed in the
        // same prefix as gnome-shell (and therefore schemas are available
        // in the standard folders)
        let schemaDir = extension.dir.get_child('schemas');
        let schemaSource;
        if (schemaDir.query_exists(null))
            schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                    GioSSS.get_default(),
                    false);
        else
            schemaSource = GioSSS.get_default();

        let schemaObj = schemaSource.lookup(schema, true);
        if (!schemaObj)
            throw new Error('Schema ' + schema + ' could not be found for extension '
                    + extension.metadata.uuid + '. Please check your installation.');

        this.parent({ settings_schema: schemaObj });
    }
});
