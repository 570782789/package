function getDay(year,month){
	var days = [31,28,31,30,31,30,31,31,30,31,30,31];
	if((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)days[1]++;
	return days[month-1];
}

function check_search(){
	if(document.getElementById("search_input").value == "")return false;
	return true;
}

function check_list(){
	if(document.getElementById("addList_input").value == "")return false;
	return true;
}

function check_form(){
	var title = document.getElementById("title").value;
	var message = document.getElementById("message").value;
	var year = document.getElementById("year").value;
	var month = document.getElementById("month").value;
	var day = document.getElementById("day").value;
	if(title == "")return false;
	if(message == "")return false;
	if(year == "" || isNaN(year))return false;
	if(month == "" || isNaN(month) || month < 1 || month > 12)return false;
	if(day == "" || isNaN(day) || day < 1 || day > getDay(year,month))return false;
	return true;
}
