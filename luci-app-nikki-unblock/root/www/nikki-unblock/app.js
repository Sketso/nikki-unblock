const $ = s => document.querySelector(s);
const escH = s => (s + "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
let RULES = [], PRESETS = [], LANG = "ru", MODE = "simple";

const I18N = {
  ru: {
    h1: "Nipret · VPN + обход DPI",
    engNikki: "VPN (Nikki)", engZapret2: "Обход DPI (Zapret2)", engCommon: "Общее",
    modeSimple: "Простой", modeAdvanced: "Расширенный",
    kioskTitle: "Разблокировать сайт", kioskHint: "Впиши адрес сайта, который не открывается, и нажми «Добавить» — он пойдёт через VPN. Ниже можно развернуть список добавленных и готовые наборы (YouTube, Instagram и др.). Страница доступна с любого устройства в домашней сети.",
    kioskCopy: "Скопировать ссылку на страницу", kioskCopied: "Ссылка скопирована", kioskNoNikki: "VPN (nikki) не установлен — разблокировка через VPN недоступна.",
    secTitle: "Безопасность", secHint: "Закрыть панель и страницу /unblock PIN-кодом. Даёшь семье ссылку + PIN — и никто чужой из сети не меняет настройки. По умолчанию выключено. Хранится только хэш PIN. Забыл PIN? Открой панель через LuCI роутера (Службы → Nipret) — там ты уже вошёл как админ, PIN не спросят, и его можно сменить или выключить прямо здесь. Важно: по обычному http (без https) PIN защищает от случайных/гостей, но не от того, кто целенаправленно перехватывает трафик в сети.",
    secRequire: "Требовать PIN", secPinPh: "PIN (мин. 4 символа)", secPinChange: "Новый PIN (чтобы сменить)",
    secLogout: "Выйти на всех устройствах", secNeedPin: "Сначала задай PIN ниже", secShort: "PIN слишком короткий (мин. 4)",
    secPinSet: "PIN задан", secPinNone: "PIN ещё не задан", secSetOn: "Задать PIN", secChange: "Сменить PIN",
    secOn: "PIN включён", secOff: "PIN выключен", secPinSaved: "PIN сохранён и включён",
    engCommonHint: "Обновления сервиса и движков + резервная копия настроек — общее для всего Nipret.",
    tabCommon: "Общее",
    tabDomains: "Домены в туннель", tabIps: "IP-исключения",
    z2TabDomains: "Домены", z2TabAuto: "Автообучение", z2TabExclude: "Исключения", z2TabSvc: "Управление",
    tabDevices: "Устройства",
    engNikkiHint: "Nikki (Mihomo) заворачивает выбранные сайты в VPN/прокси — для того, что блокируют «снаружи» (гео-блок, блок по IP): ChatGPT, Instagram, Telegram и т.п. Управляй доменами, нодами и устройствами. Простую страницу для добавления сайтов (можно дать любому в семье) открой по адресу «IP-роутера/unblock».",
    engZapret2Hint: "Zapret2 обходит блокировки провайдера на уровне DPI (без VPN) — для сайтов, которые режут «изнутри» (YouTube и т.п.). Управляй сервисом и списком доменов для обхода.",
    z2On: "zapret2 работает", z2Off: "zapret2 остановлен",
    z2Domains: "Свои домены", z2AddHint: "Домен, который zapret2 будет пробивать через DPI. Пиши как <code>youtube.com</code> — подходит и для поддоменов.",
    z2PresetsTitle: "Разблокировать (пресеты)",
    z2PresetsHint: "Готовые списки доменов для обхода DPI — YouTube, Discord и другие. Добавляются в отдельный список zapret2, не смешиваясь с твоими доменами ниже.",
    z2NoPresets: "Пресеты недоступны — проверь интернет/DNS роутера.",
    z2PresetNote: "Домены добавляются в отдельный список обхода zapret2 (по суффиксу — покрывают и поддомены), отдельно от твоих доменов.",
    z2AutoRecommend: "Рекомендуется держать автообучение выключенным и добавлять сервисы пресетами на вкладке «Домены»: автообучение часто ошибочно заносит лишние домены (телеметрию, локальные сервисы).",
    z2SetupRunning: "Применяю рекомендуемую настройку…",
    z2SetupApplied: "Готово: включены пресеты YouTube/Discord, автообучение выключено. Изменить можно на вкладках ниже.",
    z2AutoTitle: "Автообучение (autohostlist)", z2AutoLabel: "Zapret2 сам находит заблокированные домены",
    z2AutoHint: "Zapret2 отслеживает неудачные соединения и сам добавляет заблокированные домены в обход. Обычно достаточно этого; ручной список — для точечных случаев.",
    z2AutoView: "Показать список", z2AutoClear: "Очистить список", z2ClearConfirm: "Очистить весь список автообучения?", z2NoBypass: "Не пробивать этот домен",
    z2AutoPrune: "Убрать покрытые", z2AutoPruneHint: "Удаляет из автолиста домены, уже покрытые твоими доменами и пресетами (по суффиксу) — чистит накопленный шум.", z2Pruned: "Убрано доменов: ",
    z2ExPick: "Что добавить в исключения?", z2ExAsIs: "только этот хост", z2ExAll: "весь домен — со всеми поддоменами",
    z2ExNote: "Домен попадёт в исключения (не будет пробиваться), а покрытые им записи исчезнут из автосписка.",
    fltPh: "Фильтр… (можно * как маску)", fltAll: "видимые", fltDel: "Удалить выбранные", fltNoBypass: "Не пробивать выбранные",
    fltConfirm: "Применить к выбранным записям: ",
    z2OnNoDesync: "работает, но обход не активен",
    z2StratTitle: "Стратегия обхода", apply: "Применить",
    z2StratHint: "Набор параметров десинхронизации. Если что-то не пробивается — попробуй другую; при поломке автоматически откатится на прежнюю.",
    strat_ytdiscord: "YouTube + Discord (рекомендуется)", strat_default: "Сбалансированная", strat_youtube: "YouTube: QUIC-блоб googlevideo",
    strat_aggressive: "Агрессивная (TLS multidisorder + badsum)", strat_light: "Лёгкая (для слабых роутеров)", strat_custom: "Своя (ручная правка config)",
    stratCustomNote: "Это ручная стратегия из config — выбери одну из готовых, чтобы применить.", stratSame: "Эта стратегия уже активна",
    stratCustomEditHint: "Опции NFQWS2_OPT — по одной строке на профиль (--filter…). Правится только этот блок, остальной config Nipret ведёт сам. Битый конфиг откатится автоматически.",
    stratReset: "↺ Сбросить изменения", stratNeedFilter: "Нужна хотя бы одна строка с --filter",
    stratActiveTag: " · активна", stratActiveNow: "Сейчас применена: ",
    stratNoChange: "Опции не изменены — поправь текст, потом «Применить»",
    stratMatched: "Сохранено. Эти опции совпадают с готовой стратегией, поэтому активной показана: ",
    ytTitle: "Диагностика YouTube", ytHint: "Проверяет, всё ли настроено для обхода YouTube: жив ли десинк, покрыт ли googlevideo, обрабатывается ли QUIC, не течёт ли трафик мимо. Проверка идёт по состоянию правил и конфига, а не по «открывается ли видео» (браузер про QUIC врёт). Рядом с проблемой — кнопка быстрого фикса.",
    ytBtn: "Проверить YouTube",
    ytNotInstalled: "zapret2 не установлен.", ytNotRunning: "Служба zapret2 не запущена.", ytFixStart: "Запустить",
    ytNoDesync: "Служба запущена, но правила обхода не активны.", ytRunning: "Служба и правила обхода активны.",
    ytGvListed: "googlevideo есть в списках обхода.", ytGvAuto: "googlevideo будет подхвачен автообучением при заходе.",
    ytGvMissing: "googlevideo не покрыт: ни в списках, ни автообучением.", ytFixGv: "Добавить googlevideo.com",
    ytQuicBlocked: "QUIC заблокирован — браузер уйдёт на TCP.", ytQuicHandled: "QUIC обрабатывается десинком.",
    ytQuicNone: "QUIC не обрабатывается и не заблокирован — видео может зависать.", ytFixQuicBlock: "Резать QUIC",
    ytIpv6On: "IPv6 включён — трафик может идти мимо обхода по IPv6.",
    ytStratHint: "Сейчас общая стратегия. Для упрямого YouTube есть заточенная.",
    ytHintsTitle: "Не обязательно — можно улучшить",
    ytFootnote: "Если всё зелёное, а видео не грузится — попробуй стратегию «YouTube» или «Агрессивная», очисти кэш браузера и проверь в приватном окне.",
    z2HealthWarn: "Служба запущена, но правила обхода не активны — трафик идёт мимо DPI-обхода. Нажми «Перезапустить», чтобы пересобрать правила.",
    z2TryHint: "Проверить, пробивает ли zapret2 этот домен",
    z2ResOk: sz => "открывается (" + sz + ")",
    z2ResOkRedir: c => "открывается (переадресация " + c + ")",
    unitKb: "КБ", unitB: "Б",
    z2ResDpi: "не открывается — DPI рвёт соединение, попробуй другую стратегию",
    z2ResThrottled: sz => "завис на " + sz + " — удушение по IP, десинк не поможет",
    z2ResChallenge: "проверка Cloudflare — в браузере пройдёт",
    z2ResTunnel: g => "идёт не через zapret2, а в VPN (" + g + ")",
    z2MoveBtn: "Перенести в VPN",
    z2MovedTo: n => "Перенесено в VPN (" + n + ") и убрано из списка zapret2",
    z2QuicLabel: "Резать QUIC (форсить TCP) — рекомендуется",
    z2QuicHint: "HTTP/3 — это UDP/443, третий путь трафика: он идёт мимо туннеля (nikki проксирует TCP) и мимо zapret2 (для QUIC нужен отдельный блоб под каждый сервис). Из-за этого сайт бывает настроен верно и всё равно уходит напрямую, причём симптом плавает: момент переключения решает кэш Alt-Svc браузера. Блокировка возвращает браузеры на TCP, где работают оба движка; на проводном канале потеря скорости незаметна. Приложению YouTube на телефоне не поможет — ему нужен рабочий QUIC-обход, а не блок.",
    z2Ipv6Label: "Отключить IPv6 на роутере",
    z2Ipv6Hint: "Иногда чинит обход: если у устройств остаётся рабочий IPv6-маршрут до заблокированного сайта, их трафик идёт по IPv6 мимо десинка. Выключает раздачу IPv6 в локалку (RA/DHCPv6) и IPv6-WAN. Полностью обратимо.",
    z2Ipv6Confirm: "Отключить IPv6 на всём роутере? Сеть кратко переприменится, устройства перейдут на IPv4. Это обратимо тем же тумблером.",
    z2Excluded: "Исключения (не пробивать)", z2ExHint: "Домены, которые zapret2 НИКОГДА не трогает (проверяются первыми). Сюда попадают твои «баны» из автолиста и авто-защита серверов VPN-нод (её удалить нельзя).",
    noEngines: "Ни nikki (VPN), ни zapret2 не установлены — управлять нечем. Поставь хотя бы один.",
    devHint: "Устройства выбираются по MAC-адресу — он не меняется при смене IP, в отличие от адреса, который не закреплён статическим DHCP-лизом. Отметь галочками нужные устройства и выбери режим для каждого движка, затем нажми «Применить» — изменения применяются одним разом.",
    devTableTitle: "Устройства",
    nikkiModeTitle: "Режим VPN для устройств", z2ModeTitle: "Режим обхода DPI для устройств",
    modeExclude: "Исключать выбранные", modeOnly: "Пускать только выбранные",
    nikkiHintExclude: "Отмеченные устройства идут мимо VPN, напрямую.", nikkiHintOnly: "Через VPN идут только отмеченные устройства, остальные — напрямую.",
    z2HintExclude: "Отмеченные устройства без обхода DPI — чистый интернет провайдера.", z2HintOnly: "Обход DPI работает только для отмеченных устройств, остальным — чистый интернет.",
    devSummaryNikkiExclude: n => n + " устройств мимо VPN, остальные через VPN", devSummaryNikkiOnly: n => "через VPN только " + n + " устройств",
    devSummaryZ2Exclude: n => n + " устройств без обхода DPI, остальным — обход", devSummaryZ2Only: n => "обход DPI только для " + n + " устройств",
    devUnsaved: "Есть неприменённые изменения",
    add: "Добавить", tType: "тип условия", nAction: "действие",
    tSuffix: "домен+поддомены", tDomain: "точный домен", tKeyword: "подстрока",
    nProxy: "→ VPN", nDirect: "→ напрямую", nReject: "→ блок", nProxyProfile: "→ VPN (профиль)",
    exitsTitle: "Выходы (порядок = приоритет)", modePriority: "Приоритет", modeAuto: "Авто",
    modePriHint: "Сверху вниз: верхняя нода — основная, при сбое переходит на следующую. Перетаскивай ⠿ для порядка.",
    modeAutoHint: "Автовыбор самой быстрой ноды по пингу (перепроверка каждые 5 мин). Порядок игнорируется.",
    nodeActive: "активна", dragHint: "Перетащи для порядка", pingAll: "Пинг всех", subAdded: "добавлено нод: ", nodeFromSub: "подписка:",
    z2Hint: "🛡 Обнаружен zapret2 — серверы добавленных нод автоматически вносятся в его исключения (и в обход nikki), чтобы DPI-обход не рвал ваш VPN.",
    provTitle: "Подписки", provNodes: "нод", provDelConfirm: "Удалить подписку целиком? Все её ноды пропадут (по отдельности их удалить нельзя).",
    subRefresh: "Обновить подписку", subRefreshing: "Обновляю подписку…", subAutoLabel: "Автообновление подписок",
    subAutoHint: "Периодически перекачивает подписки: добавляет новые ноды, обновляет ключи, убирает исчезнувшие (порядок и вкл/выкл сохраняются).",
    migrateRules: "Перенести старые правила «→ VPN» на эту группу", migrateConfirm: "Перевести все правила «→ VPN» (профиль) на управляемую группу выходов? Порядок/автовыбор начнут влиять на них.",
    helpSummary: "❓ Что за пункты и как пользоваться",
    helpBody: "<p><b>Тип условия</b> (левый список):</p><ul>" +
      "<li><b>домен+поддомены</b> (DOMAIN-SUFFIX) — обычный выбор: <code>telegram.org</code> ловит и <code>web.telegram.org</code>, и все поддомены.</li>" +
      "<li><b>точный домен</b> (DOMAIN) — только указанное имя.</li>" +
      "<li><b>подстрока</b> (DOMAIN-KEYWORD) — если имя <i>содержит</i> слово: <code>google</code> → всё, где есть «google» (широко).</li>" +
      "<li><b>GEOSITE</b> — готовая категория из базы (обновляется сама). В поле пишешь <i>имя категории</i>: <code>telegram</code>, <code>youtube</code>, <code>netflix</code>… Одно правило заменяет список.</li>" +
      "<li><b>IP-CIDR</b> — маршрут по IP-адресу или подсети, а не по домену. Нужен, когда сервис ходит по «голым» IP (например, медиа Telegram), которые не ловятся доменными правилами. Пишешь один адрес <code>1.2.3.4</code> (это то же, что <code>/32</code>) или подсеть <code>1.2.3.0/24</code>. <b>Маска</b> после «/» задаёт размер диапазона: <code>/32</code> — ровно один адрес, <code>/24</code> — 256 адресов (…0–…255), <code>/16</code> — 65536, <code>/8</code> — 16 млн. Чем меньше число, тем шире диапазон.</li>" +
      "<li><b>GEOIP</b> — маршрут по стране или сервису из базы IP (обновляется сама), не по домену. В поле пишешь код: страну <code>ru</code>, <code>cn</code> или сервис <code>telegram</code>, <code>google</code>, <code>netflix</code>. Ловит и «голые» IP, которые не видны доменным правилам. Требует включённой базы GeoIP — если её нет, включи кнопкой «Обновить geo» во вкладке «Управление».</li></ul>" +
      "<p><b>Действие</b> (правый список):</p><ul>" +
      "<li><b>→ VPN</b> (PROXY) — пустить через VPN (разблокировать).</li>" +
      "<li><b>→ напрямую</b> (DIRECT) — в обход VPN.</li>" +
      "<li><b>→ блок</b> (REJECT) — заблокировать домен.</li></ul>" +
      "<p>Массовое поле и кнопки «Разблокировать» работают как «домен+поддомены → VPN».</p>",
    showList: "Показать списком", showItems: "Показать по одному",
    bulkHint: "Полный список доменов, по одному в строке. «Сохранить» синхронизирует: добавит новые и удалит убранные. Понимает вставку v2ray-списков.",
    save: "Сохранить", cancel: "Отмена",
    unblock: "Разблокировать", loading: "Загрузка…",
    autoUpdate: "Авто-апдейт", iv1h: "каждый час", iv6h: "каждые 6 часов", iv12h: "каждые 12 часов", iv24h: "раз в сутки", ivWeekly: "раз в неделю",
    autoHint: "Сам синхронизирует включённые наборы-списки: добавляет новые домены и убирает исчезнувшие. Лёгкая операция, по умолчанию ночью (гео-базы обновляет сам mihomo).",
    ipHint: "IP/подсети, трафик к которым идёт мимо mihomo напрямую (например, VPN-ноды). Голый IPv4 получит /32.",
    exclusions: "Исключения", system: "системный", ipNode: "нода",
    phDomain: "example.com", phGeosite: "telegram, youtube, netflix…", phGeoip: "ru · telegram · google…", phIp: "1.2.3.0/24  ·  1.2.3.4",
    done: "Готово", errP: "Ошибка: ", dup: "Уже есть в списке", listsNA: "Списки недоступны",
    pmShow: "Показать состав", pmIncl: "Включает пресет:", pmGeo: "Поддерживаемая категория доменов/IP — обновляется автоматически из базы. Ниже показаны только дополнительные IP-подсети и домены.",
    tabNodes: "Ноды", nUnblock: "→ VPN (+ноды)",
    nodesHint: "Свои VPN-выходы. Перетащи .conf или вставь конфиг/ссылку: AmneziaWG/WireGuard, vless://…, подписку https://…, или сырой clash-YAML. Добавленные ноды образуют группу UNBLOCK — выбирай «→ VPN (+ноды)» как действие правила.",
    nodeDrop: "Перетащи сюда файл .conf", nodeName: "имя (необязательно)", nodeAdd: "Добавить и проверить",
    validating: "Добавляю и проверяю ноду…", nodeMs: "мс", nodeNoResp: "не отвечает", nodeSub: "подписка",
    nodeDownFor: a => "не отвечает " + a + " (mihomo обходит её сам)",
    nodeNoRespKept: "не отвечает — оставлена включённой, mihomo обойдёт её сам",
    agoMin: "мин", agoHour: "ч", agoDay: "дн",
    stTitle: "Место на роутере", stFree: "Свободно / всего",
    stOwnState: "Данные Nipret (ноды, списки, бэкапы)",
    stGeoipWhat: "нужен только для правил GEOIP по сервисам",
    stGeositeWhat: "категории доменов для пресетов",
    stMmdbWhat: "страны, ставится самим nikki",
    stGeoipDrop: "Удалить GeoIP.dat",
    stGeoipUnused: "Ни одно правило его не использует — можно удалить без последствий.",
    stGeoipNeeded: r => "Сейчас используется правилами: " + r + ". При удалении они будут заменены на опубликованные подсети (для Telegram — с core.telegram.org), остальные удалены.",
    stGeoipConfirm: "Заменить GEOIP-правила на подсети и удалить базу? Страновые правила продолжат работать. Если mihomo не поднимется — изменение откатится.",
    stLow: "Места почти нет — записи конфига могут начать падать",
    dcProbing: "пробую открыть…",
    dcOpenOk: (c, sz) => "Открывается: код " + c + ", получено " + sz,
    dcOpenRedir: c => "Открывается: переадресация " + c + " (тела нет, это нормально)",
    dcOpenThrottled: (sz, s) => "Ответ начался и завис на " + sz + " (" + s + " с до таймаута) — это удушение по IP, десинк тут не поможет, нужен туннель",
    dcOpenDpi: "Соединение не устанавливается вообще — DPI рвёт рукопожатие, нужна другая стратегия zapret2",
    dcOpenChallenge: "Cloudflare показывает проверку — в браузере она проходит сама, это не блокировка",
    dcProbeCaveat: "Проверка идёт с роутера по TCP: у клиента результат может отличаться, если браузер уйдёт по QUIC или будет резолвить домен своим DNS",
    dcTitle: "Почему не открывается сайт?",
    dcHint: "Введи домен — панель скажет, какой движок его обрабатывает и работает ли этот путь прямо сейчас. Проверяется по живому конфигу mihomo, а не по настройкам панели.",
    dcBtn: "Проверить", dcPh: "instagram.com",
    dcByDefault: "по умолчанию",
    dcViaVpn: (g, r) => "Идёт через VPN, группа «" + g + "» (правило: " + r + ")",
    dcGroupDead: g => "Группа «" + g + "» не найдена в mihomo — трафик никуда не пойдёт",
    dcNodeDead: n => "Нода «" + n + "» не отвечает — сайт не откроется",
    dcNodeOk: (n, ms) => "Нода «" + n + "» отвечает: " + ms + " мс",
    dcBlocked: r => "Блокируется правилом: " + r,
    dcDirect: r => "Идёт напрямую, мимо VPN (правило: " + r + ")",
    dcZ2On: l => "Zapret2 пробивает этот домен (список: " + l + ") — для многих сайтов этого достаточно",
    dcZ2Down: l => "Домен есть в списке zapret2 (" + l + "), но сервис не работает",
    dcNoEngine: "Ни один движок этот домен не обрабатывает — добавь его в «Домены» (VPN) или в список zapret2",
    dcGeoCaveat: n => "Выше есть правил-категорий (GEOSITE), которые тут не проверить: " + n + " — сайт может попасть под одно из них",
    instNikki: "Установить nikki (VPN)",
    nikkiMissing: "nikki (VPN-движок) не установлен — VPN-часть скрыта. Поставить можно кнопкой «Установить nikki» в разделе «Общее» → «Обновления».",
    nkDiagTitle: "Почему не работает VPN?",
    nkDiagHint: "Проверяет всю цепочку: сервис → профиль → правила в конфиге mihomo → группа выходов → нода. Останавливается на первом обрыве и предлагает починку.",
    nkDiagBtn: "Проверить", nkDiagNoNikki: "nikki не установлен — VPN-часть работать не может",
    nkDiagUnconf: "nikki не настроен: нет профиля или сервис выключен, mihomo не запускается",
    nkDiagDown: "nikki настроен, но mihomo не запущен",
    nkDiagRunning: "nikki работает, mihomo запущен",
    nkDiagRulesLost: n => "Правил в панели: " + n + ", но в конфиге mihomo их нет — правила не доезжают",
    nkDiagRulesLive: n => "Правила доехали до mihomo: " + n,
    nkDiagNoRules: "Правил пока нет — добавь домены или включи пресет",
    nkDiagNoGroup: "Группа выходов не собрана — правила «→ VPN» указывают в пустоту",
    nkDiagFixGroup: "Собрать группу",
    nkDiagDeadBase: n => "Правил ведут в группу профиля, которая никуда не ведёт: " + n + " — трафик идёт напрямую",
    nkDiagQuic: "QUIC не заблокирован: HTTP/3 идёт мимо туннеля и мимо zapret2, сайт может уходить напрямую",
    nkDiagNoNodes: "Нод нет — добавь конфиг во вкладке «Ноды»",
    nkDiagAllOff: "Все ноды выключены — трафик идёт напрямую",
    nkDiagNodeDead: "Активная нода не отвечает",
    nkDiagNodeOk: (n, ms) => "Активная нода отвечает: " + n + " — " + ms + " мс",
    taTitle: "Почему не работает на этом устройстве?",
    taHint: "Для случая «на телевизоре работает, на телефоне нет». Записывает 60 секунд трафика выбранного устройства и показывает то, чего не видно ни в панели, ни в логах mihomo: что ушло мимо туннеля, что не смогло соединиться и что молчит в ответ.",
    taWarm: "Сначала полностью выгрузите приложение из памяти — без холодного старта зависание не повторится и в запись не попадёт.",
    taBtn: "Записать", taSec: "с",
    taNow: "Воспроизведите проблему ПРЯМО СЕЙЧАС",
    taParsing: "Разбираем запись…",
    taBusy: "Запись уже идёт — дождитесь её окончания",
    taNoDevs: "Ни одного устройства с известным адресом. Включите его и обновите страницу.",
    taPickDev: "Выберите устройство",
    taFail: "Записать не удалось — попробуйте ещё раз",
    taNoAnswer: "ответа нет",
    taEscPort: (w, p) => "Ушло мимо туннеля: " + w + " — TCP-порт " + p + " вне перехвата, mihomo этого трафика не видел",
    taEscPortU: (w, p) => "Ушло мимо туннеля: " + w + " — UDP-порт " + p + " вне перехвата",
    taEscQuic: w => "Мимо туннеля: " + w + " — это QUIC, его дропает тумблер «Блокировать QUIC». Так и задумано: приложение должно откатиться на TCP.",
    taEscExcluded: w => "Мимо туннеля: " + w + " — устройство исключено из проксирования. Это норма, если вы сами так решили.",
    taEscReserved: w => "Мимо туннеля: " + w + " — адрес в списке исключений (reserved_ip). Это норма.",
    taEscOld: w => "Мимо туннеля: " + w + " — соединение старше правил (например, установлено до перезапуска nikki).",
    taAllPorts: "Перехватывать все порты",
    taUdpNote: "Теперь трафик доходит до mihomo, и адрес можно завернуть в туннель обычным правилом — по домену или IP, как всё остальное. Само по себе это никуда не заворачивает: без правила трафик уйдёт напрямую, только уже через mihomo.",
    taRestartFix: "Перезапустить nikki",
    taStale: "Отчёт снят ДО этой починки, поэтому строки выше показывают прошлое состояние. Чтобы увидеть результат, запишите заново.",
    act_allports: "перехват всех портов",
    taSyn: (w, s) => "Соединение не установилось: " + w + " — " + s + " с тишины в ответ на запрос",
    taSynTun: "через туннель", taSynDir: "напрямую",
    taStall: (w, b) => "Запрос ушёл в туннель, ответа нет: " + w + " — отправлено " + b + " Б, принято 0",
    taDirect: (h, n) => "mihomo отправил напрямую, и ответа не было: " + h + " (соединений: " + n + ")",
    taAddDom: "Добавить домен в туннель",
    taSniBtn: "Проверить по имени", taSniRun: "Проверяем…",
    taSniSni: h => "Режут по имени: голый адрес отвечает, а тот же запрос с именем " + h + " — нет. Это DPI по SNI; поможет туннель или zapret2.",
    taSniDead: "С роутера не открывается ни с именем, ни без него. На SNI это не указывает — адресат просто недоступен.",
    taSniOk: "С роутера имя открывается прямо сейчас — значит, обрыв был кратковременным или касается только этого устройства.",
    taSniCaveat: "Проверка идёт с роутера и через mihomo, поэтому адрес мог быть выбран им, а не взят из отчёта.",
    taEscFine: n => "Ещё потоков ушло мимо туннеля, но они получали ответ и работали: " + n + ". Это не поломка — адреса не показываем.",
    taHealthy: n => "Здоровых потоков через туннель: " + n,
    taClean: "Проблемных потоков за окно не нашли.",
    taNoTraffic: "За окно устройство не открыло через ЭТОТ роутер ни одного соединения. Обычно это значит, что оно подключено к другому роутеру или к мобильному интернету; реже — что приложение так и не запустили.",
    taForeign: (ip, lan) => "Адрес " + ip + " не в сети этого роутера (" + lan + ") — его трафик сюда не попадает, записывать нечего. Такие устройства попадают в список из статических хостов, перенесённых с другого роутера.",
    nikkiUnconf: "⚠ nikki установлен, но не настроен: нет профиля или сервис выключен — mihomo не запускается, поэтому VPN-ноды и правила «→ VPN» не работают.",
    nikkiUnconfFix: "Настроить и запустить",
    nodeNikkiDown: "нода сохранена, но nikki не запущен: включи сервис и задай профиль (Services → Nikki), потом проверь ноду",
    nodeProfile: "из профиля", nodeOn: "вкл", nodeOff: "выкл",
    guardBad1: "⚠ Proxy-группа ", guardBad2: " не найдена в mihomo. Правила «→ VPN» указывают на несуществующую группу. Задай базовую группу равной имени proxy-группы твоего профиля: ",
    guardFix: "uci set nikki-unblock.config.base_group='ИМЯ' && uci commit",
    tabMgmt: "Управление",
    svcStart: "Запустить", svcStop: "Остановить", svcRestart: "Перезапустить сервис",
    svcReload: "Перечитать конфиг", svcAutostart: "Автозапуск вкл/выкл",
    svcRunning: "nikki работает", svcStopped: "nikki остановлен",
    svcBoot: "Автозапуск при загрузке", svcOn: "вкл", svcOff: "выкл",
    apLabel: "Перехватывать все порты (TCP и UDP)", apHint: "Без этого до mihomo доходит лишь горстка портов, а всё остальное уходит мимо — и этого не видно ни в панели, ни в логах, потому что трафик туда просто не попадал. Правило по домену или IP на такой трафик тоже не подействует: он утёк раньше, чем правила его увидели. Так ломались медиа в Telegram (порт 5222) и звонки со STUN на нестандартных портах. Замеры на роутере разницы в скорости и задержке для TCP не показали; UDP идёт лишним хопом через mihomo, на типе NAT для P2P и консольных игр это может сказаться. Локальная сеть не затрагивается вообще. Переключение перезапускает nikki — сеть моргнёт на несколько секунд.", mssLabel: "Фикс зависаний загрузок (MSS-clamp)", mssHint: "Включи, если через VPN большие загрузки или сайты зависают / грузятся наполовину, а мелочь при этом работает. Чинит размер сетевых пакетов под туннель. Оставлять включённым безопасно.",
    bkGroupTitle: "Бэкап настроек",
    bkTitle: "Nikki (VPN)", bkDownload: "Создать и скачать", bkRestore: "Восстановить из файла", bkAuto: "Авто-бэкап (день/неделя/месяц)",
    bkHint: "Сохраняет правила, ноды, подписки и mixin nikki (без гео-баз, ~КБ). Восстановление заменяет текущие настройки; перед этим делается снимок для отката.",
    bkRestoreConfirm: "Восстановить из этого файла? Текущие настройки будут заменены (перед этим — авто-снимок для отката).", bkRestoring: "Восстанавливаю…", kb: "КБ",
    bkRestoreRow: "Восстановить", bkRestoreRotConfirm: "Восстановить настройки из этого бэкапа? Текущее состояние обоих движков будет заменено.",
    bk_daily: "За день", bk_weekly: "За неделю", bk_monthly: "За месяц",
    undoTitle: "Откат изменений", undoHint: "Перед каждым переключением (стратегия, QUIC, IPv6, автообучение, пресеты) сохраняется снимок обоих движков. Если что-то сломалось после изменения — верни как было.",
    undoBtn: "↩ Вернуть как было", undoThis: "Откатить сюда", undoLast: "Вернуть последнее изменение", redoLast: "Вернуть отменённое", undoEmpty: "Пока нет изменений для отката", undoConfirm: "Откатить к состоянию до этого изменения? Настройки обоих движков вернутся к тому моменту.",
    act_z2strat: "стратегия zapret2", act_z2stratsave: "правка стратегии zapret2", act_z2quic: "тумблер QUIC", act_z2ipv6: "тумблер IPv6", act_z2autotoggle: "автообучение zapret2",
    act_devicesapply: "исключения устройств",
    act_preset: "пресет", presetFail: "не применилось полностью", presetBusy: "Дождись окончания текущего применения",
    act_z2preset: "пресет zapret2", act_z2preset_on: "пресет zapret2 вкл", act_z2preset_off: "пресет zapret2 выкл", act_geosite_on: "гео-пресет вкл", act_geosite_off: "гео-пресет выкл",
    act_preset_sync: "пресет доменов вкл", act_preset_off: "пресет доменов выкл", act_mssclamp: "MSS-clamp", act_auto: "авто-бэкап",
    z2bkTitle: "Zapret2 (обход DPI)", z2bkHint: "Сохраняет конфиг zapret2 (стратегии, автообучение) и все хостлисты: свои домены, автосписок, исключения, пресеты. Восстановление заменяет их и перезапускает службу; если zapret2 не поднимется — автоматический откат.",
    z2bkRestoreConfirm: "Восстановить zapret2 из этого файла? Текущий конфиг и хостлисты будут заменены (перед этим — авто-снимок для отката).",
    rpTitle: "Обратная связь", rpHint: "Опиши проблему или пожелание. Откроется черновик issue на GitHub — проверь и нажми «Submit». Ничего не отправляется без твоего подтверждения.",
    rpPh: "Что не работает или что хотелось бы улучшить…", rpAttach: "приложить диагностику (версии, статус, последние логи — без ключей и паролей)",
    rpSend: "Создать issue на GitHub", rpNeedDesc: "Сначала опиши проблему", rpOpened: "Открыл черновик issue в новой вкладке — проверь и отправь",
    rpFullHint: "Лог не поместился в ссылку — скопируй текст выше и вставь в тело issue.",
    updTitle: "Обновление", updSelf: "Обновить Nipret", updNikki: "Обновить nikki", updGeo: "Обновить geo", updZ2: "Обновить zapret2", updAll: "Обновить всё",
    updNew: "Доступно обновление", updUpToDate: "Актуальная версия", updAvail: "обновление",
    geoOn: "включено", geoOff: "выключено", geoipNeed: "Сначала включи базу GeoIP: «Обновить geo» во вкладке «Управление».",
    updRunning: "Обновляю… (можно закрыть — продолжится в фоне)", updOkCode: "Готово", updBad: "Ошибка, код ", updReload: "Nipret обновлён — нажми, чтобы перезагрузить страницу",
    on_: "Включить ", off_: "Отключить ", upd_: "Обновить ",
    enabling: "Включаю ", disabling: "Отключаю ", updating: "Обновляю ",
    adding: "Добавляю ", removing: "Удаляю…", applying: "Применяю…", saving: "Сохраняю и применяю…",
    added: "Добавлено", removedC: "удалено", already: "уже было", willAdd: "добавит", willRem: "уберёт",
    onCount: " своих + ", onCount2: " системных", en_: "Вкл", dis_: "Выкл",
    confirmDel: n => "Будет удалено доменов: " + n + ". Продолжить?",
    rmTitle: "Удаление Nipret",
    rmHint: "Полностью удалить Nipret и откатить все его изменения: правила nikki, устройства, тумблеры QUIC/MSS/IPv6, метки zapret2, ключ репозитория. Сам nikki не трогается. Перед удалением создаётся резервная копия в /tmp/nu-prepurge.tar.gz. Действие необратимо — панель исчезнет.",
    rmZ2: "Также удалить zapret2 (/opt/zapret2)",
    rmBtn: "Удалить Nipret",
    rmPrompt: "Это необратимо. Чтобы подтвердить, введите слово УДАЛИТЬ:",
    rmWord: "УДАЛИТЬ",
    rmMismatch: "Слово не совпало — отменено",
    rmRunning: "Удаляю… (панель скоро перестанет отвечать — это нормально)",
    rmGone: "Пакет снят, панель удалена.",
    rmDone: "Nipret удалён. Обновлять эту страницу больше не нужно.",
    rmDelFail: "Изменения откачены, но снять пакет не удалось. Заверши удаление командой uninstall.sh (см. README)."
  },
  en: {
    h1: "Nipret · VPN + DPI-bypass",
    engNikki: "VPN (Nikki)", engZapret2: "DPI bypass (Zapret2)", engCommon: "General",
    modeSimple: "Simple", modeAdvanced: "Advanced",
    kioskTitle: "Unblock a site", kioskHint: "Type the address of a site that won't open and hit “Add” — it will go through the VPN. Below you can expand the added list and ready-made bundles (YouTube, Instagram, etc.). This page works from any device on the home network.",
    kioskCopy: "Copy link to this page", kioskCopied: "Link copied", kioskNoNikki: "VPN (nikki) isn't installed — VPN unblocking is unavailable.",
    secTitle: "Security", secHint: "Lock the panel and the /unblock page behind a PIN. Hand out the link + PIN to your family so no stranger on the network changes settings. Off by default. Only a hash of the PIN is stored. Forgot the PIN? Open the panel through the router's LuCI (Services → Nipret) — you're already logged in there as admin, so no PIN is asked and you can change or turn it off right here. Note: over plain http (no https) a PIN keeps casual/guest users out, but not someone deliberately sniffing the network.",
    secRequire: "Require a PIN", secPinPh: "PIN (min. 4 chars)", secPinChange: "New PIN (to change it)",
    secLogout: "Log out on all devices", secNeedPin: "Set a PIN below first", secShort: "PIN too short (min. 4)",
    secPinSet: "PIN is set", secPinNone: "No PIN set yet", secSetOn: "Set PIN", secChange: "Change PIN",
    secOn: "PIN required", secOff: "PIN turned off", secPinSaved: "PIN saved and turned on",
    engCommonHint: "Service & engine updates + config backup — shared across Nipret.",
    tabCommon: "General",
    tabDomains: "Domains via VPN", tabIps: "IP exclusions",
    z2TabDomains: "Domains", z2TabAuto: "Auto-learn", z2TabExclude: "Exclusions", z2TabSvc: "Service",
    tabDevices: "Devices",
    engNikkiHint: "Nikki (Mihomo) routes chosen sites through a VPN/proxy — for services blocked \"from outside\" (geo-blocks, IP blocks): ChatGPT, Instagram, Telegram, etc. Manage domains, nodes and devices. A simple add-a-site page you can hand to anyone in the family is at \"router-IP/unblock\".",
    engZapret2Hint: "Zapret2 defeats ISP DPI blocking (no VPN) — for sites throttled/blocked \"from inside\" (YouTube, etc.). Control the service and the list of domains to bypass.",
    z2On: "zapret2 running", z2Off: "zapret2 stopped",
    z2Domains: "Your own domains", z2AddHint: "A domain zapret2 will push through DPI. Type it like <code>youtube.com</code> — also covers subdomains.",
    z2PresetsTitle: "Unblock (presets)",
    z2PresetsHint: "Ready-made domain lists for DPI-bypass — YouTube, Discord and more. Added to a separate zapret2 list, kept apart from your own domains below.",
    z2NoPresets: "Presets unavailable — check the router's internet/DNS.",
    z2PresetNote: "Domains go into a separate zapret2 bypass list (matched by suffix — subdomains covered too), apart from your own domains.",
    z2AutoRecommend: "Recommended: keep auto-learning off and add services via presets on the “Domains” tab — auto-learning often wrongly picks up junk (telemetry, local services).",
    z2SetupRunning: "Applying recommended setup…",
    z2SetupApplied: "Done: YouTube/Discord presets on, auto-learn off. You can change it on the tabs below.",
    z2AutoTitle: "Auto-learning (autohostlist)", z2AutoLabel: "Zapret2 finds blocked domains itself",
    z2AutoHint: "Zapret2 watches for failed connections and auto-adds blocked domains to the bypass. Usually enough on its own; the manual list is for specific cases.",
    z2AutoView: "Show list", z2AutoClear: "Clear list", z2ClearConfirm: "Clear the whole auto-learned list?", z2NoBypass: "Don't bypass this domain",
    z2AutoPrune: "Remove covered", z2AutoPruneHint: "Removes auto-learned domains already covered by your domains and presets (by suffix) — clears accumulated noise.", z2Pruned: "Removed: ",
    z2ExPick: "What to add to the exclusions?", z2ExAsIs: "this host only", z2ExAll: "whole domain — incl. all subdomains",
    z2ExNote: "The domain goes to the exclusions (won't be desynced) and auto-learned entries it covers are removed.",
    fltPh: "Filter… (* works as a wildcard)", fltAll: "shown", fltDel: "Delete selected", fltNoBypass: "Don't bypass selected",
    fltConfirm: "Apply to the selected entries: ",
    z2OnNoDesync: "running, but bypass inactive",
    z2StratTitle: "Bypass strategy", apply: "Apply",
    z2StratHint: "The desync parameter set. If something won't get through, try another; a broken one auto-reverts to the previous.",
    strat_ytdiscord: "YouTube + Discord (recommended)", strat_default: "Balanced", strat_youtube: "YouTube: googlevideo QUIC blob",
    strat_aggressive: "Aggressive (TLS multidisorder + badsum)", strat_light: "Light (for weak routers)", strat_custom: "Custom (hand-edited config)",
    stratCustomNote: "This is a manual strategy from config — pick one of the presets to apply.", stratSame: "That strategy is already active",
    stratCustomEditHint: "NFQWS2_OPT options — one profile per line (--filter…). Only this block is edited; Nipret manages the rest of the config. A broken config auto-reverts.",
    stratReset: "↺ Discard changes", stratNeedFilter: "Need at least one --filter line",
    stratActiveTag: " · active", stratActiveNow: "Currently applied: ",
    stratNoChange: "Options unchanged — edit the text, then hit Apply",
    stratMatched: "Saved. These options match a curated strategy, so the active one now reads: ",
    ytTitle: "YouTube diagnostics", ytHint: "Checks whether everything is set up to bypass YouTube: is the desync live, is googlevideo covered, is QUIC handled, is traffic leaking past. Based on rule/config state, not on 'does the video play' (the browser lies about QUIC). Each issue comes with a one-tap fix.",
    ytBtn: "Check YouTube",
    ytNotInstalled: "zapret2 is not installed.", ytNotRunning: "The zapret2 service is not running.", ytFixStart: "Start",
    ytNoDesync: "Service is running but the bypass rules aren't active.", ytRunning: "Service and bypass rules are active.",
    ytGvListed: "googlevideo is in the bypass lists.", ytGvAuto: "googlevideo will be picked up by auto-learn on first access.",
    ytGvMissing: "googlevideo isn't covered — not in lists, not via auto-learn.", ytFixGv: "Add googlevideo.com",
    ytQuicBlocked: "QUIC is blocked — the browser will use TCP.", ytQuicHandled: "QUIC is handled by the desync.",
    ytQuicNone: "QUIC is neither handled nor blocked — video may hang.", ytFixQuicBlock: "Block QUIC",
    ytIpv6On: "IPv6 is on — traffic may bypass the desync over IPv6.",
    ytStratHint: "You're on a generic strategy. There's one tuned for stubborn YouTube.",
    ytHintsTitle: "Optional — could be improved",
    ytFootnote: "If everything is green but video won't load — try the 'YouTube' or 'Aggressive' strategy, clear the browser cache and test in a private window.",
    z2HealthWarn: "The service is running, but the desync rules are not active — traffic is passing without the DPI bypass. Hit Restart to rebuild the rules.",
    z2TryHint: "Check whether zapret2 gets this domain through",
    z2ResOk: sz => "opens (" + sz + ")",
    z2ResOkRedir: c => "opens (redirect " + c + ")",
    unitKb: "KB", unitB: "B",
    z2ResDpi: "does not open — DPI breaks the connection, try another strategy",
    z2ResThrottled: sz => "stalled at " + sz + " — IP throttling, desync cannot fix it",
    z2ResChallenge: "Cloudflare challenge — a browser passes it",
    z2ResTunnel: g => "not going through zapret2 — routed to VPN (" + g + ")",
    z2MoveBtn: "Move to VPN",
    z2MovedTo: n => "Moved to VPN (" + n + ") and removed from the zapret2 list",
    z2QuicLabel: "Block QUIC (force TCP) — recommended",
    z2QuicHint: "HTTP/3 is UDP/443 — a third traffic path that misses both engines: nikki proxies TCP, and desyncing QUIC needs a per-service blob. A site can be routed correctly and still leave directly, and the symptom drifts because the browser's Alt-Svc cache decides when it switches. Blocking it returns browsers to TCP, where both engines work; on a fixed line the speed cost is unnoticeable. Won't help the mobile YouTube app — it needs a working QUIC desync, not a block.",
    z2Ipv6Label: "Disable IPv6 on the router",
    z2Ipv6Hint: "Sometimes fixes the bypass: if devices keep a working IPv6 route to a blocked site, their traffic goes over IPv6 and skips the desync. Turns off IPv6 for LAN clients (RA/DHCPv6) and the IPv6 WAN. Fully reversible.",
    z2Ipv6Confirm: "Disable IPv6 on the whole router? The network re-applies briefly and devices switch to IPv4. Reversible with the same toggle.",
    z2Excluded: "Exclusions (never bypass)", z2ExHint: "Domains zapret2 NEVER touches (checked first). This holds your \"bans\" from the auto-list plus the automatic protection of your VPN-node servers (which you can't remove).",
    noEngines: "Neither nikki (VPN) nor zapret2 is installed — nothing to manage. Install at least one.",
    devHint: "Devices are picked by MAC address — it doesn't change when the IP does, unlike an address with no static DHCP lease. Check the devices you want and pick a mode for each engine, then hit Apply — changes take effect all at once.",
    devTableTitle: "Devices",
    nikkiModeTitle: "VPN device mode", z2ModeTitle: "DPI-bypass device mode",
    modeExclude: "Exclude selected", modeOnly: "Allow only selected",
    nikkiHintExclude: "Checked devices bypass the VPN, going out directly.", nikkiHintOnly: "Only checked devices go through the VPN, everyone else goes direct.",
    z2HintExclude: "Checked devices skip the DPI bypass — raw ISP internet.", z2HintOnly: "The DPI bypass applies only to checked devices, everyone else gets raw internet.",
    devSummaryNikkiExclude: n => n + " device(s) bypass the VPN, the rest go through it", devSummaryNikkiOnly: n => "only " + n + " device(s) go through the VPN",
    devSummaryZ2Exclude: n => n + " device(s) skip the DPI bypass, the rest are bypassed", devSummaryZ2Only: n => "DPI bypass applies to only " + n + " device(s)",
    devUnsaved: "You have unapplied changes",
    add: "Add", tType: "match type", nAction: "action",
    tSuffix: "domain + subdomains", tDomain: "exact domain", tKeyword: "keyword",
    nProxy: "→ VPN", nDirect: "→ direct", nReject: "→ block", nProxyProfile: "→ VPN (profile)",
    exitsTitle: "Exits (order = priority)", modePriority: "Priority", modeAuto: "Auto",
    modePriHint: "Top-down: the top node is primary, falls through to the next on failure. Drag ⠿ to reorder.",
    modeAutoHint: "Auto-picks the fastest node by ping (re-checked every 5 min). Order is ignored.",
    nodeActive: "active", dragHint: "Drag to reorder", pingAll: "Ping all", subAdded: "nodes added: ", nodeFromSub: "sub:",
    z2Hint: "🛡 zapret2 detected — the servers of added nodes are auto-added to its exclusions (and to nikki's bypass) so DPI-bypass can't break your VPN.",
    provTitle: "Subscriptions", provNodes: "nodes", provDelConfirm: "Delete the whole subscription? All its nodes go away (they can't be removed individually).",
    subRefresh: "Refresh subscription", subRefreshing: "Refreshing subscription…", subAutoLabel: "Auto-refresh subscriptions",
    subAutoHint: "Periodically re-fetches subscriptions: adds new nodes, updates keys, removes departed ones (order and on/off are preserved).",
    migrateRules: "Move old «→ VPN» rules onto this group", migrateConfirm: "Move all «→ VPN» (profile) rules onto the managed exit group? Ordering/auto-select will start affecting them.",
    helpSummary: "❓ What these mean & how to use",
    helpBody: "<p><b>Match type</b> (left select):</p><ul>" +
      "<li><b>domain + subdomains</b> (DOMAIN-SUFFIX) — the usual choice: <code>telegram.org</code> also matches <code>web.telegram.org</code> and all subdomains.</li>" +
      "<li><b>exact domain</b> (DOMAIN) — only the exact name.</li>" +
      "<li><b>keyword</b> (DOMAIN-KEYWORD) — if the name <i>contains</i> the word: <code>google</code> → everything with «google» (broad).</li>" +
      "<li><b>GEOSITE</b> — a ready category from the DB (auto-updates). Type the <i>category name</i>: <code>telegram</code>, <code>youtube</code>, <code>netflix</code>… One rule replaces a whole list.</li>" +
      "<li><b>IP-CIDR</b> — routes by IP address or subnet instead of by domain. Needed when a service talks to raw IPs (e.g. Telegram media) that domain rules can't catch. Enter a single address <code>1.2.3.4</code> (same as <code>/32</code>) or a subnet <code>1.2.3.0/24</code>. The <b>mask</b> after «/» sets the range size: <code>/32</code> = exactly one address, <code>/24</code> = 256 (…0–…255), <code>/16</code> = 65536, <code>/8</code> = 16M. The smaller the number, the wider the range.</li>" +
      "<li><b>GEOIP</b> — routes by country or service from an IP database (auto-updates), not by domain. Type a code: a country <code>ru</code>, <code>cn</code> or a service <code>telegram</code>, <code>google</code>, <code>netflix</code>. Catches raw IPs domain rules miss. Needs the GeoIP database enabled — if it's off, turn it on with the «Update geo» button in the Manage tab.</li></ul>" +
      "<p><b>Action</b> (right select):</p><ul>" +
      "<li><b>→ VPN</b> (PROXY) — route via VPN (unblock).</li>" +
      "<li><b>→ direct</b> (DIRECT) — bypass the VPN.</li>" +
      "<li><b>→ block</b> (REJECT) — block the domain.</li></ul>" +
      "<p>Bulk field and the «Unblock» buttons always act as «domain+subdomains → VPN».</p>",
    showList: "Show as list", showItems: "Show one-by-one",
    bulkHint: "Full domain list, one per line. «Save» syncs: adds new lines and removes the ones you deleted. Understands pasted v2ray lists.",
    save: "Save", cancel: "Cancel",
    unblock: "Unblock", loading: "Loading…",
    autoUpdate: "Auto-update", iv1h: "hourly", iv6h: "every 6 hours", iv12h: "every 12 hours", iv24h: "daily", ivWeekly: "weekly",
    autoHint: "Keeps enabled list-presets in sync: adds new domains and removes vanished ones. Light; runs nightly by default (geo databases are updated by mihomo itself).",
    ipHint: "IPs/subnets whose traffic goes straight past mihomo (e.g. VPN nodes). A bare IPv4 gets /32.",
    exclusions: "Exclusions", system: "system", ipNode: "node",
    phDomain: "example.com", phGeosite: "telegram, youtube, netflix…", phGeoip: "ru · telegram · google…", phIp: "1.2.3.0/24  ·  1.2.3.4",
    done: "Done", errP: "Error: ", dup: "Already in the list", listsNA: "Lists unavailable",
    pmShow: "Show contents", pmIncl: "Includes preset:", pmGeo: "A maintained domain/IP category — auto-updated from the DB. Only the extra IP subnets and domains are listed below.",
    tabNodes: "Nodes", nUnblock: "→ VPN (+nodes)",
    nodesHint: "Your own VPN exits. Drop a .conf or paste a config/link: AmneziaWG/WireGuard, vless://…, a subscription https://…, or raw clash YAML. Added nodes form the UNBLOCK group — pick «→ VPN (+nodes)» as a rule action.",
    nodeDrop: "Drop a .conf file here", nodeName: "name (optional)", nodeAdd: "Add & check",
    validating: "Adding & checking node…", nodeMs: "ms", nodeNoResp: "no response", nodeSub: "subscription",
    nodeDownFor: a => "not answering for " + a + " (mihomo routes around it)",
    nodeNoRespKept: "not answering — left enabled, mihomo will route around it",
    agoMin: "min", agoHour: "h", agoDay: "d",
    stTitle: "Router storage", stFree: "Free / total",
    stOwnState: "Nipret data (nodes, lists, backups)",
    stGeoipWhat: "only needed for service-category GEOIP rules",
    stGeositeWhat: "domain categories used by presets",
    stMmdbWhat: "countries, shipped by nikki itself",
    stGeoipDrop: "Delete GeoIP.dat",
    stGeoipUnused: "No rule uses it — safe to delete.",
    stGeoipNeeded: r => "Currently used by rules: " + r + ". Deleting replaces them with published IP ranges (Telegram's come from core.telegram.org); the rest are dropped.",
    stGeoipConfirm: "Replace the GEOIP rules with IP ranges and delete the database? Country rules keep working. If mihomo fails to come back, the change is reverted.",
    stLow: "Almost no free space — config writes may start failing",
    dcProbing: "trying to open…",
    dcOpenOk: (c, sz) => "Opens: code " + c + ", " + sz + " received",
    dcOpenRedir: c => "Opens: redirect " + c + " (no body, which is normal)",
    dcOpenThrottled: (sz, s) => "Response started then stalled at " + sz + " (" + s + " s to timeout) — IP-level throttling; no desync fixes this, it needs a tunnel",
    dcOpenDpi: "No connection at all — DPI is breaking the handshake; try another zapret2 strategy",
    dcOpenChallenge: "Cloudflare is showing a challenge — a browser solves it, this is not a block",
    dcProbeCaveat: "Probed from the router over TCP: a client may differ if the browser uses QUIC or resolves the domain itself",
    dcTitle: "Why doesn't this site open?",
    dcHint: "Enter a domain and the panel tells you which engine handles it and whether that path works right now. Checked against mihomo's live config, not the panel's settings.",
    dcBtn: "Check", dcPh: "instagram.com",
    dcByDefault: "default",
    dcViaVpn: (g, r) => "Goes through the VPN, group «" + g + "» (rule: " + r + ")",
    dcGroupDead: g => "Group «" + g + "» is not in mihomo — this traffic goes nowhere",
    dcNodeDead: n => "Node «" + n + "» does not respond — the site won't open",
    dcNodeOk: (n, ms) => "Node «" + n + "» responds: " + ms + " ms",
    dcBlocked: r => "Blocked by rule: " + r,
    dcDirect: r => "Goes direct, bypassing the VPN (rule: " + r + ")",
    dcZ2On: l => "Zapret2 covers this domain (list: " + l + ") — enough for many sites",
    dcZ2Down: l => "The domain is in a zapret2 list (" + l + "), but the service is not running",
    dcNoEngine: "No engine handles this domain — add it under Domains (VPN) or to a zapret2 list",
    dcGeoCaveat: n => n + " category rules (GEOSITE) sit above the match and can't be evaluated here — the site may fall under one",
    instNikki: "Install nikki (VPN)",
    nikkiMissing: "nikki (the VPN engine) is not installed — the VPN side is hidden. Install it with «Install nikki» under Manage → Updates.",
    nkDiagTitle: "Why isn't the VPN working?",
    nkDiagHint: "Walks the whole chain: service → profile → rules inside mihomo's config → exit group → node. Stops at the first break and offers the fix.",
    nkDiagBtn: "Check", nkDiagNoNikki: "nikki is not installed — the VPN side cannot work",
    nkDiagUnconf: "nikki is not configured: no profile or the service is off, so mihomo never starts",
    nkDiagDown: "nikki is configured but mihomo is not running",
    nkDiagRunning: "nikki is up, mihomo is running",
    nkDiagRulesLost: n => "The panel has " + n + " rules, but mihomo's config has none — they never reach it",
    nkDiagRulesLive: n => "Rules reached mihomo: " + n,
    nkDiagNoRules: "No rules yet — add domains or turn on a preset",
    nkDiagNoGroup: "The exit group was never built — «→ VPN» rules point at nothing",
    nkDiagFixGroup: "Build the group",
    nkDiagDeadBase: n => n + " rules point at a profile group that leads nowhere — traffic goes direct",
    nkDiagQuic: "QUIC is not blocked: HTTP/3 misses both the tunnel and zapret2, so a site can still leave directly",
    nkDiagNoNodes: "No nodes — add a config on the Nodes tab",
    nkDiagAllOff: "Every node is off — traffic goes direct",
    nkDiagNodeDead: "The active node does not respond",
    nkDiagNodeOk: (n, ms) => "Active node responds: " + n + " — " + ms + " ms",
    taTitle: "Why doesn't it work on THIS device?",
    taHint: "For the «works on the TV, not on the phone» case. Records 60 seconds of the chosen device's traffic and shows what neither this panel nor mihomo's log can: what left past the tunnel, what never connected, and what went silent.",
    taWarm: "Force-quit the app first — without a cold start the hang won't happen again and won't make it into the recording.",
    taBtn: "Record", taSec: "s",
    taNow: "Reproduce the problem RIGHT NOW",
    taParsing: "Analysing the recording…",
    taBusy: "A recording is already running — wait for it to finish",
    taNoDevs: "No device with a known address. Turn it on and reload the page.",
    taPickDev: "Pick a device",
    taFail: "The recording failed — try again",
    taNoAnswer: "no answer",
    taEscPort: (w, p) => "Left past the tunnel: " + w + " — TCP port " + p + " is not intercepted, mihomo never saw this traffic",
    taEscPortU: (w, p) => "Left past the tunnel: " + w + " — UDP port " + p + " is not intercepted",
    taEscQuic: w => "Past the tunnel: " + w + " — this is QUIC, dropped by the «Block QUIC» switch. That is by design: the app should fall back to TCP.",
    taEscExcluded: w => "Past the tunnel: " + w + " — the device is excluded from proxying. Normal, if that was your call.",
    taEscReserved: w => "Past the tunnel: " + w + " — the address is on the exclusion list (reserved_ip). This is normal.",
    taEscOld: w => "Past the tunnel: " + w + " — the connection is older than the rules (e.g. opened before nikki restarted).",
    taAllPorts: "Intercept every port",
    taUdpNote: "The traffic now reaches mihomo, so this destination can be sent into the tunnel by an ordinary rule — by domain or IP, like everything else. This alone routes nothing: without a rule the traffic still goes direct, just via mihomo.",
    taRestartFix: "Restart nikki",
    taStale: "This report was taken BEFORE the fix, so the rows above show the earlier state. Record again to see the result.",
    act_allports: "intercept every port",
    taSyn: (w, s) => "Connection never established: " + w + " — " + s + " s of silence in reply",
    taSynTun: "through the tunnel", taSynDir: "direct",
    taStall: (w, b) => "Request went into the tunnel, no answer: " + w + " — " + b + " B sent, 0 received",
    taDirect: (h, n) => "mihomo sent it direct and nothing came back: " + h + " (connections: " + n + ")",
    taAddDom: "Route this domain through the tunnel",
    taSniBtn: "Test by name", taSniRun: "Testing…",
    taSniSni: h => "Cut by name: the bare address answers, the same request carrying the name " + h + " does not. That is SNI-based DPI; the tunnel or zapret2 fixes it.",
    taSniDead: "Opens from the router neither with the name nor without it. Nothing here points at SNI — the destination is simply unreachable.",
    taSniOk: "The name opens from the router right now — so the break was brief, or specific to this device.",
    taSniCaveat: "The test runs from the router and through mihomo, so the address contacted may be its choice rather than the one in the report.",
    taEscFine: n => "More flows left past the tunnel but were answered and worked: " + n + ". Not a fault — addresses withheld.",
    taHealthy: n => "Healthy flows through the tunnel: " + n,
    taClean: "No problem flows in this window.",
    taNoTraffic: "The device opened no connections THROUGH THIS ROUTER during the window. Usually that means it is on a different router or on mobile data; less often, that the app was never launched.",
    taForeign: (ip, lan) => "Address " + ip + " is not on this router's network (" + lan + ") — its traffic never comes through here, so there is nothing to record. Such devices reach the list as static hosts carried over from another router.",
    nikkiUnconf: "⚠ nikki is installed but not configured: no profile, or the service is off — mihomo never starts, so VPN nodes and «→ VPN» rules do nothing.",
    nikkiUnconfFix: "Set up & start",
    nodeNikkiDown: "node saved, but nikki is not running: enable the service and give it a profile (Services → Nikki), then re-check the node",
    nodeProfile: "from profile", nodeOn: "on", nodeOff: "off",
    guardBad1: "⚠ Proxy-group ", guardBad2: " was not found in mihomo. «→ VPN» rules point at a nonexistent group. Set the base group to your profile's proxy-group name: ",
    guardFix: "uci set nikki-unblock.config.base_group='NAME' && uci commit",
    tabMgmt: "Manage",
    svcStart: "Start", svcStop: "Stop", svcRestart: "Restart service",
    svcReload: "Reload config", svcAutostart: "Toggle autostart",
    svcRunning: "nikki running", svcStopped: "nikki stopped",
    svcBoot: "Start on boot", svcOn: "on", svcOff: "off",
    apLabel: "Intercept every port (TCP and UDP)", apHint: "Without this only a handful of ports reach mihomo and everything else leaves unproxied — invisible in this panel and in the logs, because the traffic never got there. A domain or IP rule can't touch it either: it escaped before the rules ever saw it. That is how Telegram media broke (port 5222) and how calls break when STUN uses an off-list port. Measured on the router, TCP costs no speed and no latency; UDP takes an extra hop through mihomo, which can affect NAT type for P2P and console games. LAN traffic is untouched. Toggling restarts nikki, so the network blinks for a few seconds.", mssLabel: "Fix download stalls (MSS clamp)", mssHint: "Turn on if large downloads or sites stall / load only halfway through the VPN while small stuff works fine. Fixes network packet size for the tunnel. Safe to leave on.",
    bkGroupTitle: "Settings backup",
    bkTitle: "Nikki (VPN)", bkDownload: "Create & download", bkRestore: "Restore from file", bkAuto: "Auto-backup (daily/weekly/monthly)",
    bkHint: "Saves nikki's rules, nodes, subscriptions and mixin (no geo databases, ~KB). Restore replaces current settings; a snapshot is taken first for rollback.",
    bkRestoreConfirm: "Restore from this file? Current settings will be replaced (an auto-snapshot is taken first for rollback).", bkRestoring: "Restoring…", kb: "KB",
    bkRestoreRow: "Restore", bkRestoreRotConfirm: "Restore settings from this backup? The current state of both engines will be replaced.",
    bk_daily: "Daily", bk_weekly: "Weekly", bk_monthly: "Monthly",
    undoTitle: "Undo changes", undoHint: "Before each toggle (strategy, QUIC, IPv6, auto-learn, presets) a snapshot of both engines is saved. If something broke after a change — put it back.",
    undoBtn: "↩ Undo last change", undoThis: "Revert to here", undoLast: "Undo last change", redoLast: "Redo undone change", undoEmpty: "No changes to undo yet", undoConfirm: "Revert to the state before this change? Both engines' settings return to that point.",
    act_z2strat: "zapret2 strategy", act_z2stratsave: "zapret2 strategy edit", act_z2quic: "QUIC toggle", act_z2ipv6: "IPv6 toggle", act_z2autotoggle: "zapret2 auto-learn",
    act_devicesapply: "device exclusions",
    act_preset: "preset", presetFail: "didn't fully apply", presetBusy: "Wait for the current apply to finish",
    act_z2preset: "zapret2 preset", act_z2preset_on: "zapret2 preset on", act_z2preset_off: "zapret2 preset off", act_geosite_on: "geo preset on", act_geosite_off: "geo preset off",
    act_preset_sync: "domain preset on", act_preset_off: "domain preset off", act_mssclamp: "MSS clamp", act_auto: "auto-backup",
    z2bkTitle: "Zapret2 (DPI bypass)", z2bkHint: "Saves the zapret2 config (strategies, auto-learn) and every hostlist: your domains, the auto list, exclusions, presets. Restore replaces them and restarts the service; if zapret2 fails to come up, it rolls back automatically.",
    z2bkRestoreConfirm: "Restore zapret2 from this file? The current config and hostlists will be replaced (an auto-snapshot is taken first for rollback).",
    rpTitle: "Feedback", rpHint: "Describe the problem or request. A GitHub issue draft opens — review it and hit Submit. Nothing is sent without your confirmation.",
    rpPh: "What's broken or what you'd like improved…", rpAttach: "attach diagnostics (versions, status, recent logs — no keys or passwords)",
    rpSend: "Open GitHub issue", rpNeedDesc: "Describe the problem first", rpOpened: "Opened an issue draft in a new tab — review and submit",
    rpFullHint: "The log didn't fit in the link — copy the text above and paste it into the issue body.",
    updTitle: "Updates", updSelf: "Update Nipret", updNikki: "Update nikki", updGeo: "Update geo", updZ2: "Update zapret2", updAll: "Update all",
    updNew: "Update available", updUpToDate: "Up to date", updAvail: "update",
    geoOn: "enabled", geoOff: "disabled", geoipNeed: "Enable the GeoIP database first: «Update geo» in the Manage tab.",
    updRunning: "Updating… (you can leave — it continues in the background)", updOkCode: "Done", updBad: "Failed, code ", updReload: "Nipret updated — click to reload the page",
    on_: "Enable ", off_: "Disable ", upd_: "Update ",
    enabling: "Enabling ", disabling: "Disabling ", updating: "Updating ",
    adding: "Adding ", removing: "Removing…", applying: "Applying…", saving: "Saving & applying…",
    added: "Added", removedC: "removed", already: "existing", willAdd: "adds", willRem: "removes",
    onCount: " custom + ", onCount2: " system", en_: "On", dis_: "Off",
    confirmDel: n => "This will remove " + n + " domain(s). Continue?",
    rmTitle: "Remove Nipret",
    rmHint: "Completely remove Nipret and revert every change it made: nikki rules, devices, QUIC/MSS/IPv6 toggles, zapret2 marks, the repo key. nikki itself is left untouched. A backup is saved to /tmp/nu-prepurge.tar.gz first. This is irreversible — the panel will disappear.",
    rmZ2: "Also remove zapret2 (/opt/zapret2)",
    rmBtn: "Remove Nipret",
    rmPrompt: "This is irreversible. To confirm, type the word REMOVE:",
    rmWord: "REMOVE",
    rmMismatch: "Word didn't match — cancelled",
    rmRunning: "Removing… (the panel will stop responding shortly — that's expected)",
    rmGone: "Package removed, panel deleted.",
    rmDone: "Nipret removed. No need to refresh this page.",
    rmDelFail: "Changes reverted, but package removal failed. Finish it with uninstall.sh (see README)."
  }
};
const t = k => (I18N[LANG] && I18N[LANG][k] !== undefined) ? I18N[LANG][k] : (I18N.ru[k] || k);

function applyI18n(){
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-html]").forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  document.querySelectorAll("[data-i18n-title]").forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.querySelectorAll(".lang a").forEach(a => a.classList.toggle("on", a.dataset.lang === LANG));
  $("#modeToggle").textContent = listMode ? t("showItems") : t("showList");
  $("#domain").placeholder = $("#rtype").value === "GEOSITE" ? t("phGeosite") : $("#rtype").value === "GEOIP" ? t("phGeoip") : $("#rtype").value === "IP-CIDR" ? t("phIp") : t("phDomain");
  renderList(); renderPresets(); loadIps();
  renderGuard(LASTSVC);
}
function setLang(l){
  LANG = (l === "en") ? "en" : "ru";
  try { localStorage.nikkiLang = LANG; } catch(e){}
  applyI18n();
  fetch("", { method:"POST", body:new URLSearchParams({ action:"setlang", lang:LANG }) });
}
document.querySelectorAll(".lang a").forEach(a => a.addEventListener("click", () => setLang(a.dataset.lang)));

