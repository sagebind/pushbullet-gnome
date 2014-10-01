const Lang = imports.lang;
const Soup = imports.gi.Soup;


const ApiClient = new Lang.Class({
    Name: "ApiClient",

    _init: function() {
        this._httpSession = new Soup.SessionAsync({ ssl_use_system_ca_file: true });
        Soup.Session.prototype.add_feature.call(this._httpSession, new Soup.ProxyResolverDefault());

        this._httpSession.connect("authenticate", Lang.bind(this, this._authenticate));
    },

    getApiKey: function() {
        return this._apiKey;
    },

    setApiKey: function(apiKey) {
        this._apiKey = apiKey;
    },

    getPushes: function(callback) {
        this._sendRequest("https://api.pushbullet.com/v2/pushes", callback);
    },

    _sendRequest: function(uri, callback) {
        let message = new Soup.Message({ method: 'GET', uri: new Soup.URI(uri) });

        this._httpSession.queue_message(message, Lang.bind(this, function(session, message, callback) {
            let response = JSON.parse(message.response_body.data);
            return callback(response);
        }, callback));
    },

    _authenticate: function(session, message, auth, retrying, user_data) {
        auth.authenticate(this._apiKey, "");
    }
});
