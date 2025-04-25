let isMusic = false;

class SoundManager {
    private error_sound:egret.Sound;
    private success_sound:egret.Sound;
    private bg_sound:egret.Sound;
    private bg_sound_channel:egret.SoundChannel;
    
    // 在音乐加载后进行播放
    private todoPlay = false;

    private static shared:SoundManager;
	public static getInstance(){
		if( !SoundManager.shared){
			SoundManager.shared = new SoundManager();
		}
		return SoundManager.shared;
	}
    public constructor(){
        this.error_sound = this.loadSound('resource/assets/sound/error.wav')
        this.success_sound = this.loadSound('resource/assets/sound/success.wav')
        this.bg_sound = this.loadSound('resource/assets/sound/bg.mp3')
        // this.bg_sound.addEventListener(egret.Event.COMPLETE,this.playBgSound,this)
        if( Utils.Cookie.getCookie('music_play') ){
            isMusic = Utils.Cookie.getCookie('music_play') === '1' ? true : false;
         }else{
            Utils.Cookie.setCookie('music_play','1',365)
        }
    }
    public static get isMusic() {
        return isMusic;
    }
    public static set isMusic(value) {
        isMusic = value;
        Utils.Cookie.setCookie('music_play',value ? '1' : '0',365);
    }

    private loadSound(url){
        var sound:egret.Sound = new egret.Sound();

        sound.addEventListener(egret.IOErrorEvent.IO_ERROR, function loadError(event:egret.IOErrorEvent) {
            console.log("loaded error!");
            alert('背景音乐加载失败');
        }, this);

        sound.addEventListener(egret.Event.COMPLETE,()=>{
             // 如果todoplay为true 加载完音乐后进行播放
            if(this.todoPlay) this.playBgSound();
        },this)

        sound.load(url);
        return sound;
    }

    public playErrorSound(){
        if( SoundManager.isMusic ){
            this.error_sound.play(0,1);
        }
    }

    public playSuccessSound(){
        if( SoundManager.isMusic ){
            this.success_sound.play(0,1);
            
        }
    }

    public playBgSound(){
        if( SoundManager.isMusic ){
           this.bg_sound_channel = this.bg_sound.play(0,0);
           this.bg_sound_channel.volume = 0.3;
           this.todoPlay = true
        }else{
            this.todoPlay = false
        }
    }

    public stopBgSound(){
        if( this.bg_sound_channel){
            this.bg_sound_channel.stop();
        }
    }
}