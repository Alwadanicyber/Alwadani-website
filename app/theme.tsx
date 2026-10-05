'use client';
import {useEffect} from 'react';
export type AppTheme='light'|'dark';
export function applyTheme(theme:AppTheme){document.documentElement.dataset.theme=theme;try{localStorage.setItem('alwadani-theme',theme);}catch{}window.dispatchEvent(new Event('alwadani-theme-change'));}
export default function Theme(){useEffect(()=>{try{const saved=localStorage.getItem('alwadani-theme');document.documentElement.dataset.theme=saved==='dark'?'dark':'light';}catch{}},[]);return null;}
