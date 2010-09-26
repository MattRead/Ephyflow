/**
 * Ephyflow v0.1
 * Epiphany and Steadyflow intergration
 *
 * GPL licensed.
 * Copyright (c) 2010 Matt Read <matt@mattread.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// import needed libraries
Epiphany = imports.gi.Epiphany;
DBus = imports.dbus;

// create the Steadyflow DBus object
function Steadyflow()
{
    this._init();
}

Steadyflow.prototype = {
    _init: function()
    {
        DBus.session.proxifyObject(this, 'net.launchpad.steadyflow', '/net/launchpad/steadyflow/app' );
    }
};

// Steadyflow DBus interface
var SteadyflowIface = {
    name: 'net.launchpad.steadyflow.App',
    methods: [
        { name: 'AddFile', inSignature: 's', outSignature: '' },
        { name: 'SetVisible', inSignature: 'b', outSignature: '' }
    ]
};
DBus.proxifyPrototype(Steadyflow.prototype, SteadyflowIface);


var steadyflow = null;

var ephyflow_download_cb = function(embed_single, mime, url)
{
    if (!steadyflow) {
        steadyflow = new Steadyflow();
    }

    try {
        // hack to determine if Steadyflow is connected to bus so the AddFile can be called
        // asynchronously and not make epiphany hang.
        steadyflow.SetVisibleRemoteSync(false);
        steadyflow.AddFileRemote(url);
        return true;
    }
    catch (e) {
        return false;
    }
}

// extend into the outer reaches of space.
extension = {
    attach_window: function(window)
    {
        var embed_single = Epiphany.EphyEmbedShell.get_default().get_embed_single();
        window._ephyflow_signal = embed_single.signal.handle_content.connect(ephyflow_download_cb);
    },
    detach_window: function(window)
    {
        var embed_single = Epiphany.EphyEmbedShell.get_default().get_embed_single();
        embed_single.signal.disconnect(window._ephyflow_signal);
        delete window._ephyflow_signal;
    }
};
