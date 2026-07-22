# Nipret

**English** · [Русский](README.ru.md)

A simple web page for your OpenWrt router that **unblocks sites and apps two ways** — through your
**VPN** and through **DPI-bypass** — with one-click buttons for Telegram, YouTube, Netflix, ChatGPT and
more. Nipret is a friendly front-end for **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)**
(the Mihomo VPN) and **[zapret2](https://github.com/bol-van/zapret)** (DPI-bypass). It manages whichever
of the two you have installed.

> *Nipret = **Ni**kki + za**pret**.* (The package/repo are still named `nikki-unblock` for compatibility.)

You set it up once, then everything is buttons in your router's web panel — no command line for daily use.

## What you can do

- **Unblock popular services** — one toggle each (Telegram, YouTube, Netflix, ChatGPT, Instagram, …).
- **Add your own sites** — send any domain through the VPN, keep it direct, or block it.
- **Add your own VPN servers** — paste a subscription link or a `vless://` / WireGuard config; reorder
  them and let it auto-pick the fastest. Import your friends' configs too.
- **Per-device control** — on one Devices page, keep specific devices off the VPN and/or off the
  DPI-bypass (or flip it: apply an engine to only the devices you pick). Matched by MAC, so an
  exclusion survives the device's IP changing.
- **Bypass DPI without a VPN (zapret2)** — for sites blocked "from inside" by your ISP (YouTube, etc.):
  turn zapret2 on/off and add domains to bypass with one-click **presets** (YouTube, Discord, Twitch,
  Twitter/X) or your own. Presets are the recommended replacement for "auto-learn", which often picks up junk.
- **One control page** — start/stop each engine, update with one click, and back up each engine
  (manual or scheduled auto-backup).
- **Simple or full view** — a Simple/Advanced switch (top-right) hides the deep settings so
  non-technical users see just the essentials: unblock presets, add-a-site, on/off. Remembered per browser.
- **Hand it to the family** — a minimal **`<router-IP>/unblock`** page lets non-technical people add
  sites to the VPN themselves, without the full panel. Optionally lock the panel (and that page) behind
  a **PIN** you set in General → Security.

## Two engines

Nipret is a *combine* over two independent tools — install either or both:

- **VPN (nikki / Mihomo)** — routes chosen sites through a proxy/VPN. Best for services blocked **from
  the outside** (geo-blocks, IP blocks): ChatGPT, Instagram, Telegram, …
- **DPI-bypass (zapret2)** — defeats your ISP's DPI at the packet level, no VPN. Best for services
  throttled/blocked **from the inside**: YouTube, Discord, …

Tabs and controls for an engine appear only if that engine is installed.

## Before you start

Install at least one engine on your router first (both is fine):

- for the **VPN** side — **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)**: add a VPN and make
  sure it connects;