/* simple vs advanced UI: simple hides everything marked .adv (deep controls / sub-tabs), leaving just
   the presets + add-a-domain essentials. Per-browser like the language, default simple. */
function setMode(m){
  MODE = (m === "advanced") ? "advanced" : "simple";
  try { localStorage.nikkiMode = MODE; } catch(e){}
  document.body.classList.toggle("mode-advanced", MODE === "advanced");
  document.body.classList.toggle("mode-simple", MODE === "simple");
  document.querySelectorAll(".mode a").forEach(a => a.classList.toggle("active", a.dataset.mode === MODE));
  // re-evaluate sub-tabs for the current engine so a now-hidden adv tab can't stay active
  const cur = document.querySelector(".tab-top.active");
  if (cur) selectEngine(cur.dataset.engine);
}
document.querySelectorAll(".mode a").forEach(a => a.addEventListener("click", () => setMode(a.dataset.mode)));

/* global status toast: in-progress (text ends with …) stays with running dots; success/errors
   pop then auto-dismiss. Driven by every setMsg call so statuses are noticeable everywhere. */
let toastTimer = null, toastClick = null;
function showToast(txt, kind, opts){
  opts = opts || {};
  const el = $("#toast"); if (!el) return;
  if (toastTimer){ clearTimeout(toastTimer); toastTimer = null; }
  txt = (txt || "").trim();
  if (!txt){ el.hidden = true; toastClick = null; return; }
  let base = txt, running = kind === "run";
  if (running) base = base.replace(/\s*(…|\.{3})\s*$/, "");   // strip trailing … — the dots animate
  toastClick = opts.click || null;
  el.className = "toast " + kind + (toastClick ? " clickable" : "");
  $("#toastIc").textContent = opts.icon || (kind === "ok" ? "✓" : kind === "err" ? "✕" : "");
  $("#toastTxt").textContent = base;
  el.hidden = false;
  // in-progress and sticky toasts stay until something replaces them
  if (!running && !opts.sticky) toastTimer = setTimeout(() => { el.hidden = true; }, kind === "err" ? 4200 : 2200);
}
$("#toast").addEventListener("click", () => { if (toastClick) toastClick(); });
const setMsg = (el, txt, ok=true) => {
  if (el){ el.textContent = txt; el.style.color = ok ? "" : "#dc2626"; }
  const s = (txt || "").trim();
  showToast(txt, !ok ? "err" : /(…|\.{3})$/.test(s) ? "run" : "ok");
};
/* full-screen overlay (page load + node applies): dims the UI with a spinner + status */
function showOverlay(txt){ const o = $("#overlay"); if (!o) return; $("#overlayText").textContent = txt || ""; o.hidden = false; }
function setOverlay(txt){ const t2 = $("#overlayText"); if (t2) t2.textContent = txt || ""; }
function hideOverlay(){ const o = $("#overlay"); if (o) o.hidden = true; }
// Never throws. A rejected fetch (router busy, request outliving uhttpd's CGI timeout, Wi-Fi blip) used
// to propagate out of every `await api(...)`, skipping the rest of the handler — including hideOverlay().
// The panel then sat on "applying" forever while the router had in fact finished the job. Most call
// sites are not wrapped in try/catch, so guarding here fixes the whole class at once rather than in the
// three dozen places that would each have to remember.
async function api(action, params){
  try {
    const r = await fetch("", { method:"POST", body: new URLSearchParams({ action, ...params }) });
    if (r.status === 401){ location.reload(); return {}; }   // session expired → back to the PIN screen
    return await r.json();
  } catch(e){ return { ok: false, error: "timeout" }; }
}

