# nikki-unblock

A tiny companion for **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** (the Mihomo
transparent-proxy manager for OpenWrt) that gives you a friendly LAN web page to decide **what goes
through the VPN, what stays direct, and what gets blocked** — with **one-click "Unblock" buttons**
for popular services (Telegram, YouTube, Netflix, ChatGPT, Discord, …).

It manages nikki's own routing rules (`uci nikki.@rule[]`) and the proxy-bypass list
(`nikki.proxy.reserved_ip`). No extra daemon — it's a self-contained CGI page served by uhttpd, with
a LuCI menu entry to open it.

> RU/EN interface. Companion project — **install nikki first.**

## Features

- **Presets ("Unblock")** — one click per service:
  - **GEOSITE** buttons (Telegram, YouTube, Google, Discord, Twitch, Netflix, Spotify, ChatGPT,
    Twitter/X, Instagram/Facebook, TikTok, GitHub, Reddit) → a single `GEOSITE,<cat>,PROXY` rule that
    auto-updates with Mihomo's geosite DB. Telegram also adds its DC **IP-CIDR** ranges (so Telegram
    Desktop + media work, not just web).
  - **Domain-list** buttons (Torrents, Social) synced from editable `.lst` files.
  - **Ads → block** (`GEOSITE,category-ads-all,REJECT`).
- **Manual rules** — add a `DOMAIN-SUFFIX` / `DOMAIN` / `DOMAIN-KEYWORD` / `GEOSITE` matcher with a
  `PROXY` / `DIRECT` / `REJECT` action. List / bulk / full-text editor views.
- **IP exclusions** — manage `nikki.proxy.reserved_ip` (traffic to those dests skips Mihomo — handy
  for your own VPN nodes; the default private ranges are protected).
- **Auto-update** — optional cron that keeps enabled list-presets in sync with the manifest.
- Everything applies via `/etc/init.d/nikki reload`.

## Requirements

- OpenWrt **≥ 24.10** with **firewall4**.
- **nikki** installed and working — https://github.com/nikkinikki-org/OpenWrt-nikki
- Base tools `curl`, `jsonfilter`, `uhttpd` (pulled as dependencies).

## Install

```sh
# 1) install nikki first (if you haven't):
wget -O - https://github.com/nikkinikki-org/OpenWrt-nikki/raw/refs/heads/main/feed.sh | ash
apk add nikki luci-app-nikki           # (opkg add on OpenWrt <= 24.10)

# 2) then nikki-unblock:
wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
```

Open it in **LuCI → Services → "nikki · Unblock"**, or directly at **http://&lt;router-ip&gt;/nikki**.

## Configuration (`uci show nikki-unblock`)

| Option | Default | Meaning |
|---|---|---|
| `applist_url` | `https://sketso.github.io/nikki-unblock/applist` | Where the preset manifest (`index.json`) + `.lst` lists are fetched from (server-side). |
| `autosync_enabled` / `autosync_interval` | `0` / `6h` | Auto-sync of enabled list-presets (also toggled from the UI). |
| `lang` | `ru` | Default UI language (`ru`/`en`); each browser can override with the RU/EN switch. |

## Host your own preset lists

The presets come from a small static host (see [`applist/`](applist/)): an `index.json` manifest plus
optional `.lst` domain files. Fork this repo, edit `applist/`, enable **GitHub Pages**, and point
`applist_url` at `https://<you>.github.io/<repo>/applist`. Most presets are GEOSITE categories (they
live in Mihomo's `GeoSite.dat`), so the host mainly serves `index.json` + a couple of `.lst` files.

Manifest entry shape:
```json
{ "id": "netflix", "name": "Netflix", "geosite": "netflix" }                 // GEOSITE button
{ "id": "ads", "name": "Ads → block", "geosite": "category-ads-all", "node": "REJECT" }
{ "id": "telegram", "name": "Telegram", "geosite": "telegram",
  "ipcidr": ["91.108.0.0/16","149.154.160.0/20"] }                            // GEOSITE + IP ranges
{ "id": "torrents", "name": "Torrents" }                                      // list -> torrents.lst
```
Check a GEOSITE category exists on the router: `strings /etc/nikki/run/GeoSite.dat | grep -qxF TELEGRAM`
(codes are UPPERCASE; note `instagram`/`x` aren't separate — use `facebook`/`twitter`).

## Notes

- **Low-RAM routers:** Mihomo is ~100 MB and each `nikki reload` briefly runs two copies. On tight
  routers (e.g. 256 MB) install zram for headroom: `apk add kmod-zram zram-swap`.
- **Security:** the page is unauthenticated on the LAN (fine for home use). The LuCI entry embeds it
  behind LuCI's login.

## Build from source

Standard LuCI feed build:
```sh
echo "src-git nikki_unblock https://github.com/sketso/nikki-unblock.git" >> feeds.conf.default
./scripts/feeds update nikki_unblock && ./scripts/feeds install -a -p nikki_unblock
make package/luci-app-nikki-unblock/compile
```

## Credits

Built on top of **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** and
**[Mihomo](https://github.com/MetaCubeX/mihomo)**. Not affiliated with either.

## License

MIT © sketso
