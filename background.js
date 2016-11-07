"use strict";

function updateLocalStorage(){
	chrome.storage.local.get("urls", function (url_array) {
		chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
			localStorage.urls = url_array.urls;
			localStorage.allowed_ips = allowed_ips_array.allowed_ips;
		});
	});
}
updateLocalStorage();

function matchingDomainRegex(url, url_regex){
	var matching = false;
	if(url.length > 0 && url_regex.length > 0){
		if(url.includes(url_regex)){
			matching = true;
		}
	}
	return matching;
}
function isIP(ipaddress)   
{  
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))  
  {
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
			if(!isIP(user_ip)){
				alert("The tool used to get your public ip address did not return a valid IP address!\n\nValue returned: "+ user_ip+"\n\nPlease email max@maxis.me with the value returned. So sorry for the inconvenience!");
				return {cancel: true};
			}
			var shouldBlock = true;
			for (var x = 0; x < stored_ips.length; x++) {
				var ip = stored_ips[x];
				if(ip.charAt(0) === "!"){
					ip = ip.substring(1, ip.length);
					if(user_ip !== ip){
						shouldBlock = false;
					}else{
						shouldBlock = true;
					}
				}else{
					if(user_ip === ip){
						shouldBlock = false;
					}else{
						shouldBlock = true;
					}
				}
				
			}
			if(shouldBlock){
				chrome.tabs.getSelected(null, function(tab) {
					localStorage.blockedTab.concat(tab[0].id+",");
				});
				chrome.browserAction.setIcon ( { path: '/img/48x48.png' } );
				return {cancel: true};
			}else{
				return {cancel: false};
			}
		}else{
			alert("BLOCKED: The tool used to get your public ip address is down");
			return {cancel: true};
		}
	}
};

chrome.tabs.onActivated.addListener(function(info){
	chrome.browserAction.setIcon ( { path: '/img/48x48g.png' } );
});

chrome.webRequest.onBeforeSendHeaders.addListener(
	validateIP,
	{ urls: ["<all_urls>"] },
	["blocking"]
);