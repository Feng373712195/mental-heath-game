class ServiceScene extends CommonScene {
	private text_scroll:eui.Scroller;
	private titles:eui.Label[]
	private rules:eui.Label[]
	private rulesH:number[] = []
	private openIndex:number[] = []

	private view_btn:eui.Label;

	public constructor() {
		super();
	}

	private static shared:ServiceScene;
	public static getInstance(){
		if( !ServiceScene.shared){
			ServiceScene.shared = new ServiceScene();
		}
		return ServiceScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	private initRuleText(){
		this.rules.forEach(i=>{ 
			i.height = 0; 
			i.alpha = 0 
		})
	}

	private toggleRule(index:number,toggle:boolean){

		let tw = egret.Tween.get(this.rules[index])
		tw.to({ 
			height:toggle ? 0 : this.rules[index].textHeight ,
			alpha:toggle ? 0 :1
		},100)

		toggle ? this.openIndex.splice(this.openIndex.indexOf(index),1) :
		this.openIndex.push(index)
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackBtn()

		this.titles = this.querySelector(this.text_scroll,'title',true)
		this.rules = this.querySelector(this.text_scroll,'rule',true)

		this.initRuleText()


		this.titles.forEach((item,index)=>{
			item.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
				this.toggleRule(index,this.openIndex.indexOf(index)!== -1)
			},item)
		})
		
		this.view_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.toViewScene,this)
	}

	private async toViewScene(){
		window.location.href = 'https://mp.weixin.qq.com/s/ZFo5E7kE7fzyTvpSQdrpaA';
	}
	
}