class LoginInMessageBox extends MessageBox implements eui.UIComponent {
	private credit:eui.Label

	public constructor() {
		super();
	}

	private static shared:LoginInMessageBox;
	public static getInstance(){
		if( !LoginInMessageBox.shared){
			LoginInMessageBox.shared = new LoginInMessageBox();
		}
		return LoginInMessageBox.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
	}

	public setCredit(num){
		this.credit.text = `金币 +${num}`
	}
	
}