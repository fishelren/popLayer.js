(function(){

	var globalVariable={ //全局变量都放在这个对象中统一管理
		//视口的宽高
		pageWidth:null,
		pageHeight:null
	}

	var EventUtil={ //跨浏览器事件处理
		addHandler:function(element,type,handler){
			if(element.addEventListener){ //DOM 2级事件处理程序
				element.addEventListener(type,handler,false);
			}else if(element.attachEvent){ //针对IE8及之前
				element.attachEvent("on"+type,handler);
			}else{ //DOM 0级事件处理程序
				element["on"+type]=handler;
			}
		},
		removeHandler:function(element,type,handler){
			if(element.removeEventListener){
				element.removeEventListener(type,handler,false);
			}else if(element.detachEvent){
				element.detachEvent("on"+type,handler);
			}else{
				element["on"+type]=null;
			}
		},
		getEvent:function(event){ //跨浏览器获得事件对象，IE8及之前的DOM 0级事件处理程序只能从window中获取event对象
			return event?event:window.event;
		},
		getTarget:function(event){ //获得事件的目标对象
			return event.target || event.srcElement;
		},
		preventDefault:function(event){ //取消事件的默认行为
			if(event.preventDefault){ //能力检测
				event.preventDefault();
			}else{
				event.returnValue=false;
			}
		},
		stopPropagation:function(event){ //取消事件传播
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble=true;
			}
		}
	};

	function popLayer(){ //创建弹出层的类

	}
	
	function getViewScale(){ //得到视口的宽高
		
		globalVariable.pageWidth=window.innerWidth;
		globalVariable.pageHeight=window.innerHeight;

		//兼容老版本浏览器
		if(typeof pageWidth!="number"){
			if(document.compatMode=="CSS1Compat"){
				globalVariable.pageWidth=document.documentElement.clientWidth;
				globalVariable.pageHeight=document.documentElement.clientHeight;
			}else{
				globalVariable.pageWidth=document.body.clientWidth;
				globalVariable.pageHeight=document.body.clientHeight;
			}
		}
	}

	popLayer.prototype.init=function(settingObj,configObj){ //如果没有指定属性值或配置，则指定默认值
		
		var defaultSetting={ //默认样式，left和top随后计算得到
			width:"500px",
			height:"300px"
		};

		var defaultConfigSetting={ //默认配置项
			"data-flag":true,  //默认支持拖拽
			title:"", //标题栏文本
			content:"",
			okFunc:null, //“确定”响应函数
			cancelFunc:null //“取消”响应函数
		};

		for(var attrName in defaultSetting){
			if(!settingObj.hasOwnProperty(attrName)){
				settingObj[attrName]=defaultSetting[attrName];
			}
		}

		for(var configName in defaultConfigSetting){
			if(!configObj.hasOwnProperty(configName)){
				configObj[configName]=defaultConfigSetting[configName];
			}
		}

		getViewScale();//初次计算视口大小

		//默认至于窗口的中央
		if(!settingObj.hasOwnProperty("left") || !settingObj.hasOwnProperty("top")){

			if(!settingObj.hasOwnProperty("left")){
				settingObj["left"]=globalVariable.pageWidth/2-parseInt(settingObj["width"])/2+"px";
			}
			if(!settingObj.hasOwnProperty("top")){
				settingObj["top"]=globalVariable.pageHeight/2-parseInt(settingObj["height"])/2+"px";
			}
		}

	}

	var param={ //控制物体拖拽效果的相关参数
		
		//拖拽物体起始时的left和top
		objInitLeft:0,
		objInitTop:0,
		//拖拽开始时鼠标的位置
		mouseInitX:0,
		mouseInitY:0,
		//拖拽开关
		flag:false
	}

	//得到计算样式对象
	function getStyleValue(obj,style){ //得到对象中某个属性的计算样式值
		return obj.currentStyle?obj.currentStyle[style]:document.defaultView.getComputedStyle(obj,null)[style];
	}

	var drag=function(dragObj){ //拖拽

		var dragObjWidth=parseInt(getStyleValue(dragObj,"width"));
		var dragObjHeight=parseInt(getStyleValue(dragObj,"height"));

		EventUtil.addHandler(dragObj,"mousedown",function(event){
			var e=EventUtil.getEvent(event);

			param.flag=true;

			param.mouseInitX=e.clientX;
			param.mouseInitY=e.clientY;
			
			//这里不要用this,因为attachEvent/detachEvent是在全局作用域中运行的，this===window
			param.objInitLeft=parseInt(getStyleValue(dragObj,"left"));
			param.objInitTop=parseInt(getStyleValue(dragObj,"top"));

		});

		EventUtil.addHandler(document,"mouseup",function(){
			param.flag=false;
		});

		EventUtil.addHandler(document,"mousemove",function(event){ 
			
			var e=EventUtil.getEvent(event); //确保能够跨浏览器获得事件对象

			/* 
				阻止鼠标移动时的默认行为，解决了Chrome和Opera上由于拖拽
				触发了浏览器的drag操作，从而导致mouseup事件丢失的bug

				mousedown和mousemove事件组合使用时本身就带有拖拽(drag)和选择(selection)的默认操作,
				同时发生时（拖拽选中的内容）就会造成mouseup事件的丢失
			*/
			EventUtil.preventDefault(e);
			
			if(dragObj.getAttribute("data-flag") && param.flag){

				//鼠标拖拽过程中的实时位置
				var mouseNowX=e.clientX; 
				var mouseNowY=e.clientY;

				//鼠标相对于拖拽起点的位移，而物体的偏移量对应着鼠标的偏移量
				var offsetX=mouseNowX-param.mouseInitX;
				var offsetY=mouseNowY-param.mouseInitY;

				var dragObjDestLeft=param.objInitLeft+offsetX;
				var dragObjDestTop=param.objInitTop+offsetY;

				//保证物体在视口范围内拖拽
				if(dragObjDestLeft<0){
					dragObjDestLeft=0;
				}
				if(dragObjDestTop<0){
					dragObjDestTop=0;
				}
				if(dragObjDestLeft+dragObjWidth>globalVariable.pageWidth){
					dragObjDestLeft=globalVariable.pageWidth-dragObjWidth;
				}
				if(dragObjDestTop+dragObjHeight>globalVariable.pageHeight){
					dragObjDestTop=globalVariable.pageHeight-dragObjHeight;
				}
				dragObj.style.left=dragObjDestLeft+"px";
				dragObj.style.top=dragObjDestTop+"px";
			}
		});
	}

	function destroyElemFromBody(elem,parent){ //从父元素parent上移除子元素elem，并销毁
		elem.style.visibility="hidden";
		parent.removeChild(elem);
		elem=null; //销毁
	}

	popLayer.prototype.open=function(options,config){

		var setting={}; //接收自定义样式
		var configSetting={}; //接收自定义配置

		var body=document.getElementsByTagName("body")[0];

		var frame=document.createElement("div");
		frame.className="layer-frame";

		/******弹出层标题栏******/
		var frameTitle=document.createElement("div");
		frameTitle.className="layer-frame-title";

		var frameCloseBtn=document.createElement("button");
		frameCloseBtn.className="layer-frame-title-btn";

		var frameCloseBtnLogo=document.createElement("span");
		var frameCloseBtnLogoTxt=document.createTextNode("×");
		frameCloseBtnLogo.appendChild(frameCloseBtnLogoTxt);
		frameCloseBtn.appendChild(frameCloseBtnLogo);
		EventUtil.addHandler(frameCloseBtn,"click",function(){
			
			destroyElemFromBody(frame,body);
		});

		frameTitle.appendChild(frameCloseBtn);

		var frameTitleTxt=document.createElement("span");
		frameTitleTxt.className="layer-frame-title-txt";
		frameTitle.appendChild(frameTitleTxt);
		
		//解决IE6-9不支持user-select样式的问题
		frameTitle.onselectstart = function(){ return false; }
		
		frame.appendChild(frameTitle);

		/***************************************/

		/***********弹出层按钮部分**************/
		var frameBtnsWrapper=document.createElement("div");
		frameBtnsWrapper.className="layer-frame-btns-wrapper";

		var okBtn=document.createElement("button");
		var okBtnTxt=document.createTextNode("确定");
		okBtn.className="layer-frame-btn okBtn";
		okBtn.appendChild(okBtnTxt);

		var cancelBtn=document.createElement("button");
		var cancelBtnTxt=document.createTextNode("取消");
		cancelBtn.className="layer-frame-btn";
		cancelBtn.appendChild(cancelBtnTxt);

		frameBtnsWrapper.appendChild(okBtn);
		frameBtnsWrapper.appendChild(cancelBtn);

		frame.appendChild(frameBtnsWrapper);
		
		/*************************/

		/**************弹出层内容区域****************/
		var frameContent=document.createElement("div");
		frameContent.className="layer-frame-content";

		//解决IE6-9不支持user-select样式的问题
		frameContent.onselectstart = function(){ return false; }

		frame.appendChild(frameContent);
		/*************************/

		for(var attrName in options){

			var attrVal=options[attrName];
			
			if(attrName==="width" || attrName==="height" || 
				attrName==="left" || attrName==="top"){
				setting[attrName]=attrVal;
				if(setting[attrName].toString().indexOf("px")==-1){
					setting[attrName]+="px";
				}
			}else if(attrName==="drag"){
				setting[attrName]=attrVal;
			}
		}

		for(var configName in config){
			var configVal=config[configName];
			configSetting[configName]=configVal;
		}

		this.init(setting,configSetting); //没有设定的样式或配置就设定默认值

		for(var attrName in setting){
			frame.style[attrName]=setting[attrName];
		}

		for(var configName in configSetting){
			
			if(configName==="title"){
				frameTitleTxt.innerHTML=configSetting[configName]; //设置标题文字
			}else if(configName==="content"){
				frameContent.innerHTML=configSetting[configName];
			}else if(configName==="okFunc"){

				if(configSetting[configName]!=null){

					EventUtil.addHandler(okBtn,"click",function(){
						
						destroyElemFromBody(frame,body);
						configSetting.okFunc.apply(window);//configSetting[configName]在此处会变成boolean类型的true，很奇怪
					});

				}else{
					EventUtil.addHandler(okBtn,"click",function(){
						
						destroyElemFromBody(frame,body);
					});
					
				}
				
			}else if(configName==="cancelFunc"){

				if(configSetting[configName]!=null){
					EventUtil.addHandler(cancelBtn,"click",function(args){ //args为自定义的参数数组，有别于隐式存在的arguments类数组对象

						destroyElemFromBody(frame,body);
						configSetting.cancelFunc.apply(window); //在全局作用域中执行这个函数
					});
				}else{
					EventUtil.addHandler(cancelBtn,"click",function(){
						
						destroyElemFromBody(frame,body);
					});
				}
			}else{
				frame.setAttribute(configName,configSetting[configName]);
			}
			
		}

		body.appendChild(frame);

		frame.style.visibility="visible";

		drag(frame);
	}

	EventUtil.addHandler(window,"resize",getViewScale); //窗口大小改变，重新计算视口尺寸

	var popLayer=new popLayer();

	window.popLayer=popLayer; //添加到window的属性上
})();