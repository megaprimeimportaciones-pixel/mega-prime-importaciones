import {readdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),dir=new URL('migraciones/',root);
const files=(await readdir(dir)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
let sql='-- Mega Prime Importaciones: ejecutar SOLO en un proyecto nuevo y exclusivo.\n-- No contiene contraseñas ni claves. No repetir en un proyecto ya migrado.\n\n';
for(const file of files)sql+='-- '+file+'\n'+await readFile(new URL(file,dir),'utf8')+'\n\n';
await writeFile(new URL('INSTALACION_SUPABASE.sql',root),sql);console.log('SQL de instalación reunido: '+files.length+' migraciones.');
