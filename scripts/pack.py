"""공유용 압축 파일 만들기 — 사이트에 실제로 쓰이는 파일만 dist/cocobi-site.zip 으로 묶는다.

    python landing/scripts/pack.py

.env(API 키), scripts/, docs/, 프롬프트, 안 쓰는 에셋(색칠 도안 등)은 넣지 않는다.
받은 사람은 압축을 풀고 index.html 을 더블클릭하면 된다(글꼴은 인터넷 연결 시 적용).
"""

import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "cocobi-site.zip"

PAGES = ["index.html", "character.html"]
CODE = ["css/style.css", "css/character.css", "js/main.js", "js/characters.js", "js/character.js"]
COCOBI_PATTERNS = [
    r"characters_\d{2}(_detail)?\.png",      # 캐릭터 썸네일·상세
    r"characters_bg_object_\d{2}\.png",      # 꽃 장식
    r"characters_txt_object_0[145]\.png",    # 노트 테이프·스티커
    r"main_characters_cloud_0[13]\.png",     # 구름
    r"main_characters_(coco|lobi)_img\.png", # 코코·러비 전신
    r"(logo|main_characters_logo)\.png", r"cocobiTxt\.svg", r"main_visual_bg\.jpg",
]
GENERATED = ["og.webp", "outro-art.webp"]

README = """꼬마공룡 코코비 소개 페이지
============================

1. 압축을 풉니다.
2. index.html 을 더블클릭해 브라우저(Chrome 권장)로 엽니다.
3. 스크롤을 내리면 타일이 모이고, 캐릭터 타일을 누르면 소개 페이지로 이동해요.

* 글꼴은 인터넷에 연결되어 있을 때 적용됩니다.
* 코코비의 모든 저작권은 (주)키글에 있습니다.
"""


def main():
    files = PAGES + CODE
    files += [f"assets/cocobi/{p.name}" for p in sorted((ROOT / "assets/cocobi").iterdir())
              if any(re.fullmatch(pat, p.name) for pat in COCOBI_PATTERNS)]
    files += [f"assets/generated/{n}" for n in GENERATED]

    missing = [f for f in files if not (ROOT / f).exists()]
    if missing:
        raise SystemExit(f"없는 파일: {missing}")

    OUT.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.write(ROOT / f, f"cocobi-site/{f}")
        zf.writestr("cocobi-site/읽어주세요.txt", README)
    print(f"{OUT.relative_to(ROOT.parent)}  ({len(files)}개 파일, {OUT.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
