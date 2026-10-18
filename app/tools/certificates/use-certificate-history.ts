'use client';
import {useCallback,useRef,useState,type SetStateAction} from 'react';
import {emptyPack,type CertificatePack} from '@/lib/certificates';
export function useCertificateHistory(){
 const [pack,setRaw]=useState<CertificatePack>(emptyPack),[revision,setRevision]=useState(0);
 const current=useRef(pack),past=useRef<CertificatePack[]>([]),future=useRef<CertificatePack[]>([]);
 const setPack=useCallback((action:SetStateAction<CertificatePack>)=>{const next=typeof action==='function'?action(current.current):action;if(next===current.current)return;past.current=[...past.current.slice(-29),current.current];future.current=[];current.current=next;setRaw(next);setRevision(r=>r+1);},[]);
 const loadPack=useCallback((next:CertificatePack)=>{current.current=next;past.current=[];future.current=[];setRaw(next);setRevision(r=>r+1);},[]);
 const undo=useCallback(()=>{const previous=past.current.pop();if(!previous)return;future.current.push(current.current);current.current=previous;setRaw(previous);setRevision(r=>r+1);return previous;},[]);
 const redo=useCallback(()=>{const next=future.current.pop();if(!next)return;past.current.push(current.current);current.current=next;setRaw(next);setRevision(r=>r+1);return next;},[]);
 return {pack,setPack,loadPack,undo,redo,canUndo:past.current.length>0,canRedo:future.current.length>0,revision};
}