/* ---------- tabs ---------- */
document.querySelectorAll(".tab").forEach(tb => tb.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".view").forEach(x => x.classList.remove("active"));
  tb.classList.add("active");
  $("#view-" + tb.dataset.view).classList.add("active");
  if (tb.dataset.view === "nodes") loadNodes().then(autoPingNodes);
  else if (tb.dataset.view === "domains") presetOp.ensure();   // resume a preset spinner if one is applying
  else if (tb.dataset.view === "mgmt") loadSvc();
  else if (tb.dataset.view === "common") { loadVersions(); loadUpdCheck(); loadBackup(); loadZ2Backup(); loadAuth(); loadUndo(); loadStorage(); taOpen(); }   // Общее: updates + backup + security + storage + запись устройства
  else if (tb.dataset.view === "devices") loadDevices();
  else if (tb.dataset.view.indexOf("z2") === 0) { loadZapret2(); z2PresetOp.ensure(); }   // any zapret2 sub-view
}));
/* top-level engine selector — shows only that engine's sub-tabs, opens the first */
function selectEngine(eng){
  document.querySelectorAll(".tab-top").forEach(b => b.classList.toggle("active", b.dataset.engine === eng));
  const hint = $("#engineHint");   // engine description under the big buttons, above the sub-tabs
  hint.dataset.i18n = eng === "zapret2" ? "engZapret2Hint" : eng === "common" ? "engCommonHint" : "engNikkiHint";   // data-i18n → survives RU/EN switch
  hint.textContent = t(hint.dataset.i18n);
  let first = null, n = 0;
  document.querySelectorAll(".tabs-sub .tab").forEach(b => {
    // in simple mode an .adv sub-tab stays hidden — and must not be picked as the first/active one
    const show = b.dataset.engine === eng && !(MODE === "simple" && b.classList.contains("adv"));
    b.hidden = !show;
    if (show){ n++; if (!first) first = b; }
  });
  $(".tabs-sub").hidden = n <= 1;   // single-view engine → hide the (one-button) sub-bar
  if (first) first.click();
}
document.querySelectorAll(".tab-top").forEach(b => b.addEventListener("click", () => selectEngine(b.dataset.engine)));