- for the **DPI-bypass** side — **[zapret2](https://github.com/bol-van/zapret)**.

Then install Nipret — its tabs light up for whatever you have.

## Security model

Nipret is built for a **trusted home LAN**. By default the panel (`/cgi-bin/nikki-unblock`) has **no
login of its own**: anyone who can open your router's web page can also change routing, apply presets,
restore backups and run updates. That is a deliberate trade-off for one-tap usability at home.

You can optionally turn on a **PIN** (General → Security) to lock the panel and the `/unblock` page —
handy when you hand the link to family or share Wi-Fi with guests. The PIN is stored only as a salted
hash. A logged-in router admin reaching the panel through LuCI (Services → Nipret) is never asked for
it, so you can always change or reset the PIN there even if you forget it. **Caveat:** over plain http
the PIN and its cookie travel in the clear, so it keeps casual/guest users out but is not protection
against someone actively sniffing your LAN.

Either way:

- **never expose the router's web port (80/443) to the internet** — don't port-forward it, don't put
  the router in a DMZ;
- treat guest Wi-Fi accordingly: give guests an isolated network, or set a PIN;
- LuCI's own login protects only the LuCI page that embeds Nipret; the standalone panel is open unless
  you set a PIN.

## Install

Pick whichever is easier for you.

### Option A — from the router's web panel (no command line)

In LuCI go to **System → Software**, then either:

- click **“Upload Package…”** and upload the package file from the
  [**Releases page**](https://github.com/sketso/nikki-unblock/releases/latest)
  (`luci-app-nikki-unblock.apk` on OpenWrt 25.12+, or the `.ipk` on older routers); **or**
- in the **“Download and install package”** field, paste this link and click **OK**:

  ```
  https://github.com/sketso/nikki-unblock/releases/latest/download/luci-app-nikki-unblock.apk
  ```

The router will warn it's from an **“untrusted source”** — that's normal (it isn't in OpenWrt's official
repo). Just confirm.

### Option B — one command (also turns on one-click auto-updates)

```sh
wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
```

This adds a small **signed** update feed, so new versions later show up right in **LuCI → System →
Software** and `apk upgrade` works.

---

Either way, open it in your web panel: **LuCI → Services → “nikki · Unblock”**
(or go to `http://YOUR-ROUTER-IP/nikki`).

## Updating

- In the app: **General** tab → **Update Nipret** (works no matter how you installed).
- Or in the router panel: **LuCI → System → Software** — if you used Option B it's listed there; with
  Option A just re-do the upload / paste-link with the newer version.

## Uninstalling

Nipret touches more than its own files (nikki routing rules, firewall snippets, a zapret2 desync hook,
IPv6 toggles, a cron watchdog, the signed update feed). A plain `apk del` would leave those behind, so
use one of the two clean paths — both do the **same** full revert and leave a safety backup at
`/tmp/nu-prepurge.tar.gz`:

- **From the app:** **General** tab (advanced mode) → **Remove Nipret**. Tick *“also remove zapret2”* if
  you want that gone too, then confirm. The panel reverts everything and removes itself.
- **One command:**

  ```sh
  wget -O - https://github.com/sketso/nikki-unblock/raw/main/uninstall.sh | sh
  # also remove /opt/zapret2:
  wget -O - https://github.com/sketso/nikki-unblock/raw/main/uninstall.sh | sh -s -- zapret2
  ```

Either way the router is returned to its pre-Nipret state. **nikki is never touched** (removing it is
its own thing); **zapret2** is left alone unless you explicitly ask for it. Regret it? Install again and
feed `/tmp/nu-prepurge.tar.gz` to **General → Backup → Restore**.

## Something not working?

- **A service is ON but nothing goes through the VPN.** The app shows a warning banner at the top when
  it can't find your VPN's group (it looks for one named `PROXY`, which is the default). If your VPN in
  nikki uses a different group name, the banner shows a one-line command to set it — a one-time fix.
  Most people never touch this.
- **Presets won't load / “lists unavailable”.** Your router can't reach the preset list host — check the
  router's internet/DNS, or that your VPN is up.

---

<details>
<summary><b>Advanced / self-hosting</b> (you can ignore this)</summary>

### Settings (`uci show nikki-unblock`)

| Option | Default | Meaning |
|---|---|---|
| `applist_url` | `…github.io/nikki-unblock/applist` | Where the one-click preset lists are fetched from. |
| `autosync_enabled` / `autosync_interval` | `0` / `24h` | Auto-refresh of enabled list-presets. |
| `lang` | `ru` | Default UI language (`ru`/`en`); each browser can switch with the RU/EN toggle. |
| `base_group` | `PROXY` | Your nikki profile's VPN proxy-group name. Change it only if yours isn't `PROXY`. |
| `exit_group` | `UNBLOCK` | Name of the managed group (your profile + added VPN nodes) that “→ VPN” uses. |

VPN-node configs (keys, subscription tokens) stay **only on the router** and are never sent to the
browser or uploaded anywhere.

### How it installs (for the curious)

On OpenWrt ≥ 25.12 the installer adds a small **signed** package repo hosted on this project's GitHub
Pages (its key goes to `/etc/apk/keys/`, the feed to `/etc/apk/repositories.d/`), so the package shows up
in LuCI → System → Software and `apk upgrade luci-app-nikki-unblock` works. On older OpenWrt it installs
the `.ipk` from the latest release. It's **not** the official OpenWrt repository — nothing is submitted
anywhere; it's a personal feed, like nikki's own.

### Host your own preset lists

Presets come from a static host (see [`applist/`](applist/)): `index.json` + optional `.lst` files. Fork
this repo, edit `applist/`, enable GitHub Pages, and point `applist_url` at your copy. Example manifest
entries:

```json
{ "id": "netflix",  "name": "Netflix",  "geosite": "netflix", "geoip": "netflix" }
{ "id": "telegram", "name": "Telegram", "geosite": "telegram", "ipcidr": ["91.108.0.0/16"] }
{ "id": "torrents", "name": "Torrents" }
{ "id": "ads",      "name": "Ads → block", "geosite": "category-ads-all", "node": "REJECT" }
```

### Build from source

```sh
echo "src-git nikki_unblock https://github.com/sketso/nikki-unblock.git" >> feeds.conf.default
./scripts/feeds update nikki_unblock && ./scripts/feeds install -a -p nikki_unblock
make package/luci-app-nikki-unblock/compile
```

### Low-RAM routers

Each VPN reload briefly runs two Mihomo copies (~100 MB each). On tight routers add zram:
`apk add kmod-zram zram-swap`.

</details>

Built on **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** and
**[Mihomo](https://github.com/MetaCubeX/mihomo)** (not affiliated). MIT © sketso.
