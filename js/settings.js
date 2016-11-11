"use strict";

function updateBackground(){
	chrome.runtime.sendMessage({type: "update"}, function(response) {
	  return true;
	});
}

function storeWhitelist(domain_string, ips, manual, callback){
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
					var previousIPs = allowed_ips_array[url_pointer];
					if(!manual){
						var stored_ips = allowed_ips_array[url_pointer].split(",");
						//check if ip already exists
						for (var q = 0; q < stored_ips.length; q++){
							var input_ips = ips.split(",");
							for (var y = 0; y < input_ips.length; y++){
								console.log("q: "+stored_ips[q]+" y: "+input_ips[y]);
								if(input_ips[y].indexOf(stored_ips[q]) != -1){
									previousIPs = previousIPs.replace(stored_ips[q], "");
								}
							}
						}
						ips = previousIPs+","+ips;
						//remove excess commas
						ips = ips.replace(/\,{2,}/g,"");
					}
					
					allowed_ips_array[url_pointer] = ips;
				}
			
				chrome.storage.local.set({'allowed_ips': allowed_ips_array}, function(){
					updateBackground();
					if(callback != null){
						callback();
					}
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