/* ---------- domains ---------- */
function suffixMatchers(){
  return new Set(RULES.filter(x => x.type === "DOMAIN-SUFFIX" && x.node === "PROXY").map(x => x.matcher));
}
function typeOpts(){
  return '<option value="DOMAIN-SUFFIX">' + t("tSuffix") + '</option>' +
         '<option value="DOMAIN">' + t("tDomain") + '</option>' +
         '<option value="DOMAIN-KEYWORD">' + t("tKeyword") + '</option>' +
         '<option value="GEOSITE">GEOSITE</option>' +
         '<option value="GEOIP">GEOIP</option>' +
         '<option value="IP-CIDR">IP-CIDR</option>';
}
function nodeOpts(cur){
  // "→ VPN" = the managed exit group (EXITG). PROXY (raw profile) only shown for legacy rules still on it.
  let o = '<option value="' + EXITG + '">' + t("nProxy") + '</option>';
  o += '<option value="DIRECT">' + t("nDirect") + '</option><option value="REJECT">' + t("nReject") + '</option>';
  if (cur === "PROXY") o += '<option value="PROXY">' + t("nProxyProfile") + '</option>';
  return o;
}
// a rule is "owned" by a preset (list-preset src tag, or a geosite/IP that a preset manages) -> hidden
// from the per-item list to keep it about your own domains; still visible via "show as list" + preset cards
// a preset's geosite/geoip may be a comma-separated combo (e.g. "twitter,facebook,tiktok")
const geoList = s => (s || "").split(",").map(x => x.trim()).filter(Boolean);
function presetOwned(r){
  if (r.src) return true;
  for (const p of PRESETS){
    if (r.type === "GEOSITE" && geoList(p.geosite).indexOf(r.matcher) >= 0) return true;
    if (r.type === "GEOIP" && geoList(p.geoip).indexOf(r.matcher) >= 0) return true;
    if (p.ipcidr && r.type === "IP-CIDR" && p.ipcidr.indexOf(r.matcher) >= 0) return true;
  }
  return false;
}
/* ---------- list filter + bulk selection (shared by the nikki and zapret2 domain lists) ----------
   Each list gets a .fbar toolbar: a mask filter (substring, or * wildcard), a "select shown"
   master checkbox and one bulk action. Selection counts only VISIBLE checked rows — filtering
   away a row unchecks it, so the bulk action always matches what's on screen. */
