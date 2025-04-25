class AboutScene extends CommonScene {
	private view_btn:eui.Label
	public constructor() {
		super();
	}

	private static shared:AboutScene;
	public static getInstance(){
		if( !AboutScene.shared){
			AboutScene.shared = new AboutScene();
		}
		return AboutScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackBtn();
		this.view_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.toViewScene.bind(this),
		this);
	}

	private async toViewScene(){
		window.location.href = 'https://mp.weixin.qq.com/s/QqVd6AOIw91l3p9NSCuMow';
	}
	
}