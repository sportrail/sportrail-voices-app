"""
Gera previews visuais das três molduras (A, B, C) em formato 9:16.
Para cada uma, gera duas versões:
1. PNG da moldura sozinha (PNG transparente para overlay)
2. PNG mockup com placeholder de vídeo dentro (para preview/validação)
"""

import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

LOGO = Path("/home/claude/molduras_briefing/sportrail_logo_white.png")
PREVIEWS_DIR = Path("/home/claude/molduras_briefing/previews")
PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)

with open(LOGO, "rb") as f:
    LOGO_B64 = "data:image/png;base64," + base64.b64encode(f.read()).decode()


def common_head():
    return """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
"""


# ====================================================================
# MOLDURA A — Simétrica (9:16)
# Header 10%, Video 78%, Footer 12%
# ====================================================================

def html_moldura_a_9x16(with_placeholder=False):
    """
    Moldura A: barras superior (TESTIMONIAL + aspa) e inferior (logo + 10 anos).
    Por design, é genérica — não tem nome+função.
    Área do vídeo é transparente.
    """
    placeholder_style = """
    background: linear-gradient(135deg, #555 0%, #222 100%);
    display: flex; align-items: center; justify-content: center;
    color: #888; font-family: 'DM Sans', sans-serif; font-size: 24pt;
    letter-spacing: 6px;
    """
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1080px;height:1920px;overflow:hidden;background:transparent}}
  body{{background:transparent;}}
  
  .canvas{{
    width:1080px;height:1920px;
    display:flex;flex-direction:column;
    background:transparent;
  }}
  
  .header{{
    height:192px; /* 10% de 1920 */
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    position:relative;
    border-bottom:3px solid #ED1C24;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:16pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
    margin-top:-30px;
  }}
  .header .quote-mark{{
    position:absolute;
    bottom:-50px;left:50%;transform:translateX(-50%);
    font-family:'Bebas Neue',sans-serif;
    font-size:140pt;line-height:0.5;
    color:#ED1C24;opacity:0.18;
  }}
  
  .video-area{{
    flex:1;
    background:transparent;
  }}
  
  .footer{{
    height:230px; /* 12% de 1920 */
    background:#0B0A0F;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    gap:14px;
    border-top:3px solid #ED1C24;
  }}
  .footer .logo{{
    width:340px;height:auto;
  }}
  .footer .anniversary{{
    font-family:'Bebas Neue',sans-serif;
    font-size:22pt;color:#ED1C24;letter-spacing:6px;
  }}
</style></head>
<body><div class="canvas">
  <div class="header">
    <div class="label">TESTIMONIAL</div>
    <div class="quote-mark">"</div>
  </div>
  {placeholder_content}
  <div class="footer">
    <img class="logo" src="{LOGO_B64}" alt="">
    <div class="anniversary">10 ANOS · 2016—2026</div>
  </div>