function fltMatch(d, q){
  if (!q) return true;
  d = d.toLowerCase();
  if (q.indexOf("*") >= 0){
    const re = new RegExp("^" + q.split("*").map(s => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
    return re.test(d);
  }
  return d.indexOf(q) >= 0;
}
function fltApply(bar){
  const q = $(bar.q).value.trim().toLowerCase();
  $(bar.ul).querySelectorAll("li").forEach(li => {
    const dom = li.querySelector(".dom"); if (!dom) return;
    const hide = !fltMatch(dom.textContent, q);
    li.hidden = hide;
    if (hide){ const c = li.querySelector(".pick"); if (c) c.checked = false; }
  });
  fltCount(bar);
}
function fltCount(bar){
  const n = $(bar.ul).querySelectorAll("li:not([hidden]) .pick:checked").length;
  const b = $(bar.btn); b.disabled = !n;
  b.textContent = t(bar.btnKey) + (n ? " (" + n + ")" : "");
}
function fltRerender(bar){ $(bar.all).checked = false; fltApply(bar); }
function fltInit(bar){
  $(bar.q).addEventListener("input", () => fltApply(bar));
  $(bar.all).addEventListener("change", e => {
    $(bar.ul).querySelectorAll("li:not([hidden]) .pick").forEach(c => { c.checked = e.currentTarget.checked; });
    fltCount(bar);
  });
  $(bar.ul).addEventListener("change", e => { if (e.target.classList.contains("pick")) fltCount(bar); });
  $(bar.btn).addEventListener("click", () => {
    const keys = [...$(bar.ul).querySelectorAll("li:not([hidden]) .pick:checked")].map(c => c.dataset.key);
    if (keys.length) bar.run(keys);
  });
}
async function fltBulk(action, params, msgEl, reload){
  showOverlay(t("applying")); setMsg(msgEl, t("applying"));
  let res; try { res = await api(action, params); } catch(e){ res = {}; }
  hideOverlay();
  if (res && res.ok) setMsg(msgEl, t("done")); else setMsg(msgEl, t("errP") + ((res && res.error) || "?"), false);
  reload();
}
const BAR_LIST = { q: "#fltList", all: "#fallList", btn: "#fdelList", ul: "#list", btnKey: "fltDel",
  run: keys => { if (confirm(t("fltConfirm") + keys.length)) fltBulk("ruledelbulk", { idxs: keys.join(" ") }, $("#msg"), loadDomains); } };
const BAR_Z2U = { q: "#fltZ2U", all: "#fallZ2U", btn: "#fdelZ2U", ul: "#z2UserList", btnKey: "fltDel",
  run: keys => { if (confirm(t("fltConfirm") + keys.length)) fltBulk("z2hostdelbulk", { domains: keys.join(",") }, $("#z2DomMsg"), loadZapret2); } };
const BAR_Z2A = { q: "#fltZ2A", all: "#fallZ2A", btn: "#fdelZ2A", ul: "#z2AutoList", btnKey: "fltNoBypass",
  run: keys => { if (confirm(t("fltConfirm") + keys.length)) fltBulk("z2excludebulk", { domains: keys.join(",") }, $("#z2AutoMsg"), loadZapret2); } };
const BAR_Z2X = { q: "#fltZ2X", all: "#fallZ2X", btn: "#fdelZ2X", ul: "#z2ExList", btnKey: "fltDel",
  run: keys => { if (confirm(t("fltConfirm") + keys.length)) fltBulk("z2unexcludebulk", { domains: keys.join(",") }, $("#z2ExMsg"), loadZapret2); } };
[BAR_LIST, BAR_Z2U, BAR_Z2A, BAR_Z2X].forEach(fltInit);

function renderList(){
  const ul = $("#list"); ul.innerHTML = "";
  const manual = RULES.filter(x => !presetOwned(x));
  // newest first (rules are appended to UCI, so reverse for display; idx values are preserved)
  [...manual].reverse().forEach(x => {
    const li = document.createElement("li");
    if (x.enabled === "0") li.className = "off";
    li.innerHTML =
      '<input type="checkbox" class="pick" data-key="' + x.idx + '">' +
      '<span class="dom">' + escH(x.matcher) + '</span>' +
      '<select class="edit" data-field="type">' + typeOpts() + '</select>' +
      '<select class="edit" data-field="node">' + nodeOpts(x.node) + '</select>' +
      '<label class="sw"><input type="checkbox" data-act="toggle" data-idx="' + x.idx + '"' + (x.enabled === "0" ? "" : " checked") + '><span class="sl"></span></label>' +
      '<button class="ghost" data-act="del" data-idx="' + x.idx + '">✕</button>';
    li.dataset.idx = x.idx;
    li.querySelector('[data-field="type"]').value = x.type;
    li.querySelector('[data-field="node"]').value = x.node;
    ul.appendChild(li);
  });
  $("#count").textContent = "(" + manual.length + ")";
  fltRerender(BAR_LIST);
}
// Which DOMAINS this preset put in. Type matters since 2.34: category and IP rules carry the same src
// tag now, and counting them here inflated the set against the preset's domain list — every preset
// that has both a list and categories (ai, Соцсети, Мессенджеры) then showed as forever partial.
function taggedSet(id){
  return new Set(RULES.filter(r => r.type === "DOMAIN-SUFFIX"
    && (" " + (r.src || "") + " ").indexOf(" " + id + " ") >= 0).map(r => r.matcher));
}
// on/off/partial for one facet
function listFacet(p){
  const L = new Set(p.domains || []);
  // a composite preset carries several lists (its own + each included preset's); rules stay tagged
  // with the id of the list they came from, so the tag set is the union over all of them
  const ids = (p.lists && p.lists.length) ? p.lists : [p.id];
  const tagged = new Set(ids.flatMap(id => [...taggedSet(id)]));
  const have = suffixMatchers();
  const inSync = tagged.size === L.size && [...L].every(d => tagged.has(d));
  const presentAny = [...L].some(d => have.has(d));
  if (inSync && L.size > 0) return "on";
  if (tagged.size === 0 && !presentAny) return "off";
  return "part";
}
// combined state of a preset (geosite facet + list facet). A preset may have either or both.
function presetState(p){
  const facets = [];
  const facetOf = (list, type) => { const have = list.filter(c => RULES.some(r => r.type === type && r.matcher === c)).length; return have === list.length ? "on" : have === 0 ? "off" : "part"; };
  const gcats = geoList(p.geosite); if (gcats.length) facets.push(facetOf(gcats, "GEOSITE"));
  // geoip facet only counts when the GeoIP DB is enabled — otherwise the rule can't be added and the
  // card would be stuck "partial". While GeoIP is off, geosite + IP-CIDR fully define the preset.
  const gips = geoList(p.geoip); if (gips.length && GEO_OK) facets.push(facetOf(gips, "GEOIP"));
  // IP-CIDR must count too, otherwise a range ADDED to the manifest later never reaches anyone who
  // already has the preset on: the card would stay green while the new range is missing from the
  // rules, and autosync only ever touches domain lists. Counting it turns the card orange instead,
  // and one click completes the sync. (Found when Telegram's 95.161.64.0/20 — announced by AS62041
  // but absent from Telegram's published cidr.txt — turned out to be missing from the preset.)
  if ((p.ipcidr || []).length) facets.push(facetOf(p.ipcidr, "IP-CIDR"));
  if ((p.domains || []).length) facets.push(listFacet(p));
  if (!facets.length) return { on: false, part: false };
  if (facets.every(f => f === "on")) return { on: true, part: false };
  if (facets.every(f => f === "off")) return { on: false, part: false };
  return { on: true, part: true };
}
/* Preset applies are ATOMIC + DETACHED on the server: one op per kind, tracked in a status file the
   UI polls (?api=presetop / ?api=z2presetop). opPoller() is the shared per-card spinner machinery —
   the spinner survives tab switches and page reloads, and the server's crash guard ends it honestly.
   cfg: {api, cardsSel, msg(), onDone()} */
function opPoller(cfg){
  const st = { polling: false, applyingId: null };
  function mark(id){
    st.applyingId = id;
    document.querySelectorAll(cfg.cardsSel).forEach(c => {
      c.classList.toggle("applying", c.dataset.pid === id);
      const inp = c.querySelector("input"); if (inp) inp.disabled = true;   // lock every card while one applies
    });
  }
  function clear(){
    st.applyingId = null;
    document.querySelectorAll(cfg.cardsSel).forEach(c => {
      c.classList.remove("applying"); const inp = c.querySelector("input"); if (inp) inp.disabled = false;
    });
  }
  async function poll(){
    st.polling = true;
    let s = null; try { s = await (await fetch("?api=" + cfg.api)).json(); } catch(e){}
    if (s && s.running){
      mark(s.id);
      setMsg(cfg.msg(), (s.on === 1 ? t("enabling") : t("disabling")) + (s.name || "") + "…");
      setTimeout(poll, 1000); return;
    }
    st.polling = false;
    clear();
    if (s && s.done){
      setMsg(cfg.msg(), s.ok === 1 ? t("done") : (t("errP") + t("presetFail")), s.ok === 1);
      await cfg.onDone();
    }
  }
  function ensure(){ if (!st.polling) poll(); }
  /* start a card's apply: optimistic spinner, POST, then poll (or roll the card back on refusal) */
  async function start(id, name, wantOn, action, params, onRefused){
    mark(id);
    setMsg(cfg.msg(), (wantOn ? t("enabling") : t("disabling")) + name + "…");
    let r = null; try { r = await api(action, params); } catch(e){}
    if (r && r.ok && r.started) ensure();
    else if (r && r.error === "busy"){ setMsg(cfg.msg(), t("presetBusy"), false); ensure(); }
    else { clear(); setMsg(cfg.msg(), t("errP") + ((r && r.error) || "?"), false); onRefused(); }
  }
  return { st, mark, clear, ensure, start };
}
const presetOp = opPoller({ api: "presetop", cardsSel: "#presets .pcard", msg: () => $("#presetMsg"),
  onDone: async () => { await loadDomains(); loadUndo(); } });
function startPresetApply(p, wantOn){
  // schema fields (geosite/ips/node/…) are resolved server-side from the applist index by id
  presetOp.start(p.id, p.name, wantOn, "preset_apply", { id: p.id, on: wantOn ? 1 : 0 }, renderPresets);
}
function showPresetInfo(p){
  $("#pmTitle").textContent = p.name;
  const tgt = escH(p.node || "VPN");
  let h = "";
  // The manifest's own explanation of when this preset is the right one, first thing in the dialog —
  // the lists below say WHAT is inside, this says WHY. Escaped: it arrives over the network.
  const note = (LANG === "en" ? p.note_en : p.note_ru) || p.note_ru || p.note_en;
  if (note) h += '<div class="pmnote pmwhy">' + escH(note) + '</div>';
  // a folded-in preset is named up front: the rest of the dialog already shows its merged contents,
  // so without this line it looks like the entries were copied into this preset by hand
  const inc = p.includes || [];
  if (inc.length){
    const names = inc.map(id => (PRESETS.find(x => x.id === id) || {}).name || id);
    h += '<div class="pmrow">' + t("pmIncl") + ' <b>' + escH(names.join(", ")) + '</b></div>';
  }
  // concrete contents first (GEOSITE/GEOIP categories, then the extra IP/domain lists)…
  geoList(p.geosite).forEach(c => h += '<div class="pmrow"><b>GEOSITE</b> · <code>' + escH(c) + '</code> → ' + tgt + '</div>');
  geoList(p.geoip).forEach(g => h += '<div class="pmrow"><b>GEOIP</b> · <code>' + escH(g) + '</code> → ' + tgt + (GEO_OK ? "" : " · " + t("geoOff")) + '</div>');
  const ips = p.ipcidr || [];
  if (ips.length){
    h += '<div class="pmsub">IP-CIDR (' + ips.length + ')</div>';
    h += '<ul class="pmlist">' + ips.map(x => '<li>' + escH(x) + '</li>').join("") + '</ul>';
  }
  const d = p.domains || [];
  if (d.length){
    h += '<div class="pmsub">' + t("tSuffix") + ' (' + d.length + ')</div>';
    h += '<ul class="pmlist">' + d.map(x => '<li>' + escH(x) + '</li>').join("") + '</ul>';
  }
  // …then the explanatory note at the bottom
  if (p.geosite || p.geoip) h += '<div class="pmnote">' + t("pmGeo") + '</div>';
  if (!p.geosite && !p.geoip && !ips.length && !d.length) h += '<div class="pmnote">' + t("listsNA") + '</div>';
  $("#pmBody").innerHTML = h;
  $("#pmodal").hidden = false;
}
function presetCard(p){
  const st = presetState(p);
  const card = document.createElement("div");
  card.className = "pcard" + (st.part ? " partial" : st.on ? " on" : "");
  card.dataset.pid = p.id;
  // checked only when FULLY on; a partial preset shows unchecked (orange) so a click completes the sync
  card.innerHTML =
    '<span class="pname">' + escH(p.name) + '</span>' +
    '<button class="pinfo" title="' + escH(t("pmShow")) + '">?</button>' +
    '<label class="sw"><input type="checkbox"' + (st.on && !st.part ? " checked" : "") + '><span class="sl"></span></label>';
  card.querySelector(".pinfo").addEventListener("click", () => showPresetInfo(p));
  card.querySelector("input").addEventListener("change", e => startPresetApply(p, e.target.checked));
  return card;
}
function renderPresets(){
  if (PRESETS.length === 0) return;
  const box = $("#presets"); box.innerHTML = "";
  PRESETS.forEach(p => box.appendChild(presetCard(p)));
  if (presetOp.st.applyingId) presetOp.mark(presetOp.st.applyingId);   // keep the spinner across re-renders
}
$("#pmClose").addEventListener("click", () => { $("#pmodal").hidden = true; });
$("#pmodal").addEventListener("click", e => { if (e.target.id === "pmodal") $("#pmodal").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("#pmodal").hidden = true; });
/* first-load skeletons (shimmer placeholders) — shown only until the first data arrives */
let listReady = false, presetsReady = false;
function skelPresets(){ $("#presets").innerHTML = '<div class="skel skcard"></div>'.repeat(8); }
function skelList(){ $("#list").innerHTML = '<li class="skrow"><div class="skel"></div></li>'.repeat(6); }
async function loadDomains(){
  if (!listReady && !listMode) skelList();
  RULES = await (await fetch("?api=list")).json();
  listReady = true;
  renderList(); renderPresets();
  if (!$("#bulkWrap").hidden) $("#bulk").value = [...suffixMatchers()].join("\n");
}

/* view-mode toggle */
let listMode = false;
$("#modeToggle").addEventListener("click", () => {
  listMode = !listMode;
  $("#bulkWrap").hidden = !listMode;
  $("#list").hidden = listMode;
  $("#modeToggle").textContent = listMode ? t("showItems") : t("showList");
  if (listMode) $("#bulk").value = [...suffixMatchers()].join("\n");
});
function exitListMode(){
  listMode = false; $("#bulkWrap").hidden = true; $("#list").hidden = false;
  $("#modeToggle").textContent = t("showList");
}
$("#cancelList").addEventListener("click", exitListMode);
$("#saveList").addEventListener("click", async () => {
  const wanted = new Set($("#bulk").value.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean));
  const have = suffixMatchers();
  const toRemove = [...have].filter(d => !wanted.has(d)).length;
  if (toRemove > 0 && !confirm(t("confirmDel")(toRemove))) return;
  $("#saveList").disabled = true;
  setMsg($("#msg"), t("saving"));
  const res = await api("setall", { domains: $("#bulk").value });
  $("#saveList").disabled = false;
  if (res.ok){ setMsg($("#msg"), t("added") + ": " + res.added + " · " + t("removedC") + ": " + res.removed); await loadDomains(); exitListMode(); }
  else setMsg($("#msg"), t("errP") + (res.error || "?"), false);
});
$("#rtype").addEventListener("change", () => {
  $("#domain").placeholder = $("#rtype").value === "GEOSITE" ? t("phGeosite") : $("#rtype").value === "GEOIP" ? t("phGeoip") : $("#rtype").value === "IP-CIDR" ? t("phIp") : t("phDomain");
});
$("#addForm").addEventListener("submit", async e => {
  e.preventDefault();
  const d = $("#domain").value.trim(); if (!d) return;
  const type = $("#rtype").value, node = $("#rnode").value;
  $("#addBtn").disabled = true;
  setMsg($("#msg"), t("adding") + "«" + d + "»…");
  const res = await api("add", { domain: d, type, node });
  $("#addBtn").disabled = false;
  if (res.ok){ setMsg($("#msg"), res.dup ? t("dup") : (t("done") + ": " + type + " «" + d + "» → " + node)); $("#domain").value = ""; loadDomains(); }
  else if (res.error === "geoip_off") setMsg($("#msg"), t("geoipNeed"), false);
  else setMsg($("#msg"), t("errP") + (res.error || "?"), false);
});
$("#list").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const { act, idx } = b.dataset;
  b.disabled = true;
  setMsg($("#msg"), act === "del" ? t("removing") : t("applying"));
  const res = await api(act, { idx });
  if (res.ok){ setMsg($("#msg"), t("done")); loadDomains(); }
  else { setMsg($("#msg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
});
// row change: enable/disable slider, or inline type/action edit
$("#list").addEventListener("change", async e => {
  const tg = e.target.closest('input[data-act="toggle"]');
  if (tg){
    tg.disabled = true; setMsg($("#msg"), t("applying"));
    const res = await api("toggle", { idx: tg.dataset.idx });
    if (res.ok){ setMsg($("#msg"), t("done")); }
    else { setMsg($("#msg"), t("errP") + (res.error || "?"), false); }
    loadDomains(); return;
  }
  const sel = e.target.closest("select.edit"); if (!sel) return;
  const li = sel.closest("li"); const idx = li.dataset.idx;
  const type = li.querySelector('[data-field="type"]').value;
  const node = li.querySelector('[data-field="node"]').value;
  setMsg($("#msg"), t("applying"));
  const res = await api("ruledit", { idx, type, node });
  if (res.ok){ setMsg($("#msg"), t("done")); loadDomains(); }
  else { setMsg($("#msg"), t("errP") + (res.error || "?"), false); loadDomains(); }
});

/* ---------- ip exclusions ---------- */
async function loadIps(){
  const ips = await (await fetch("?api=iplist")).json();
  const ul = $("#ipList"); ul.innerHTML = "";
  const custom = ips.filter(x => !x.protected);
  $("#ipCount").textContent = "(" + custom.length + t("onCount") + (ips.length - custom.length) + t("onCount2") + ")";
  ips.forEach(x => {
    const li = document.createElement("li");
    li.innerHTML = '<span class="dom">' + x.ip + '</span>' +
      (x.protected ? '<span class="badge">' + (x.node ? t("ipNode") : t("system")) + '</span>' : '<button class="ghost" data-ip="' + x.ip + '">✕</button>');
    ul.appendChild(li);
  });
}
$("#ipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const ip = $("#ip").value.trim(); if (!ip) return;
  $("#ipBtn").disabled = true;
  setMsg($("#ipMsg"), t("adding") + ip + "…");
  const res = await api("ipadd", { ip });
  $("#ipBtn").disabled = false;
  if (res.ok){ setMsg($("#ipMsg"), res.dup ? t("dup") : (t("done") + ": " + (res.ip || ip))); $("#ip").value = ""; loadIps(); }
  else setMsg($("#ipMsg"), t("errP") + (res.error || "?"), false);
});
$("#ipList").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  b.disabled = true;
  setMsg($("#ipMsg"), t("removing"));
  const res = await api("ipdel", { ip: b.dataset.ip });
  if (res.ok){ setMsg($("#ipMsg"), t("done")); loadIps(); }
  else { setMsg($("#ipMsg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
});

/* ---------- devices: merged Nikki + Zapret2 selection, by MAC ---------- */
// The whole tab is one draft: checkboxes and mode selects only mutate local state (DEVROWS/the
// <select> values) until Apply sends it all in a single devicesapply request. DEVCOMMITTED is a
// snapshot of the last known-applied state, used purely to enable/disable the Apply button and show
// the "unsaved changes" hint — never sent anywhere itself.
let DEVROWS = [];
let DEVMETA = { nikki: { present: 0, mode: "exclude" }, zapret2: { present: 0, mode: "exclude" } };
let DEVCOMMITTED = null;

function devSnapshot(){
  return JSON.stringify({
    nikkiMode: $("#nikkiMode").value, z2Mode: $("#z2Mode").value,
    rows: DEVROWS.map(d => [d.mac, !!d.nikki, !!d.zapret2])
  });
}
function devDirty(){ return DEVCOMMITTED !== null && devSnapshot() !== DEVCOMMITTED; }

async function loadDevices(){
  let d; try { d = await (await fetch("?api=devicesall")).json(); } catch(e){ d = null; }
  DEVMETA.nikki = (d && d.nikki) || { present: 0, mode: "exclude" };
  DEVMETA.zapret2 = (d && d.zapret2) || { present: 0, mode: "exclude" };
  DEVROWS = (d && d.devices) || [];
  renderDevices();
  DEVCOMMITTED = devSnapshot();
  updateApplyState();
}
function renderDevices(){
  $("#nikkiModeCard").hidden = !CAPS.nikki;
  $("#z2ModeCard").hidden = !CAPS.zapret2;
  $("#nikkiMode").value = DEVMETA.nikki.mode || "exclude";
  $("#z2Mode").value = DEVMETA.zapret2.mode || "exclude";
  const ul = $("#devList"); ul.innerHTML = "";
  $("#devCount").textContent = "(" + DEVROWS.length + ")";
  DEVROWS.forEach(d => ul.appendChild(devRow(d)));
  updateHints(); updateSummary();
}
function devRow(d){
  const li = document.createElement("li"); li.className = "devrow";
  li.innerHTML =
    '<span class="dom">' + escH(d.name || d.mac) + '<span class="meta">' + escH(d.mac + (d.ip ? " · " + d.ip : "")) + '</span></span>' +
    (CAPS.nikki ? '<label class="devchk"><input type="checkbox" data-eng="nikki" data-mac="' + escH(d.mac) + '"' + (d.nikki ? " checked" : "") + '><span>' + escH(t("engNikki")) + '</span></label>' : "") +
    (CAPS.zapret2 ? '<label class="devchk"><input type="checkbox" data-eng="zapret2" data-mac="' + escH(d.mac) + '"' + (d.zapret2 ? " checked" : "") + '><span>' + escH(t("engZapret2")) + '</span></label>' : "");
  return li;
}
function updateHints(){
  $("#nikkiModeHint").textContent = t($("#nikkiMode").value === "only" ? "nikkiHintOnly" : "nikkiHintExclude");
  $("#z2ModeHint").textContent = t($("#z2Mode").value === "only" ? "z2HintOnly" : "z2HintExclude");
}
function updateSummary(){
  const nk = DEVROWS.filter(d => d.nikki).length, z2 = DEVROWS.filter(d => d.zapret2).length;
  const parts = [];
  if (CAPS.nikki) parts.push(t($("#nikkiMode").value === "only" ? "devSummaryNikkiOnly" : "devSummaryNikkiExclude")(nk));
  if (CAPS.zapret2) parts.push(t($("#z2Mode").value === "only" ? "devSummaryZ2Only" : "devSummaryZ2Exclude")(z2));
  $("#devSummary").textContent = parts.join(" · ");
}
// Only touches #devMsg when there's no pending applying/success/error text to preserve — the Apply
// handler manages that itself via setMsg. Checking a box never pops a toast; only Apply does.
function updateApplyState(){
  const dirty = devDirty();
  $("#devApplyBtn").disabled = !dirty;
  const el = $("#devMsg"); el.textContent = dirty ? t("devUnsaved") : ""; el.style.color = "";
}
$("#devList").addEventListener("change", e => {
  const cb = e.target.closest('input[type="checkbox"]'); if (!cb) return;
  const row = DEVROWS.find(d => d.mac === cb.dataset.mac); if (!row) return;
  row[cb.dataset.eng] = cb.checked;
  updateSummary(); updateApplyState();
});
$("#nikkiMode").addEventListener("change", () => { updateHints(); updateSummary(); updateApplyState(); });
$("#z2Mode").addEventListener("change", () => { updateHints(); updateSummary(); updateApplyState(); });
$("#devApplyBtn").addEventListener("click", async () => {
  const btn = $("#devApplyBtn"); btn.disabled = true;
  showOverlay(t("applying")); setMsg($("#devMsg"), t("applying"));
  const params = {
    nikkiMode: $("#nikkiMode").value, z2Mode: $("#z2Mode").value,
    nikkiMacs: DEVROWS.filter(d => d.nikki).map(d => d.mac).join(","),
    z2Macs: DEVROWS.filter(d => d.zapret2).map(d => d.mac).join(",")
  };
  let res; try { res = await api("devicesapply", params); } catch(e){ res = {}; }
  hideOverlay();
  if (res && res.ok) { setMsg($("#devMsg"), t("done")); await loadDevices(); }
  else { setMsg($("#devMsg"), t("errP") + ((res && res.error) || "?"), false); btn.disabled = false; }
});

/* ---------- combine capability gating (nikki / zapret2 present?) ---------- */
let CAPS = { nikki: true, zapret2: true };
function applyCaps(){
  // top-level engine tabs light up only for installed engines; "common" (Manage) is always there
  const nt = document.querySelector('.tab-top[data-engine="nikki"]');   if (nt) nt.hidden = !CAPS.nikki;
  const zt = document.querySelector('.tab-top[data-engine="zapret2"]'); if (zt) zt.hidden = !CAPS.zapret2;
  const svc = document.querySelector('#view-mgmt .svc'); if (svc) svc.style.display = CAPS.nikki ? "" : "none";
  const zb = $("#z2bkBlock"); if (zb) zb.hidden = !CAPS.zapret2;
  const nkd = $("#nkDiagBlock"); if (nkd) nkd.hidden = !CAPS.nikki;
  // the capture reasons about nikki's interception — without nikki there is nothing for it to say
  const tab = $("#taBlock"); if (tab) tab.hidden = !CAPS.nikki;
  // nikki missing → offer to install it. Doing it by hand is a minefield (its feed is DPI-blocked here,
  // and picking the stable engine silently breaks XHTTP nodes), so the button is the supported path.
  const inb = $("#instNikki"); if (inb) inb.hidden = CAPS.nikki;
  const unb = $("#updNikki"); if (unb) unb.hidden = !CAPS.nikki;
  // open the first available engine (prefer nikki, else zapret2, else common)
  const firstEng = document.querySelector('.tab-top:not([hidden])');
  selectEngine(firstEng ? firstEng.dataset.engine : "common");
  const g = $("#guard");
  if (g && !CAPS.nikki && !CAPS.zapret2){ g.textContent = t("noEngines"); g.hidden = false; }
  else if (g && !CAPS.nikki){ g.textContent = t("nikkiMissing"); g.hidden = false; }
}

/* ---------- zapret2 (DPI bypass) management ---------- */
let Z2 = { present: 0, running: 0, boot: 0, autohostlist: 0 };
let Z2HOSTS = { user: [], auto: [] };
let Z2PRESETS = [], z2presetsLoaded = false, z2setupChecked = false;
async function loadZapret2(){
  // the whole zapret2 engine tab is gated off (applyCaps) when zapret2 is absent, so if we got here it's present
  try { Z2 = await (await fetch("?api=z2status")).json(); } catch(e){ Z2 = { present: CAPS.zapret2 ? 1 : 0 }; }
  if (Z2.present !== 1) return;
  // first-run curated default (once): on a FRESH zapret2 enable core presets + turn auto-learn off
  if (Z2.setup_done !== 1 && !z2setupChecked){
    z2setupChecked = true;
    showOverlay(t("z2SetupRunning"));
    const r = await api("z2setup", {});
    hideOverlay();
    if (r && r.applied){ setMsg($("#z2PresetMsg"), t("z2SetupApplied")); z2presetsLoaded = false;
      try { Z2 = await (await fetch("?api=z2status")).json(); } catch(e){} }
  }
  try { Z2HOSTS = await (await fetch("?api=z2hosts")).json(); } catch(e){ Z2HOSTS = { user: [], auto: [] }; }
  renderZ2();
  if (!z2presetsLoaded) loadZ2Presets();   // curated bypass presets — fetch once, then re-render from cache
  loadUndo();   // a toggle here may have created an undo point — refresh the header control
}
/* ---- curated DPI-bypass presets (YouTube/Discord/…), applist-style like nikki's.
   Applying one is atomic + detached (z2preset_apply → ?api=z2presetop) with a per-card spinner. */
const z2PresetOp = opPoller({ api: "z2presetop", cardsSel: "#z2presets .pcard", msg: () => $("#z2PresetMsg"),
  onDone: async () => { z2presetsLoaded = false; await loadZ2Presets(); loadZapret2(); } });
async function loadZ2Presets(){
  try { Z2PRESETS = await (await fetch("?api=z2presets")).json(); z2presetsLoaded = true; }
  catch(e){ Z2PRESETS = []; }
  renderZ2Presets();
}
function renderZ2Presets(){
  const box = $("#z2presets"); if (!box) return; box.innerHTML = "";
  if (!Array.isArray(Z2PRESETS) || !Z2PRESETS.length){ box.innerHTML = '<span class="hint">' + t("z2NoPresets") + '</span>'; return; }
  Z2PRESETS.forEach(p => box.appendChild(z2presetCard(p)));
  if (z2PresetOp.st.applyingId) z2PresetOp.mark(z2PresetOp.st.applyingId);   // keep the spinner across re-renders
}
function z2presetCard(p){
  const card = document.createElement("div");
  card.className = "pcard" + (p.active ? " on" : "");
  card.dataset.pid = p.id;
  card.innerHTML =
    '<span class="pname">' + escH(p.name) + '</span>' +
    '<button class="pinfo" title="' + escH(t("pmShow")) + '">?</button>' +
    '<label class="sw"><input type="checkbox"' + (p.active ? " checked" : "") + '><span class="sl"></span></label>';
  card.querySelector(".pinfo").addEventListener("click", () => z2showPresetInfo(p));
  card.querySelector("input").addEventListener("change", e =>
    z2PresetOp.start(p.id, p.name, e.target.checked, "z2preset_apply",
                     { id: p.id, on: e.target.checked ? 1 : 0, name: p.name }, renderZ2Presets));
  return card;
}
function z2showPresetInfo(p){
  $("#pmTitle").textContent = p.name;
  const d = p.domains || [];
  let h = '<div class="pmsub">' + t("tSuffix") + ' (' + d.length + ')</div>';
  h += '<ul class="pmlist">' + d.map(x => '<li>' + escH(x) + '</li>').join("") + '</ul>';
  h += '<div class="pmnote">' + t("z2PresetNote") + '</div>';
  $("#pmBody").innerHTML = h;
  $("#pmodal").hidden = false;
}
function renderZ2(){
  const run = Z2.running === 1;
  const dOk = Z2.desync_ok === 1;
  $("#z2Dot").className = "dot " + (run ? (dOk ? "up" : "warn") : "down");
  $("#z2State").textContent = run ? (dOk ? t("z2On") : t("z2OnNoDesync")) : t("z2Off");
  $("#z2Health").hidden = !(run && !dOk);
  $("#z2Run").checked = run; $("#z2Boot").checked = Z2.boot === 1; $("#z2AutoChk").checked = Z2.autohostlist === 1;
  $("#z2Quic").checked = Z2.quic_block === 1;
  $("#z2Ipv6").checked = Z2.ipv6_off === 1;
  renderStrat();
  const ul = $("#z2UserList"); ul.innerHTML = "";
  const u = Z2HOSTS.user || []; $("#z2UserCount").textContent = "(" + u.length + ")";
  u.forEach(d => { const li = document.createElement("li");
    li.innerHTML = '<input type="checkbox" class="pick" data-key="' + escH(d) + '">' +
      '<span class="dom">' + escH(d) + '</span>' +
      '<span class="ms" data-z2res="' + escH(d) + '"></span>' +
      '<button class="ghost" data-z2try="' + escH(d) + '" title="' + escH(t("z2TryHint")) + '">⟳</button>' +
      '<button class="ghost" data-z2del="' + escH(d) + '">✕</button>';
    ul.appendChild(li); });
  fltRerender(BAR_Z2U);
  $("#z2AutoCount").textContent = "(" + (Z2HOSTS.auto || []).length + ")";
  if (!$("#z2AutoList").hidden) renderZ2Auto();
  const ex = Z2HOSTS.exclude || []; $("#z2ExCount").textContent = "(" + ex.length + ")";
  const el = $("#z2ExList"); el.innerHTML = "";
  ex.forEach(x => { const li = document.createElement("li");
    li.innerHTML = (x.sys ? "" : '<input type="checkbox" class="pick" data-key="' + escH(x.d) + '">') +
      '<span class="dom">' + escH(x.d) + '</span>' +
      (x.sys ? '<span class="badge">' + t("system") + '</span>' : '<button class="ghost" data-z2unex="' + escH(x.d) + '">✕</button>');
    el.appendChild(li); });
  fltRerender(BAR_Z2X);
}
function renderZ2Auto(){
  const ul = $("#z2AutoList"); ul.innerHTML = "";
  (Z2HOSTS.auto || []).forEach(d => { const li = document.createElement("li");
    li.innerHTML = '<input type="checkbox" class="pick" data-key="' + escH(d) + '">' +
      '<span class="dom">' + escH(d) + '</span><button class="ghost" data-z2exclude="' + escH(d) + '" title="' + escH(t("z2NoBypass")) + '">✕</button>';
    ul.appendChild(li); });
  fltRerender(BAR_Z2A);
}
async function z2Do(op, el){
  el.disabled = true; showOverlay(t("applying")); setMsg($("#z2Msg"), t("applying"));
  let s; try { s = await api("z2svc", { op }); } catch(e){ s = {}; }
  hideOverlay(); el.disabled = false;
  if (s && s.ok) setMsg($("#z2Msg"), t("done")); else setMsg($("#z2Msg"), t("errP") + ((s && s.error) || "?"), false);
  loadZapret2();
}
$("#z2Run").addEventListener("change", e => z2Do(e.currentTarget.checked ? "start" : "stop", e.currentTarget));
$("#z2Boot").addEventListener("change", e => z2Do(e.currentTarget.checked ? "enable" : "disable", e.currentTarget));
$("#z2Quic").addEventListener("change", async e => {
  const el = e.currentTarget; el.disabled = true; showOverlay(t("applying")); setMsg($("#z2Msg"), t("applying"));
  let res; try { res = await api("z2quic", { on: el.checked ? 1 : 0 }); } catch(_){ res = {}; }
  hideOverlay(); el.disabled = false;
  if (res && res.ok) setMsg($("#z2Msg"), t("done")); else setMsg($("#z2Msg"), t("errP") + ((res && res.error) || "?"), false);
  loadZapret2();
});
/* ---------- zapret2 strategies (curated NFQWS2_OPT) ---------- */
const STRATS = ["ytdiscord", "default", "youtube", "aggressive", "light"];
let stratBodyLoaded = false;   // guards the editor prefill so a status refresh never clobbers live edits
let stratBodyOrig = "";        // body as loaded, so Apply can tell "edited" from "untouched"
let stratBodySrc = "live";     // "live" = editing the running config, "saved" = your stashed custom one
let stratPending = false;      // user picked an option they haven't applied — a refresh must not reset it
// A <select> doubles as "what's live" and "what am I picking", so the two become indistinguishable the
// moment you touch it. Tag the ACTIVE one in its own label, and say so in plain text under the row.
function stratLabel(id, cur){ return (t("strat_" + id) || id) + (id === cur ? t("stratActiveTag") : ""); }
function renderStrat(){
  const sel = $("#z2Strat");
  const cur = STRATS.includes(Z2.strategy) ? Z2.strategy : "custom";
  // "custom" is always offered now — selecting it opens an editor prefilled with the live NFQWS2_OPT,
  // so you can hand-tune starting from whatever strategy is active.
  const want = STRATS.concat("custom");
  if (sel.dataset.built !== want.join(",")){
    sel.innerHTML = "";
    want.forEach(id => { const o = document.createElement("option"); o.value = id;
      o.textContent = stratLabel(id, cur); sel.appendChild(o); });
    sel.dataset.built = want.join(",");
  } else {
    [...sel.options].forEach(o => { o.textContent = stratLabel(o.value, cur); });
  }
  // never yank a pending choice out from under the user (loadZapret2 re-renders after every z2 action)
  if (!stratPending) sel.value = cur;
  $("#z2StratCur").textContent = t("stratActiveNow") + (t("strat_" + cur) || cur);
  syncStratEditor();
}
// show the raw-config editor only while "custom" is selected; prefill once (never on every refresh)
function syncStratEditor(){
  const isCustom = $("#z2Strat").value === "custom";
  $("#z2StratEdit").hidden = !isCustom;
  if (isCustom && !stratBodyLoaded) loadStratBody();
}
async function loadStratBody(){
  const ta = $("#z2StratBody"); ta.value = "…";
  let src = "live";
  try { const d = await (await fetch("?api=z2stratraw")).json();
    ta.value = (d && d.ok && d.lines) ? d.lines.join("\n") : "";
    src = (d && d.source) || "live";
  } catch(e){ ta.value = ""; }
  stratBodySrc = src;
  stratBodyOrig = ta.value;   // baseline for "did you actually change anything?"
  stratBodyLoaded = true;
}
$("#z2Strat").addEventListener("change", () => {
  stratPending = $("#z2Strat").value !== (STRATS.includes(Z2.strategy) ? Z2.strategy : "custom");
  syncStratEditor();
});
$("#z2StratReset").addEventListener("click", () => { stratBodyLoaded = false; loadStratBody(); });
$("#z2StratApply").addEventListener("click", async () => {
  const id = $("#z2Strat").value;
  const btn = $("#z2StratApply");
  if (id === "custom"){
    const body = $("#z2StratBody").value;
    if (!/--filter/.test(body)){ setMsg($("#z2StratMsg"), t("stratNeedFilter"), false); return; }
    // Saving an untouched body that's ALREADY live restarts zapret2 for nothing and then reads back as
    // whatever curated set it matches — looking like the click did nothing. But an untouched body from the
    // SAVED slot is the whole point of coming back to "Custom": apply it as-is.
    if (stratBodySrc === "live" && body === stratBodyOrig){ setMsg($("#z2StratMsg"), t("stratNoChange")); return; }
    btn.disabled = true; showOverlay(t("applying")); setMsg($("#z2StratMsg"), t("applying"));
    let res; try { res = await api("z2stratsave", { body }); } catch(e){ res = {}; }
    hideOverlay(); btn.disabled = false;
    if (res && res.ok){
      stratBodyLoaded = false; stratPending = false;
      // identity is derived from the body, so these options may equal a curated strategy — say so plainly
      // instead of letting the dropdown silently snap to a name the user never picked.
      setMsg($("#z2StratMsg"), res.strategy && res.strategy !== "custom"
        ? t("stratMatched") + (t("strat_" + res.strategy) || res.strategy) : t("done"));
    } else setMsg($("#z2StratMsg"), t("errP") + ((res && res.error) || "?"), false);
    loadZapret2();
    return;
  }
  if (id === Z2.strategy){ stratPending = false; setMsg($("#z2StratMsg"), t("stratSame")); return; }
  btn.disabled = true;
  showOverlay(t("applying")); setMsg($("#z2StratMsg"), t("applying"));
  let res; try { res = await api("z2strat", { id }); } catch(e){ res = {}; }
  hideOverlay(); btn.disabled = false;
  if (res && res.ok){ setMsg($("#z2StratMsg"), t("done")); stratPending = false; }
  else setMsg($("#z2StratMsg"), t("errP") + ((res && res.error) || "?"), false);
  loadZapret2();
});
$("#z2Ipv6").addEventListener("change", async e => {
  const el = e.currentTarget;
  if (el.checked && !confirm(t("z2Ipv6Confirm"))){ el.checked = false; return; }
  el.disabled = true; showOverlay(t("applying")); setMsg($("#z2Msg"), t("applying"));
  let res; try { res = await api("z2ipv6", { on: el.checked ? 1 : 0 }); } catch(_){ res = {}; }
  hideOverlay(); el.disabled = false;
  if (res && res.ok) setMsg($("#z2Msg"), t("done")); else setMsg($("#z2Msg"), t("errP") + ((res && res.error) || "?"), false);
  loadZapret2();
});
/* ---------- storage: what is eating the flash ----------
   Routers ship 60-128 MB and GeoIP.dat alone is ~17 MB of it; the dev box hit 100 % full unnoticed,
   which is where config writes start failing. Rules are deliberately NOT offered as a lever — all of
   them together weigh ~19 KB, so "turn off a preset to free space" would promise megabytes that don't
   exist. Only the blobs move the needle. */
// compact "how long ago" for health timestamps
function agoStr(epoch){
  if (!epoch) return "";
  const m = Math.max(0, Math.round(Date.now() / 1000 - epoch) / 60);
  if (m < 60) return Math.round(m) + " " + t("agoMin");
  const h = m / 60;
  return (h < 24 ? Math.round(h) + " " + t("agoHour") : Math.round(h / 24) + " " + t("agoDay"));
}
// Bytes only mean something once there are some: a redirect legitimately carries no body, and
// "0 KB" there reads like a failure when the probe in fact succeeded.
function sizeStr(b){ return b >= 1024 ? Math.round(b / 1024) + " " + t("unitKb") : b + " " + t("unitB"); }
const mb = kb => (kb / 1024).toFixed(1) + " MB";
async function loadStorage(){
  let s; try { s = await (await fetch("?api=storage")).json(); } catch(e){ return; }
  if (!s || !s.total_kb) return;
  const lowPct = s.free_kb / s.total_kb < 0.1, lowAbs = s.free_kb < 5120;
  $("#stFreeVal").textContent = mb(s.free_kb) + " / " + mb(s.total_kb);
  $("#stFreeVal").style.color = (lowPct || lowAbs) ? "var(--bad, #e05252)" : "";
  const rows = [
    ["GeoIP.dat", s.geoip_kb, t("stGeoipWhat")],
    ["GeoSite.dat", s.geosite_kb, t("stGeositeWhat")],
    ["Country.mmdb", s.mmdb_kb, t("stMmdbWhat")],
    ["zapret2", s.z2_kb, ""],
    [t("stOwnState"), s.state_kb, ""]
  ].filter(r => r[1] > 0);
  $("#stRows").innerHTML = rows.map(r =>
    '<div class="uprow"><span class="upname">' + escH(r[0]) + (r[2] ? ' <span class="hint">' + escH(r[2]) + '</span>' : "") +
    '</span><span class="upver">' + mb(r[1]) + '</span></div>').join("");
  // the blob is only worth its size while a service-category rule needs it
  const btn = $("#stGeoipBtn"), hint = $("#stHint");
  if (s.geoip_kb > 0){
    btn.hidden = false;
    btn.textContent = t("stGeoipDrop") + " (" + mb(s.geoip_kb) + ")";
    hint.hidden = false;
    hint.textContent = s.geoip_needed ? t("stGeoipNeeded")(s.geoip_needed) : t("stGeoipUnused");
  } else { btn.hidden = true; hint.hidden = true; }
  if (lowPct || lowAbs) setMsg($("#stMsg"), t("stLow"), false);
}
$("#stGeoipBtn").addEventListener("click", async () => {
  if (!confirm(t("stGeoipConfirm"))) return;
  const b = $("#stGeoipBtn"); b.disabled = true; showOverlay(t("applying")); setMsg($("#stMsg"), t("applying"));
  let r; try { r = await api("geoipdrop", {}); } catch(e){ r = { error: "timeout" }; }
  hideOverlay(); b.disabled = false;
  setMsg($("#stMsg"), (r && r.log) || (r && r.error) || t("errP"), !!(r && r.ok));
  loadStorage(); loadDomains();
});

/* ---------- "why doesn't THIS site open?" — per-domain verdict ----------
   Answers the question users actually ask. Resolves the domain the way mihomo will: against the rules in
   the LIVE config, first match wins — so it reports what the router really does, not what the panel
   believes it configured. GEOSITE rules can't be evaluated here (they need the .dat blobs), so any that
   sit above the match are surfaced as a caveat rather than quietly ignored. */
async function dcCheck(dom){
  const box = $("#dcResult"), btn = $("#dcBtn");
  btn.disabled = true; setMsg($("#dcMsg"), t("applying"));
  let d; try { d = await api("domaincheck", { domain: dom }); } catch(e){ d = {}; }
  btn.disabled = false;
  if (!d || !d.ok){ setMsg($("#dcMsg"), t("errP") + ((d && d.error) || "?"), false); box.hidden = true; return; }
  setMsg($("#dcMsg"), "");
  const rows = [];
  const add = (state, msg) => rows.push({ state, msg });
  const viaVpn = d.target && !["DIRECT", "REJECT", "REJECT-DROP", "PASS", ""].includes(d.target);
  if (viaVpn){
    add("ok", t("dcViaVpn")(d.target, d.type === "MATCH" ? t("dcByDefault") : d.type + " " + d.value));
    if (!d.target_live) add("bad", t("dcGroupDead")(d.target));
    else if (d.delay === "x") add("bad", t("dcNodeDead")(d.node || "?"));
    else add("ok", t("dcNodeOk")(d.node, d.delay));
  } else if (d.target === "REJECT" || d.target === "REJECT-DROP"){
    add("info", t("dcBlocked")(d.type === "MATCH" ? t("dcByDefault") : d.type + " " + d.value));
  } else {
    add(d.z2 ? "info" : "warn", t("dcDirect")(d.type === "MATCH" ? t("dcByDefault") : d.type + " " + d.value));
  }
  // the other engine: zapret2 needs no rule of ours, only its hostlist
  if (d.z2) add(d.z2_running ? "ok" : "bad", d.z2_running ? t("dcZ2On")(d.z2_list) : t("dcZ2Down")(d.z2_list));
  else if (!viaVpn) add("info", t("dcNoEngine"));
  if (d.geosite_before > 0) add("info", t("dcGeoCaveat")(d.geosite_before));
  box.innerHTML = ""; box.hidden = false;
  const render = e => {
    const div = document.createElement("div"); div.className = "ytrow " + e.state;
    div.innerHTML = '<span class="ytic">' + (e.state === "ok" ? "✓" : e.state === "bad" ? "✕" : e.state === "warn" ? "!" : "·") + '</span>' +
                    '<span class="ytmsg">' + escH(e.msg) + '</span>';
    box.appendChild(div); return div;
  };
  rows.forEach(render);
  // Routing is only half the answer — now actually try to open it. Kept as a second call so the routing
  // verdict shows immediately instead of waiting out a probe that can run to a 12 s timeout.
  const pending = render({ state: "info", msg: t("dcProbing") });
  let p; try { p = await api("reachcheck", { domain: d.domain }); } catch(e){ p = {}; }
  pending.remove();
  if (p && p.ok){
      if (p.verdict === "ok") render({ state: "ok", msg: (p.code >= 300 && p.code < 400) ? t("dcOpenRedir")(p.code) : t("dcOpenOk")(p.code, sizeStr(p.bytes)) });
    else if (p.verdict === "throttled") render({ state: "bad", msg: t("dcOpenThrottled")(sizeStr(p.bytes), p.secs) });
    else if (p.verdict === "dpi") render({ state: "bad", msg: t("dcOpenDpi") });
    else if (p.verdict === "challenge") render({ state: "info", msg: t("dcOpenChallenge") });
    render({ state: "info", msg: t("dcProbeCaveat") });
  }
}
$("#dcForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#dcInput").value.trim(); if (v) dcCheck(v);
});

