"use strict";

function saveOptions(){
	var domain_regexs = document.getElementsByClassName("domain_regex");
	var ips = document.getElementsByClassName("ips");
	for (var i=0;i<domain_regexs.length;i++){
		var domain_regex = domain_regexs[i].value;
		var ip = ips[i].value;
		console.log("domain: "+domain_regex+" ip: "+ip);
		storeWhitelist(domain_regex,ip);
	}
}

document.getElementById("save").addEventListener("click", function(){
	saveOptions();
}, false);

document.getElementById("add").addEventListener("click", function(){
	saveOptions();
	var html = document.getElementById("content").innerHTML;
	html += '<p>DOMAIN:<br><input class="domain_regex" value=""/><br>ALLOWED IPS (comma seperated):<br><textarea class="ips" style="width:100%"></textarea><br><hr></p>';
	document.getElementById("content").innerHTML = html;
});

function setMessage(string){
	document.getElementById("message").innerHTML = string;
}

function setUpOptions(){
	//chrome.storage.local.clear(function() {});
	chrome.storage.local.get("urls", function (url_array) {
		url_array = url_array.urls;
		console.log("urls:"+JSON.stringify(url_array));
		chrome.storage.local.get("allowed_ips", function(allowed_ips_array) {
				allowed_ips_array = allowed_ips_array.allowed_ips;
				console.log("allowed_ips_array:"+JSON.stringify(allowed_ips_array));
				var html = "";
				for(var x=0; x < allowed_ips_array.length; x++){
					var url = url_array[x];
					var ips = allowed_ips_array[x];
					html += '<p>DOMAIN (<a href="#" url="'+url+'" class="delete">REMOVE RULE</a>):<br><input class="domain_regex" value="'+url+'"/disabled><br>ALLOWED IPS (comma seperated):<br><textarea class="ips" style="width:100%">'+ips+'</textarea><br><hr></p>';
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