'use strict';
'require view';

/* The UI itself is a self-contained uhttpd CGI at /cgi-bin/nikki-unblock (RU/EN, works
   standalone too at http://<router>/nikki). Here we just embed it inside the LuCI chrome
   so it appears as a native menu entry. */

var currentFrame = null, triedRefresh = false;

/* If the optional PIN is on and the iframe ends up showing the login screen (session expired, wiped
   by "log out on all devices", or its URL's luci_sid went stale), the login page posts us a message —
   we hand back a FRESH L.env.sessionid (this parent page's own live one) rather than relying on
   whatever was baked into the iframe's src at its last render. See the CGI's auth_luci_sid_ok()/
   auth_login_page() for why a shared cookie can't do this instead. One retry per view load: if the
   fresh sid still doesn't work (e.g. the LuCI session itself is gone too), don't loop — let the
   ordinary PIN form take over. */
if (!window.__nipretMsgHooked) {
	window.__nipretMsgHooked = true;
	window.addEventListener('message', function (ev) {
		if (ev.origin !== location.origin) return;
		if (ev.data && ev.data.type === 'nipret-need-luci-sid' && currentFrame && !triedRefresh) {
			triedRefresh = true;
			currentFrame.src = '/cgi-bin/nikki-unblock?luci_sid=' + encodeURIComponent(L.env.sessionid || '');
		}
	});
}

return view.extend({
	load: function () { return null; },

	render: function () {
		triedRefresh = false;
		currentFrame = E('iframe', {
			'src': '/cgi-bin/nikki-unblock?luci_sid=' + encodeURIComponent(L.env.sessionid || ''),
			'style': 'width:100%;min-height:82vh;border:0;background:transparent;'
		});
		return currentFrame;
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
