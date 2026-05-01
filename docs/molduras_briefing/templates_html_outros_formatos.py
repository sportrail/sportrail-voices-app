"""
Gera Molduras A e B nos formatos 1:1 (1080x1080) e 16:9 (1920x1080).
A Moldura C fica fora destes formatos por design.
"""

import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

LOGO = Path("/home/claude/molduras_briefing/sportrail_logo_white.png")
PREVIEWS_DIR = Path("/home/claude/molduras_briefing/previews")

with open(LOGO, "rb") as f:
    LOGO_B64 = "data:image/png;base64," + base64.b64encode(f.read()).decode()


def common_head():
    return """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
"""


# ====================================================================
# MOLDURA A — 1:1 (1080x1080)
# Header 12%, Video 76%, Footer 12%
# ====================================================================

def html_moldura_a_1x1(with_placeholder=False):
    placeholder_style = """background:linear-gradient(135deg,#555 0%,#222 100%);display:flex;align-items:center;justify-content:center;color:#888;font-family:'DM Sans',sans-serif;font-size:24pt;letter-spacing:6px;"""
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1080px;height:1080px;overflow:hidden;background:transparent}}
  .canvas{{width:1080px;height:1080px;display:flex;flex-direction:column;background:transparent}}
  
  .header{{
    height:130px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    position:relative;
    border-bottom:3px solid #ED1C24;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:14pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
    margin-top:-20px;
  }}
  .header .quote-mark{{
    position:absolute;
    bottom:-38px;left:50%;transform:translateX(-50%);
    font-family:'Bebas Neue',sans-serif;
    font-size:100pt;line-height:0.5;
    color:#ED1C24;opacity:0.18;
  }}
  
  .video-area{{flex:1;background:transparent}}
  
  .footer{{
    height:130px;
    background:#0B0A0F;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    gap:10px;
    border-top:3px solid #ED1C24;
  }}
  .footer .logo{{width:240px;height:auto}}
  .footer .anniversary{{
    font-family:'Bebas Neue',sans-serif;
    font-size:16pt;color:#ED1C24;letter-spacing:5px;
  }}
</style></head>
<body><div class="canvas">
  <div class="header"><div class="label">TESTIMONIAL</div><div class="quote-mark">"</div></div>
  {placeholder_content}
  <div class="footer">
    <img class="logo" src="{LOGO_B64}" alt="">
    <div class="anniversary">10 ANOS · 2016—2026</div>
  </div>
</div></body></html>"""


# ====================================================================
# MOLDURA A — 16:9 (1920x1080)
# Header 14%, Video 72%, Footer 14% — proporcionalmente maiores em horizontal
# ====================================================================

def html_moldura_a_16x9(with_placeholder=False):
    placeholder_style = """background:linear-gradient(135deg,#555 0%,#222 100%);display:flex;align-items:center;justify-content:center;color:#888;font-family:'DM Sans',sans-serif;font-size:24pt;letter-spacing:6px;"""
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1920px;height:1080px;overflow:hidden;background:transparent}}
  .canvas{{width:1920px;height:1080px;display:flex;flex-direction:column;background:transparent}}
  
  .header{{
    height:150px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    position:relative;
    border-bottom:3px solid #ED1C24;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:16pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
    margin-top:-22px;
  }}
  .header .quote-mark{{
    position:absolute;
    bottom:-42px;left:50%;transform:translateX(-50%);
    font-family:'Bebas Neue',sans-serif;
    font-size:120pt;line-height:0.5;
    color:#ED1C24;opacity:0.18;
  }}
  
  .video-area{{flex:1;background:transparent}}
  
  .footer{{
    height:150px;
    background:#0B0A0F;
    display:flex;flex-direction:row;
    align-items:center;justify-content:center;
    gap:40px;
    border-top:3px solid #ED1C24;
  }}
  .footer .logo{{width:280px;height:auto}}
  .footer .anniversary{{
    font-family:'Bebas Neue',sans-serif;
    font-size:20pt;color:#ED1C24;letter-spacing:6px;
  }}
</style></head>
<body><div class="canvas">
  <div class="header"><div class="label">TESTIMONIAL</div><div class="quote-mark">"</div></div>
  {placeholder_content}
  <div class="footer">
    <img class="logo" src="{LOGO_B64}" alt="">
    <div class="anniversary">10 ANOS · 2016—2026</div>
  </div>
