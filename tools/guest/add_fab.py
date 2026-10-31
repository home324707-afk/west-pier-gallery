#!/usr/bin/env python3
"""Register fabricated images (photographs or paintings/prints) as guest-AI image works, status 'ready'; then run tools/guest/hang.py.
Models: Z-Image-Turbo (Space Tongyi-MAI/Z-Image-Turbo, api /generate) and FLUX.1-schnell (Space black-forest-labs/FLUX.1-schnell, api /infer), both anonymous via gradio_client.
Usage: python3 tools/guest/add_fab.py spec.json   (list of {key,title,gfam,model,file,prompt,seed,w,h,note?}; order = hanging order)"""
import json, sys, os, datetime
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(ROOT)
MODELS = {
 'Z-Image-Turbo': dict(model_requested='Z-Image-Turbo (Tongyi-MAI)', service='Hugging Face Space Tongyi-MAI/Z-Image-Turbo, anonymous Gradio API (no account)', endpoint='https://tongyi-mai-z-image-turbo.hf.space (api /generate)',
   model_licence='Apache 2.0 (Tongyi-MAI/Z-Image-Turbo)', model_licence_url='https://huggingface.co/Tongyi-MAI/Z-Image-Turbo', steps='9 steps, shift 3.0',
   terms='Model and Space are both Apache 2.0, which places no restriction on outputs; the Space imposes no further terms on generated images.'),
 'Grok Bot image generator': dict(model_requested="Grok Bot's built-in image generator (GenerateImage tool); the underlying model is not disclosed to the curator", service="Grok Bot built-in image generation tool (text prompt in, image out; no reference images used)", endpoint='n/a (built-in tool call)',
   model_licence='Not published by the tool; no licence was stated for its outputs', model_licence_url='', steps='generator settings and seed are not exposed',
   terms='The tool states no restrictions on its outputs and exposes no model name, seed or settings, so the curator cannot verify the generator\'s own terms beyond that.'),
 'FLUX.1-schnell': dict(model_requested='FLUX.1 [schnell] (Black Forest Labs)', service='Hugging Face Space black-forest-labs/FLUX.1-schnell, anonymous Gradio API (no account)', endpoint='https://black-forest-labs-flux-1-schnell.hf.space (api /infer)',
   model_licence='Apache 2.0 (black-forest-labs/FLUX.1-schnell); the Space is MIT', model_licence_url='https://huggingface.co/black-forest-labs/FLUX.1-schnell', steps='4 steps',
   terms='The model is Apache 2.0, which places no restriction on outputs, and the Space (MIT) imposes no further terms on generated images.')}

HORDE = dict(service='AI Horde (aihorde.net), a volunteer GPU network, anonymous API key (no account); a community worker ran the job', endpoint='https://aihorde.net/api/v2 (async generate)',
   terms_pre='AI Horde states that it claims no rights in generated outputs; ')
