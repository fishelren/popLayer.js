一个自定义的弹出层控件，兼容到IE7。IE7/+,FF,Chrome,Opera测试通过。

用法：

引入CSS文件

	<link href="popLayer.css" rel="stylesheet">

引入JavaScript文件

	<script type="text/javascript" src="popLayer.js"></script>

创建弹出层控件

	popLayer.open({
		/*初始时距离视口顶端和左侧的距离，单位默认为px，不设置top和left则出现在视口中央*/
		top:100, //clientX
		left:200 //clientY
	},{
		"data-flag":true, //默认为true，可拖拽
		title:"hello world", //默认为空
		content:"This is a pop layer library", //默认为空
		okFunc:function(){ //点击“确定”按钮的响应函数，不设置则仅销毁弹出层
			alert("您点击了\"确定\"按钮");
		},
		cancelFunc:function(){ //点击“取消”按钮的响应函数，不设置则仅销毁弹出层
			alert("您点击了\"取消\"按钮");
		}
	});

	