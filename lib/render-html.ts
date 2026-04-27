export type TestimonialLangData = {
  quote: string;
  name: string;
  role: string;
  affiliation: string;
  label_top: string;
  label_bottom: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function e(data: TestimonialLangData) {
  return {
    quote: escapeHtml(data.quote),
    name: escapeHtml(data.name),
    role: escapeHtml(data.role),
    affiliation: escapeHtml(data.affiliation),
    label_top: escapeHtml(data.label_top),
    label_bottom: escapeHtml(data.label_bottom),
  };
}

export function buildHtml4x5(
  data: TestimonialLangData,
  photoB64: string,
  logoB64: string,
): string {
  const d = e(data);
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1350px; overflow: hidden; }
  body { font-family: 'DM Sans', sans-serif; background: #0B0A0F; }

  .container {
    width: 1080px;
    height: 1350px;
    display: grid;
    grid-template-columns: 500px 580px;
    position: relative;
  }

  .photo-col {
    width: 500px;
    height: 1350px;
    overflow: hidden;
    position: relative;
  }
  .photo-col img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
  }

  .photo-col::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0,0,0,0) 70%, rgba(11,10,15,0.4) 100%);
    pointer-events: none;
  }

  .text-col {
    width: 580px;
    height: 1350px;
    background: #0B0A0F;
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .accent-bar {
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 1350px;
    background: #ED1C24;
  }

  .label-top {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 4px;
    color: #ED1C24;
    text-transform: uppercase;
  }

  .quote-mark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 220px;
    line-height: 0.8;
    color: #ED1C24;
    opacity: 0.18;
    position: absolute;
    top: 110px;
    left: 40px;
    pointer-events: none;
  }

  .main {
    margin-top: 40px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .quote {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 38px;
    line-height: 1.25;
    color: #FAF8F5;
    letter-spacing: -0.5px;
    position: relative;
    z-index: 2;
  }

  .divider {
    width: 60px;
    height: 2px;
    background: #ED1C24;
    margin: 36px 0 24px 0;
  }

  .name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px;
    line-height: 1;
    color: #FAF8F5;
    letter-spacing: 1px;
  }

  .role {
    font-family: 'DM Sans', sans-serif;
    font-size: 18px;
    font-weight: 400;
    color: #AAAAAA;
    margin-top: 8px;
    line-height: 1.4;
  }

  .brand-logo {
    width: 220px;
    height: auto;
    display: block;
  }

  .brand-anniversary {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #666666;
    margin-top: 10px;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="photo-col">
      <img src="${photoB64}" alt="${d.name}">
    </div>
    <div class="text-col">
      <div class="accent-bar"></div>
      <div class="label-top">${d.label_top}</div>
      <div class="quote-mark">"</div>
      <div class="main">
        <div class="quote">${d.quote}</div>
        <div class="divider"></div>
        <div class="name">${d.name}</div>
        <div class="role">${d.role}<br>${d.affiliation}</div>
      </div>
      <div>
        <img src="${logoB64}" alt="Sportrail" class="brand-logo">
        <div class="brand-anniversary">${d.label_bottom}</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function buildHtml9x16(
  data: TestimonialLangData,
  photoB64: string,
  logoB64: string,
): string {
  const d = e(data);
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  body { font-family: 'DM Sans', sans-serif; background: #0B0A0F; }

  .container {
    width: 1080px;
    height: 1920px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .photo-block {
    width: 1080px;
    height: 1050px;
    overflow: hidden;
    position: relative;
  }
  .photo-block img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 28%;
  }

  .photo-block::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 180px;
    background: linear-gradient(to bottom, rgba(11,10,15,0) 0%, rgba(11,10,15,1) 100%);
  }

  .text-block {
    width: 1080px;
    height: 870px;
    background: #0B0A0F;
    padding: 60px 70px 70px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .text-block::before {
    content: '';
    position: absolute;
    left: 70px;
    top: 0;
    width: 80px;
    height: 6px;
    background: #ED1C24;
  }

  .label-top {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 5px;
    color: #ED1C24;
    text-transform: uppercase;
    margin-top: 30px;
  }

  .quote-mark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 320px;
    line-height: 0.7;
    color: #ED1C24;
    opacity: 0.10;
    position: absolute;
    top: 40px;
    right: 60px;
    pointer-events: none;
    z-index: 1;
  }

  .quote {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 56px;
    line-height: 1.25;
    color: #FAF8F5;
    letter-spacing: -0.5px;
    margin-top: 30px;
    position: relative;
    z-index: 2;
  }

  .divider {
    width: 60px;
    height: 2px;
    background: #ED1C24;
    margin: 40px 0 28px 0;
  }

  .name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 54px;
    line-height: 1;
    color: #FAF8F5;
    letter-spacing: 1px;
  }

  .role {
    font-family: 'DM Sans', sans-serif;
    font-size: 22px;
    font-weight: 400;
    color: #AAAAAA;
    margin-top: 10px;
    line-height: 1.4;
  }

  .brand-logo {
    width: 260px;
    height: auto;
    display: block;
  }

  .brand-anniversary {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #666666;
    margin-top: 10px;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="photo-block">
      <img src="${photoB64}" alt="${d.name}">
    </div>
    <div class="text-block">
      <div class="quote-mark">"</div>
      <div>
        <div class="label-top">${d.label_top}</div>
        <div class="quote">${d.quote}</div>
      </div>
      <div>
        <div class="divider"></div>
        <div class="name">${d.name}</div>
        <div class="role">${d.role}<br>${d.affiliation}</div>
        <div style="margin-top: 36px;">
          <img src="${logoB64}" alt="Sportrail" class="brand-logo">
          <div class="brand-anniversary">${d.label_bottom}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
