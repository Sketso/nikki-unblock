'use strict';
'require view';

/* The UI itself is a self-contained uhttpd CGI at /cgi-bin/nikki-unblock (RU/EN, works
   standalone too at http://<router>/nikki). Here we just embed it inside the LuCI chrome
   so it appears as a native menu entry. */
return view.extend({
	load: function () { return null; },

	render: function () {
		return E('iframe', {
			'src': '/cgi-bin/nikki-unblock',
			'style': 'width:100%;min-height:82vh;border:0;background:transparent;'
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