/* ---------- one-click "why isn't the VPN working?" (nikki side) ----------
   Walks the chain in the order it actually breaks and stops being green at the first broken link. The
   load-bearing checks are the ones comparing INTENT with REALITY (uci_rules vs live_rules/first_hit,
   base_dead): every silent failure we have seen looked fine from the panel's own state. */
async function nkDiagCheck(){
  const btn = $("#nkDiagBtn"); btn.disabled = true; setMsg($("#nkDiagMsg"), t("applying"));
  let d; try { d = await (await fetch("?api=nikkidiag")).json(); }
  catch(e){ setMsg($("#nkDiagMsg"), t("errP"), false); btn.disabled = false; return; }
  setMsg($("#nkDiagMsg"), ""); btn.disabled = false;
  const box = $("#nkDiagResult"); box.innerHTML = ""; box.hidden = false;
  const rows = [];
  const add = (state, msg, fix) => rows.push({ state, msg, fix });
  if (!d.present){ add("bad", t("nkDiagNoNikki")); }
  else if (!d.running){
    add("bad", (!d.profile_ok || !d.enabled) ? t("nkDiagUnconf") : t("nkDiagDown"),
        (!d.profile_ok || !d.enabled) ? { label: t("nikkiUnconfFix"), action: "nikkiinit" }
                                      : { label: t("svcRestart"), action: "svc", params: { op: "restart" } });
  } else {
    add("ok", t("nkDiagRunning"));
    // intent vs reality — the check that was missing everywhere
    if (d.uci_rules > 0 && d.first_hit !== 1)
      add("bad", t("nkDiagRulesLost")(d.uci_rules), { label: t("svcReload"), action: "svc", params: { op: "reload" } });
    else if (d.uci_rules > 0) add("ok", t("nkDiagRulesLive")(d.uci_rules));
    else add("info", t("nkDiagNoRules"));
    // the exit group must exist for "→ VPN" to resolve at all
    if (d.nodes > 0 && !d.exit_group) add("bad", t("nkDiagNoGroup"), { label: t("nkDiagFixGroup"), action: "noderegen" });
    // rules aimed at a profile group that can only reach DIRECT go nowhere — the friend's exact failure
    if (d.base_dead && d.legacy > 0)
      add("bad", t("nkDiagDeadBase")(d.legacy), { label: t("migrateRules"), action: "migraterules" });
    // nodes
    if (!d.quic_block) add("warn", t("nkDiagQuic"));
    if (d.nodes === 0) add("info", t("nkDiagNoNodes"));
    else if (d.nodes_on === 0) add("bad", t("nkDiagAllOff"));
    else if (d.delay === "x") add("bad", t("nkDiagNodeDead"));
    else add("ok", t("nkDiagNodeOk")(d.active, d.delay));
  }
  rows.forEach(e => {
    const div = document.createElement("div"); div.className = "ytrow " + e.state;
    div.innerHTML = '<span class="ytic">' + (e.state === "ok" ? "✓" : e.state === "bad" ? "✕" : e.state === "warn" ? "!" : "·") + '</span>' +
                    '<span class="ytmsg">' + escH(e.msg) + '</span>';
    if (e.fix){
      const b = document.createElement("button"); b.className = "ghost"; b.textContent = e.fix.label;
      b.addEventListener("click", async () => {
        b.disabled = true; showOverlay(t("applying"));
        try { await api(e.fix.action, e.fix.params || {}); } catch(err){}
        hideOverlay(); loadSvc(); loadNodes(); loadDomains(); nkDiagCheck();
      });
      div.appendChild(b);
    }
    box.appendChild(div);
  });
}
$("#nkDiagBtn").addEventListener("click", nkDiagCheck);

/* ---------- "why doesn't it work on THIS device?" — a 60-second capture ----------
   The third diagnostic, for what the other two structurally cannot answer: both of them reason about
   ROUTING, and routing looks identical for the TV that works and the phone that doesn't. This one
   watches one device's actual packets — conntrack sees the flows that never reached mihomo, and those
   are exactly the ones invisible everywhere else in this panel.
   The user is a PARTICIPANT here, unlike every other operation: nothing shows up unless they reproduce
   the problem inside the window. Hence a countdown and an instruction instead of a spinner.
   All the analysis lives in /usr/bin/nikki-unblock-trace — the same tool that prints the text report
   over ssh. The server runs it with --json through the standard detached-op machinery; nothing about
   conntrack is re-implemented here or in the CGI. */
const TA = { client: null, polling: false, tick: null, left: null };
async function loadTraceDevs(){
  const sel = $("#taDev"); if (!sel) return;
  let d; try { d = await (await fetch("?api=devicesall")).json(); } catch(e){ d = null; }
  // Two kinds of row this list must not offer. No address = nothing to filter conntrack by. And
  // lan_ok=false = the address belongs to ANOTHER router's subnet (static hosts carried over from a
  // cloned config), so its packets never pass through here — picking one burns 60 s to produce an empty
  // report that reads like "nothing was wrong". Fall back to the unfiltered list if the check knocked
  // everything out, so a router whose LAN we failed to detect is still usable.
  const withIp = ((d && d.devices) || []).filter(x => x.ip);
  const local = withIp.filter(x => x.lan_ok !== false);
  const devs = local.length ? local : withIp;
  const keep = sel.value;
  sel.innerHTML = devs.map(x => '<option value="' + escH(x.ip) + '">' +
                                escH((x.name || x.mac) + " · " + x.ip) + '</option>').join("");
  if (keep && devs.some(x => x.ip === keep)) sel.value = keep;
  $("#taBtn").disabled = !devs.length;
  if (!devs.length) setMsg($("#taMsg"), t("taNoDevs"), false);
}
function taOpen(){
  if (MODE === "simple" || !CAPS.nikki) return;   // .adv block — hidden in simple mode, pointless without nikki
  loadTraceDevs();
  if (!TA.polling) taPoll();                      // a capture started before a page reload resumes here
}
/* The countdown ticks LOCALLY once a second. Driving it straight off the poll made it jump in
   3-second steps — the runner only rewrites its phase that often — and a timer that skips looks
   broken to the person watching it, who has been asked to keep reproducing the problem until it ends.
   The server phase stays the authority: it corrects the local count on every poll. */
function taShowRun(phase){
  const n = parseInt(phase, 10);
  TA.left = isNaN(n) ? null : n;
  taPaint();
  if (!TA.tick) TA.tick = setInterval(() => {
    if (TA.left === null || TA.left <= 0) return;
    TA.left--; taPaint();
  }, 1000);
}
function taPaint(){
  const counting = TA.left !== null && TA.left > 0;
  $("#taRun").hidden = false;
  $("#taNow").hidden = !counting;
  $("#taCount").textContent = counting ? TA.left + " " + t("taSec") : "";
  $("#taPhase").textContent = counting ? "" : t("taParsing");
}
function taStopTick(){ if (TA.tick){ clearInterval(TA.tick); TA.tick = null; } TA.left = null; }
async function taPoll(){
  TA.polling = true;
  let s = null; try { s = await (await fetch("?api=traceop")).json(); } catch(e){}
  if (s && s.running){
    if (!TA.client) TA.client = s.id;   // adopted after a reload: the op file is the only source of truth
    taShowRun(s.phase);
    setTimeout(taPoll, 1000); return;
  }
  TA.polling = false;
  // Accept a completion only for OUR operation. A poll that takes any done=1 it happens to see was the
  // exact bug that produced three false diagnoses in a row while this was being built.
  if (!s || !s.done || (TA.client && s.id !== TA.client)) return;
  taStopTick();
  $("#taRun").hidden = true; $("#taBtn").disabled = false; TA.client = null;
  if (s.ok !== 1){ setMsg($("#taMsg"), t("taFail"), false); return; }
  // The runner renames the report into place BEFORE marking the op done, so it is already there. One
  // retry covers the odd filesystem that disagrees, and costs nothing when it doesn't happen.
  let d = await api2("traceresult");
  if (!d || !d.ok){ await new Promise(r => setTimeout(r, 500)); d = await api2("traceresult"); }
  if (!d || !d.ok){ setMsg($("#taMsg"), t("taFail"), false); return; }
  setMsg($("#taMsg"), t("done"));
  taRender(d);
}
async function api2(name){ try { return await (await fetch("?api=" + name)).json(); } catch(e){ return null; } }
/* One destination usually shows up as a dozen flows (a new source port each retry) — collapsing them
   keeps the report about DESTINATIONS, which is what the reader can act on. */
function taGroup(arr, keyf){
  const m = new Map();
  (arr || []).forEach(r => {
    const k = keyf(r), g = m.get(k);
    if (g){ g.n++; g.sent += (r.sent || 0); g.recv += (r.recv || 0); g.secs = Math.max(g.secs || 0, r.secs || 0); }
    else m.set(k, Object.assign({ n: 1 }, r));
  });
  return [...m.values()];
}
function taHint(txt){
  const el = document.createElement("div"); el.className = "ythint"; el.textContent = txt; return el;
}
function taRender(d){
  const rows = [];
  const add = (state, msg, fix) => rows.push({ state, msg, fix });
  const where = r => (r.host || r.dst) + ":" + r.port;
  const many = r => where(r) + (r.n > 1 ? " ×" + r.n : "");
  // Leaving past the tunnel is NOT a fault by itself — plenty of traffic is supposed to, and plenty
  // more works perfectly while doing it. Only a flow that got NOTHING BACK is evidence of a problem.
  // Reported: a working IPsec flow (traffic in both directions) was listed as broken and offered a
  // "fix", which is how a diagnostic loses the reader's trust in one screen.
  // The split happens on the router — d.escaped is already only the silent ones, d.escaped_ok counts
  // the rest — so a chatty device can't push the flows that matter out of the report's size cap.
  taGroup(d.escaped, r => r.why + "|" + r.proto + "|" + where(r)).forEach(r => {
    const w = many(r);
    if (r.why === "port" && r.proto === "tcp")
      add("bad", t("taEscPort")(w, r.port), { label: t("taAllPorts"), action: "allports", params: { on: 1 } });
    // One switch, not a button per port. A service picks its ports per session, so adding the one that
    // happened to show up here is whack-a-mole; the gate belongs open, and rules decide the routing.
    else if (r.why === "port")
      add("bad", t("taEscPortU")(w, r.port),
          { label: t("taAllPorts"), action: "allports", params: { on: 1 }, note: "taUdpNote" });
    else if (r.why === "quic") add("info", t("taEscQuic")(w));
    else if (r.why === "excluded") add("info", t("taEscExcluded")(w));
    else if (r.why === "reserved") add("info", t("taEscReserved")(w));
    // A flow older than the rules stays direct until it is re-established — restarting nikki is what
    // makes the app reconnect into the current rules.
    else add("info", t("taEscOld")(w), { label: t("taRestartFix"), action: "svc", params: { op: "restart" } });
  });
  // The rest left the tunnel and worked. One counting line, no addresses: it is context, not a finding.
  if (d.escaped_ok > 0) add("info", t("taEscFine")(d.escaped_ok));
  // NOTE: no "add this IP to the rules" button anywhere above. For an escaped flow a rule is useless
  // by construction — the traffic never reached mihomo, so no rule of ours could have matched it.
  // Widening the interception is the only thing that can change that, which is why it is the only fix
  // offered here.
  taGroup(d.syn, r => where(r)).forEach(r => {
    const msg = t("taSyn")(many(r), r.secs) + " · " + (r.path === "tunnel" ? t("taSynTun") : t("taSynDir"));
    // Testable only when a name is known for the address — that is what tells "the address is dead"
    // apart from "the name is what's blocked".
    add("bad", msg, r.host ? { label: t("taSniBtn"), probe: { ip: r.dst, host: r.host, port: r.port } } : null);
  });
  taGroup(d.stall, r => where(r)).forEach(r => add("bad", t("taStall")(many(r), r.sent)));
  (d.direct || []).filter(r => r.recv === 0 && /[a-z]/i.test(r.host)).forEach(r =>
    add("bad", t("taDirect")(r.host, r.cnt),
        { label: t("taAddDom"), action: "add", params: { type: "DOMAIN-SUFFIX", domain: r.host, node: EXITG } }));
  const tun = (d.healthy && d.healthy.tunnel) || 0;
  if (!rows.length) add("info", (!tun && !(d.mihomo && d.mihomo.decisions)) ? t("taNoTraffic") : t("taClean"));
  // Healthy flows never leave the router — only their count does. The report carries every address the
  // device talked to, with host names, and this panel gets handed to friends.
  add("info", t("taHealthy")(tun));

  const box = $("#taResult"); box.innerHTML = ""; box.hidden = false; delete box.dataset.stale;
  // One fix, one button. Ten destinations missing the same TCP port produce ten identical rows, and
  // each carrying its own "intercept every port" button was worse than useless: the first click fixed
  // it and the rest stayed clickable, offering to re-apply a setting that was already on.
  const offered = new Set();
  rows.forEach(e => {
    const div = document.createElement("div"); div.className = "ytrow " + e.state;
    div.innerHTML = '<span class="ytic">' + (e.state === "ok" ? "✓" : e.state === "bad" ? "✕" : e.state === "warn" ? "!" : "·") + '</span>' +
                    '<span class="ytmsg">' + escH(e.msg) + '</span>';
    if (e.fix && !e.fix.probe){
      const sig = e.fix.action + "|" + JSON.stringify(e.fix.params || {});
      if (offered.has(sig)) e = { ...e, fix: null }; else offered.add(sig);
    }
    if (e.fix){
      const b = document.createElement("button"); b.className = "ghost"; b.textContent = e.fix.label;
      b.addEventListener("click", async () => {
        b.disabled = true;
        if (e.fix.probe){
          b.textContent = t("taSniRun");
          const p = await api("snitest", e.fix.probe);
          b.remove();
          const v = (p && p.ok) ? p.verdict : null;
          div.insertAdjacentElement("afterend", taHint(
            (v === "sni" ? t("taSniSni")(e.fix.probe.host) : v === "dead" ? t("taSniDead")
             : v === "ok" ? t("taSniOk") : t("errP")) + (v ? " " + t("taSniCaveat") : "")));
          return;
        }
        showOverlay(t("applying"));
        const r = await api(e.fix.action, e.fix.params || {});
        hideOverlay(); loadSvc(); loadDomains();
        const failed = r && r.ok === false;
        setMsg($("#taMsg"), failed ? (t("errP") + (r.error || "?")) : t("done"), !failed);
        if (failed){ b.disabled = false; return; }
        // The rows below were computed against the settings as they were BEFORE this fix, so they are
        // now a snapshot of the past — say so instead of letting them read as the current state.
        if (e.fix.note) div.insertAdjacentElement("afterend", taHint(t(e.fix.note)));
        if (!box.dataset.stale){ box.dataset.stale = "1"; box.appendChild(taHint(t("taStale"))); }
      });
      div.appendChild(b);
    }
    box.appendChild(div);
  });
}
$("#taBtn").addEventListener("click", async () => {
  const ip = $("#taDev").value;
  if (!ip){ setMsg($("#taMsg"), t("taPickDev"), false); return; }
  $("#taBtn").disabled = true; $("#taResult").hidden = true;
  TA.client = ip; taShowRun(60);
  const r = await api("tracestart", { client: ip });
  if (!(r && r.ok && r.started)){
    taStopTick();
    $("#taRun").hidden = true; $("#taBtn").disabled = false; TA.client = null;
    setMsg($("#taMsg"), (r && r.error === "busy") ? t("taBusy")
                      : (r && r.error === "foreign") ? t("taForeign")(ip, r.lan || "?")
                      : t("errP") + ((r && r.error) || "?"), false);
    return;
  }
  setMsg($("#taMsg"), "");
  if (!TA.polling) taPoll();
});

