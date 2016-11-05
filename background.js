"use strict";

function updateLocalStorage(){
	chrome.storage.local.get("urls", function (url_array) {
		chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
			localStorage.urls = url_array.urls;
			localStorage.allowed_ips = allowed_ips_array.allowed_ips;
			alert("updating local with "+localStorage.urls);
			alert("updating local with "+localStorage.allowed_ips);
		});
	});
}
updateLocalStorage();

function matchingDomainRegex(url, url_regex){
	alert(url+" vs "+ url_regex);
	if(url.includes(url_regex)){
		alert(url_regex);
		return true;
	}else{
		return false;
	}
}
//----RECEIVE MESSAGES FROM UI 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === "update"){
		updateLocalStorage();
    }
});

var validateIP = function(details) {
	var access_url = details.url;
	var stored_urls = localStorage.urls.split(",");
	var stored_ips = localStorage.allowed_ips.split(",");
	
	var isDomain = false;
	//check if access_url is one stored 
	for (var i = 0; i < stored_urls.length; i++) {
		isDomain = matchingDomainRegex(access_url, stored_urls[i]);
		if(isDomain){
			break;
		}
	}
	
	if(isDomain){
		var request = new XMLHttpRequest();
		request.open('GET', 'https://api.ipify.org', false);
		request.send(null);
		if (request.status === 200) {
			var user_ip = request.responseText;
			for (var x = 0; x < stored_ips.length; x++) {
				alert(stored_ips[x]);
				if(user_ip === stored_ips[x]){
					return {cancel: false};
				}
			}
			return {cancel: true};
		}
	}
};

chrome.webRequest.onBeforeSendHeaders.addListener(
	validateIP,
	{ urls: ["<all_urls>"] },
	["blocking"]
);