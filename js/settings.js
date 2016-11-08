"use strict";

function updateBackground(){
	chrome.runtime.sendMessage({type: "update"}, function(response) {
	  return true;
	});
}

function storeWhitelist(domain_string, ips, manual){
	console.log("input:"+domain_string);
	var validInput = true;
	
	//valid ip entry
	ips = ips.replace(/ /g,'');
	var ip_array = ips.split(",");
	for (var i = 0; i < ip_array.length; i++){
		var ip = ip_array[i];
		if(ip.charAt(0) == "!"){
			if(!isIP(ip.substring(1,ip.length))){
				validInput = false;
			}
		}else{
			if(!isIP(ip)){
				validInput = false;
			}
		}
	}
	
	if(validInput){
		var url_pointer = 0;
		var x;
		chrome.storage.local.get("urls", function (url_array) {
			url_array = url_array.urls;
			var already_url = false;
			
			if(url_array == null){
				url_array = [];
			}else{
				console.log("checking domains");
				for(x=0; x < url_array.length; x++){
					if(url_array[x] === domain_string){
						console.log("domain already exists");
						already_url = true;
						url_pointer = x;
						break;
					}
				}
			}
			
			chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
				allowed_ips_array = allowed_ips_array.allowed_ips;
				console.log("get:"+JSON.stringify(allowed_ips_array));
				if(allowed_ips_array == null){
					allowed_ips_array = [];
				}
				
				if(!already_url){
					//store new url
					url_array[url_array.length] = domain_string;
					chrome.storage.local.set({'urls': url_array}, function(){
						updateBackground();
					});
					url_pointer = x++;
					allowed_ips_array[allowed_ips_array.length] = ips;
				}else{
					if(!manual){
						var stored_ips = allowed_ips_array[url_pointer].split(",");
						for (var x = 0; x < stored_ips.length; x++){
							var input_ips = ips.split(",");
							for (var y = 0; y < input_ips.length; y++){
								if(stored_ips[x] === input_ips[y] || stored_ips[x] === "!"+input_ips[y]){
									ips.replace(stored_ips[x], "");
								}
							}
						}
						allowed_ips_array[url_pointer] = allowed_ips_array[url_pointer]+","+ips;
					}else{
						allowed_ips_array[url_pointer] = ips;
					}
				}
			
				chrome.storage.local.set({'allowed_ips': allowed_ips_array}, function(){
					updateBackground();
					setUpOptions();
				});
			});
		});
	}
}

function deleteWhitelist(domain_string){
	chrome.storage.local.get("urls", function (url_array) {
		url_array = url_array.urls;
		chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
			allowed_ips_array = allowed_ips_array.allowed_ips;
			for(var x=0; x < allowed_ips_array.length; x++){
				if(url_array[x] === domain_string){
					allowed_ips_array.splice(x, 1);
					url_array.splice(x, 1);
					break;
				}
			}
			chrome.storage.local.set({'urls': url_array}, function(){
				chrome.storage.local.set({'allowed_ips': allowed_ips_array}, function(){
					updateBackground();
				});
			});
		});
	});
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

function getHostFromURL(url){
    var a = document.createElement('a');
    a.href = url;
	if(url.indexOf(a.hostname) != -1){
    	return a.hostname;
	}else{
		return null;
	}
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}