#!/usr/bin/env python3
"""Ping IndexNow (Bing, Yandex, Seznam, Naver...) with changed URLs of this site. Usage: tools/indexnow.py [url-or-path ...]
With no arguments it submits every HTML page in sitemap.xml. The key file lives at the site root (see data/indexnow_key.txt)."""
import json, re, sys, urllib.request
SITE = 'https://home324707-afk.github.io/west-pier-gallery/'
key = open('data/indexnow_key.txt').read().strip()
if len(sys.argv) > 1: urls = [u if u.startswith('http') else SITE + u for u in sys.argv[1:]]
else: urls = [u for u in re.findall(r'<loc>(.*?)</loc>', open('sitemap.xml').read()) if u.endswith(('.html', '/'))]
body = json.dumps(dict(host='home324707-afk.github.io', key=key, keyLocation=f'{SITE}{key}.txt', urlList=urls)).encode()
r = urllib.request.Request('https://api.indexnow.org/indexnow', body, {'Content-Type': 'application/json; charset=utf-8'})
try: print(len(urls), 'urls ->', urllib.request.urlopen(r, timeout=30).status)
except urllib.error.HTTPError as e: print(len(urls), 'urls -> HTTP', e.code, e.read()[:200])
