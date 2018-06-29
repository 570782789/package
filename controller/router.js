const formidable = require("formidable");
const dao = require("../model/dao.js");

exports.getLogin = (request, response, next) => {  //"=>"代表Arrow Function（箭头函数），相当于匿名函数，可以简化函数定义，就不需要每次打function(request, response, next)。
	let tips = "";
	let tip = request.query.tip;  //服务器获取tip的值
	if(tip == "1") tips = "用户名或密码错误";
	else if(tip == "2") tips = "用户尚未登录";
	response.render("login", {  //对服务器响应login页面tips的值
		"tip": tips
	});
}

exports.postLogin = (request, response, next) => { //用户登录
	let form = new formidable.IncomingForm();  //Formidable模块，创建Formidable.IncomingForm对象
	form.parse(request, (err, fields, files) => { //该方法会转换请求中所包含的表单数据，function(err, fields, files)中包含了所有字段域和文件信息
		if(err) {
			console.log("表单解析失败");
			next();  //回调函数，继续执行function(err, fields, files)功能
			return;
		}
		let userName = fields.userName; //获取输入的用户名和密码
		let userPass = fields.userPass;
		let sql = "select * from login where userName = '" + userName + "' and userPass = '" + userPass + "'";   //获取数据库保存的用户名密码
		dao.query(sql, (err, result) => { //调用dao.js中的connection.query(sql, function(err, result)方法，调用sql语句查询用户名和密码
			if(err) {
				console.log(err);
				next();  //回调
				return;
			}
			if(result.length == 0) {  //如果没有从数据库中查询到结果
				response.writeHead(302, { //向请求的客户端发送响应头，重定向到登录页面
					"Location": "http://127.0.0.1:3000/login?tip=1"  //登录失败
				});
				response.end(); //响应结束
			} else {
				request.session.userName = userName; //将从数据库查询到的用户名提交给服务器由session模块保存
				response.writeHead(302, {  //向请求的客户端发送响应头，转到用户界面
					"Location": "http://127.0.0.1:3000/index?list=2"  //成功登录
				});
				response.end();
			}
		});
	});
}

exports.getIndex = (request, response, next) => {  //优先排序
	if(request.session.userName == null) { //如果session会话中保存的用户名为空，则跳转到登录页面
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let id = 2;   //设置id为2，从to-do清单开始
	if(request.query.list != null) id = parseInt(request.query.list);  //获取list的id值
	let sql = "select * from lists";  //从数据库查询新创建的清单列表
	dao.query(sql, (err, left_result) => { //left_result代表查询出的清单列表
		if(err) {
			console.log(err);
			next();  //回调
			return;
		}
		if(id == 1) { //我的一天
			let now = new Date();  //获取当前时间日期
			let year = now.getFullYear();
			let month = now.getMonth() + 1;
			let day = now.getDate();
			if(month < 10) month = "0" + month;
			if(day < 10) day = "0" + day;
			let now_date = year + "-" + month + "-" + day;
			sql = "select * from things where time='" + now_date + "' and isdelete=0 order by urgent desc,time asc";   //从代办清单里找到与当天日期相同的清单添加到我的一天
		} else if(id == 2) sql = "select * from things where isdelete=0 order by urgent desc,time asc";   //isdelete代表事项是否完成，如果未完成则把to-do中的事件按紧急度降序排序
		else if(id == 3) sql = "select * from things where isdelete=1 order by urgent desc,time asc";   //isdelete=1表示已完成，把查询到的结果按紧急度降序排序
		else sql = "select * from things where list_id=" + id + " and isdelete=0 order by urgent desc,time asc";  //新建的列表的排序
		dao.query(sql, (err, right_result) => {
			if(err) {
				console.log(err);
				next();
				return;
			}
			response.render("index", {   //返回信息
				"userName": request.session.userName,
				"lists": left_result,
				"contents": right_result,
				"list_flag": id
			});
		});
	});
}

exports.postAddThing = (request, response, next) => { //添加计划
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let form = new formidable.IncomingForm();
	let list_id = 2;
	if(request.query.list != null) list_id = parseInt(request.query.list);
	form.parse(request, (err, fields, files) => {
		if(err != null) {
			console.log("表单解析错误");
			next();
			return;
		}
		let id = request.query.update;
		let title = fields.title;
		let message = fields.message;
		let urgent = parseInt(fields.urgent);
		let year = fields.year;
		let month = fields.month;
		let day = fields.day;
		if(month < 10) month = "0" + parseInt(month);
		if(day < 10) day = "0" + parseInt(day);
		let time = year + "-" + month + "-" + day;
		let sql = "insert into things values(null,?,?,?,?,0,?)";
		let params = [title, message, urgent, time, list_id];
		if(id != null) {
			sql = "update things set title=?,message=?,urgent=?,time=? where id=" + id;
			params = [title, message, urgent, time];
			dao.update(sql, params, (err, result) => {  
				if(err) {
					console.log(err);
					next();
					return;
				}
				response.writeHead(302, {
					"Location": "http://127.0.0.1:3000/index?list=" + list_id
				});
				response.end();
			});
		} else {
			dao.add(sql, params, (err, result) => { 
				if(err) {
					console.log(err);
					next();
					return;
				}
				response.writeHead(302, {
					"Location": "http://127.0.0.1:3000/index?list=" + list_id
				});
				response.end();
			});
		}
	});
}

exports.getDeleteThing = (request, response, next) => { //删除计划
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let id = request.query.id;
	let list = request.query.list;
	let sql = "update things set isdelete=1 where id=?";  //标记已完成
	dao.update(sql, [id], (err, result) => {
		if(err) {
			console.log(err);
			next();
			return;
		}
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/index?list=" + list 
		});
		response.end();
	});
}

