"""
Especificações de proporções das molduras Sportrail.

Para cada combinação (moldura, formato), define:
- Dimensões totais do canvas
- Área do vídeo (top-left + width/height) — esta área fica TRANSPARENTE no PNG
- Zonas de identidade visual (header, footer, name bar, quote area)

A regra de ouro: a área do vídeo nunca é menor que 50% da área total
(senão o vídeo perde protagonismo).
"""

# Dimensões standard
FORMATS = {
    "9x16": (1080, 1920),  # Reels, Stories, TikTok
    "1x1":  (1080, 1080),  # Posts quadrados
    "16x9": (1920, 1080),  # YouTube, TV, web horizontal
}

# Para cada moldura, defino as proporções da "respiração" — quanto espaço
# dou às zonas de identidade vs ao vídeo. Estas proporções são depois
# adaptadas a cada formato.

MOLDURA_A_PROPORCOES = {
    # Moldura simétrica: barras horizontais top + bottom
    "header_ratio": 0.10,  # 10% do canvas em cima
    "footer_ratio": 0.12,  # 12% em baixo (mais espaço pelo logo + 10 anos)
    "video_padding_x": 0.025,  # 2.5% de padding lateral
}

MOLDURA_B_PROPORCOES = {
    # Moldura com nome+função permanente
    "header_ratio": 0.08,
    "name_bar_ratio": 0.12,  # barra de nome ocupa 12%
    "footer_ratio": 0.06,
    "video_padding_x": 0.025,
}

MOLDURA_C_PROPORCOES = {
    # Vídeo em cima + quote em baixo (mais espaço para a quote)
    "header_ratio": 0.06,
    "video_ratio": 0.45,  # vídeo ocupa 45% do canvas
    "quote_ratio": 0.43,  # quote ocupa 43%
    "footer_ratio": 0.06,
    "video_padding_x": 0.025,
}

if __name__ == "__main__":
    print("Verificação de proporções:\n")
    
    for nome, props in [("A", MOLDURA_A_PROPORCOES), ("B", MOLDURA_B_PROPORCOES), ("C", MOLDURA_C_PROPORCOES)]:
        total = sum(v for k, v in props.items() if k.endswith("_ratio"))
        video_area = 1.0 - total
        print(f"Moldura {nome}: identidade={total*100:.0f}%, vídeo≈{video_area*100:.0f}%")
    
    print("\nDimensões em pixels para cada formato:\n")
    for fmt, (w, h) in FORMATS.items():
        print(f"  {fmt}: {w}x{h}")