MODELS.update({
 'SDXL 1.0': dict(model_requested='Stable Diffusion XL 1.0 (Stability AI), model name "SDXL 1.0" on AI Horde', service=HORDE['service'], endpoint=HORDE['endpoint'],
   model_licence='CreativeML Open RAIL++-M (stabilityai/stable-diffusion-xl-base-1.0)', model_licence_url='https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0', steps='30 steps, k_euler, CFG 6.5',
   terms=HORDE['terms_pre'] + 'the model licence (Open RAIL++-M) permits use of outputs subject to its use restrictions (no unlawful, harmful or deceptive use), none of which this work engages. Anonymous text-to-image jobs on AI Horde are shared with LAION by its terms; image-to-image jobs are not.'),
 'FLUX.1-schnell@horde': dict(model_requested='FLUX.1 [schnell] (Black Forest Labs), model name "Flux.1-Schnell fp8 (Compact)" on AI Horde', service=HORDE['service'], endpoint=HORDE['endpoint'],
   model_licence='Apache 2.0 (black-forest-labs/FLUX.1-schnell)', model_licence_url='https://huggingface.co/black-forest-labs/FLUX.1-schnell', steps='6 steps, k_euler, CFG 1 (fp8 compact build)',
   terms=HORDE['terms_pre'] + 'the model is Apache 2.0, which places no restriction on outputs. Anonymous text-to-image jobs on AI Horde are shared with LAION by its terms; image-to-image jobs are not.'),
 'Qwen-Image': dict(model_requested='Qwen-Image (Alibaba Qwen), model name "Qwen-Image_fp8" on AI Horde', service=HORDE['service'], endpoint=HORDE['endpoint'],
   model_licence='Apache 2.0 (Qwen/Qwen-Image)', model_licence_url='https://huggingface.co/Qwen/Qwen-Image', steps='20 steps, k_euler, CFG 4 (fp8 build)',
   terms=HORDE['terms_pre'] + 'the model is Apache 2.0, which places no restriction on outputs. Anonymous text-to-image jobs on AI Horde are shared with LAION by its terms; image-to-image jobs are not.'),
 'HiDream-I1-Dev': dict(model_requested='HiDream-I1 Dev (HiDream.ai)', service='Hugging Face Space HiDream-ai/HiDream-I1-Dev, anonymous Gradio API (no account)', endpoint='https://hidream-ai-hidream-i1-dev.hf.space (api /generate_with_status)',
   model_licence='MIT (HiDream-ai/HiDream-I1-Dev)', model_licence_url='https://huggingface.co/HiDream-ai/HiDream-I1-Dev', steps='Space defaults (settings not exposed)',
   terms='The model is MIT-licensed, which places no restriction on outputs, and the Space imposes no further terms on generated images.'),
})
spec = json.load(open(sys.argv[1]))
G = json.load(open('data/guests.json')); have = {g['id'] for g in G}
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
for p in spec:
    gid = f'g-fab-{p["key"]}'
    if gid in have: print('already', gid); continue
    m = MODELS[p.get('mkey', p['model'])]; ref = p.get('ref'); im = Image.open(p['file']).convert('RGB'); jp = f'guest/commissions/fab-{p["key"]}.jpg'; im.save(jp, quality=92)
    noun = 'painting' if p['gfam'] == 'painted' else 'photograph'
    rec = dict(id=gid, type='image', title=p['title'], model=p['model'], model_requested=m['model_requested'], service=m['service'], endpoint=m['endpoint'], date=now, prompt=p['prompt'],
        settings=f'resolution {p["w"]}x{p["h"]}, seed {p["seed"]}, {m["steps"]}' + (f', denoising strength {ref["denoise"]}' if ref else '') + (f', worker {p["worker"]}' if p.get('worker') else '') + f'; native output {im.size[0]}x{im.size[1]}, stored as JPEG q92', source='commission', file=f'guest/commissions/fab-{p["key"]}.json', content=jp,
        model_licence=m['model_licence'], model_licence_url=m['model_licence_url'],
        terms_note=m['terms'] + (f' Made by image-to-image from {ref["credit"]}, so the gallery cannot dedicate it to the public domain: it is shared under the same licence as the photograph ({ref["lic"]}), with credit to the photographer. Fabricated {noun}: nothing in it was ever {"painted, drawn or printed by hand" if noun == "painting" else "photographed"}.' if ref else f' The gallery claims no rights in the output and dedicates it to the public domain (CC0) as far as it can. Fabricated {noun}: nothing in it was ever {"painted, drawn or printed by hand" if noun == "painting" else "photographed"}.'),
        lic=ref['lic'] if ref else 'CC0 1.0', licurl=ref['licurl'] if ref else 'https://creativecommons.org/publicdomain/zero/1.0/', status='ready', gfam=p['gfam'], **({'ref': ref, 'source_credit': ref['credit']} if ref else {}),
        note=p.get('note') or 'The prompt was written by the curator, an AI. Several candidates were generated for each idea; this one was kept and the rest discarded on looks alone (warped structure, wrong pier, garbled text and similar faults were rejected). The image is shown unedited apart from resizing for the web.')
    json.dump({k: v for k, v in rec.items() if k != 'status'}, open(rec['file'], 'w'), indent=1, ensure_ascii=False); G.append(rec); print('registered', gid)
json.dump(G, open('data/guests.json', 'w'), indent=1, ensure_ascii=False)
