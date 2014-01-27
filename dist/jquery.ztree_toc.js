/*! ztree_toc - v0.1.0 - 2014-01-27
* https://github.com/i5ting/jQuery.zTree_Toc.js
* Copyright (c) 2014 alfred.sang; Licensed MIT */
/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1
 */ 
function encode_id_with_array(opts,arr){
	console.log('---------------- get_id_with_str start---------------\n');

	var result = 0;
  	for(var z = 0; z < arr.length; z++ ){  
		// str += opts.step+'*' +  opts.step + '*';
		
		result += factor(opts, arr.length - z ,arr[z]);
		console.log('z = ' + z + ',result=' ,result);
  	}

	console.log('result all = '+result);
	console.log('--------------end-----------------\n');
	
	return result;
}


/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1

	1,1 = 100

 */ 
function get_parent_id_with_array(opts,arr){
	console.log('---------------- get_id_with_str start---------------\n');
	var result_arr = [];

  	for(var z = 0; z < arr.length; z++ ){  
		result_arr.push(arr[z]);
  	}
	
	result_arr.pop();
	
	var result = 0;
  	for(var z = 0; z < result_arr.length; z++ ){  
		// str += opts.step+'*' +  opts.step + '*';
		
		result += factor(opts,result_arr.length - z,result_arr[z]);
		console.log('z = ' + z + ',result=',result);
  	}

	console.log('result all = '+result);
	console.log('--------------end-----------------\n');
	
	return result;
}

function factor(opts ,count,current){
	if(1 == count){
		return current;
	}
	
	var str = '';
	for(var i = count - 1;i > 0; i-- ){
		str += current * opts.step+'*';
	}
	
	console.log('str = '+str);
	
	return eval( str + '1' );
}

;(function($){
	/*
	 * 根据header创建目录内容
	 */	
	function create_toc(opts){
		$(opts.documment_selector).find(':header').each(function() {
			var level = parseInt(this.nodeName.substring(1), 10);
			
			_rename_header_content(opts,this,level);
			
			_add_header_node(opts,$(this));
		});//end each
	}
	
	/*
	 * 渲染ztree
	 */	
	function render_with_ztree(opts){
		var t = $(opts._zTree);
		t = $.fn.zTree.init(t,opts.ztreeSetting,opts._header_nodes).expandAll(opts.is_expand_all);
		// alert(opts._headers * 88);
		// $(opts._zTree).height(opts._headers  * 33 + 33);
			
		$(opts._zTree).css(opts.ztreeStyle);
	}
	
	/*
	 * 将已有header编号，并重命名
	 */	
	function _rename_header_content(opts ,header_obj ,level){
		if(opts._headers.length == level) {
			opts._headers[level - 1]++;
		} else if(opts._headers.length > level) {
			opts._headers = opts._headers.slice(0, level);
			opts._headers[level - 1] ++;
		} else if(opts._headers.length < level) {
			for(var i = 0; i < (level - opts._headers.length); i++) {
			  // console.log('push 1');
			  opts._headers.push(1);
			}
		}
		
		if(opts.is_auto_number == true){
			$(header_obj).text(opts._headers.join('.') + '. ' + $(header_obj).text());
		}
	}
	
	/*
	 * 给ztree用的header_nodes增加数据
	 */	
	function _add_header_node(opts ,header_obj){
		var id  = encode_id_with_array(opts,opts._headers);
		var pid = get_parent_id_with_array(opts,opts._headers);
	  
      	// 设置锚点id
		$(header_obj).attr('id',id);

		log($(header_obj).text());
		
		opts._header_nodes.push({
			id:id, 
			pId:pid , 
			name:$(header_obj).text()||'null', 
			open:true,
			url:'#'+ id,
			target:'_self'
		});
	}
	
	function log(str){
		if($.fn.ztree_toc.defaults.debug == true){
			console.log(str);
		}
	}

	$.fn.ztree_toc = function(options){
		// 将defaults 和 options 参数合并到{}
		var opts = $.extend({},$.fn.ztree_toc.defaults,options);
		
		return this.each(function(){
			opts._zTree = $(this);
			
			create_toc(opts);
			
			render_with_ztree(opts);
		})
		// each end
	}
	
	//定义默认
	$.fn.ztree_toc.defaults = {
		_zTree: null,
		_headers: [],
		_header_nodes: [{ id:1, pId:0, name:"Table of Content",open:true}],
		debug: true,
		documment_selector: 'body',
		is_posion_top: false,
		/*
		 * 默认是否显示header编号
		 */
		is_auto_number: false,
		/*
		 * 默认是否展开全部
		 */	
		is_expand_all: true,
		/*
		 * 是否对选中行，显示高亮效果
		 */	
		is_highlight_selected_line: true,
		step: 100,
		ztreeStyle: {
			width:'260px',
			overflow: 'auto',
			position: 'fixed',
			'z-index': 2147483647,
			border: '0px none',
			left: '0px',
			bottom: '0px',
			// height:'100px'
		},
		ztreeSetting: {
			view: {
				dblClickExpand: false,
				showLine: true,
				showIcon: false,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable: true,
					idKey : "id",
					pIdKey: "pId",
					// rootPId: "0"
				}
			},
			callback: {
				beforeClick: function(treeId, treeNode) {
					if($.fn.ztree_toc.defaults.is_highlight_selected_line == true){
						$('#' + treeNode.id).css('color' ,'red').fadeOut("slow" ,function() {
						    // Animation complete.
							$(this).show().css('color','black');
						});
					}
				}	
			}
		}
	};

})(jQuery);