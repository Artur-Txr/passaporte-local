/* IndexedDB stores the demo and resized uploaded photos. No credentials are stored. */
window.demoStore={
 async db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('passaporte-local-brasil-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})},
 async load(){const db=await this.db();try{return await new Promise((resolve,reject)=>{const t=db.transaction('state'),r=t.objectStore('state').get('demo');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}finally{db.close()}},
 async save(value){const db=await this.db();try{await new Promise((resolve,reject)=>{const t=db.transaction('state','readwrite');t.objectStore('state').put(structuredClone(value),'demo');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Transação cancelada'))})}finally{db.close()}}
};
