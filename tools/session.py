#!/usr/bin/env python3
"""Time update sessions honestly.
  python3 tools/session.py start "what this session is for"   # records start (UTC now)
  python3 tools/session.py end "what was done" [images_added]  # records end, recomputes totals
  python3 tools/session.py status
Writes data/stats.json (update_sessions, total_update_seconds) and appends to log.txt."""
import json, sys, os, datetime as dt
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'data', 'stats.json'); L = os.path.join(ROOT, 'log.txt')
now = lambda: dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
iso = lambda d: d.strftime('%Y-%m-%dT%H:%M:%SZ')
parse = lambda s: dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
def load():
    s = json.load(open(P)); s.setdefault('update_sessions', []); return s
def save(s):
    done = [x for x in s['update_sessions'] if x.get('end_utc')]
    s['total_update_seconds'] = sum(x['seconds'] for x in done)
    s['update_session_count'] = len(s['update_sessions'])
    json.dump(s, open(P, 'w'), indent=1, ensure_ascii=False)
def log(msg): open(L, 'a').write(f'{iso(now())} | {msg}\n')
def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'; s = load()
    if cmd == 'start':
        if s['update_sessions'] and not s['update_sessions'][-1].get('end_utc'):
            sys.exit('a session is already open: ' + s['update_sessions'][-1]['start_utc'])
        t = sys.argv[3] if len(sys.argv) > 3 else iso(now())
        n = len(s['update_sessions']) + 1
        s['update_sessions'].append(dict(n=n, start_utc=t, end_utc=None, seconds=None, purpose=sys.argv[2] if len(sys.argv) > 2 else '', done='', images_added=0))
        save(s); log(f'Update session {n} started at {t}. {sys.argv[2] if len(sys.argv) > 2 else ""}'); print('started', n, t)
    elif cmd == 'end':
        x = s['update_sessions'][-1]
        if x.get('end_utc'): sys.exit('no open session')
        e = now(); x['end_utc'] = iso(e); x['seconds'] = int((e - parse(x['start_utc'])).total_seconds())
        x['done'] = sys.argv[2] if len(sys.argv) > 2 else ''; x['images_added'] = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        save(s); log(f'Update session {x["n"]} ended at {x["end_utc"]}: {x["seconds"]//60} min {x["seconds"]%60} s. {x["done"]}'); print('ended', x)
    else:
        print(json.dumps(s.get('update_sessions'), indent=1)); print('total_update_seconds', s.get('total_update_seconds'))
if __name__ == '__main__': main()
