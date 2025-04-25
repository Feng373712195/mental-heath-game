class AboutLevelItem extends eui.ItemRenderer {
	private text:eui.Label

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
		this.text.text = `${this.data.name}：${this.data.minCredit}-${this.data.credit}`
	}
	
}