class UseKeyMessageBox extends MessageBox implements  eui.UIComponent {
	private correct_answer:eui.Label
	private analysis:eui.Label
	private analysis_scroll:eui.Scroller
	public constructor() {
		super();
	}

	private static shared:UseKeyMessageBox;
	public static getInstance(){
		if( !UseKeyMessageBox.shared){
			UseKeyMessageBox.shared = new UseKeyMessageBox();
		}
		return UseKeyMessageBox.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	public setSate(state, correct_answer, analysis){
		this.correct_answer.text = '答案：' + correct_answer;
		this.analysis.text = '解析：' + analysis;
		// 答案解析滚动恢复到顶部
		this.analysis_scroll.viewport.scrollV = 0
	}
}