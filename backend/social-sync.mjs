// Sincroniza videos públicos autorizados de TikTok. No extrae estados privados.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const env=process.env,repo=resolve(fileURLToPath(new URL('..',import.meta.url)));
for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'])if(!env[key])throw Error('Falta '+key);
const tokenFile=env.SOCIAL_TOKEN_FILE?resolve(env.SOCIAL_TOKEN_FILE):null;
if(tokenFile){const r=relative(repo,tokenFile);if(!r.startsWith('..')&&!resolve(r).startsWith('..'))throw Error('SOCIAL_TOKEN_FILE debe estar fuera del repositorio');}
let token={access_token:env.TIKTOK_ACCESS_TOKEN,refresh_token:env.TIKTOK_REFRESH_TOKEN,expires_at:0};
if(tokenFile){try{token={...token,...JSON.parse(await readFile(tokenFile,'utf8'))}}catch(e){if(e.code!=='ENOENT')throw e}}
async function accessToken(){
 if(token.refresh_token&&env.TIKTOK_CLIENT_KEY&&env.TIKTOK_CLIENT_SECRET&&Date.now()>token.expires_at-60000){
  const r=await fetch('https://open.tiktokapis.com/v2/oauth/token/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_key:env.TIKTOK_CLIENT_KEY,client_secret:env.TIKTOK_CLIENT_SECRET,grant_type:'refresh_token',refresh_token:token.refresh_token}),signal:AbortSignal.timeout(20000)});
  const data=await r.json();if(!r.ok||!data.access_token)throw Error('Reconectar autorización TikTok');token={access_token:data.access_token,refresh_token:data.refresh_token||token.refresh_token,expires_at:Date.now()+data.expires_in*1000};
  if(!tokenFile)throw Error('Configura SOCIAL_TOKEN_FILE privado para conservar la rotación de tokens');await mkdir(dirname(tokenFile),{recursive:true});await writeFile(tokenFile,JSON.stringify(token),{mode:0o600});
 }
 if(!token.access_token)throw Error('Autoriza TikTok Display API antes de sincronizar');return token.access_token;
}
async function db(path,method='GET',body,prefer){const r=await fetch(env.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('No se pudo actualizar la web');return r.status===204?null:r.json()}
async function syncTikTok(){
 const key=await accessToken(),r=await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,share_url,create_time',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({max_count:20}),signal:AbortSignal.timeout(20000)}),data=await r.json();
 if(!r.ok||data.error?.code&&data.error.code!=='ok')throw Error('TikTok rechazó el acceso; revisar permisos o reconectar');
 let imported=0;for(const video of data.data?.videos||[]){
  const external_id='tiktok:'+video.id,existing=await db('posts?external_id=eq.'+encodeURIComponent(external_id)+'&select=id');if(existing.length)continue;
  const link=new URL(video.share_url);if(link.protocol!=='https:'||!/(^|\.)tiktok\.com$/.test(link.hostname))continue;
  // Se respeta el estado local del contenido ya importado; el usuario puede despublicarlo o anclarlo.
  await db('posts?on_conflict=external_id','POST',{external_id,external_url:link.href,platform:'tiktok',title:String(video.title||'Novedad de TikTok').slice(0,199),body:String(video.video_description||''),published:env.SOCIAL_AUTO_PUBLISH==='true',created_at:video.create_time?new Date(video.create_time*1000).toISOString():new Date().toISOString()},'resolution=ignore-duplicates,return=representation');imported++;
 }
 console.log('TikTok: '+imported+' publicaciones nuevas importadas como '+(env.SOCIAL_AUTO_PUBLISH==='true'?'publicadas':'borradores')+'.');
}
let stop=false;process.on('SIGTERM',()=>stop=true);process.on('SIGINT',()=>stop=true);
do{try{await syncTikTok()}catch(e){console.error(e.message)}if(process.argv.includes('--once'))break;await new Promise(r=>setTimeout(r,120000))}while(!stop);
