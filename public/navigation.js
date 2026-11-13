// Navigation only changes visibility; it never recreates forms or changes saved records.
function activateTabs(buttons, attribute, selected, focus) {
  for (const tab of buttons) {
    const active=tab.getAttribute(attribute)===selected;
    tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!active;
    if(active && focus)tab.focus();
  }
}
function showView(name, focus=false) {
  activateTabs(document.querySelectorAll('[data-view]'),'data-view',name,focus);
}
function showProjectTab(name, focus=false) {
  activateTabs(document.querySelectorAll('[data-project-view]'),'data-project-view',name,focus);
}
for (const [selector,attribute,activate] of [['[data-view]','data-view',showView],['[data-project-view]','data-project-view',showProjectTab]]) {
  const tabs=[...document.querySelectorAll(selector)];
  for (const tab of tabs) {
    tab.onclick=()=>activate(tab.getAttribute(attribute));
    tab.onkeydown=event=>{
      const index=tabs.indexOf(tab);let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();activate(tabs[next].getAttribute(attribute),true);}
    };
  }
}
for(const button of document.querySelectorAll('[data-open-view]'))button.onclick=()=>showView(button.dataset.openView,true);
