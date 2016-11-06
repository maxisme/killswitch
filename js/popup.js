"use strict";

function storeURL(domainOnly){
	chrome.tabs.getSelected(null, function(tab) {
		var url = tab.url;
		if(domainOnly){
			url = getHostFromURL(tab.url);
		}
		
		var request = new XMLHttpRequest();
		request.open('GET', 'https://api.ipify.org', false);
		request.send(null);
		if (request.status === 200) {
			var ip = request.responseText;
			storeWhitelist(url, ip);
		}
	});
}

document.getElementById("wl_domain").addEventListener("click", function(){
	console.log("clicked");
	storeURL(true);
}, false);

document.getElementById("wl_url").addEventListener("click", function(){
	storeURL(false);
}, false);