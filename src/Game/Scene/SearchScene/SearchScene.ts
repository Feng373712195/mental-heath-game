class SearchScene extends CommonScene{
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
		this.setBackBtn()
	}

	private static shared:SearchScene;
	public static getInstance(){
		if( !SearchScene.shared){
			SearchScene.shared = new SearchScene();
		}
		return SearchScene.shared;
	}

	
}