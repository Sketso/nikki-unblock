# nikki-unblock

[English](README.md) · **Русский**

LuCI-компаньон для **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** (менеджера прозрачного
прокси Mihomo для OpenWrt). Даёт удобную LAN-страницу, чтобы решать, **что идёт через VPN, что напрямую,
а что блокируется** — с **кнопками в один клик** для популярных сервисов (Telegram, YouTube, Netflix,
ChatGPT, …) и вкладкой для управления своими VPN-нодами.

Без отдельного демона: это самодостаточный CGI на uhttpd, открывается из пункта меню LuCI. Интерфейс
RU/EN. Правит только собственные правила nikki (`uci nikki.@rule[]`) и применяет их через
`/etc/init.d/nikki reload`.

## Возможности

- **Карточки-пресеты** — тумблер на сервис; клик по **?** показывает, что именно внутри карточки. В
  основе — авто-обновляемые категории **GEOSITE**/**GEOIP**, кураторские **списки** доменов и диапазоны
  **IP-CIDR** (например, Telegram добавляет IP своих ДЦ, чтобы работал Desktop и медиа, а не только веб).
  Карточки бывают гибридными (**AI** = `category-ai-!cn` + `ai.lst`), и есть **Реклама → блок**. Правила,
  которыми владеет пресет, скрыты из ручного списка, чтобы он был про *твои* домены.
- **Ручные правила** — добавить матчер `DOMAIN-SUFFIX` / `DOMAIN` / `DOMAIN-KEYWORD` / `GEOSITE` /
  `GEOIP` / `IP-CIDR` → `PROXY` / `DIRECT` / `REJECT`. Виды списком / массово / текстом; смена типа и
  маршрута прямо в строке; iOS-тумблеры.
- **Выходы (VPN-ноды)** — перетащи или вставь **AmneziaWG/WireGuard `.conf`**, **ссылку-подписку**
  (base64 или clash — импортируется как отдельные переставляемые ноды, работает даже когда clash-вывод
  панели пустой), **share-ссылки** (`vless://`, `vmess://`, `trojan://`, `ss://`, `hysteria2://`; вкл.
  `xhttp`/`grpc`/`ws` + `reality`) или **сырой clash-YAML**. Ноды профиля и добавленные объединяются в
  одну **переставляемую перетаскиванием** группу выходов с переключателем **Приоритет ↔ Авто** (самый
  быстрый по пингу), вкл/выкл и задержкой на ноду, индикатором активной и кнопкой **Пинг всех**. Подписки
  **отслеживаются и обновляются** (↻ или авто), каждая нода авто-проверяется, а битый конфиг сам
  откатывается, чтобы не сломать nikki. Если рядом стоит **zapret2**, серверы нод авто-исключаются из его
  DPI-десинка.
- **Вкладка «Управление»** — старт/стоп/рестарт/reload nikki + автозапуск; блок **«Обновление»** (версии
  + обновление nikki-unblock / nikki / гео-баз в один клик, в фоне с живым логом); **«Бэкап конфига»**
  (скачать / восстановить / ротация авто-бэкапов); и опциональный тумблер **MSS clamp** (лечит зависания
  больших загрузок на некоторых сборках mihomo).
- **IP-исключения** — управление `nikki.proxy.reserved_ip` (адреса в обход Mihomo; приватные диапазоны по
  умолчанию защищены).
- **Автосинк** — опциональный cron, поддерживающий включённые списки-пресеты в актуальном виде.

## Установка

```sh
# 1) сначала поставь nikki (если ещё нет):
wget -O - https://github.com/nikkinikki-org/OpenWrt-nikki/raw/refs/heads/main/feed.sh | ash
apk add nikki luci-app-nikki           # (opkg add на OpenWrt <= 24.10)

# 2) затем nikki-unblock:
wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
```

На **apk** (OpenWrt ≥ 25.12) `feed.sh` добавляет небольшой **подписанный** репозиторий на GitHub Pages
(ставит его ключ в `/etc/apk/keys/` + прописывает фид) — пакет появляется в **LuCI → System → Software**,
а обновление это просто `apk upgrade luci-app-nikki-unblock` (или кнопка во вкладке «Управление»). На
**opkg** ставится `.ipk` из последнего релиза.

Открой в **LuCI → Services → «nikki · Unblock»** или по **http://&lt;ip-роутера&gt;/nikki**.

> ⚠ **Задай `base_group`, если твоя proxy-группа не `PROXY`.** Правила «→ VPN» идут через exit
> proxy-группу твоего профиля mihomo, по умолчанию она считается `PROXY`. Если у тебя иначе (`🚀 Proxy`,
> `Select`, …):
> ```sh
> uci set nikki-unblock.config.base_group='ИМЯ-ГРУППЫ' && uci commit nikki-unblock
> ```
> UI покажет предупреждение, если указанной группы нет в mihomo. (В любом случае нужен рабочий профиль
> nikki с proxy-группой.)

## Настройки (`uci show nikki-unblock`)

| Опция | По умолчанию | Смысл |
|---|---|---|
| `applist_url` | `…github.io/nikki-unblock/applist` | Откуда берутся манифест пресетов + `.lst` списки (со стороны сервера). |
| `autosync_enabled` / `autosync_interval` | `0` / `24h` | Автосинк включённых списков-пресетов (также из UI). |
| `lang` | `ru` | Язык UI по умолчанию (`ru`/`en`); каждый браузер может переключить сам. |
| `base_group` | `PROXY` | Exit proxy-группа профиля. Задай, если она не `PROXY`. |
| `exit_group` | `UNBLOCK` | Имя управляемой группы (профиль + добавленные ноды), через которую идёт «→ VPN». |

Конфиги VPN-нод (ключи, токены подписок) хранятся **только на роутере** в `/etc/nikki-unblock/`
(root-only) и в сгенерированном `/etc/nikki/mixin.yaml` — в браузер не отдаются и никуда не коммитятся.

## Свои пресеты

Пресеты берутся со статического хоста (см. [`applist/`](applist/)): `index.json` + опциональные `.lst`.
Форкни, поправь `applist/`, включи GitHub Pages и укажи `applist_url` на свою копию. Запись манифеста:

```json
{ "id": "netflix",  "name": "Netflix",  "geosite": "netflix", "geoip": "netflix" }
{ "id": "telegram", "name": "Telegram", "geosite": "telegram", "ipcidr": ["91.108.0.0/16"] }
{ "id": "torrents", "name": "Torrents" }                       // список доменов → torrents.lst
{ "id": "ads",      "name": "Реклама → блок", "geosite": "category-ads-all", "node": "REJECT" }
```

Проверить категорию GEOSITE/GEOIP: `strings /etc/nikki/run/GeoSite.dat | grep -qxF TELEGRAM` (коды
ЗАГЛАВНЫМИ; `instagram`/`x` не отдельные — используй `facebook`/`twitter`).

## Заметки

- **Роутеры с мало́й RAM:** каждый `nikki reload` кратко держит две копии Mihomo (~100 МБ каждая). На
  слабых роутерах поставь zram: `apk add kmod-zram zram-swap`.
- **Безопасность:** страница без аутентификации в LAN (норм для дома); пункт LuCI прикрыт логином LuCI.

## Сборка из исходников

```sh
echo "src-git nikki_unblock https://github.com/sketso/nikki-unblock.git" >> feeds.conf.default
./scripts/feeds update nikki_unblock && ./scripts/feeds install -a -p nikki_unblock
make package/luci-app-nikki-unblock/compile
```

## Благодарности и лицензия

На основе **[nikki](https://github.com/nikkinikki-org/OpenWrt-nikki)** и
**[Mihomo](https://github.com/MetaCubeX/mihomo)** (без аффилиации). MIT © sketso.
