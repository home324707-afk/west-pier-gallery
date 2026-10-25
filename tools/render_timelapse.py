#!/usr/bin/env python3
"""Render the live time-lapse (ai/timelapse.js) to media/west-pier-timelapse.mp4 for sharing.
Needs a local server on :8765 (python3 -m http.server 8765), Playwright and ffmpeg. Frames are drawn by the same code the site runs."""
import asyncio, base64, subprocess
from playwright.async_api import async_playwright
FPS = 25
async def main():
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'medium', '-movflags', '+faststart', 'media/west-pier-timelapse.mp4'], stdin=subprocess.PIPE)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 1000})
        await pg.goto('http://localhost:8765/timelapse.html'); await pg.wait_for_timeout(2000)
        await pg.evaluate("document.querySelector('.tlwrap').style.cssText='position:fixed;left:0;top:0;width:1280px;z-index:99';dispatchEvent(new Event('resize'));WPTL.stop()")
        for t0 in await pg.evaluate('WPTL.S.map(s=>s.t0)'):
            await pg.evaluate(f'WPTL.seek({t0})'); await pg.wait_for_timeout(400)
        total = await pg.evaluate('WPTL.total')
        for i in range(int(total / 1000 * FPS)):
            d = await pg.evaluate(f"(WPTL.seek({i * 1000 / FPS}),document.getElementById('timelapse').toDataURL('image/jpeg',.9))")
            ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
        await b.close()
    ff.stdin.close(); ff.wait(); print('done')
asyncio.run(main())
