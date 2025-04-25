class ShoppingItem extends eui.ItemRenderer {
	// 购买按钮
	private buy_btn:eui.Group;
	// 礼物图标
	private gift_img:eui.Image;

	// 价格
	private price:eui.Label
	// 数量
	private amount:eui.Label

	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.buy_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.buy,this)

		this.gift_img.addEventListener(egret.TouchEvent.TOUCH_TAP,
			this.showGiftInfo,this)
	}

	public dataChanged(){
		this.amount.text = `x${this.data.amount}`
		this.price.text = Utils.formatNum(this.data.price)

		if(this.data.icon){
			Utils.ImageLoader(this.data.icon).then(res=>{
				this.gift_img.source = res
			})
		}
	}

	private showBuyMessage(info){
		const message = BuySuccessMessage.getInstance()
		message.showMessage()
		message.setInfo(info)
	}

	private showGiftInfo(){
		const message = GiftMessage.getInstance()
		message.showMessage()
		message.setGifInfo(this.data)
	}


	private async buy(){

		const loading = Loading.getInstance();
		const user_info = Store.getInstance().user

		if( user_info.key_count + this.data.amount > user_info.total_key_count ){
			alert('无法拥有更多钥匙')
			return
		}

		loading.show()
		const res = await Http.PostRequest<{
			errcode:number,
			errmsg:string,
			gift:any,
		}>('/gift/buy',{
			id:this.data._id,
			amount:this.data.amount
		})
		loading.hide()

		if( res.errcode === 0 ){
			ShoppingMallScene.getInstance().dispatchEvent(new egret.Event('updateUserInfo'))
			this.showBuyMessage({ ...res.gift , ...{ amount:this.data.amount }})
		}else{
			alert(res.errmsg)
		}
	}
	
}