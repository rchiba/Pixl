YUI.add('gallery-twitter-status', function(Y) {

var RE_USERNAME = /@(\w+)/g,
    RE_LINK     = /((?:https?|s?ftp|ssh)\:\/\/[^"\s<>]*[^.,;'">\:\s<>\)\]\!])/g,
    TwitterStatus;

TwitterStatus = Y.Base.create("twitterStatus", Y.Widget, [], {
    ENTRY_TEMPLATE:
    '<div class="twitter-status-update">'+
        '<p>{text} '+
            '<span class="twitter-status-timestamp">{relativeTime}</span>'+
        '</p>'+
    '</div>',

    TITLE_TEMPLATE:
    '<h3 class="twitter-status-title">{title} '+
        '<a href="{url}" class="twitter-status-username">{username}</a>'+
    '</h3>',

    interval: null,

    initializer: function () {
        this.publish({
            data:  { defaultFn: this._defDataFn },
            error: { defaultFn: this._defErrorFn }
        });

        this._initJSONPRequest();

        this.after( {
            usernameChange: this._refreshJSONPRequest,
            countChange   : this._refreshJSONPRequest
        } );
    },

    _initJSONPRequest: function () {
        var un      = this.get('username'),
            url     = TwitterStatus.TWITTER_URL + TwitterStatus.FEED_URI +
                      un + '.json?'+
                      'd=' + (new Date()).getTime() + // cache busting needed?
                      '&count=' + this.get('count') +
                      '&callback={callback}';

        this._jsonpHandle = new Y.JSONPRequest(url, {
            on: {
                success: this._handleJSONPResponse
            },
            context: this
        });
    },

    _refreshJSONPRequest: function () {
        this._initJSONPRequest();
        this.syncUI();
    },

    renderUI: function () {
        var cb   = this.get('contentBox');

        if (!cb.one('ul.twitter-status-updates')) {
            cb.append('<ul class="twitter-status-updates"></ul>');
        }
    },

    bindUI: function () {
        this.after('usernameChange'      , this.syncUI);
        this.after('countChange'         , this.syncUI);
        this.after('stringsChange'       , this.syncUI);
        this.after('refreshSecondsChange', this._updateInterval);
    },

    syncUI: function () {
        this._uiUpdateTitle();
        this.update();

        this._updateInterval();
    },

    _uiUpdateTitle: function () {
        var cb    = this.get('contentBox'),
            title = cb.one('.twitter-status-title'),
            content, un;

        if (this.get('includeTitle')) {
            un = this.get('username');

            content = Y.Lang.sub(this.TITLE_TEMPLATE, {
                title   : this.get('strings.title'),
                username: '@' + un,
                url     : this.TWITTER_URL + un
            });


            if (title) {
                title.replace(content);
            } else {
                cb.prepend(content);
            }
        } else if (title) {
            title.remove();
        }
    },

    update: function () {
        this._jsonpHandle.send();
    },

    _handleJSONPResponse: function (data) {
        if (Y.Lang.isObject(data)) {
            this.fire('data', { data: data });
        } else {
            this.fire('error');
        }
    },

    _defDataFn: function (e) {
        this.get('contentBox').removeClass('twitter-status-error');

        this._printEntries(e.data);
    },

    _printEntries: function (data) {
        var cb      = this.get('contentBox'),
            entries = this._createEntries(data);

        cb.one('.twitter-status-updates').
            setContent('<li>' + entries.join('</li><li>') + '</li>');
    },

    _createEntries: function (data) {
        var entries = [], i;

        for (i = data.length - 1; i >= 0; --i) {
            data[i].relativeTime = Y.toRelativeTime(
                // IE's Date.parse can't handle dates formatted as
                // "Tue Feb 03 23:02:18 +0000 2009"
                // but it works without the TZ offset
                new Date(Date.parse(data[i].created_at.replace(/\+\d+/,''))));

            entries[i] = this._createEntry(data[i]);
        }

        return entries;
    },

    _createEntry: function (entry) {
        return Y.Lang.sub(this.ENTRY_TEMPLATE, entry)
                    .replace(RE_LINK,'<a href="$1">$1</a>')
                    .replace(RE_USERNAME,
                        '<a class="twitter-acct" href="' +
                            TwitterStatus.TWITTER_URL +
                        '$1">@$1</a>');
    },

    _defErrorFn: function () {
        this.get('contentBox').
            addClass('twitter-status-error').
            setContent('<li><em>'+this.get('strings.error')+'</em></li>');
    },

    _updateInterval: function () {
        if (this.interval) {
            this.interval.cancel();
        }

        this.interval = Y.later(
            this.get('refreshSeconds') * 1000,
            this, this.update, null, true);
    }

}, {
    TWITTER_URL: 'http://twitter.com/',

    FEED_URI: 'statuses/user_timeline/',

    ATTRS: {
        username: {},

        count: {
            value: 10,
            validator: Y.Lang.isNumber
        },

        refreshSeconds: {
            value: 300, // 5mins
            validator: Y.Lang.isNumber
        },

        strings: {
            value: {
                title:  'Latest Updates',
                error:  'Oops!  We had some trouble connecting to Twitter :('
            }
        },

        includeTitle: {
            value: true,
            validator: Y.Lang.isBoolean
        }
    }
});

Y.namespace('Twitter').Status = TwitterStatus;


}, '@VERSION@' ,{requires:['widget', 'substitute', 'gallery-torelativetime', 'jsonp', 'base-build']});