/* ---------- one-click YouTube diagnostics ---------- */
async function ytCheck(){
  const btn = $("#ytBtn"); btn.disabled = true; setMsg($("#ytMsg"), t("applying"));
  let d; try { d = await (await fetch("?api=ytdiag")).json(); } catch(e){ setMsg($("#ytMsg"), t("errP"), false); btn.disabled = false; return; }
  setMsg($("#ytMsg"), ""); btn.disabled = false;
  const box = $("#ytResult"); box.innerHTML = ""; box.hidden = false;
  // Two buckets: definite pass/fail checks (ok/bad) vs. optional advisories (warn/info). The advisories
  // are non-critical nudges — with the checks green, the bypass already works — so they render under a
  // separate "не обязательно" divider instead of looking like errors stacked on the checks.
  const checks = [], hints = [];
  const add = (bucket, state, msg, fix) => bucket.push({ state, msg, fix });
  const render = (entry) => {
    const div = document.createElement("div"); div.className = "ytrow " + entry.state;
    div.innerHTML = '<span class="ytic">' + (entry.state === "ok" ? "✓" : entry.state === "bad" ? "✕" : entry.state === "warn" ? "!" : "·") + '</span>' +
                    '<span class="ytmsg">' + escH(entry.msg) + '</span>';
    if (entry.fix){
      const b = document.createElement("button"); b.className = "ghost"; b.textContent = entry.fix.label;
      b.addEventListener("click", async () => {
        b.disabled = true; showOverlay(t("applying"));
        try { await api(entry.fix.action, entry.fix.params || {}); } catch(e){}
        hideOverlay(); loadZapret2(); ytCheck();
      });
      div.appendChild(b);
    }
    box.appendChild(div);
  };
  if (!d.present){ render({ state: "bad", msg: t("ytNotInstalled") }); return; }
  // service health
  if (!d.running) add(checks, "bad", t("ytNotRunning"), { label: t("ytFixStart"), action: "z2svc", params: { op: "restart" } });
  else if (!d.desync_ok) add(checks, "bad", t("ytNoDesync"), { label: t("svcRestart"), action: "z2svc", params: { op: "restart" } });
  else add(checks, "ok", t("ytRunning"));
  // googlevideo coverage
  if (d.gv_covered) add(checks, "ok", d.gv_listed ? t("ytGvListed") : t("ytGvAuto"));
  else add(checks, "bad", t("ytGvMissing"), { label: t("ytFixGv"), action: "z2hostadd", params: { domain: "googlevideo.com" } });
  // QUIC — a clear verdict either way, so it's a check
  if (d.quic_block) add(checks, "ok", t("ytQuicBlocked"));
  else if (d.quic_handled) add(checks, "ok", t("ytQuicHandled"));
  else add(hints, "warn", t("ytQuicNone"), { label: t("ytFixQuicBlock"), action: "z2quic", params: { on: 1 } });
  // IPv6 leak — advisory
  if (!d.ipv6_off) add(hints, "warn", t("ytIpv6On"), { label: t("z2Ipv6Label"), action: "z2ipv6", params: { on: 1 } });
  // strategy nudge if still on a generic one — advisory
  if (d.strategy !== "youtube" && d.strategy !== "aggressive")
    add(hints, "warn", t("ytStratHint"), { label: t("strat_youtube"), action: "z2strat", params: { id: "youtube" } });
  checks.forEach(render);
  if (hints.length){
    const sep = document.createElement("div"); sep.className = "ytsep";
    sep.textContent = t("ytHintsTitle"); box.appendChild(sep);
    hints.forEach(render);
  }
  const foot = document.createElement("div"); foot.className = "ythint"; foot.textContent = t("ytFootnote");
  box.appendChild(foot);
}
$("#ytBtn").addEventListener("click", ytCheck);
$("#z2Restart").addEventListener("click", e => z2Do("restart", e.currentTarget));
$("#z2Reload").addEventListener("click", e => z2Do("reload", e.currentTarget));
$("#z2Form").addEventListener("submit", async e => {
  e.preventDefault(); const d = $("#z2Domain").value.trim(); if (!d) return;
  $("#z2Btn").disabled = true; showOverlay(t("applying")); setMsg($("#z2DomMsg"), t("applying"));
  const res = await api("z2hostadd", { domain: d });
  hideOverlay(); $("#z2Btn").disabled = false;
  if (res.ok){ setMsg($("#z2DomMsg"), res.dup ? t("dup") : t("done")); $("#z2Domain").value = ""; loadZapret2(); }
  else setMsg($("#z2DomMsg"), t("errP") + (res.error || "?"), false);
});
// Probe one zapret2 domain and, when the desync provably cannot fix it, offer to route it instead.
// The distinction is the whole point: a broken handshake is a strategy problem, but throttling and IP
// blocks are decided on the destination address, where no amount of desync helps and only a tunnel does.
async function z2Try(dom){
  const cell = document.querySelector('[data-z2res="' + CSS.escape(dom) + '"]');
  if (cell) cell.textContent = "…";
  let r; try { r = await api("z2reach", { domain: dom }); } catch(e){ r = {}; }
  if (!cell) return;
  if (!r || !r.ok){ cell.textContent = t("errP"); return; }
  if (r.path === "tunnel"){ cell.textContent = t("z2ResTunnel")(r.tunnel_target); return; }
  if (r.verdict === "ok"){
    cell.textContent = (r.code >= 300 && r.code < 400) ? t("z2ResOkRedir")(r.code) : t("z2ResOk")(sizeStr(r.bytes));
    return;
  }
  if (r.verdict === "challenge"){ cell.textContent = t("z2ResChallenge"); return; }
  cell.textContent = r.verdict === "throttled" ? t("z2ResThrottled")(sizeStr(r.bytes)) : t("z2ResDpi");
  // only offer the move where routing is genuinely the answer
  if (r.verdict === "throttled"){
    const b = document.createElement("button");
    b.className = "ghost"; b.textContent = t("z2MoveBtn");
    b.addEventListener("click", async () => {
      b.disabled = true; showOverlay(t("applying"));
      let m; try { m = await api("z2move", { domain: dom }); } catch(e){ m = {}; }
      hideOverlay();
      if (m && m.ok){ setMsg($("#z2DomMsg"), t("z2MovedTo")(m.node)); loadZapret2(); loadDomains(); }
      else { setMsg($("#z2DomMsg"), t("errP") + ((m && m.error) || "?"), false); b.disabled = false; }
    });
    cell.appendChild(document.createTextNode(" ")); cell.appendChild(b);
  }
}
$("#z2UserList").addEventListener("click", async e => {
  const tb = e.target.closest("button[data-z2try]");
  if (tb){ z2Try(tb.dataset.z2try); return; }
  const b = e.target.closest("button[data-z2del]"); if (!b) return;
  b.disabled = true; showOverlay(t("removing")); setMsg($("#z2DomMsg"), t("removing"));
  const res = await api("z2hostdel", { domain: b.dataset.z2del });
  hideOverlay();
  if (res.ok){ setMsg($("#z2DomMsg"), t("done")); loadZapret2(); }
  else { setMsg($("#z2DomMsg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
});
$("#z2AutoChk").addEventListener("change", async e => {
  const on = e.currentTarget.checked ? 1 : 0;
  e.currentTarget.disabled = true; showOverlay(t("applying")); setMsg($("#z2AutoMsg"), t("applying"));
  const res = await api("z2autotoggle", { on });
  hideOverlay(); e.currentTarget.disabled = false;
  if (res && res.ok) setMsg($("#z2AutoMsg"), t("done")); else setMsg($("#z2AutoMsg"), t("errP") + ((res && res.error) || "?"), false);
  loadZapret2();
});
$("#z2AutoView").addEventListener("click", () => {
  const ul = $("#z2AutoList"), bar = $("#z2AutoBar");
  if (ul.hidden){ renderZ2Auto(); ul.hidden = false; bar.hidden = false; }
  else { ul.hidden = true; bar.hidden = true; }
});
$("#z2AutoClear").addEventListener("click", async e => {
  if (!confirm(t("z2ClearConfirm"))) return;
  e.currentTarget.disabled = true; showOverlay(t("applying")); setMsg($("#z2AutoMsg"), t("applying"));
  const res = await api("z2autoclear", {});
  hideOverlay(); e.currentTarget.disabled = false;
  if (res.ok){ setMsg($("#z2AutoMsg"), t("done")); loadZapret2(); }
  else setMsg($("#z2AutoMsg"), t("errP") + (res.error || "?"), false);
});
$("#z2AutoPrune").addEventListener("click", async e => {
  e.currentTarget.disabled = true; showOverlay(t("applying")); setMsg($("#z2AutoMsg"), t("applying"));
  const res = await api("z2autoprune", {});
  hideOverlay(); e.currentTarget.disabled = false;
  if (res && res.ok){ setMsg($("#z2AutoMsg"), t("z2Pruned") + res.removed); loadZapret2(); }
  else setMsg($("#z2AutoMsg"), t("errP") + ((res && res.error) || "?"), false);
});
function z2suffixChain(d){
  // "rr1.sn-abc.googlevideo.com" → [itself, "sn-abc.googlevideo.com", "googlevideo.com"] (never the bare TLD)
  const p = d.split(".");
  const out = [d];
  for (let i = 1; i <= p.length - 2; i++) out.push(p.slice(i).join("."));
  return out;
}
async function z2doExclude(d){
  showOverlay(t("applying")); setMsg($("#z2AutoMsg"), t("applying"));
  const res = await api("z2exclude", { domain: d });
  hideOverlay();
  if (res.ok){ setMsg($("#z2AutoMsg"), t("done")); loadZapret2(); }
  else setMsg($("#z2AutoMsg"), t("errP") + (res.error || "?"), false);
}
$("#z2AutoList").addEventListener("click", e => {
  const b = e.target.closest("button[data-z2exclude]"); if (!b) return;
  const d = b.dataset.z2exclude, opts = z2suffixChain(d);
  if (opts.length < 2){ z2doExclude(d); return; }
  $("#pmTitle").textContent = t("z2NoBypass");
  let h = '<div class="pmsub">' + t("z2ExPick") + '</div>';
  opts.forEach((o, i) => {
    h += '<button class="ghost exopt" data-exd="' + escH(o) + '"><code>' + escH(o) + '</code><br><small>' +
         t(i === 0 ? "z2ExAsIs" : "z2ExAll") + '</small></button>';
  });
  h += '<div class="pmnote">' + t("z2ExNote") + '</div>';
  $("#pmBody").innerHTML = h;
  $("#pmBody").querySelectorAll("button[data-exd]").forEach(btn =>
    btn.addEventListener("click", () => { $("#pmodal").hidden = true; z2doExclude(btn.dataset.exd); }));
  $("#pmodal").hidden = false;
});
$("#z2ExList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-z2unex]"); if (!b) return;
  b.disabled = true; showOverlay(t("removing")); setMsg($("#z2ExMsg"), t("removing"));
  const res = await api("z2unexclude", { domain: b.dataset.z2unex });
  hideOverlay();
  if (res.ok){ setMsg($("#z2ExMsg"), t("done")); loadZapret2(); }
  else { setMsg($("#z2ExMsg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
});

/* ---------- presets + autosync loaders ---------- */
async function loadPresets(){
  const box = $("#presets");
  if (!presetsReady) skelPresets();
  try {
    PRESETS = await (await fetch("?api=presets")).json();
    if (!Array.isArray(PRESETS) || !PRESETS.length) throw 0;
    presetsReady = true;
    renderPresets(); renderList();  // re-filter the list now that preset ownership is known
  } catch(e){ PRESETS = []; box.innerHTML = ""; setMsg($("#presetMsg"), t("listsNA"), false); }
}
async function loadAutosync(){
  try {
    const s = await (await fetch("?api=autosync")).json();
    $("#autoOn").checked = !!s.enabled; $("#autoIv").value = s.interval || "24h"; $("#autoIv").disabled = !s.enabled;
  } catch(e){}
}
async function saveAutosync(){
  const on = $("#autoOn").checked ? 1 : 0;
  $("#autoIv").disabled = !on;
  setMsg($("#autoMsg"), t("saving"));
  const res = await api("autosync", { on, interval: $("#autoIv").value });
  if (res.ok) setMsg($("#autoMsg"), res.enabled ? (t("en_") + " · " + res.interval) : t("dis_"));
  else setMsg($("#autoMsg"), t("errP"), false);
}
$("#autoOn").addEventListener("change", saveAutosync);
$("#autoIv").addEventListener("change", saveAutosync);

/* ---------- vpn nodes ---------- */
let NODES = [], PROVIDERS = [], NODEMODE = "fallback", EXITG = "UNBLOCK";
async function loadNodes(){
  let d; try { d = await (await fetch("?api=nodes")).json(); } catch(e){ d = {}; }
  NODES = (d && d.nodes) || []; PROVIDERS = (d && d.providers) || [];
  NODEMODE = (d && d.mode) || "fallback";
  document.querySelectorAll("#nodeMode button").forEach(b => b.classList.toggle("on", b.dataset.mode === NODEMODE));
  $("#modeHint").textContent = NODEMODE === "urltest" ? t("modeAutoHint") : t("modePriHint");
  const ul = $("#nodeList"); ul.innerHTML = "";
  NODES.forEach((n, i) => {
    const off = n.enabled === 0;
    const li = document.createElement("li");
    // order is the priority chain in fallback mode; url-test picks by latency and ignores it entirely,
    // so dragging there would save an order that changes nothing
    li.draggable = NODEMODE !== "urltest"; li.dataset.name = n.name; if (off) li.classList.add("off");
    const src = n.sub ? t("nodeFromSub") + " " + n.sub : (n.kind === "profile" ? t("nodeProfile") : (n.type + (n.host ? " · " + n.host : "")));
    // health comes from the background watcher, so it survives you not looking at this page; the tab's
    // own ping (autoPingNodes) only ever knows "right now"
    const down = n.health === "bad" && !off;
    const meta = src + (n.active ? " · " + t("nodeActive") : "") + (down ? " · " + t("nodeDownFor")(agoStr(n.health_since)) : "");
    li.innerHTML =
      (NODEMODE === "urltest" ? '<span class="drag" style="opacity:.25" title="' + escH(t("dragAutoOff")) + '">⠿</span>' : '<span class="drag" title="' + escH(t("dragHint")) + '">⠿</span>') +
      '<span class="ndot' + (n.active ? " act" : "") + '" data-dot="' + i + '"></span>' +
      '<span class="dom">' + escH(n.name) + '</span>' +
      '<span class="meta">' + escH(meta) + '</span>' +
      '<span class="ms" data-ms="' + i + '"></span>' +
      '<label class="sw"><input type="checkbox" data-toggle="' + encodeURIComponent(n.name) + '"' + (off ? "" : " checked") + '><span class="sl"></span></label>' +
      (n.kind === "node" ? '<button class="ghost" data-del="' + n.id + '">✕</button>' : '');
    ul.appendChild(li);
  });
  $("#migrateBtn").hidden = !(d && d.legacy > 0);
  const z2 = $("#z2Hint"); z2.hidden = !(d && d.zapret2 === 1); if (!z2.hidden) z2.textContent = t("z2Hint");
  const ph = $("#provHead"), pl = $("#provList"); pl.innerHTML = ""; ph.hidden = PROVIDERS.length === 0;
  let hasSub = false;
  PROVIDERS.forEach(p => {
    const isSub = p.kind === "sub"; if (isSub) hasSub = true;
    const li = document.createElement("li");
    let btns = "";
    if (isSub) btns += '<button class="ghost" data-subrefresh="' + p.id + '" title="' + escH(t("subRefresh")) + '">↻</button>';
    btns += '<button class="ghost" data-delprov="' + p.id + '" data-kind="' + (p.kind || "provider") + '">✕</button>';
    li.innerHTML = '<span class="dom">' + escH(p.name) + '</span>' +
      '<span class="meta">' + t("nodeSub") + " · " + p.count + " " + t("provNodes") + '</span>' + btns;
    pl.appendChild(li);
  });
  $("#subAutoRow").hidden = !hasSub;
  if (hasSub) loadSubAuto();
}
async function loadSubAuto(){
  try { const s = await (await fetch("?api=subauto")).json();
    $("#subAutoOn").checked = !!s.enabled; $("#subAutoIv").value = s.interval || "24h"; $("#subAutoIv").disabled = !s.enabled;
  } catch(e){}
}
async function saveSubAuto(){
  const on = $("#subAutoOn").checked ? 1 : 0; $("#subAutoIv").disabled = !on;
  setMsg($("#subMsg"), t("saving"));
  const res = await api("subauto", { on, interval: $("#subAutoIv").value });
  setMsg($("#subMsg"), res && res.ok ? (res.enabled ? t("done") + " · " + res.interval : t("done")) : t("errP"), !res || res.ok);
}
// ping every enabled exit concurrently; colour the status dot (green=active, orange=reachable, red=down)
async function autoPingNodes(){
  await Promise.all(NODES.map(async (n, i) => {
    const el = $('#nodeList [data-ms="' + i + '"]'); const dot = $('#nodeList [data-dot="' + i + '"]');
    if (n.enabled === 0){ if (el) el.textContent = ""; if (dot) dot.className = "ndot off"; return; }
    if (el) el.textContent = "…";
    try {
      const r = await api("nodecheck", { name: n.name });
      const bad = !r || !r.ok || r.delay === "x";
      if (el) el.textContent = bad ? t("nodeNoResp") : r.delay + " " + t("nodeMs");
      if (dot) dot.className = "ndot " + (n.active ? "act" : bad ? "down" : "up");
    } catch(e){ if (el) el.textContent = ""; if (dot) dot.className = "ndot down"; }
  }));
}
async function addNodeCfg(cfg, name){
  if (!cfg.trim()) return;
  $("#nodeBtn").disabled = true;
  setMsg($("#nodeMsg"), t("validating")); showOverlay(t("validating"));
  const res = await api("nodeadd", { config: cfg, name: name || "" });
  $("#nodeBtn").disabled = false;
  if (res.ok){
    let m = t("done");
    // nikki down = the node is saved but untested; that's a nikki setup problem, not a bad config
    if (res.nikki_down){
      if (res.kind === "node") m += " · " + res.name;
      setMsg($("#nodeMsg"), m + " — " + t("nodeNikkiDown"), false);
    } else {
    if (res.kind === "node") m += " · " + res.name + " — " + (res.delay === "x" ? t("nodeNoRespKept") : res.delay + " " + t("nodeMs"));
    else if (res.kind === "multi") m += " · " + t("subAdded") + res.added;
    setMsg($("#nodeMsg"), m, res.kind !== "node" || res.delay !== "x");
    }
    $("#nodeCfg").value = ""; $("#nodeName").value = "";
    loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); loadDomains();
  } else { hideOverlay(); setMsg($("#nodeMsg"), t("errP") + (res.error || "?"), false); }
}
$("#nodeForm").addEventListener("submit", e => { e.preventDefault(); addNodeCfg($("#nodeCfg").value, $("#nodeName").value.trim()); });
$("#nodeList").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.del){
    b.disabled = true; setMsg($("#nodeMsg"), t("removing")); showOverlay(t("removing"));
    const res = await api("nodedel", { id: b.dataset.del });
    if (res.ok){ setMsg($("#nodeMsg"), t("done")); loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); loadDomains(); }
    else { hideOverlay(); setMsg($("#nodeMsg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
  }
});
$("#nodeList").addEventListener("change", async e => {
  const c = e.target.closest('input[data-toggle]'); if (!c) return;
  c.disabled = true; setMsg($("#nodeMsg"), t("saving")); showOverlay(t("saving"));
  const res = await api("nodetoggle", { name: decodeURIComponent(c.dataset.toggle) });
  if (res && res.ok) setMsg($("#nodeMsg"), t("done"));
  else setMsg($("#nodeMsg"), t("errP") + ((res && res.error) || "?"), false);
  loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); loadDomains();
});
// mode toggle (priority ↔ auto)
$("#nodeMode").addEventListener("click", async e => {
  const b = e.target.closest("button[data-mode]"); if (!b || b.dataset.mode === NODEMODE) return;
  document.querySelectorAll("#nodeMode button").forEach(x => { x.disabled = true; });
  setMsg($("#nodeMsg"), t("applying")); showOverlay(t("applying"));
  const res = await api("nodemode", { mode: b.dataset.mode });
  document.querySelectorAll("#nodeMode button").forEach(x => { x.disabled = false; });
  if (res && res.ok){ setMsg($("#nodeMsg"), t("done")); loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); }
  else { hideOverlay(); setMsg($("#nodeMsg"), t("errP") + ((res && res.error) || "?"), false); }
});
// subscription refresh + delete
$("#provList").addEventListener("click", async e => {
  const r = e.target.closest("button[data-subrefresh]");
  if (r){
    r.disabled = true; setMsg($("#subMsg"), t("subRefreshing")); showOverlay(t("subRefreshing"));
    const res = await api("subrefresh", { id: r.dataset.subrefresh });
    if (res && res.ok){ setMsg($("#subMsg"), t("done") + " · " + res.count); loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); loadDomains(); }
    else { hideOverlay(); setMsg($("#subMsg"), t("errP") + ((res && res.error) || "?"), false); r.disabled = false; }
    return;
  }
  const b = e.target.closest("button[data-delprov]"); if (!b) return;
  if (!confirm(t("provDelConfirm"))) return;
  b.disabled = true; setMsg($("#subMsg"), t("removing")); showOverlay(t("removing"));
  const res = await api(b.dataset.kind === "sub" ? "subdel" : "nodedel", { id: b.dataset.delprov });
  if (res.ok){ setMsg($("#subMsg"), t("done")); loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); loadDomains(); }
  else { hideOverlay(); setMsg($("#subMsg"), t("errP") + (res.error || "?"), false); b.disabled = false; }
});
$("#subAutoOn").addEventListener("change", saveSubAuto);
$("#subAutoIv").addEventListener("change", () => { if ($("#subAutoOn").checked) saveSubAuto(); });
// ping all exit nodes at once
$("#pingAll").addEventListener("click", e => { e.currentTarget.blur(); autoPingNodes(); });
// migrate existing "→ VPN" rules onto the managed exit group
$("#migrateBtn").addEventListener("click", async e => {
  if (!confirm(t("migrateConfirm"))) return;
  e.currentTarget.disabled = true; setMsg($("#nodeMsg"), t("applying")); showOverlay(t("applying"));
  // every other handler guards this; this one didn't, and a request that outlived uhttpd's CGI timeout
  // threw out of the await — leaving the overlay stuck on "applying" forever while the router had in
  // fact finished the job. Never let a failed call skip hideOverlay().
  let res; try { res = await api("migraterules", {}); } catch(err){ res = { error: "timeout" }; }
  e.currentTarget.disabled = false; hideOverlay();
  if (res && res.ok){ setMsg($("#nodeMsg"), t("done") + (res.changed ? " (" + res.changed + ")" : "")); loadDomains(); loadNodes(); }
  else setMsg($("#nodeMsg"), t("errP") + ((res && res.error) || "?"), false);
});
// drag-to-reorder exits (top = default / primary in Priority mode)
(function(){
  const ul = $("#nodeList"); let dragEl = null;
  // element the dragged row should be inserted BEFORE for a given pointer Y (null = append at end)
  const afterEl = y => {
    let best = null, bestOff = -Infinity;
    ul.querySelectorAll("li:not(.dragging)").forEach(c => {
      const b = c.getBoundingClientRect(); const off = y - b.top - b.height / 2;
      if (off < 0 && off > bestOff){ bestOff = off; best = c; }
    });
    return best;
  };
  ul.addEventListener("dragstart", e => { const li = e.target.closest("li"); if (!li) return; dragEl = li; li.classList.add("dragging"); try { e.dataTransfer.effectAllowed = "move"; } catch(_){} });
  // live reflow: move the row in real time so the drop lands exactly where you see it (incl. the very top)
  ul.addEventListener("dragover", e => {
    e.preventDefault(); if (!dragEl) return;
    const a = afterEl(e.clientY);
    if (a == null) ul.appendChild(dragEl); else ul.insertBefore(dragEl, a);
  });
  ul.addEventListener("dragend", () => { if (dragEl) dragEl.classList.remove("dragging"); dragEl = null; });
  ul.addEventListener("drop", async e => {
    e.preventDefault(); if (!dragEl) return;
    dragEl.classList.remove("dragging"); dragEl = null;
    const names = [...ul.querySelectorAll("li")].map(x => x.dataset.name);
    setMsg($("#nodeMsg"), t("saving")); showOverlay(t("saving"));
    const res = await api("nodeorder", { names: names.join("\n") });
    if (res && res.ok){ setMsg($("#nodeMsg"), t("done")); loadNodes().then(() => { hideOverlay(); autoPingNodes(); }); }
    else { setMsg($("#nodeMsg"), t("errP") + ((res && res.error) || "?"), false); loadNodes().then(hideOverlay); }
  });
})();
(function(){
  const dz = $("#dropzone");
  const readFile = f => { if (!f) return; const r = new FileReader(); r.onload = () => { $("#nodeCfg").value = r.result; if (!$("#nodeName").value) $("#nodeName").value = f.name.replace(/\.(conf|yaml|yml|txt)$/i, ""); }; r.readAsText(f); };
  const toggle = on => e => { e.preventDefault(); dz.classList.toggle("drag", on); };
  ["dragenter","dragover"].forEach(ev => dz.addEventListener(ev, toggle(true)));
  ["dragleave"].forEach(ev => dz.addEventListener(ev, toggle(false)));
  dz.addEventListener("drop", e => { toggle(false)(e); readFile(e.dataTransfer.files[0]); });
  dz.addEventListener("click", () => { const i = document.createElement("input"); i.type = "file"; i.onchange = () => readFile(i.files[0]); i.click(); });
})();

