class ChooseTypeDetailScenen extends CommonScene {
	public constructor() {
		super();
	}
	
	private static shared:ChooseTypeDetailScenen;
	public static getInstance(){
		if( !ChooseTypeDetailScenen.shared){
			ChooseTypeDetailScenen.shared = new ChooseTypeDetailScenen();
		}
		return ChooseTypeDetailScenen.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackBtn();
	}
	
}