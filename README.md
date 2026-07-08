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

- **Presets ("Unblock")** — one **toggle switch** per service, in a card you can click (**?**) to see
  exactly what it contains (domain list / geosite category / IP ranges):
  - **GEOSITE** cards (Telegram, YouTube, Google, Discord, Twitch, Netflix, Spotify,
    Twitter/X, Instagram/Facebook, TikTok, GitHub, Reddit) → a single `GEOSITE,<cat>,PROXY` rule that
    auto-updates with Mihomo's geosite DB. Telegram also adds its DC **IP-CIDR** ranges, IPv4 + IPv6
    (so Telegram Desktop + media work, not just web).
  - **Domain-list** cards (Torrents, Social) synced from editable `.lst` files.
  - When the **GeoIP** database is enabled, cards that have a matching GeoIP category (Telegram,
    Google, Netflix, Twitter/X, Instagram/Facebook) also lay down a `GEOIP,<service>` rule — a
    belt-and-suspenders IP-level match on top of the geosite/domain rules. Toggling the card on/off
    manages all facets together; if GeoIP is off the card just uses geosite (+ IP-CIDR) as before.
  - **Hybrid** cards can pair a geosite category *and* a supplementary list — e.g. **AI** =
    `category-ai-!cn` (comprehensive, auto-updating) + a curated `ai.lst` (ChatGPT/Claude/Gemini,
    Grok, Perplexity, Mistral, DeepSeek, Copilot, … — the transparent, editable part).
  - **Ads → block** (`GEOSITE,category-ads-all,REJECT`).
  - Rules a preset owns are hidden from the manual list below (to keep it about *your* domains); they
    stay visible in the preset card's popup and in the "show as list" view.
- **Manual rules** — add a `DOMAIN-SUFFIX` / `DOMAIN` / `DOMAIN-KEYWORD` / `GEOSITE` / `GEOIP` / `IP-CIDR`
  matcher with a `PROXY` / `DIRECT` / `REJECT` action. `GEOIP` routes by country (`ru`, `cn`) or service
  (`telegram`, `google`, `netflix`) from an auto-updating IP database — enable it once via the Manage
  tab's **Update geo** button (downloads GeoIP.dat and switches mihomo to geodata-mode). List / bulk / full-text editor views. The list is
  newest-first and each row has inline dropdowns to **re-type or re-route an existing rule** on the spot,
  plus an iOS-style on/off switch.
- **Manage tab** — start / stop / restart / reload the nikki service and toggle boot autostart, with a
  live running indicator; plus an **Updates** block showing installed versions with one-click
  **Update nikki-unblock** (pulls the latest release `.apk`), **Update nikki** (`apk upgrade nikki` +
  mihomo), and **Update geo** (downloads GeoSite/GeoIP databases + enables GeoIP), and **Update all**. Updates run in
  the background (apk outlasts the CGI timeout) with a live log that keeps streaming even if you
  navigate away.
- **IP exclusions** — manage `nikki.proxy.reserved_ip` (traffic to those dests skips Mihomo — handy
  for your own VPN nodes; the default private ranges are protected).
- **Auto-update** — optional cron that keeps enabled list-presets in sync with the manifest.
- **VPN nodes** — a tab to add your own exit configs (drag-drop a file or paste): **AmneziaWG /
  WireGuard `.conf`**, a **subscription link** (remnawave/clash → mihomo proxy-provider), **share-links**
  (`vless://`, `vmess://`, `trojan://`, `ss://`, `hysteria2://`), or **raw clash/mihomo YAML**. Each is
  converted to a mihomo proxy, injected into nikki, and **auto-checked** (latency probe via the mihomo
  API). Added nodes form a fallback group `UNBLOCK` (= your profile's base group + the added nodes);
  A bad config is auto-reverted so it can't break nikki. The **Exits** list unifies your **profile
  nodes** (referenced by name) and your added nodes into one **drag-to-reorder** list, with:
  - a **Priority ↔ Auto** switch — *Priority* (`fallback`) uses the top node and falls through to the
    next on failure (drag to set the order); *Auto* (`url-test`) auto-picks the fastest by ping,
    re-checked periodically;
  - an **enable/disable** toggle per node (works for profile nodes too — a disabled node drops out of
    the pool), a live **active-node** indicator, and per-node latency;
  - one managed exit group that **"→ VPN" routes through**, so ordering / auto-select apply to every
    tunneled domain (a one-click button migrates older "→ VPN (profile)" rules onto it).
  Subscriptions appear as bundles (all-or-nothing delete — you can't toggle a single proxy inside one).
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

> ### ⚠ Set `base_group` if your proxy-group isn't `PROXY`
> nikki-unblock routes "→ VPN" rules and pools your VPN nodes through your mihomo profile's **exit
> proxy-group**. It assumes that group is named **`PROXY`**. If your working profile calls it something
> else (`🚀 Proxy`, `Select`, …), point `base_group` at the real name — otherwise every "→ VPN" rule
> targets a group that doesn't exist and nothing is tunneled:
> ```sh
> uci set nikki-unblock.config.base_group='YOUR-GROUP-NAME' && uci commit nikki-unblock
> ```
> The UI shows a warning banner on load if the configured `base_group` isn't found in mihomo, so you'll
> know if it's wrong. (Prerequisite either way: a **working nikki profile that defines a proxy-group** —
> set that up in nikki before adding rules here.)

## Configuration (`uci show nikki-unblock`)

| Option | Default | Meaning |
|---|---|---|
| `applist_url` | `https://sketso.github.io/nikki-unblock/applist` | Where the preset manifest (`index.json`) + `.lst` lists are fetched from (server-side). |
| `autosync_enabled` / `autosync_interval` | `0` / `6h` | Auto-sync of enabled list-presets (also toggled from the UI). |
| `lang` | `ru` | Default UI language (`ru`/`en`); each browser can override with the RU/EN switch. |
| `base_group` | `PROXY` | Your mihomo profile's existing exit proxy-group (VPN-nodes tab pools added nodes with it). Set it if your profile's group isn't named `PROXY`. |
| `exit_group` | `UNBLOCK` | Name of the combined group (`base_group` + added nodes) that "→ VPN (+nodes)" rules target. |

Added VPN-node configs (keys, subscription tokens) are stored **only on the router** under
`/etc/nikki-unblock/` (root-only) and the generated `/etc/nikki/mixin.yaml` — never sent back to the
browser or committed anywhere.

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
