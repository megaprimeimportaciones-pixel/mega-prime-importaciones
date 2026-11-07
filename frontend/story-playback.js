// Reproducción y avance de estados; el navegador decide si permite sonido automático.
window.MPStoryPlayback=class{
 constructor(next,changed=()=>{}){this.next=next;this.changed=changed;this.timer=null;this.token=0;this.paused=false;this.remaining=7000;this.total=7000;this.started=0;this.media=null;this.finished=false}
 stop(){this.token++;clearTimeout(this.timer);this.timer=null;if(this.media){this.media.onended=null;this.media.onerror=null;this.media.onpause=null;this.media.onplay=null;this.media.pause()}this.media=null}
 countdown(ms){clearTimeout(this.timer);this.remaining=this.total=ms;this.started=Date.now();if(!this.paused)this.timer=setTimeout(()=>this.done(),ms)}
 done(){if(this.finished||this.paused)return;this.finished=true;this.stop();this.next()}
 async start(media=null,ms=7000){this.stop();this.finished=false;this.paused=false;this.remaining=this.total=ms;this.media=media;const token=this.token;this.changed();if(!media){this.countdown(ms);return}media.onended=()=>this.done();media.onpause=()=>{if(!media.ended)this.pause()};media.onplay=()=>{if(this.paused){this.paused=false;this.changed()}};media.onerror=()=>{if(token===this.token)this.countdown(4000)};try{await media.play()}catch{if(token!==this.token||this.paused)return;media.muted=true;try{await media.play()}catch{if(token===this.token)this.countdown(ms)}}if(token===this.token){if(this.paused)media.pause();this.changed()}}
 pause(){if(this.paused)return;this.paused=true;if(this.timer){clearTimeout(this.timer);this.timer=null;this.remaining=Math.max(0,this.remaining-(Date.now()-this.started))}this.media?.pause();this.changed()}
 async resume(){if(!this.paused)return;this.paused=false;if(this.media){if(this.media.ended){this.done();return}try{await this.media.play()}catch{this.media.muted=true;try{await this.media.play()}catch{this.countdown(this.remaining)}}}else{this.started=Date.now();this.timer=setTimeout(()=>this.done(),this.remaining)}this.changed()}
 async sound(){if(!this.media)return;this.media.muted=false;try{await this.media.play()}catch{this.media.muted=true}this.changed()}
 get progress(){if(this.media&&Number.isFinite(this.media.duration)&&this.media.duration>0)return this.media.currentTime/this.media.duration;return Math.min(1,Math.max(0,1-(this.remaining-(this.paused?0:Date.now()-this.started))/this.total))}
};
