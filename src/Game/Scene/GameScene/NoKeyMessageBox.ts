class NoKeyMessageBox extends MessageBox implements  eui.UIComponent {
	public constructor() {
		super();
	}

	private static shared:NoKeyMessageBox;
	public static getInstance(){
		if( !NoKeyMessageBox.shared){
			NoKeyMessageBox.shared = new NoKeyMessageBox();
		}
		return NoKeyMessageBox.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	
}