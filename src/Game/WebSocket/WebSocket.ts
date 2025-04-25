class SocketIO{
    public socket;

    private needConnect = true

    private static shared:SocketIO;
	public static getInstance(){
		if( !SocketIO.shared){
			SocketIO.shared = new SocketIO();
		}
		return SocketIO.shared;
	}
    
    public init(){
        return new Promise((resolve)=>{
            if( this.needConnect ){
                this.connect()   
                this.socket.once('disconnect',()=>{
                    console.log('disconnect')
                    this.needConnect = true
                })
                this.socket.once('connect', () => {
                    console.log('connect')
                    this.needConnect = false
                    resolve()
                })
            }else{
                resolve()
            }
        })
    }

    private connect(){
        this.socket = io.connect('ws://mental.api.linkyee.com', {
            hostname: 'mental.api.linkyee.com',
            path: '/socket.io',
            port: '80',
            secure: false,
            transports: ['websocket']
        });
    }
}