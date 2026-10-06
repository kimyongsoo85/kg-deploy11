"""개발용 정적 서버 — 모든 응답에 캐시 금지 헤더를 붙여 새로고침만 해도 최신 파일이 보이게 한다.

    python landing/scripts/serve.py [포트]   (기본 5173)
"""

import functools
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{port} (no-cache)")
        httpd.serve_forever()
