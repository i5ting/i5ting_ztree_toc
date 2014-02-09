;$(function(){
	$('.tab_header li').on('mouseover', function (){
		$('.tab_header li').removeClass('active');
		$(this).addClass('active');

		$('.tab_content div').hide();
		$('.tab_content div').eq($(this).index()).show();
	})
});