exports.getRemoveThing = (request, response, next) => {  //彻底删除
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let id = request.query.id;
	let sql = "delete from things where id=" + id;  //直接删除
	dao.remove(sql, (err, result) => {
		if(err) {
			console.log(err);
			next();
			return;
		}
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/index?list=3"
		});
		response.end();
	});
}

exports.postAddList = (request, response, next) => {  //添加列表
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let form = new formidable.IncomingForm();
	form.parse(request, (err, fields, files) => {
		if(err != null) {
			console.log("表单解析错误");
			next();
			return;
		}
		let listName = fields.listName;
		let sql = "insert into lists values(null,?,null)";
		dao.add(sql, [listName], (err, result) => {
			if(err) {
				console.log(err);
				next();
				return;
			}
			response.writeHead(302, {
				"Location": "http://127.0.0.1:3000/index?list=2"
			});
			response.end();
		});
	});
}

exports.getRemoveList = (request, response, next) => {  //删除列表
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	let list = request.query.list;
	let sql = "delete from lists where id=" + parseInt(request.query.id);
	dao.remove(sql, (err, result) => {
		if(err) {
			console.log(err);
			next();
			return;
		}
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/index?list=" + list
		});
		response.end();
	});
}

exports.postSearch = (request, response, next) => {  //搜索
	if(request.session.userName == null) {
		response.writeHead(302, {
			"Location": "http://127.0.0.1:3000/login?tip=2"
		});
		response.end();
		return;
	}
	var form = new formidable.IncomingForm();
	form.parse(request, (err, fields, files) => {
		if(err != null) {
			console.log("表单解析错误");
			next();
			return;
		}
		var search = fields.search;
		var sql = "select * from things where title like '%" + search + "%' and isdelete=0 order by urgent desc,time asc";
		dao.query(sql, (err, result) => {
			if(err) {
				console.log(err);
				next();
				return;
			}
			sql = "select * from lists";
			dao.query(sql, (err, resl) => {
				if(err) {
					console.log(err);
					next();
					return;
				}
				response.render("index", {
					"userName": request.session.userName,
					"lists": resl,
					"contents": result,
					"list_flag": -1
				});
			});
		});
	});
}

exports.getLogout = (request, response, next) => {  //注销
	request.session.userName = null;
	response.writeHead(302, {
		"Location": "http://127.0.0.1:3000/login?tip=2"
	});
	response.end();
}