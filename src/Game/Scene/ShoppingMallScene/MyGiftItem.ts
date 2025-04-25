const addZero = (num: number) => (num > 9 ? num : `0${num}`)


class MyGiftItem extends eui.ItemRenderer {
	private gift_img:eui.Image;
	private gift_info:eui.Group
	private gift_name:eui.Label;
	private gift_time:eui.Label
	
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
	}
	
	public dataChanged(){

		if( this.data && this.data.gift ){
			if( this.data.gift.icon ){
				Utils.ImageLoader(this.data.gift.icon).then(res=>{
					this.gift_img.source = res
				})
			}
			this.gift_name.text = `${this.data.gift.name} x${this.data.amount}`
			if( this.data.valid_until ){
				// const createdTime = new Date(this.data.gift.created_at)
				// const time = new Date( (+createdTime) * (this.data.gift.valid_days * 1000 * 60 * 60 * 24 ))
				const time = new Date(this.data.valid_until)
				const date = `${time.getFullYear()}-${addZero(time.getMonth() + 1)}-${addZero(time.getDate())}`
				this.gift_time.text = `${date}过期`

				this.gift_info.height = 60
			}else{
				this.gift_info.height = 30
			}
		}
	}
}