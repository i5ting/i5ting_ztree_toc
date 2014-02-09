;(function($) { 

	$.fn.tab = function(options) {
		// 将defaults 和 options 参数合并到{}
		var opts = $.extend({},$.fn.tab.defaults,options);
		
		return this.each(function() {
			var obj = $(this);
			
			$(obj).find('.tab_header li').on(opts.trigger_event_type, function (){
				$(obj).find('.tab_header li').removeClass('active');
				$(this).addClass('active');

				$(obj).find('.tab_content div').hide();
				$(obj).find('.tab_content div').eq($(this).index()).show();
			})		
		});
		// each end
	}
	
	//定义默认
	$.fn.tab.defaults = {
		trigger_event_type:'click', //mouseover | click 默认是click
	};

})(jQuery);