</div></body></html>"""


# ====================================================================
# MOLDURA B — Com nome+função permanente (9:16)
# Header 8%, Video ~70%, Name bar 14%, Footer 8%
# ====================================================================

def html_moldura_b_9x16(name="RUI LANÇA", role="Sports Director (Multi-Sports)", affiliation="Al-Ittihad Club", with_placeholder=False, generic=False):
    """
    Moldura B: barra superior + área do vídeo + barra com nome/função + barra com logo.
    Pode ser genérica (sem nome+função) — quando `generic=True`, mostra placeholder
    visual com dashes para o utilizador preencher manualmente no editor.
    """
    placeholder_style = """
    background: linear-gradient(135deg, #555 0%, #222 100%);
    display: flex; align-items: center; justify-content: center;
    color: #888; font-family: 'DM Sans', sans-serif; font-size: 24pt;
    letter-spacing: 6px;
    """
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    if generic:
        name_bar = """
      <div class="name-bar">
        <div class="name-bar-content">
          <div class="name-placeholder">— NOME —</div>
          <div class="role-placeholder">— função · afiliação —</div>
        </div>
      </div>"""
    else:
        name_bar = f"""
      <div class="name-bar">
        <div class="name-bar-content">
          <div class="name">{name}</div>
          <div class="role">{role} · {affiliation}</div>
        </div>
      </div>"""
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1080px;height:1920px;overflow:hidden;background:transparent}}
  
  .canvas{{
    width:1080px;height:1920px;
    display:flex;flex-direction:column;
    background:transparent;
  }}
  
  .header{{
    height:154px;
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    border-bottom:2px solid #222130;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:14pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
  }}
  
  .video-area{{
    flex:1;
    background:transparent;
  }}
  
  .name-bar{{
    height:269px; /* 14% de 1920 */
    background:#0B0A0F;
    display:flex;align-items:center;
    padding:0 60px 0 80px;
    border-top:2px solid #222130;
    position:relative;
  }}
  .name-bar::before{{
    content:'';
    position:absolute;left:0;top:30%;
    width:8px;height:40%;
    background:#ED1C24;
  }}
  .name-bar-content{{
    display:flex;flex-direction:column;gap:14px;
  }}
  .name{{
    font-family:'Bebas Neue',sans-serif;
    font-size:60pt;color:#FAF8F5;line-height:1;letter-spacing:1px;
  }}
  .role{{
    font-family:'DM Sans',sans-serif;
    font-size:20pt;color:#AAAAAA;font-weight:400;line-height:1.3;
  }}
  .name-placeholder{{
    font-family:'Bebas Neue',sans-serif;
    font-size:46pt;color:#666;line-height:1;letter-spacing:2px;
  }}
  .role-placeholder{{
    font-family:'DM Sans',sans-serif;
    font-size:18pt;color:#444;font-weight:400;line-height:1.3;
    font-style:italic;
  }}
  
  .footer{{
    height:154px; /* 8% de 1920 */
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
  }}
  .footer .logo{{width:280px;height:auto}}
</style></head>
<body><div class="canvas">
  <div class="header">
    <div class="label">TESTIMONIAL · SPORTRAIL 10 YEARS</div>
  </div>
  {placeholder_content}
  {name_bar}
  <div class="footer">
    <img class="logo" src="{LOGO_B64}" alt="">
  </div>
</div></body></html>"""


# ====================================================================
# MOLDURA C — Vídeo + Quote (9:16 only)
# Header 6%, Video 45%, Quote 43%, Footer 6%
# ====================================================================

def html_moldura_c_9x16(quote="We need companies like Sportrail to improve and increase the level of the sport.", 
                        name="RUI LANÇA", role="Sports Director · Al-Ittihad Club",
                        with_placeholder=False, generic=False):
    """
    Moldura C: vídeo na metade superior + quote escrita na metade inferior.
    Só em 9:16 (não funciona em formatos horizontais).
    """
    placeholder_style = """
    background: linear-gradient(135deg, #555 0%, #222 100%);
    display: flex; align-items: center; justify-content: center;
    color: #888; font-family: 'DM Sans', sans-serif; font-size: 24pt;
    letter-spacing: 6px;
    """
    placeholder_content = '<div class="video-area" style="' + placeholder_style + '">VÍDEO</div>' if with_placeholder else '<div class="video-area"></div>'
    
    if generic:
        quote_section = """
      <div class="quote-text-placeholder">— QUOTE DO TESTEMUNHO —</div>
      <div class="divider"></div>
      <div class="name-placeholder">— NOME —</div>
      <div class="role-placeholder">— função · afiliação —</div>"""
    else:
        quote_section = f"""
      <div class="quote-text">{quote}</div>
      <div class="divider"></div>
      <div class="name">{name}</div>
      <div class="role">{role}</div>"""
    
    return f"""<!DOCTYPE html>
<html><head>{common_head()}<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  html,body{{width:1080px;height:1920px;overflow:hidden;background:transparent}}
  
  .canvas{{
    width:1080px;height:1920px;
    display:flex;flex-direction:column;
    background:transparent;
  }}
  
  .header{{
    height:115px; /* 6% */
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
  }}
  .header .label{{
    font-family:'DM Sans',sans-serif;
    font-size:13pt;font-weight:700;
    color:#ED1C24;letter-spacing:6px;
  }}
  
  .video-area{{
    height:864px; /* 45% */
    background:transparent;
  }}
  
  .quote-area{{
    height:826px; /* 43% */
    background:#0B0A0F;
    padding:80px 90px 50px 90px;
    display:flex;flex-direction:column;justify-content:flex-start;
    position:relative;
  }}
  .quote-area::before{{
    content:'"';
    position:absolute;
    top:30px;right:60px;
    font-family:'Bebas Neue',sans-serif;
    font-size:280pt;line-height:0.7;
    color:#ED1C24;opacity:0.13;
  }}
  .quote-text{{
    font-family:'DM Sans',sans-serif;
    font-weight:500;font-size:42pt;
    color:#FAF8F5;line-height:1.25;
    margin-bottom:50px;
    position:relative;z-index:2;
  }}
  .quote-text-placeholder{{
    font-family:'DM Sans',sans-serif;
    font-weight:400;font-size:36pt;
    color:#555;line-height:1.25;font-style:italic;
    margin-bottom:50px;
  }}
  .divider{{
    width:80px;height:4px;
    background:#ED1C24;
    margin-bottom:30px;
  }}
  .name{{
    font-family:'Bebas Neue',sans-serif;
    font-size:42pt;color:#FAF8F5;letter-spacing:1px;
    line-height:1;margin-bottom:14px;
  }}
  .role{{
    font-family:'DM Sans',sans-serif;
    font-size:20pt;color:#AAAAAA;
  }}
  .name-placeholder{{
    font-family:'Bebas Neue',sans-serif;
    font-size:36pt;color:#666;letter-spacing:2px;
    line-height:1;margin-bottom:14px;
  }}
  .role-placeholder{{
    font-family:'DM Sans',sans-serif;
    font-size:18pt;color:#444;font-style:italic;
  }}
  
  .footer{{
    height:115px; /* 6% */
    background:#0B0A0F;
    display:flex;align-items:center;justify-content:center;
    border-top:2px solid #222130;
  }}
  .footer .logo{{width:200px;height:auto}}
</style></head>
<body><div class="canvas">
  <div class="header">
    <div class="label">TESTIMONIAL · SPORTRAIL 10 YEARS</div>
  </div>
  {placeholder_content}
  <div class="quote-area">
    {quote_section}
  </div>
  <div class="footer">
    <img class="logo" src="{LOGO_B64}" alt="">
  </div>
</div></body></html>"""


def render(html, output_path, transparent=False):
    """Renderiza HTML em PNG via Chromium."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page = ctx.new_page()
        page.set_content(html, wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=str(output_path), full_page=False, omit_background=transparent)
        browser.close()


# ====================================================================
# Gerar previews
# ====================================================================

print("A gerar Moldura A (9:16) — preview com vídeo placeholder...")
render(html_moldura_a_9x16(with_placeholder=True), PREVIEWS_DIR / "A_9x16_preview.png", transparent=False)

print("A gerar Moldura A (9:16) — moldura transparente (overlay)...")
render(html_moldura_a_9x16(with_placeholder=False), PREVIEWS_DIR / "A_9x16_moldura.png", transparent=True)

print("A gerar Moldura B (9:16) — com Rui Lança...")
render(html_moldura_b_9x16(with_placeholder=True), PREVIEWS_DIR / "B_9x16_preview_rui.png", transparent=False)

print("A gerar Moldura B (9:16) — overlay transparente com nome...")
render(html_moldura_b_9x16(with_placeholder=False), PREVIEWS_DIR / "B_9x16_moldura_rui.png", transparent=True)

print("A gerar Moldura B (9:16) — versão genérica...")
render(html_moldura_b_9x16(with_placeholder=True, generic=True), PREVIEWS_DIR / "B_9x16_preview_generic.png", transparent=False)

print("A gerar Moldura C (9:16) — com Rui Lança...")
render(html_moldura_c_9x16(with_placeholder=True), PREVIEWS_DIR / "C_9x16_preview_rui.png", transparent=False)

print("A gerar Moldura C (9:16) — versão genérica...")
render(html_moldura_c_9x16(with_placeholder=True, generic=True), PREVIEWS_DIR / "C_9x16_preview_generic.png", transparent=False)

print("\n✓ Previews gerados em:", PREVIEWS_DIR)
