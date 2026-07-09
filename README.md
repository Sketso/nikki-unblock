# nikki-unblock

**English** · [Русский](README.ru.md)

A LuCI companion for **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** (the Mihomo
transparent-proxy manager for OpenWrt). It gives you a friendly LAN web page to decide **what goes
through the VPN, what stays direct, and what gets blocked** — with **one-click buttons** for popular
services (Telegram, YouTube, Netflix, ChatGPT, …) and a tab to manage your own VPN exit nodes.

No extra daemon: it's a self-contained CGI served by uhttpd, opened from a LuCI menu entry. RU/EN UI.
It only edits nikki's own routing rules (`uci nikki.@rule[]`) and applies them with
`/etc/init.d/nikki reload`.

## Features

- **Preset cards** — one toggle per service; click **?** to see exactly what a card contains. Built on
  auto-updating **GEOSITE**/**GEOIP** categories, curated domain **lists**, and **IP-CIDR** ranges (e.g.
  Telegram adds its DC IP ranges so Desktop + media work, not just web). Cards can be hybrid (**AI** =
  `category-ai-!cn` + a curated `ai.lst`), and **Ads → block**. Preset-owned rules are hidden from the
  manual list to keep it about *your* domains.
- **Manual rules** — add a `DOMAIN-SUFFIX` / `DOMAIN` / `DOMAIN-KEYWORD` / `GEOSITE` / `GEOIP` / `IP-CIDR`
  matcher → `PROXY` / `DIRECT` / `REJECT`. List / bulk / full-text views; inline re-type / re-route; iOS
  toggles.
- **Exits (VPN nodes)** — drag-drop or paste **AmneziaWG/WireGuard `.conf`**, a **subscription link**
  (base64 or clash, imported as individual reorderable nodes — works even when a panel's clash output is
  empty), **share-links** (`vless://`, `vmess://`, `trojan://`, `ss://`, `hysteria2://`; incl.
  `xhttp`/`grpc`/`ws` + `reality`), or **raw clash YAML**. Your profile nodes and added nodes merge into
  one **drag-to-reorder** exit group with a **Priority ↔ Auto** (fastest-by-ping) switch, per-node
  enable/disable + latency, an active indicator, and **Ping all**. Subscriptions are **tracked &
  refreshable** (↻ or auto), each node is auto-checked, and a bad config auto-reverts so it can't break
  nikki. If **zapret2** runs alongside, node servers are auto-excluded from its DPI-desync.
- **Manage tab** — start/stop/restart/reload nikki + autostart toggle; an **Updates** block (versions +
  one-click update of nikki-unblock / nikki / geo databases, running in the background with a live log);
  **Config backup** (download / restore / rotating auto-backup); and an optional **MSS clamp** toggle
  (fixes large-download stalls on some mihomo builds).
- **IP exclusions** — manage `nikki.proxy.reserved_ip` (dests that skip Mihomo; default private ranges
  protected).
- **Auto-sync** — optional cron that keeps enabled list-presets fresh.

## Install

```sh
# 1) install nikki first (if you haven't):
wget -O - https://github.com/nikkinikki-org/OpenWrt-nikki/raw/refs/heads/main/feed.sh | ash
apk add nikki luci-app-nikki           # (opkg add on OpenWrt <= 24.10)

# 2) then nikki-unblock:
wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
```

On **apk** (OpenWrt ≥ 25.12), `feed.sh` adds a small **signed** package repo on GitHub Pages (installs
its key into `/etc/apk/keys/` + registers the feed) — so the package appears in **LuCI → System →
Software** and updates are just `apk upgrade luci-app-nikki-unblock` (or the Manage-tab button). On
**opkg** it installs the `.ipk` from the latest release.

Open it in **LuCI → Services → "nikki · Unblock"**, or at **http://&lt;router-ip&gt;/nikki**.

> ⚠ **Set `base_group` if your proxy-group isn't `PROXY`.** "→ VPN" rules route through your mihomo
> profile's exit proxy-group, assumed to be named `PROXY`. If yours differs (`🚀 Proxy`, `Select`, …):
> ```sh
> uci set nikki-unblock.config.base_group='YOUR-GROUP-NAME' && uci commit nikki-unblock
> ```
> The UI shows a warning banner if the configured group isn't found in mihomo. (Either way you need a
> working nikki profile that defines a proxy-group.)

## Configuration (`uci show nikki-unblock`)

| Option | Default | Meaning |
|---|---|---|
| `applist_url` | `…github.io/nikki-unblock/applist` | Where the preset manifest + `.lst` lists are fetched (server-side). |
| `autosync_enabled` / `autosync_interval` | `0` / `24h` | Auto-sync of enabled list-presets (also toggled in the UI). |
| `lang` | `ru` | Default UI language (`ru`/`en`); each browser can override via the RU/EN switch. |
| `base_group` | `PROXY` | Your profile's exit proxy-group. Set it if it isn't named `PROXY`. |
| `exit_group` | `UNBLOCK` | Name of the managed group (profile + added nodes) that "→ VPN" routes through. |

VPN-node configs (keys, subscription tokens) live **only on the router** under `/etc/nikki-unblock/`
(root-only) and the generated `/etc/nikki/mixin.yaml` — never sent to the browser or committed.

## Host your own presets

Presets come from a static host (see [`applist/`](applist/)): `index.json` + optional `.lst` files.
Fork, edit `applist/`, enable GitHub Pages, and point `applist_url` at your copy. A manifest entry:

```json
{ "id": "netflix",  "name": "Netflix",  "geosite": "netflix", "geoip": "netflix" }
{ "id": "telegram", "name": "Telegram", "geosite": "telegram", "ipcidr": ["91.108.0.0/16"] }
{ "id": "torrents", "name": "Torrents" }                       // domain list → torrents.lst
{ "id": "ads",      "name": "Ads → block", "geosite": "category-ads-all", "node": "REJECT" }
```

Verify a GEOSITE/GEOIP category exists: `strings /etc/nikki/run/GeoSite.dat | grep -qxF TELEGRAM`
(codes are UPPERCASE; `instagram`/`x` aren't separate — use `facebook`/`twitter`).

## Notes

- **Low-RAM routers:** each `nikki reload` briefly runs two Mihomo copies (~100 MB each). On tight
  routers install zram for headroom: `apk add kmod-zram zram-swap`.
- **Security:** the page is unauthenticated on the LAN (fine for home use); the LuCI entry sits behind
  LuCI's login.

## Build from source

```sh
echo "src-git nikki_unblock https://github.com/sketso/nikki-unblock.git" >> feeds.conf.default
./scripts/feeds update nikki_unblock && ./scripts/feeds install -a -p nikki_unblock
make package/luci-app-nikki-unblock/compile
```

## Credits & license

Built on **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** and
**[Mihomo](https://github.com/MetaCubeX/mihomo)** (not affiliated). MIT © sketso.