/* ---------- management (nikki service control) ---------- */
function renderSvc(s){
  const run = s.running === 1;
  $("#svcDot").className = "dot " + (run ? "up" : "down");
  $("#svcState").textContent = run ? t("svcRunning") : t("svcStopped");
  $("#svcRun").checked = run;
  $("#svcBootChk").checked = s.boot === 1;
  $("#mssChk").checked = s.mss === 1;
  $("#apChk").checked = s.allports === 1;
}
let LASTSVC = null;
function renderGuard(s){
  const g = $("#guard"); if (!g) return;
  // Never-configured nikki: mihomo can't start without a profile, so every "→ VPN" rule and every added
  // node is dead weight — and the failure surfaces far from its cause. Name it here, with the fix.
  if (s && s.unconfigured === 1){
    g.textContent = "";
    g.append(t("nikkiUnconf"));
    const b = document.createElement("button");
    b.type = "button"; b.textContent = t("nikkiUnconfFix");
    b.addEventListener("click", async () => {
      b.disabled = true; showOverlay(t("applying"));
      let r; try { r = await api("nikkiinit", {}); } catch(e){ r = {}; }
      hideOverlay(); b.disabled = false;
      if (r && r.ok){ loadSvc(); loadNodes(); loadDomains(); }
      else { g.append(" — " + ((r && r.log) || (r && r.error) || "?")); }
    });
    g.append(" "); g.append(b);
    g.hidden = false;
    return;
  }
  if (s && s.running === 1 && s.base_ok === 0){
    g.textContent = "";
    g.append(t("guardBad1"));
    const c = document.createElement("code"); c.textContent = s.base_group; g.append(c);
    g.append(t("guardBad2"));
    const f = document.createElement("code"); f.textContent = t("guardFix"); g.append(f);
    g.hidden = false;
  } else { g.hidden = true; }
}
async function loadSvc(){
  try { LASTSVC = await (await fetch("?api=svcstatus")).json(); renderSvc(LASTSVC); renderGuard(LASTSVC); } catch(e){}
}
/* ---------- backup / restore ---------- */
let BK_FILES = [], UNDO_RING = [], REDO = null;
async function loadBackup(){
  try {
    const s = await (await fetch("?api=backupauto")).json();
    $("#bkAutoOn").checked = !!s.enabled;
    BK_FILES = s.files || [];
    const ul = $("#bkList"); ul.innerHTML = "";
    BK_FILES.forEach(f => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="dom">' + escH(t("bk_" + f.name) || f.name) + '</span>' +
        '<span class="meta">' + f.kb + ' ' + t("kb") + ' · ' + escH(f.date || "") + '</span>' +
        '<button class="ghost" data-bkrestore="' + escH(f.name) + '">' + escH(t("bkRestoreRow")) + '</button>';
      ul.appendChild(li);
    });
    buildUndoMenu();
  } catch(e){}
}
$("#bkList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-bkrestore]"); if (!b) return;
  if (!confirm(t("bkRestoreRotConfirm"))) return;
  restoreBackup(b.dataset.bkrestore, $("#bkMsg"));
});
/* ---------- undo / restore — global header control (both engines) ---------- */
function refreshAllAfterRestore(){
  loadDomains(); loadPresets(); if (CAPS.zapret2) loadZapret2(); loadSvc(); loadVersions(); loadBackup(); loadUndo(); loadStorage();
}
async function loadUndo(){
  try { const d = await (await fetch("?api=undolist")).json();
        UNDO_RING = (d && Array.isArray(d.undo)) ? d.undo : []; REDO = (d && d.redo) ? d.redo : null; }
  catch(e){ UNDO_RING = []; REDO = null; }
  buildUndoMenu();
}
function buildUndoMenu(){
  const wrap = $("#undoWrap"), menu = $("#undoMenu");
  const hasUndo = UNDO_RING.length, hasBk = BK_FILES.length;
  wrap.hidden = false;   // the control is always present so users can find it
  $("#undoTop").classList.toggle("dim", !(hasUndo || hasBk || REDO));
  $("#undoTop").title = hasUndo ? (t("undoLast") + " · " + (t("act_" + UNDO_RING[0].label) || UNDO_RING[0].label)) : t("undoTitle");
  let h = '<div class="um-head">' + escH(t("undoTitle")) + '</div>';
  if (REDO) h += '<button class="umi umi-redo" data-kind="redo">' +
    '<span class="um-badge">↻</span><span class="um-txt"><b>' + escH(t("redoLast")) + '</b>' +
    '<small>' + escH(REDO.time || "") + '</small></span></button>';
  if (!hasUndo && !hasBk && !REDO) h += '<div class="um-empty">' + escH(t("undoEmpty")) + '</div>';
  UNDO_RING.slice(0, 5).forEach((u, i) => {
    const label = t("act_" + u.label) || u.label;
    h += '<button class="umi" data-kind="undo" data-id="' + escH(u.id) + '">' +
         '<span class="um-badge">' + (i === 0 ? "↩" : "−" + (i + 1)) + '</span>' +
         '<span class="um-txt"><b>' + escH(i === 0 ? t("undoLast") : label) + '</b>' +
         '<small>' + escH((i === 0 ? label + " · " : "") + (u.time || "")) + '</small></span></button>';
  });
  if (hasUndo && hasBk) h += '<div class="um-sep"></div>';
  BK_FILES.forEach(f => {
    h += '<button class="umi" data-kind="bk" data-which="' + escH(f.name) + '">' +
         '<span class="um-badge">⤺</span>' +
         '<span class="um-txt"><b>' + escH(t("bk_" + f.name) || f.name) + '</b>' +
         '<small>' + escH(f.date || "") + '</small></span></button>';
  });
  menu.innerHTML = h;
}
async function doUndo(id){
  if (!confirm(t("undoConfirm"))) return;
  showOverlay(t("applying"));
  let res; try { res = await api("undo", id ? { id } : {}); } catch(_){ res = {}; }
  hideOverlay();
  if (!(res && res.ok)) alert(t("errP") + ((res && res.error) || "?"));
  refreshAllAfterRestore();
}
async function doRedo(){
  showOverlay(t("applying"));
  let res; try { res = await api("redo", {}); } catch(_){ res = {}; }
  hideOverlay();
  if (!(res && res.ok)) alert(t("errP") + ((res && res.error) || "?"));
  refreshAllAfterRestore();
}
async function restoreBackup(which, msgEl){
  showOverlay(t("bkRestoring")); if (msgEl) setMsg(msgEl, t("bkRestoring"));
  let res; try { res = await api("bkrestore", { which }); } catch(_){ res = {}; }
  hideOverlay();
  if (res && res.ok){ if (msgEl) setMsg(msgEl, t("done")); }
  else { if (msgEl) setMsg(msgEl, t("errP") + ((res && res.error) || "?"), false); else alert(t("errP") + ((res && res.error) || "?")); }
  refreshAllAfterRestore();
}
// header button: toggle the menu (works on touch); desktop also opens on hover via CSS
$("#undoTop").addEventListener("click", e => { e.stopPropagation(); $("#undoWrap").classList.toggle("open"); });
$("#undoMenu").addEventListener("click", e => {
  const b = e.target.closest(".umi"); if (!b) return;
  $("#undoWrap").classList.remove("open");
  if (b.dataset.kind === "undo") doUndo(b.dataset.id);
  else if (b.dataset.kind === "redo") doRedo();
  else if (b.dataset.kind === "bk"){ if (confirm(t("bkRestoreRotConfirm"))) restoreBackup(b.dataset.which, null); }
});
document.addEventListener("click", () => $("#undoWrap").classList.remove("open"));
$("#bkDownload").addEventListener("click", () => { window.location = "?api=backup"; });
$("#bkAutoOn").addEventListener("change", async e => {
  setMsg($("#bkMsg"), t("applying"));
  const res = await api("backupauto", { on: e.currentTarget.checked ? 1 : 0 });
  setMsg($("#bkMsg"), res && res.ok ? t("done") : t("errP"), !res || res.ok);
  loadBackup();
});
/* ---------- Report / feedback (prefilled GitHub issue — no secrets, user submits) ---------- */
const RP_REPO = "https://github.com/Sketso/nikki-unblock/issues/new";
$("#rpSend").addEventListener("click", async () => {
  const desc = $("#rpDesc").value.trim();
  if (!desc){ setMsg($("#rpMsg"), t("rpNeedDesc"), false); return; }
  $("#rpSend").disabled = true; setMsg($("#rpMsg"), t("applying"));
  let full = "";
  if ($("#rpLogs").checked){
    try { const d = await (await fetch("?api=diag")).json(); full = (d && d.text) || ""; } catch(e){}
  }
  const mkUrl = b => RP_REPO + "?title=" + encodeURIComponent("[report] " + desc.slice(0, 60)) +
                     "&body=" + encodeURIComponent(b);
  let diag = full ? ("\n\n### diagnostics\n```\n" + full + "\n```\n") : "";
  let url = mkUrl(desc + diag);
  // GitHub/browser URL length is limited — if too long, send only a short tail inline and reveal
  // the full log in a textarea for the user to copy-paste (clipboard API isn't available over http)
  $("#rpFull").hidden = true; $("#rpFullHint").hidden = true;
  if (url.length > 7000 && full){
    const tail = full.split("\n").slice(-12).join("\n");
    url = mkUrl(desc + "\n\n### diagnostics (trimmed — full log below to paste)\n```\n" + tail + "\n```\n");
    $("#rpFull").value = full; $("#rpFull").hidden = false; $("#rpFullHint").hidden = false;
  }
  window.open(url, "_blank");
  $("#rpSend").disabled = false;
  setMsg($("#rpMsg"), t("rpOpened"));
});
$("#z2bkDownload").addEventListener("click", () => { window.location = "?api=z2backup"; });
$("#z2bkRestoreBtn").addEventListener("click", () => $("#z2bkFile").click());
$("#z2bkFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  if (!confirm(t("z2bkRestoreConfirm"))){ e.target.value = ""; return; }
  setMsg($("#z2bkMsg"), t("bkRestoring"));
  try {
    const res = await (await fetch("?api=z2restore", { method: "POST", body: file })).json();
    if (res.ok){ setMsg($("#z2bkMsg"), t("done")); loadZapret2(); }
    else setMsg($("#z2bkMsg"), t("errP") + (res.error || "?"), false);
  } catch(err){ setMsg($("#z2bkMsg"), t("errP") + err, false); }
  e.target.value = "";
});
async function loadZ2Backup(){
  if (!CAPS.zapret2) return;
  try {
    const s = await (await fetch("?api=z2backupauto")).json();
    $("#z2bkAutoOn").checked = !!s.enabled;
    const ul = $("#z2bkList"); ul.innerHTML = "";
    (s.files || []).forEach(f => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="dom">' + escH(t("bk_" + f.name) || f.name) + '</span>' +
        '<span class="meta">' + f.kb + ' ' + t("kb") + ' · ' + escH(f.date || "") + '</span>' +
        '<button class="ghost" data-z2bkrestore="' + escH(f.name) + '">' + escH(t("bkRestoreRow")) + '</button>';
      ul.appendChild(li);
    });
  } catch(e){}
}
$("#z2bkAutoOn").addEventListener("change", async e => {
  setMsg($("#z2bkMsg"), t("applying"));
  const res = await api("z2backupauto", { on: e.currentTarget.checked ? 1 : 0 });
  setMsg($("#z2bkMsg"), res && res.ok ? t("done") : t("errP") + ((res && res.error) || "?"), !res || res.ok);
  loadZ2Backup();
});
$("#z2bkList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-z2bkrestore]"); if (!b) return;
  if (!confirm(t("z2bkRestoreConfirm"))) return;
  setMsg($("#z2bkMsg"), t("bkRestoring"));
  const res = await api("z2bkrestore", { which: b.dataset.z2bkrestore });
  if (res && res.ok){ setMsg($("#z2bkMsg"), t("done")); loadZapret2(); }
  else setMsg($("#z2bkMsg"), t("errP") + ((res && res.error) || "?"), false);
});
/* ---------- security: optional PIN gate ---------- */
let AUTH_ON = false, PIN_SET = false;
function renderAuth(){
  $("#authOn").checked = AUTH_ON;
  $("#authLogout").hidden = !AUTH_ON;
  // status line makes it obvious whether a PIN already exists (first complaint)
  const st = $("#authStatus");
  st.textContent = PIN_SET ? "✓ " + t("secPinSet") : t("secPinNone");
  st.classList.toggle("ok", PIN_SET);
  // the button both sets a PIN and turns the gate on — its label reflects which
  $("#authApply").textContent = t(PIN_SET ? "secChange" : "secSetOn");
  $("#authPin").placeholder = t(PIN_SET ? "secPinChange" : "secPinPh");
}
async function loadAuth(){
  try { const c = await (await fetch("?api=config")).json(); AUTH_ON = c.auth_enabled === 1; PIN_SET = c.pin_set === 1; } catch(e){}
  renderAuth();
}
// the toggle applies IMMEDIATELY (no separate Apply) — matches every other switch in the panel
$("#authOn").addEventListener("change", async e => {
  const want = e.currentTarget.checked;
  if (want && !PIN_SET){   // can't require a PIN that doesn't exist yet — guide, don't half-enable
    e.currentTarget.checked = false;
    setMsg($("#secMsg"), t("secNeedPin"), false);
    $("#authPin").focus();
    return;
  }
  setMsg($("#secMsg"), t("applying"));
  const res = await api("authset", { enabled: want ? 1 : 0 });
  if (res && res.ok){ AUTH_ON = !!res.enabled; renderAuth(); setMsg($("#secMsg"), t(want ? "secOn" : "secOff")); }
  else { e.currentTarget.checked = AUTH_ON; setMsg($("#secMsg"), t("errP") + ((res && res.error) || "?"), false); }
});
// set or change the PIN (also turns the gate on — setting a PIN implies wanting it)
$("#authApply").addEventListener("click", async () => {
  const pin = $("#authPin").value;
  if (pin.length < 4){ setMsg($("#secMsg"), t("secShort"), false); return; }
  setMsg($("#secMsg"), t("applying"));
  const res = await api("authset", { enabled: 1, pin });
  if (res && res.ok){ $("#authPin").value = ""; AUTH_ON = true; PIN_SET = true; renderAuth(); setMsg($("#secMsg"), t("secPinSaved")); }
  else setMsg($("#secMsg"), t("errP") + ((res && res.error === "short") ? t("secShort") : (res && res.error) || "?"), false);
});
$("#authLogout").addEventListener("click", async () => {
  await api("logout", {}); location.reload();   // reload → PIN screen (auth still on)
});
$("#bkRestoreBtn").addEventListener("click", () => $("#bkFile").click());
$("#bkFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file){ return; }
  if (!confirm(t("bkRestoreConfirm"))){ e.target.value = ""; return; }
  setMsg($("#bkMsg"), t("bkRestoring"));
  try {
    const res = await (await fetch("?api=restore", { method: "POST", body: file })).json();
    if (res.ok){ setMsg($("#bkMsg"), t("done")); loadDomains(); loadPresets(); loadNodes().then(autoPingNodes); loadSvc(); loadVersions(); loadBackup(); }
    else setMsg($("#bkMsg"), t("errP") + (res.error || "?"), false);
  } catch(err){ setMsg($("#bkMsg"), t("errP") + err, false); }
  e.target.value = "";
});
async function svcDo(op, el){
  if (!op) return;
  el.disabled = true; setMsg($("#svcMsg"), t("applying"));
  let s; try { s = await api("svc", { op }); } catch(e){ s = {}; }
  el.disabled = false;
  if (s && s.ok){ setMsg($("#svcMsg"), t("done")); renderSvc(s); }
  else { setMsg($("#svcMsg"), t("errP") + ((s && s.error) || "?"), false); loadSvc(); }
}
$("#svcRun").addEventListener("change", e => svcDo(e.currentTarget.checked ? "start" : "stop", e.currentTarget));
$("#svcBootChk").addEventListener("change", e => svcDo(e.currentTarget.checked ? "enable" : "disable", e.currentTarget));
$("#mssChk").addEventListener("change", async e => {
  e.currentTarget.disabled = true; setMsg($("#svcMsg"), t("applying"));
  const res = await api("mssclamp", { on: e.currentTarget.checked ? 1 : 0 });
  e.currentTarget.disabled = false;
  setMsg($("#svcMsg"), res && res.ok ? t("done") : t("errP"), !res || res.ok);
});
// Widening the port range restarts nikki, so the whole LAN blinks for a few seconds — the toggle
// reloads the status afterwards instead of trusting its own checkbox.
$("#apChk").addEventListener("change", async e => {
  e.currentTarget.disabled = true; setMsg($("#svcMsg"), t("applying"));
  const res = await api("allports", { on: e.currentTarget.checked ? 1 : 0 });
  e.currentTarget.disabled = false;
  setMsg($("#svcMsg"), res && res.ok ? t("done") : t("errP"), !res || res.ok);
  loadSvc();
});
$("#svcRestart").addEventListener("click", e => svcDo("restart", e.currentTarget));
$("#svcReload").addEventListener("click", e => svcDo("reload", e.currentTarget));

/* ---------- updates (apk, async) ---------- */
let GEO_OK = false;
async function loadVersions(){
  try {
    const v = await (await fetch("?api=versions")).json();
    $("#verSelf").textContent = v.self || "?";
    $("#verNikki").textContent = (v.nikki || "?") + " · mihomo " + (v.mihomo || "?");
    const wasGeo = GEO_OK;
    GEO_OK = v.geo_ok === 1;
    $("#verGeo").textContent = GEO_OK ? (t("geoOn") + (v.geo_date ? " · " + v.geo_date : "")) : t("geoOff");
    const z2 = v.z2_present === 1;
    $("#verZ2Row").hidden = !z2; $("#updZ2").hidden = !z2;
    if ($("#rmZ2Row")) $("#rmZ2Row").hidden = !z2;   // offer "also remove zapret2" only when it's present
    if (z2) $("#verZ2").textContent = v.z2_ver || "?";
    // presets may load before versions — refresh cards so the geoip facet reflects the real DB state
    if (wasGeo !== GEO_OK && PRESETS.length) renderPresets();
    applyUpdMarks();   // re-apply latest-version highlighting if a check already ran
  } catch(e){}
}
/* auto-check for available updates (github releases + apk feeds); colour rows green/amber */
let UPDCHK = null, updChecking = false;
function applyUpdMarks(){
  if (!UPDCHK) return;
  const c = UPDCHK;
  const mark = (el, cur, latest) => {
    if (!el || !latest) return;
    const upd = cur && latest !== cur;
    el.classList.toggle("avail", !!upd); el.classList.toggle("ok", !upd);
    el.title = upd ? t("updNew") : t("updUpToDate");
    if (upd) el.textContent = cur + " → " + latest;
  };
  if (c.self) mark($("#verSelf"), c.self.cur, c.self.latest);
  if (c.zapret2 && c.zapret2.present) mark($("#verZ2"), c.zapret2.cur, c.zapret2.latest);
  const vn = $("#verNikki");
  if (vn){   // combined nikki+mihomo row: text is reset by loadVersions first, so append once
    const upd = (c.nikki && c.nikki.upd) || (c.mihomo && c.mihomo.upd);
    vn.classList.toggle("avail", !!upd); vn.classList.toggle("ok", !upd);
    vn.title = upd ? t("updNew") : t("updUpToDate");
    if (upd) vn.textContent += " · " + t("updAvail");
  }
}
async function loadUpdCheck(force){
  if (updChecking) return;
  if (UPDCHK && !force) { applyUpdMarks(); return; }
  updChecking = true;
  try { UPDCHK = await (await fetch("?api=updcheck")).json(); applyUpdMarks(); }
  catch(e){}
  finally { updChecking = false; }
}
function updBtns(dis){ ["#updSelf","#updNikki","#updGeo","#updZ2","#updAll"].forEach(id => { $(id).disabled = dis; }); }
let updPolling = false, updCurOp = null;
async function pollUpdate(){
  if (updPolling) return; updPolling = true;
  updBtns(true);
  const log = $("#updLog"); log.hidden = false;
  setMsg($("#updMsg"), t("updRunning"));
  let bad = 0;
  const finish = (ok, code) => {
    updPolling = false; updBtns(false);
    setMsg($("#updMsg"), ok ? t("updOkCode") : (t("updBad") + code), ok);
    loadVersions(); loadSvc(); loadUpdCheck(true);   // versions changed → re-check availability
    // a self-update swapped THIS page's own code — the new UI only appears after a reload. Leave a
    // sticky, clickable toast instead of forcing it, so the log stays readable until the user is ready.
    if (ok && (updCurOp === "self" || updCurOp === "all"))
      showToast(t("updReload"), "ok", { sticky: true, icon: "↻", click: () => location.reload() });
  };
  const tick = async () => {
    let s = null;
    try { s = await (await fetch("?api=updatestatus")).json(); bad = 0; } catch(e){ bad++; }
    if (s){
      if (s.log !== undefined && s.log !== "") { log.textContent = s.log; log.scrollTop = log.scrollHeight; }
      if (s.done){ finish(s.code === "0", s.code); return; }
    } else if (bad >= 3){
      // The endpoint stopped returning JSON — a self-update most likely replaced the CGI with a
      // version that predates ?api=updatestatus. The detached apk job still finished; assume success.
      finish(true, "0"); return;
    }
    setTimeout(tick, 1500);
  };
  tick();
}
async function doUpdate(op){
  updCurOp = op;
  updBtns(true); setMsg($("#updMsg"), t("applying"));
  let r; try { r = await api("update", { op }); } catch(e){ r = {}; }
  if (r && r.ok){ pollUpdate(); }
  else { updBtns(false); setMsg($("#updMsg"), t("errP") + ((r && r.error) || "?"), false); }
}
$("#updSelf").addEventListener("click", () => doUpdate("self"));
$("#updNikki").addEventListener("click", () => doUpdate("nikki"));
$("#updGeo").addEventListener("click", () => doUpdate("geo"));
$("#updZ2").addEventListener("click", () => doUpdate("z2"));
$("#instNikki").addEventListener("click", () => doUpdate("instnikki"));
$("#updAll").addEventListener("click", () => doUpdate("all"));

/* ---------- danger zone: uninstall Nipret ---------- */
/* Poll the purge log until the CGI deletes itself (apk del). The endpoint vanishing IS the success
   signal — exactly the reasoning the self-update poll uses (see pollUpdate). */
async function pollPurge(){
  const log = $("#rmLog"); log.hidden = false;
  setMsg($("#rmMsg"), t("rmRunning"));
  let bad = 0;
  const tick = async () => {
    let s = null;
    try { s = await (await fetch("?api=purgestatus")).json(); bad = 0; } catch(e){ bad++; }
    if (s){
      if (s.log) { log.textContent = s.log; log.scrollTop = log.scrollHeight; }
      // __REMOVED__ in the log while the CGI still answers = the revert finished but `apk del` couldn't
      // remove the package. The important part (revert) succeeded; point the user at the shell fallback.
      if (s.log && s.log.indexOf("__REMOVED__") >= 0){
        setMsg($("#rmMsg"), t("rmDelFail"), false);
        showToast(t("rmDelFail"), "err", { sticky: true });
        return;
      }
    } else if (bad >= 3){
      // endpoint gone → the package (and this CGI) was removed. That's the finish line.
      log.textContent += "\n>> " + t("rmGone");
      setMsg($("#rmMsg"), t("rmDone"), true);
      showToast(t("rmDone"), "ok", { sticky: true });
      return;
    }
    setTimeout(tick, 1500);
  };
  tick();
}
async function doUninstall(){
  const typed = prompt(t("rmPrompt"));
  if (typed == null) return;                                   // cancelled
  if (typed.trim().toUpperCase() !== t("rmWord")){ setMsg($("#rmMsg"), t("rmMismatch"), false); return; }
  const z2 = ($("#rmZ2") && $("#rmZ2").checked) ? 1 : 0;
  $("#rmBtn").disabled = true; setMsg($("#rmMsg"), t("applying"));
  let r; try { r = await api("uninstall", { confirm: "REMOVE", zapret2: z2 }); } catch(e){ r = {}; }
  if (r && r.ok){ pollPurge(); }
  else { $("#rmBtn").disabled = false; setMsg($("#rmMsg"), t("errP") + ((r && r.error) || "?"), false); }
}
$("#rmBtn") && $("#rmBtn").addEventListener("click", doUninstall);

/* kiosk: the /unblock page reuses this whole app but strips it to the VPN "add a site" essentials.
   Same engine/domain/preset logic, just a minimal standalone surface for non-technical users. */
const KIOSK = /[?&]page=unblock(\b|$)/.test(location.search);
$("#kioskCopy") && $("#kioskCopy").addEventListener("click", () => {
  const url = location.origin + "/unblock";
  // navigator.clipboard needs https; over plain-http LAN fall back to execCommand on a temp textarea
  const ta = document.createElement("textarea"); ta.value = url;
  ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.focus(); ta.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch(e){}
  document.body.removeChild(ta);
  setMsg(null, ok ? t("kioskCopied") : url);
});
async function bootKiosk(){
  document.body.classList.add("kiosk");
  $("#kioskHead").hidden = false;
  if (CAPS.nikki){ selectEngine("nikki"); await Promise.allSettled([loadDomains(), loadPresets()]); }
  else $("#kioskNikkiWarn").hidden = false;
  hideOverlay();
}

/* ---------- boot ---------- */
(async () => {
  showOverlay(t("loading"));         // dim + spinner over the whole UI while it loads (~5 s cold)
  let def = "ru";
  try { const c = await (await fetch("?api=config")).json(); def = c.lang || "ru"; EXITG = c.exit_group || "UNBLOCK";
        CAPS = { nikki: c.nikki !== 0, zapret2: c.zapret2 !== 0 }; } catch(e){}
  try { LANG = localStorage.nikkiLang || def; } catch(e){ LANG = def; }
  MODE = "simple";
  if (!KIOSK) { try { MODE = (localStorage.nikkiMode === "advanced") ? "advanced" : "simple"; } catch(e){ MODE = "simple"; } }
  document.body.classList.add(MODE === "advanced" ? "mode-advanced" : "mode-simple");
  document.querySelectorAll(".mode a").forEach(a => a.classList.toggle("active", a.dataset.mode === MODE));
  applyI18n();
  applyCaps();                       // hide the tabs/controls for whichever engine isn't installed
  setOverlay(t("loading"));
  if (KIOSK) { await bootKiosk(); return; }
  // essentials first (presets is the slow fetch); drop the overlay once the Domains view is ready
  if (CAPS.nikki) await Promise.allSettled([loadDomains(), loadPresets()]);
  hideOverlay();
  if (CAPS.nikki){ loadIps(); loadAutosync(); loadNodes(); loadSvc(); presetOp.ensure(); }
  if (CAPS.zapret2) z2PresetOp.ensure();   // resume a z2-preset spinner if one is applying
  if (CAPS.nikki || CAPS.zapret2) loadDevices();
  loadVersions(); loadUpdCheck(); loadBackup(); loadZ2Backup(); loadAuth(); loadUndo(); loadStorage();   // one availability check per session (cached)
  // resume the log view if an update is already running (started from another tab/session)
  try { const s = await (await fetch("?api=updatestatus")).json(); if (s && s.running) pollUpdate(); } catch(e){}
})();
