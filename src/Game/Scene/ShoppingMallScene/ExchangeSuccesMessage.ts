class ExchangeSuccesMessage extends MessageBox implements  eui.UIComponent {
	private message:eui.Label
	private gift_info:eui.Label;
	private gift_icon:eui.Image;

	public constructor() {
		super();
	}

	private static shared:ExchangeSuccesMessage;
	private static pk_btn:eui.Group;
	public static getInstance(){
		if( !ExchangeSuccesMessage.shared){
			ExchangeSuccesMessage.shared = new ExchangeSuccesMessage();
		}
		return ExchangeSuccesMessage.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
	}

	public setInfo(info){
		Utils.ImageLoader(info.icon).then(res=>{
			this.gift_icon.source = res
		})
		this.message.text = `成功兑换${info.name}`
		this.gift_info.text = info.remark
	}	
	
}