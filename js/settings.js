"use strict";
//
//var urls = ["https://m4x.co/", "*://google.com/*"];
//var allowed_ips = [[0,['185.164.138.19']], [0,['188.29.164.162']]];


document.getElementById("edit").addEventListener("click", function(){
	console.log("clicked");
	var domain_regexs = document.getElementsByClassName("domain_regex");
	var ips = document.getElementsByClassName("ips");
	for (var i=0;i<domain_regexs.length;i++){
		var domain_regex = domain_regexs[i].value;
		var ip = ips[i].value;
		console.log("domain: "+domain_regex+" ip: "+ip);
		storeWhitelist(domain_regex,ip);
	}
}, false);

document.getElementById("add").addEventListener("click", function(){
	var html = document.getElementById("content").innerHTML;
	html += 'Domain:<br><input class="domain_regex" value=""/><br>Allowed IPs (comma seperated):<br><textarea class="ips" style="width:100%"></textarea><br><hr>';
	document.getElementById("content").innerHTML = html;
});

function storeWhitelist(domain_string, ips){
	console.log("input:"+domain_string);
	var validInput = true;
	
	ips = ips.replace(/ /g,'');
	var ip_array = ips.split(",");
	for (var i = 0; i < ip_array.length; i++){
		var ip = ip_array[i];
		if(!isIP(ip)){
			setMessage("Invalid Ip: "+ ip);
			validInput = false;
		}
	}
	
	if(validInput){
		var url_pointer = 0;
		var x;
		chrome.storage.sync.get("urls", function (url_array) {
			url_array = url_array.urls;
			var already_url = false;
			console.log("current url_array:"+JSON.stringify(url_array));
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
			
			chrome.storage.sync.get("allowed_ips", function(allowed_ips_array) {
				allowed_ips_array = allowed_ips_array.allowed_ips;
				console.log("get:"+JSON.stringify(allowed_ips_array));
				if(allowed_ips_array == null){
					console.log("null allowed_ips_array");
					allowed_ips_array = [];
				}
				
				if(!already_url){
					//store updated url_array
					url_array[url_array.length] = domain_string;
					chrome.storage.sync.set({'urls': url_array}, function(){});
					url_pointer = x++;
				}
				
				if(!url_pointer){
					url_pointer = 0;
				}
				
				console.log("url_pointer"+url_pointer);
				allowed_ips_array[allowed_ips_array.length] = [url_pointer, ips];
				
				chrome.storage.sync.set({'allowed_ips': allowed_ips_array}, function(){
					setMessage("Success!");
					console.log("set:"+JSON.stringify(allowed_ips_array));
				});
			});
		});
	}
}

function deleteWhitelist(domain_string){
	chrome.storage.sync.get("urls", function (url_array) {
		url_array = url_array.urls;
		chrome.storage.sync.get("allowed_ips", function(allowed_ips_array) {
			allowed_ips_array = allowed_ips_array.allowed_ips;
			for(var x=0; x < allowed_ips_array.length; x++){
				var point = allowed_ips_array[x][0];
				if(url_array[point] === domain_string){
					allowed_ips_array.splice(x, 1);
					url_array.splice(point, 1);
					break;
				}
			}
			chrome.storage.sync.set({'allowed_ips': allowed_ips_array}, function(){});
			chrome.storage.sync.set({'urls': url_array}, function(){});
			setMessage("Succesfully deleted");
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

function setMessage(string){
	document.getElementById("message").innerHTML = string;
}

function setUpOptions(){
	chrome.storage.sync.get("urls", function (url_array) {
		url_array = url_array.urls;
		console.log("urls:"+JSON.stringify(url_array));
		chrome.storage.sync.get("allowed_ips", function(allowed_ips_array) {
				allowed_ips_array = allowed_ips_array.allowed_ips;
				console.log("allowed_ips_array:"+JSON.stringify(allowed_ips_array));
				var html = "";
				for(var x=0; x < allowed_ips_array.length; x++){
					var url = url_array[allowed_ips_array[x][0]];
					var ips = allowed_ips_array[x][1];
					html += 'Domain <a href="#" url="'+url+'" class="delete">X</a>:<br><input class="domain_regex" value="'+url+'"/disabled><br>Allowed IPs (comma seperated):<br><textarea class="ips" style="width:100%">'+ips+'</textarea><br><hr>';
				}
				document.getElementById("content").innerHTML = html;

				//set event delete listeners
				var deleteClasses = document.getElementsByClassName("delete");
				var deleteFunction = function() {
					var url = this.getAttribute("url");
					deleteWhitelist(url);
				};
				for (var i = 0; i < deleteClasses.length; i++) {
					deleteClasses[i].addEventListener('click', deleteFunction, false);
				}
		});
	});
}

window.onload = function(){
	setUpOptions();
};