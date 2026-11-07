import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const hash=b=>createHash('sha256').update(b).digest('hex');
if(process.argv[2]==='verify'){
 const dir=resolve(process.argv[3]),manifest=JSON.parse(await readFile(join(dir,'manifest.json'),'utf8'));
 for(const [name,checksum]of Object.entries(manifest)){if(!resolve(dir,name).startsWith(dir+requireSep()))throw Error('Ruta inválida');const b=await readFile(join(dir,name));if(hash(b)!==checksum)throw Error('Hash incorrecto: '+name);if(name.endsWith('.json'))JSON.parse(b.toString())}console.log('Backup: hashes y JSON verificados. No equivale a una restauración en Supabase.');process.exit(0);
}
function requireSep(){return process.platform==='win32'?'\\':'/'}
const env=process.env;if(!env.BACKUP_DIR||!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Faltan BACKUP_DIR y variables privadas de Supabase.');
const baseDir=resolve(env.BACKUP_DIR),repo=resolve(fileURLToPath(new URL('..',import.meta.url)));
if(baseDir.toLowerCase().startsWith(repo.toLowerCase()+requireSep())||baseDir.toLowerCase()===repo.toLowerCase())throw Error('BACKUP_DIR debe estar fuera del repositorio.');
const dir=join(baseDir,new Date().toISOString().replaceAll(':','-'));
await mkdir(dir,{recursive:true});const manifest={};
async function api(path,method='GET',body){const r=await fetch(env.SUPABASE_URL+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error('Backup falló '+r.status);return r}
async function save(name,b){await writeFile(join(dir,name),b);manifest[name]=hash(b)}
for(const table of ['members','blocked_sessions','content','versions','posts','inquiries','contact_lists','campaigns','message_queue','videos','inquiry_messages','notification_targets','chat_notifications']){
 let offset=0,all=[];while(true){const rows=await (await api('/rest/v1/'+table+'?select=*&limit=500&offset='+offset)).json();all.push(...rows);if(rows.length<500)break;offset+=500}await save(table+'.json',Buffer.from(JSON.stringify(all)));
}
let files=[];async function walk(prefix){let offset=0;while(true){const rows=await (await api('/storage/v1/object/list/media','POST',{prefix,limit:500,offset,sortBy:{column:'name',order:'asc'}})).json();for(const r of rows){const path=(prefix?prefix+'/':'')+r.name;if(r.id){const name='media-'+files.length+'.bin';await save(name,Buffer.from(await(await api('/storage/v1/object/media/'+path)).arrayBuffer()));files.push({path,file:name})}else await walk(path)}if(rows.length<500)break;offset+=500}}
await walk('');await save('storage-index.json',Buffer.from(JSON.stringify(files)));await writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2));console.log('Backup de aplicación y medios exportado. Guardarlo cifrado y con acceso privado.');
