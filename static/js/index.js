function show_addList(){
	$("#addList").show();
}

function hide_addList(){
	$("#addList").hide();
}

function show_cover(){
	$("#cover").show();
}

function hide_cover(){
	$("#cover").hide();
}

function addList(){
	show_addList();
	show_cover();
}
function no_addList(){
	hide_addList();
	hide_cover();
}


function show_addthings(){
	$("#addthings").show();
}

function hide_addthings(){
	$("#addthings").hide();
}
function show_covers(){
	$("#covers").show();
}

function hide_covers(){
	$("#covers").hide();
}

function addthings(){
	show_addthings();
	show_covers();
}

function no_addthings(){
	hide_addthings();
	hide_covers();
}


function removeList(id,list){
	location.href = "/removeList?id="+id+"&list="+list;
}

function updateThing(title,message,time,urgent,id){  //修改
	document.getElementById("title").value = title;
	document.getElementById("message").value = message;
	document.getElementById("year").value = time.substring(0,4);
	document.getElementById("month").value = time.substring(5,7);
	document.getElementById("day").value = time.substring(8,10);
	document.getElementById("urg"+urgent).checked = "checked";
	if(document.getElementById("myform").action.indexOf("update") == -1)
		document.getElementById("myform").action += ("&update="+id);
	document.getElementById("quxiao").style.display = "inline";
	addthings();
}

function quxiao(list){
	document.getElementById("title").value = "";
	document.getElementById("message").value = "";
	document.getElementById("year").value = "";
	document.getElementById("month").value = "";
	document.getElementById("day").value = "";
	document.getElementById("urg1").checked = "checked";
	document.getElementById("myform").action = "/addThing?list="+list;
	document.getElementById("quxiao").style.display = "none";	
}
