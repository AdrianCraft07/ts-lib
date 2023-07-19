
import {dom} from './dom.ts'

export function navigateTo(path:string, callback: ()=>void) {
  history.pushState({}, '', path);
  window.dispatchEvent(new Event('pushstate'));
  callback && callback();
}
export const makeLink = (callback:()=>void) => function Link({target, to, ...props}:{[key:string]:string}){
  const handleClick = (e) => {
    const isMainEvent = e.button === 0; // primary click
    const isModifierEvent = e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
    const isManegableEvent = !props.target || props.target === '_self';

    if (isMainEvent && isManegableEvent && !isModifierEvent) {
      e.preventDefault();
      navigateTo(to, callback);
    } 
  }
  return dom('a', {href: to, ...props, onClick: handleClick})
}