require 'redcarpet'
require 'pygments'

require 'redcarpet'
require 'rexml/document'
module Redcarpet::Render
  class Custom < Base
    def header(title, level)
      @headers ||= []
 
      title_elements = REXML::Document.new(title)
      flattened_title = title_elements.inject('') do |flattened, element|
        flattened +=  if element.respond_to?(:text)
                        element.text
                      else
                        element.to_s
                      end
      end
      permalink = flattened_title.downcase.gsub(/[^a-z\s]/, '').gsub(/\W+/, "-")
      
      # for extra credit: implement this as its own method
      if @headers.include?(permalink)
        permalink += "_1"
         # my brain hurts
        loop do
          break if !@headers.include?(permalink)
          # generate titles like foo-bar_1, foo-bar_2
          permalink.gsub!(/\_(\d+)$/, "_#{$1.to_i + 1}")
        end
      end
      @headers << permalink
      %(\n<h#{level}><a name="#{permalink}" class="anchor" href="##{permalink}"><span class="anchor-icon"></span></a>#{title}</h#{level}>\n)
    end
  end
end

class HTMLwithPygments < Redcarpet::Render::HTML
	def doc_header()
    '<style>' + Pygments.css('.highlight',:style => 'friendly') + '</style>'
  end
	
  def block_code(code, language)
    Pygments.highlight(code, :lexer => language, :options => {:encoding => 'utf-8'})
  end
end

def build_with_dir(destiny_dir)
	Dir.foreach(destiny_dir) do |ff| 
	  # puts ff
		unless /^\./ =~ ff ||/^images/ =~ ff ||/^css/ =~ ff
			# get markdown text
			text = IO.read(destiny_dir + '/' + ff)
	
			# options = [:fenced_code,:generate_toc,:hard_wrap,:no_intraemphasis,:strikethrough,:gh_blockcode,:autolink,:xhtml,:tables]
  
			# convert to html
			markdown = Redcarpet::Markdown.new(HTMLwithPygments,:gh_blockcode=>true,:no_intra_emphasis=>true,:filter_html => true,:hard_wrap => true,:autolink => true, :space_after_headers => true,:fenced_code_blocks => true)
			parse_markdown = markdown.render(text)
			# parse_markdown = syntax_highlighter(parse_markdown)
			
			css_link = ''
			if destiny_dir.to_s.index('/') 
				css_link =  %Q{
						<link href="../style/github-bf51422f4bb36427d391e4b75a1daa083c2d840e.css" media="all" rel="stylesheet" type="text/css"/>
						<link href="../style/github2-d731afd4f624c99a4b19ad69f3083cd6d02b81d5.css" media="all" rel="stylesheet" type="text/css"/>
				}
			else
				css_link =  %Q{
						<link href="style/github-bf51422f4bb36427d391e4b75a1daa083c2d840e.css" media="all" rel="stylesheet" type="text/css"/>
						<link href="style/github2-d731afd4f624c99a4b19ad69f3083cd6d02b81d5.css" media="all" rel="stylesheet" type="text/css"/>
						<link href="../../css/zTreeStyle/zTreeStyle.css" media="all" rel="stylesheet" type="text/css"/>
				}
			end
			
		  t = %Q{
		    <html>
		      <head>
					  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
		        <title>#{ff.gsub('.md','')}</title>
						#{css_link}
					  <style>
						pre {
						    counter-reset: line-numbering;
						    border: solid 1px #d9d9d9;
						    border-radius: 0;
						    background: #fff;
						    padding: 0;
						    line-height: 23px;
						    margin-bottom: 30px;
						    white-space: pre;
						    overflow-x: auto;
						    word-break: inherit;
						    word-wrap: inherit;
						}

						pre a::before {
						  content: counter(line-numbering);
						  counter-increment: line-numbering;
						  padding-right: 1em; /* space after numbers */
						  width: 25px;
						  text-align: right;
						  opacity: 0.7;
						  display: inline-block;
						  color: #aaa;
						  background: #eee;
						  margin-right: 16px;
						  padding: 2px 10px;
						  font-size: 13px;
						  -webkit-touch-callout: none;
						  -webkit-user-select: none;
						  -khtml-user-select: none;
						  -moz-user-select: none;
						  -ms-user-select: none;
						  user-select: none;
						}

						pre a:first-of-type::before {
						  padding-top: 10px;
						}

						pre a:last-of-type::before {
						  padding-bottom: 10px;
						}

						pre a:only-of-type::before {
						  padding: 10px;
						}
					
						.highlight { background-color: #ffffcc } /* RIGHT */
						</style>
		      </head>
		      <body>
						<div>
							
						</div>
		        <div id='readme' style='width:834px;margin:20px auto'>
							<ul id="tree" class="ztree" style="">
				
							</ul>
		          <article class='markdown-body'>
		            #{parse_markdown}
		          </article>
		        </div>
		      </body>
		    </html>
				<script type="text/javascript" src="../../js/jquery-1.4.4.min.js"></script>
				<script type="text/javascript" src="../../js/jquery.ztree.core-3.5.js"></script>
				<script type="text/javascript" src="../../jquery.ztree_toc.js"></script>
				<SCRIPT type="text/javascript" >
				<!--
				$(document).ready(function(){
					$('#tree').ztree_toc({
						
					});
				});
				//-->
				</SCRIPT>
		  }
			
			if destiny_dir.to_s.index('/') 
				p 'build src/' + destiny_dir.to_s.split('/')[1] + '/' + ff.gsub('.md','') + '.html'
				build_dir = 'build/' + destiny_dir.to_s.split('/')[1] + '/'
				IO.write(build_dir + ff.gsub('.md','') + '.html',t) # => 10
			else
				p 'build src/' + ff.gsub('.md','') + '.html'
				build_dir = 'build/'  
				# write to html file
				IO.write(build_dir + ff.gsub('.md','') + '.html',t) # => 10
			end
			
		end
	end 
end 

build_with_dir('src')
