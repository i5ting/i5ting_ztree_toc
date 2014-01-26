# jQuery.zTree_Toc.js

this is a jQuery plugin for preview  markdown table of content

## Usage

Add this line to your html file:

	<script type="text/javascript" src="js/jquery-1.4.4.min.js"></script>
	<script type="text/javascript" src="js/jquery.ztree.core-3.5.js"></script>
	<script type="text/javascript" src="jquery.ztree_toc.js"></script>

And then execute:

	<SCRIPT type="text/javascript" >
	<!--
	$(document).ready(function(){
		$('#tree').ztree_toc({
	
		});
	});
	//-->
	</SCRIPT>
	

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## 版本历史

v0.0.5
完成了基本功能，打开编辑，实时预览。

TODO
v0.0.6

记成bootstrap
支持vim
支持保存和打开
支持布局，左右全屏等



## Example

```javascript
$('#tree').ztree_toc({

});
```

## License

this gem is released under the [MIT License](http://www.opensource.org/licenses/MIT).
