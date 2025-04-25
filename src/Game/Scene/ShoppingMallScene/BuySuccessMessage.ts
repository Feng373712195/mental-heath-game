class BuySuccessMessage extends MessageBox implements  eui.UIComponent {
	private amount:eui.Label
	private remark:eui.Label
	private icon:eui.Image
	private gift_icon:eui.Image;
	
	public constructor() {
		super();
	}

	private static shared:BuySuccessMessage;
	private static pk_btn:eui.Group;
	public static getInstance(){
		if( !BuySuccessMessage.shared){
			BuySuccessMessage.shared = new BuySuccessMessage();
		}
		return BuySuccessMessage.shared;
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
		const { icon, remark, amount} = info
		if(icon){
			Utils.ImageLoader(icon).then(res=>{
				this.icon.source = res
			})
		}
		this.remark.text = remark
		this.amount.text = `+${amount}`
	}	
}