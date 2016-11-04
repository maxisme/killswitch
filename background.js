var getURLs = chrome.storage.sync.get("urls", function (url_array) {
	urls = url_array.urls;
	console.log("urls:"+JSON.stringify(url_array));
	return { urls: ["https://m4x.co"] }
});

var validateIP = function(details) {
	return {cancel: false};
	/*chrome.storage.sync.get("urls", function (url_array) {
		var urls = url_array.urls;
		chrome.storage.sync.get("allowed_ips", function(allowed_ips_array) {
			var allowed_ips = allowed_ips_array.allowed_ips;	
			var access_url = details.url;
			var request = new XMLHttpRequest();
			request.open('GET', 'https://api.ipify.org', false);
			request.send(null);
			if (request.status === 200) {
				var my_ip = request.responseText;
				//check if allowed through
				for (var i = 0; i < allowed_ips.length; i++) {
					var url = urls[allowed_ips[i][0]];
					var ip = allowed_ips[i][1];
					if(access_url.includes(url)){ //shit way to do it but I am lazy
						if(my_ip === ip){
							return {cancel: false};
						}
					}
				}
				return {cancel: true};
			}	
		});
	});*/
};

chrome.webRequest.onBeforeSendHeaders.addListener(
	validateIP,
	{ urls: ["https://m4x.co/*"] },
	["blocking"]
);