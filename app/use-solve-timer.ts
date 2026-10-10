'use client';
import {useEffect,useMemo,useCallback} from 'react';
import {ActiveSolveTimer,MAX_SOLVE_MS} from '@/lib/solve-time';

// No countdown is displayed. Only time with an answerable question is counted.
export function useSolveTimer(key:string,enabled:boolean){
  const storageKey='alwadani-solve-v1:'+key;
  const timer=useMemo(()=>{
    let saved=0;
    try{const n=Number(sessionStorage.getItem(storageKey));if(Number.isFinite(n)&&n>=0&&n<=MAX_SOLVE_MS)saved=n;}catch{}
    return new ActiveSolveTimer(saved);
  },[storageKey]);
  const persist=useCallback(()=>{try{sessionStorage.setItem(storageKey,String(timer.value()));}catch{}},[storageKey,timer]);
  useEffect(()=>{
    const sync=()=>{if(enabled&&!document.hidden)timer.resume();else timer.pause();persist();};
    const leave=()=>{timer.pause();persist();};
    sync();
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('pagehide',leave);
    const checkpoint=enabled?window.setInterval(persist,1000):undefined;
    return()=>{leave();document.removeEventListener('visibilitychange',sync);window.removeEventListener('pagehide',leave);if(checkpoint!==undefined)window.clearInterval(checkpoint);};
  },[enabled,timer,persist]);
  return useCallback(()=>{const elapsed=timer.capture();persist();return elapsed;},[timer,persist]);
}
