"use strict";

function updateBackground(){
	chrome.runtime.sendMessage({type: "update"}, function(response) {
	  return true;
	});
}

function storeWhitelist(domain_string, ips, manual, callback){
	var validInput = true;
	
	//valid ip entry
	ips = ips.replace(/ /g,'').replace(/\|/g,'');
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
	
	domain_string = domain_string.toLowerCase();
	
	if(validInput){
		var url_pointer = 0;
		var x;
		chrome.storage.local.get("urls", function (url_array) {
			url_array = url_array.urls;
			var already_url = false;
			
			if(url_array == null){
				url_array = [];
			}else{
				for(x=0; x < url_array.length; x++){
					if(url_array[x] === domain_string){
						already_url = true;
						url_pointer = x;
						break;
					}
				}
			}
			
			chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
				allowed_ips_array = allowed_ips_array.allowed_ips;
				
				if(!already_url){
					//sort url array so urls come after hosts
					/*if(domain_string.indexOf("http") === -1){
						url_array = url_array.unshift(domain_string);
						url_pointer = -1;
					}else{*/
						url_pointer = x++;
					//}
					url_array[url_array.length] = domain_string;

					chrome.storage.local.set({'urls': url_array}, function(){
						updateBackground();
					});
				}
				
				if(!manual){
					console.log("not manual"+stored_ips);
					if(allowed_ips_array[url_pointer] != null){
						var input_ips = ips.split(",");
						var stored_ips = allowed_ips_array[url_pointer].split(",");
						
						//prevent duplicate ip addresses or alternative ones
						for (var q = 0; q < stored_ips.length; q++){
							for (var y = 0; y < input_ips.length; y++){
								var i = input_ips[y];
								var s = stored_ips[q];
								//i == "!"+s - i is negative version of already stored ip
								//"!"+i == s - i is non negative version of already stored ip
								if(i == s || i == "!"+s || "!"+i == s){
									stored_ips.splice(stored_ips.indexOf(s), 1);
								}
							}
						}
						ips = stored_ips.concat(input_ips);
					}
				}
				
				ips = ips+"|";
				
				if(already_url){
					allowed_ips_array[allowed_ips_array.length] = ips;
				}else if(allowed_ips_array != null){
					if(url_pointer == -1){
						allowed_ips_array = allowed_ips_array.splice(0, 0, ips);
						console.log("SPLICED");
					}else{
						allowed_ips_array[url_pointer] = ips;
					}
				}else{
					allowed_ips_array = [ips];
				}
				console.log("final:"+allowed_ips_array);
			
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