class GiftMessage extends MessageBox {

	private gift_info:eui.Label
	private gift_name:eui.Label
	private gift_img:eui.Image

	public constructor() {
		super();
	}

	private static shared:GiftMessage;
	private static pk_btn:eui.Group;
	public static getInstance(){
		if( !GiftMessage.shared){
			GiftMessage.shared = new GiftMessage();
		}
		return GiftMessage.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}

	public setGifInfo(data){

		
		const { name,icon,remark } = data

		this.gift_info.text = remark
		this.gift_name.text = name
		Utils.ImageLoader(icon).then(res=>{
			this.gift_img.source = res
		})

		this.once('onClose',()=>{
			this.gift_info.text = ''
			this.gift_name.text = ''
			if(this.gift_img){
				this.gift_img.source = ''
			}
		})
	}
	
}