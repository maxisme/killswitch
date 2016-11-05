"use strict";

var getURLs = function () { 
	chrome.storage.sync.get("urls", function (url_array) {
		var urls = url_array.urls;
		return urls;
	});
};

var validateIP = function(details) {
	var access_url = details.url;
	chrome.storage.sync.get("urls", function (url_array) {
		var urls = url_array.urls;
		var isDomain = false;
		for (var i = 0; i < urls.length; i++) {
			if(access_url.includes(urls[i])){
				alert('hi');
				return {cancel: true};
			}
		}
		
		if(isDomain){
			chrome.storage.sync.get("allowed_ips", function(allowed_ips_array) {
				var allowed_ips = allowed_ips_array.allowed_ips;	
				var request = new XMLHttpRequest();
				request.open('GET', 'https://api.ipify.org', false);
				request.send(null);
				if (request.status === 200) {
					var my_ip = request.responseText;
					//check if allowed through
					for (var i = 0; i < allowed_ips.length; i++) {
						var url = urls[allowed_ips[i][0]];
						var ip = allowed_ips[i][1];
						if(my_ip === ip){
							return {cancel: false};
						}
					}
					return {cancel: true};
				}	
			});
		}
	});
};

chrome.storage.sync.get("urls", function (url_array) {
	var urls = url_array.urls;
	console.log("urls:"+JSON.stringify(url_array));
});

chrome.webRequest.onBeforeSendHeaders.addListener(
	validateIP,
	{ urls: ["<all_urls>"] },
	["blocking"]
);