</div></body></html>"""


# ====================================================================
# MOLDURA B — 1:1 (1080x1080)
# Mais compacta verticalmente
# ====================================================================

def html_moldura_b_1x1(name="RUI LANÇA", role="Sports Director (Multi-Sports)", affiliation="Al-Ittihad Club", with_placeholder=False, generic=False):
    placeholder_style = """background:linear-gradient(135deg,#555 0%,#222 100%);display:flex;align-items:center;justify-content:center;color:#888;font-family:'DM Sans',sans-serif;font-size:22pt;letter-spacing:6px;"""
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    if generic:
        name_bar = """<div class="name-bar"><div class="name-bar-content">
        <div class="name-placeholder">— NOME —</div>
        <div class="role-placeholder">— função · afiliação —</div></div></div>"""
    else:
        name_bar = f"""<div class="name-bar"><div class="name-bar-content">
        <div class="name">{name}</div>
        <div class="role">{role} · {affiliation}</div></div></div>"""
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1080px;height:1080px;overflow:hidden;background:transparent}}
  .canvas{{width:1080px;height:1080px;display:flex;flex-direction:column;background:transparent}}
  
  .header{{
    height:80px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    border-bottom:2px solid #222130;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:11pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
  }}
  
  .video-area{{flex:1;background:transparent}}
  
  .name-bar{{
    height:130px;
    background:#0B0A0F;
    display:flex;align-items:center;
    padding:0 60px 0 70px;
    border-top:2px solid #222130;
    position:relative;
  }}
  .name-bar::before{{
    content:'';
    position:absolute;left:0;top:30%;
    width:6px;height:40%;
    background:#ED1C24;
  }}
  .name-bar-content{{display:flex;flex-direction:column;gap:8px}}
  .name{{
    font-family:'Bebas Neue',sans-serif;
    font-size:38pt;color:#FAF8F5;line-height:1;letter-spacing:1px;
  }}
  .role{{
    font-family:'DM Sans',sans-serif;
    font-size:14pt;color:#AAAAAA;font-weight:400;line-height:1.3;
  }}
  .name-placeholder{{
    font-family:'Bebas Neue',sans-serif;
    font-size:32pt;color:#666;line-height:1;letter-spacing:2px;
  }}
  .role-placeholder{{
    font-family:'DM Sans',sans-serif;
    font-size:13pt;color:#444;font-weight:400;line-height:1.3;font-style:italic;
  }}
  
  .footer{{
    height:75px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
  }}
  .footer .logo{{width:200px;height:auto}}
</style></head>
<body><div class="canvas">
  <div class="header"><div class="label">TESTIMONIAL · SPORTRAIL 10 YEARS</div></div>
  {placeholder_content}
  {name_bar}
  <div class="footer"><img class="logo" src="{LOGO_B64}" alt=""></div>
</div></body></html>"""


# ====================================================================
# MOLDURA B — 16:9 (1920x1080)
# Adapta nome+função para o lado, em vez de bandas horizontais
# ====================================================================

def html_moldura_b_16x9(name="RUI LANÇA", role="Sports Director (Multi-Sports)", affiliation="Al-Ittihad Club", with_placeholder=False, generic=False):
    placeholder_style = """background:linear-gradient(135deg,#555 0%,#222 100%);display:flex;align-items:center;justify-content:center;color:#888;font-family:'DM Sans',sans-serif;font-size:24pt;letter-spacing:6px;"""
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    if generic:
        name_section = """<div class="name-bar"><div class="name-bar-content">
        <div class="name-placeholder">— NOME —</div>
        <div class="role-placeholder">— função · afiliação —</div></div></div>"""
    else:
        name_section = f"""<div class="name-bar"><div class="name-bar-content">
        <div class="name">{name}</div>
        <div class="role">{role} · {affiliation}</div></div></div>"""
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1920px;height:1080px;overflow:hidden;background:transparent}}
  .canvas{{width:1920px;height:1080px;display:flex;flex-direction:column;background:transparent}}
  
  .header{{
    height:90px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    border-bottom:2px solid #222130;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:13pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
  }}
  
  .video-area{{flex:1;background:transparent}}
  
  .name-bar{{
    height:130px;
    background:#0B0A0F;
    display:flex;align-items:center;
    padding:0 80px;
    border-top:2px solid #222130;
    position:relative;
  }}
  .name-bar::before{{
    content:'';
    position:absolute;left:0;top:30%;
    width:6px;height:40%;
    background:#ED1C24;
  }}
  .name-bar-content{{display:flex;flex-direction:row;align-items:baseline;gap:30px}}
  .name{{
    font-family:'Bebas Neue',sans-serif;
    font-size:42pt;color:#FAF8F5;line-height:1;letter-spacing:1px;
  }}
  .role{{
    font-family:'DM Sans',sans-serif;
    font-size:16pt;color:#AAAAAA;font-weight:400;
  }}
  .name-placeholder{{
    font-family:'Bebas Neue',sans-serif;
    font-size:36pt;color:#666;line-height:1;letter-spacing:2px;
  }}
  .role-placeholder{{
    font-family:'DM Sans',sans-serif;
    font-size:15pt;color:#444;font-weight:400;font-style:italic;
  }}
  
  .footer{{
    height:80px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
  }}
  .footer .logo{{width:220px;height:auto}}
</style></head>
<body><div class="canvas">
  <div class="header"><div class="label">TESTIMONIAL · SPORTRAIL 10 YEARS</div></div>
  {placeholder_content}
  {name_section}
  <div class="footer"><img class="logo" src="{LOGO_B64}" alt=""></div>
</div></body></html>"""


# ====================================================================
# RENDERER
# ====================================================================

def render(html, output_path, w, h, transparent=False):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
        page = ctx.new_page()
        page.set_content(html, wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(output_path), full_page=False, omit_background=transparent)
        browser.close()


# Gerar previews
print("Moldura A 1:1 — preview...")
render(html_moldura_a_1x1(with_placeholder=True), PREVIEWS_DIR / "A_1x1_preview.png", 1080, 1080)

print("Moldura A 16:9 — preview...")
render(html_moldura_a_16x9(with_placeholder=True), PREVIEWS_DIR / "A_16x9_preview.png", 1920, 1080)

print("Moldura B 1:1 — preview...")
render(html_moldura_b_1x1(with_placeholder=True), PREVIEWS_DIR / "B_1x1_preview.png", 1080, 1080)

print("Moldura B 16:9 — preview...")
render(html_moldura_b_16x9(with_placeholder=True), PREVIEWS_DIR / "B_16x9_preview.png", 1920, 1080)

print("\n✓ Todos os formatos gerados")
