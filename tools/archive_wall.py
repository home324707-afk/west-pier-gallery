#!/usr/bin/env python3
"""Archive the anonymous wall. ntfy.sh only keeps messages for 12 hours, so this
polls the public topic and appends anything new to wall/wall.json, then commits
and pushes. Run it at least every few hours (box loop, routine, or an Action).
Then: python3 tools/guest/submissions.py && python3 tools/guest/hang.py && python3 build.py (open call, tag t-submit)."""
import json, urllib.request, subprocess, os, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'wall', 'wall.json')
W = json.load(open(P))
topic = W['topic']
req = urllib.request.Request(f'https://ntfy.sh/{topic}/json?poll=1&since=all', headers={'User-Agent': 'west-pier-wall-archiver'})
raw = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')
lines = []
for line in raw.splitlines():
    try: lines.append(json.loads(line))
    except Exception: pass
gone = {m.get('sequence_id') for m in lines if m.get('event') == 'message_delete'}  # ntfy DELETE /topic/<id>: honour deletions
before = len(W['messages']); W['messages'] = [m for m in W['messages'] if m['id'] not in gone]; removed = before - len(W['messages'])
have = {m['id'] for m in W['messages']}
new = []
for m in lines:
    if m.get('event') != 'message' or m.get('id') in have or m.get('id') in gone: continue
    tags = [t for t in (m.get('tags') or []) if t.startswith('t-')]
    new.append(dict(id=m['id'], time=int(m.get('time', 0)),
                    name=(m.get('title') or 'Anonymous')[:60],
                    text=(m.get('message') or '')[:4000 if 't-submit' in tags else 2000],  # open-call submissions may be longer
                    thread=(tags[0][2:] if tags else 'forum')[:20]))
if not new and not removed:
    print('no new messages'); sys.exit(0)
W['messages'] = sorted(W['messages'] + new, key=lambda m: m['time'])[-20000:]
W['updated'] = int(time.time())
json.dump(W, open(P, 'w'), ensure_ascii=False, indent=0)
print('archived', len(new), 'removed', removed)
if '--no-push' in sys.argv: sys.exit(0)
gh = subprocess.run(['which', 'gh'], capture_output=True, text=True).stdout.strip() or 'gh'
g = lambda *a: subprocess.run(['git', '-C', ROOT, *a], check=True)
g('pull', '-q', '--rebase', '--autostash')
g('add', 'wall/wall.json')
g('-c', 'user.name=West Pier Curator', '-c', 'user.email=245372891+home324707-afk@users.noreply.github.com', 'commit', '-qm', f'Wall: archive {len(new)} message(s)')
g('-c', 'credential.helper=', '-c', f'credential.helper=!{gh} auth git-credential', 'push', '-q')
