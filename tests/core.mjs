import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
const base=new URL('../frontend/',import.meta.url),store=new Map();
const sandbox={window:null,sessionStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},console,URL,Blob,Response,crypto,location:{href:'https://example.test/',origin:'https://example.test'},fetch:async()=>new Response(JSON.stringify({access_token:'test',refresh_token:'refresh',user:{id:'u1'}}))};sandbox.window=sandbox;
vm.createContext(sandbox);
for(const file of readdirSync(base).filter(f=>f.endsWith('.js')))new vm.Script(readFileSync(new URL(file,base),'utf8'),{filename:file});
for(const f of ['config.js','calc-rules.js','cms_shared.js','integrations-defaults.js','client.js'])vm.runInContext(readFileSync(new URL(f,base),'utf8'),sandbox,{filename:f});
sandbox.MP_CONFIG.url='https://example.test';sandbox.MP_CONFIG.anonKey='public-test';
assert(sandbox.MPI_cleanConfig(sandbox.MPI_CMS_DEFAULTS).location);
assert.equal(sandbox.MPI_cleanConfig(sandbox.MPI_CMS_DEFAULTS).chatbot.name,'Prime');
assert.equal(sandbox.MPI_CMS_DEFAULTS.branding.name,'Mega Prime Importaciones');
sandbox.document={getElementById:()=>null};
for(const f of ['contact-settings.js','social-settings.js'])vm.runInContext(readFileSync(new URL(f,base),'utf8'),sandbox);
const phones=JSON.parse(JSON.stringify(sandbox.MPI_CMS_DEFAULTS));
// Las extensiones deben conservar sus campos aunque se limpien antes de cargar sus defaults.
const savedDefaults=sandbox.MPI_CMS_DEFAULTS;delete sandbox.MPI_CMS_DEFAULTS.location;const incoming={...JSON.parse(JSON.stringify(savedDefaults)),location:{visible:true,title:'Ubicación personalizada'}};assert.equal(sandbox.MPI_cleanConfig(incoming).location.title,'Ubicación personalizada');sandbox.MPI_CMS_DEFAULTS.location={visible:true,title:'Ubicación personalizada'};
sandbox.MP_CONTACTS.apply(phones,[{id:'a',label:'Ventas',number:'0963796222',enabled:true},{id:'b',label:'Oficina',number:'+593987654321',enabled:true},{id:'c',label:'Soporte',number:'+593987654322',enabled:true},{id:'d',label:'Bodega',number:'+593987654323',enabled:true}],'b');
assert.equal(phones.whatsapp.numbers.length,4);assert.equal(phones.whatsapp.number,'593987654321');
assert.throws(()=>sandbox.MP_CONTACTS.apply(phones,[{id:'a',number:'+593987654321',enabled:true},{id:'b',number:'+593987654321',enabled:true}],'a'),/repitas/);
assert.throws(()=>sandbox.MP_SOCIAL.url('javascript:alert(1)'),/HTTPS/);
assert.equal(sandbox.MP_SOCIAL.embed('https://www.tiktok.com/@cuenta/video/6718335390845095173').src,'https://www.tiktok.com/player/v1/6718335390845095173?description=1&autoplay=0');
assert.equal(sandbox.MP_SOCIAL.embed('https://tiktok.com.evil.test/@x/video/123456789'),null);
assert.equal(sandbox.MP_SOCIAL.url(''), '');
await sandbox.MP.login('test@example.test','synthetic-password');assert.equal(sandbox.MP.session.user.id,'u1');assert(store.has('mp_session_v1'));
await assert.rejects(()=>sandbox.MP.upload({type:'text/html',size:50}),/Admite/);
await assert.rejects(()=>sandbox.MP.upload({type:'video/mp4',size:60*1024*1024}),/Admite/);
let upload=false;sandbox.fetch=async(path,options)=>{upload=options.method==='POST'&&path.includes('/storage/v1/object/media/u1/');return new Response('{}')};
await sandbox.MP.upload(Object.assign(new Blob(['test'],{type:'image/png'}),{}));assert(upload);
vm.runInContext(readFileSync(new URL('vendor/xlsx.full.min.js',base),'utf8'),sandbox);
vm.runInContext(readFileSync(new URL('contact-import.js',base),'utf8'),sandbox);
for(const bookType of ['xlsx','xls']){
 const workbook=sandbox.XLSX.utils.book_new();sandbox.XLSX.utils.book_append_sheet(workbook,sandbox.XLSX.utils.aoa_to_sheet([['Contacto'],['+593987654321'],['+593987654321']]),'Prueba');
 const data=sandbox.XLSX.write(workbook,{type:'array',bookType});const numbers=await sandbox.MP_importContacts({name:'prueba.'+bookType,size:data.byteLength,arrayBuffer:async()=>data});assert.equal(numbers.length,1);assert.equal(numbers[0],'+593987654321');
}
await assert.rejects(()=>sandbox.MP_importContacts({size:11*1024*1024}),/10 MB/);
for(const file of ['index.html','catalogo-digital.html']){
 const html=readFileSync(new URL(file,base),'utf8');assert(html.includes('public-bridge.js'));
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m=>!(/src\s*=|type\s*=/i.test(m[1])));
 for(const [i,s]of scripts.entries())new vm.Script(s[2],{filename:file+' inline '+i});
}
const panel=readFileSync(new URL('panel.html',base),'utf8');for(const f of ['integrations-defaults.js','contact-import.js','campaigns.js'])assert(panel.includes(f));
const publicHTML=readFileSync(new URL('index.html',base),'utf8');assert(publicHTML.includes('animated-chatbot.js'));assert(publicHTML.includes('animated-chatbot.css'));
assert(publicHTML.includes('stories.js'));assert(!publicHTML.includes('ENTORNO DE PRUEBAS · DATOS FICTICIOS · NO REALIZAR COMPRAS'));assert.equal(sandbox.MPI_CMS_DEFAULTS.header.topVisible,false);
for(const product of sandbox.MPI_CMS_DEFAULTS.products){assert(product.image.startsWith('uploads/media/'));assert(readFileSync(new URL(product.image,base)).length>1000)}
const botCSS=readFileSync(new URL('animated-chatbot.css',base),'utf8');assert(botCSS.includes('prefers-reduced-motion'));assert(botCSS.includes('@keyframes mp-robot-wave'));
for(const name of ['manage-users','inquiry','recovery']){const ts=readFileSync(new URL('../backend/supabase/functions/'+name+'/index.ts',base),'utf8');new vm.Script(stripTypeScriptTypes(ts).replace(/^import .*;\s*$/gm,''),{filename:name+'.ts'});}
console.log('PASS: sintaxis JS e inline, configuración ampliada, sesión REST, validación de archivos, subida REST, importación real XLS/XLSX con deduplicación y dependencias del panel.');
