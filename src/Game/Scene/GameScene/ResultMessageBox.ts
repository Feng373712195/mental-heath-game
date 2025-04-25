class ResultMessageBox extends MessageBox implements  eui.UIComponent {
	
	private analysis_scroll:eui.Scroller
	private axnum:eui.Label;
	private top_tip:eui.Group
	private tip_text1:eui.Image;
	private tip_text2:eui.Image;
	private title:eui.Label
	private bg_img:eui.Image
	
	private right_answer:eui.Label
	private analysis:eui.Label

	private message_ctx:eui.Group;

	// 下一题按钮
	private close_btn_text:eui.Label

	public constructor() {
		super();
		this.set_bg = false
	}

	private static shared:ResultMessageBox;
	public static getInstance(){
		if( !ResultMessageBox.shared){
			ResultMessageBox.shared = new ResultMessageBox();
		}
		return ResultMessageBox.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.bg_img.source = 'message_bg_png'
		console.log( document.body.clientHeight , 'message_box' )
		if( document.body.clientHeight < 700 ){
			this.messagebox.anchorOffsetY = 700 / 2;
			this.messagebox.height = 700;
			this.message_ctx.height = 300;
		}
	}
	
	public setSate(state,right,analysis,axnum,islast,readonly?){
		this.right_answer.text = '答案：' + right;
		this.axnum.text = `+${axnum}`;
		this.axnum.visible = readonly ? false : true;
		this.analysis.text = analysis;

		// 答案解析滚动恢复到顶部
		this.analysis_scroll.viewport.scrollV = 0

		if( readonly ){
			this.title.visible = true
			this.top_tip.visible = false
			this.tip_text1.visible = false
			this.tip_text2.visible = false 
			this.close_btn_text.text = '关闭'
		}else{
			this.title.visible = false
			this.top_tip.visible = true
			this.tip_text1.visible = state ? true : false
			this.tip_text2.visible = state ? false : true
			this.close_btn_text.text = islast ? '完成答题' : '下一题'
		}
	}
}