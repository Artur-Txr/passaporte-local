const paletteDefinitions={
 petroleo:{name:'Moderno e elegante',primary:'#123B4A',accent:'#E87961',background:'#F7F9FA',ink:'#20343D',muted:'#5D6D76',soft:'#E7EEF1',dark:'#0D2B36'},
 indigo:{name:'Criativo e jovem',primary:'#4546A0',accent:'#E9B949',background:'#F6F7FB',ink:'#292C46',muted:'#646879',soft:'#EAEAF6',dark:'#30316F'},
 terracota:{name:'Acolhedor e ligado a viagens',primary:'#AD543E',accent:'#244858',background:'#FAF5ED',ink:'#382D29',muted:'#73675E',soft:'#F0E2D7',dark:'#803C2B'}
};
function applyPalette(key){
 key=Object.hasOwn(paletteDefinitions,key)?key:'petroleo';const p=paletteDefinitions[key];
 document.documentElement.dataset.palette=key;
 const s=document.documentElement.style;
 for(const [k,v] of Object.entries({'--green':p.primary,'--green-dark':p.dark,'--accent':p.accent,'--paper':p.background,'--ink':p.ink,'--muted':p.muted,'--sage':p.soft,'--terra':p.primary,'--line':p.soft}))s.setProperty(k,v);
 const picker=document.getElementById('theme-picker');if(picker)picker.value=key;const mobilePicker=document.getElementById('mobile-theme-picker');if(mobilePicker)mobilePicker.value=key;document.querySelectorAll('[data-brand]').forEach(img=>img.src=`assets/marca/${key}-${img.dataset.brand}.svg`);
 const url=new URL(location.href);url.searchParams.set('paleta',key);history.replaceState(history.state,'',url);
}
applyPalette(new URL(location.href).searchParams.get('paleta')||'petroleo');
document.getElementById('theme-picker')?.addEventListener('change',e=>applyPalette(e.target.value));
window.palettes={apply:applyPalette,definitions:paletteDefinitions};

document.getElementById('mobile-theme-picker')?.addEventListener('change',e=>applyPalette(e.target.value));
