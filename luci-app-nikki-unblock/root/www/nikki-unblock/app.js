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
    strat_default: "Сбалансированная (по умолчанию)", strat_youtube: "YouTube: QUIC-блоб googlevideo",
    strat_aggressive: "Агрессивная (TLS multidisorder + badsum)", strat_light: "Лёгкая (для слабых роутеров)", strat_custom: "Своя (ручная правка config)",
    stratCustomNote: "Это ручная стратегия из config — выбери одну из готовых, чтобы применить.", stratSame: "Эта стратегия уже активна",
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
    z2QuicLabel: "Резать QUIC (форсить TCP)",
    z2QuicHint: "Блокирует UDP/443 из локальной сети — браузеры откатываются на TCP, где обход DPI работает надёжнее. Приложению YouTube на телефоне это не поможет: ему нужен рабочий QUIC-обход, а не блок.",
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
    pmShow: "Показать состав", pmGeo: "Поддерживаемая категория доменов/IP — обновляется автоматически из базы. Ниже показаны только дополнительные IP-подсети и домены.",
    tabNodes: "Ноды", nUnblock: "→ VPN (+ноды)",
    nodesHint: "Свои VPN-выходы. Перетащи .conf или вставь конфиг/ссылку: AmneziaWG/WireGuard, vless://…, подписку https://…, или сырой clash-YAML. Добавленные ноды образуют группу UNBLOCK — выбирай «→ VPN (+ноды)» как действие правила.",
    nodeDrop: "Перетащи сюда файл .conf", nodeName: "имя (необязательно)", nodeAdd: "Добавить и проверить",
    validating: "Добавляю и проверяю ноду…", nodeMs: "мс", nodeNoResp: "не отвечает", nodeSub: "подписка",
    nodeProfile: "из профиля", nodeOn: "вкл", nodeOff: "выкл",
    guardBad1: "⚠ Proxy-группа ", guardBad2: " не найдена в mihomo. Правила «→ VPN» указывают на несуществующую группу. Задай базовую группу равной имени proxy-группы твоего профиля: ",
    guardFix: "uci set nikki-unblock.config.base_group='ИМЯ' && uci commit",
    tabMgmt: "Управление",
    svcStart: "Запустить", svcStop: "Остановить", svcRestart: "Перезапустить сервис",
    svcReload: "Перечитать конфиг", svcAutostart: "Автозапуск вкл/выкл",
    svcRunning: "nikki работает", svcStopped: "nikki остановлен",
    svcBoot: "Автозапуск при загрузке", svcOn: "вкл", svcOff: "выкл",
    mssLabel: "Фикс зависаний загрузок (MSS-clamp)", mssHint: "Включи, если через VPN большие загрузки или сайты зависают / грузятся наполовину, а мелочь при этом работает. Чинит размер сетевых пакетов под туннель. Оставлять включённым безопасно.",
    bkGroupTitle: "Бэкап настроек",
    bkTitle: "Nikki (VPN)", bkDownload: "Создать и скачать", bkRestore: "Восстановить из файла", bkAuto: "Авто-бэкап (день/неделя/месяц)",
    bkHint: "Сохраняет правила, ноды, подписки и mixin nikki (без гео-баз, ~КБ). Восстановление заменяет текущие настройки; перед этим делается снимок для отката.",
    bkRestoreConfirm: "Восстановить из этого файла? Текущие настройки будут заменены (перед этим — авто-снимок для отката).", bkRestoring: "Восстанавливаю…", kb: "КБ",
    bkRestoreRow: "Восстановить", bkRestoreRotConfirm: "Восстановить настройки из этого бэкапа? Текущее состояние обоих движков будет заменено.",
    bk_daily: "За день", bk_weekly: "За неделю", bk_monthly: "За месяц",
    undoTitle: "Откат изменений", undoHint: "Перед каждым переключением (стратегия, QUIC, IPv6, автообучение, пресеты) сохраняется снимок обоих движков. Если что-то сломалось после изменения — верни как было.",
    undoBtn: "↩ Вернуть как было", undoThis: "Откатить сюда", undoLast: "Вернуть последнее изменение", redoLast: "Вернуть отменённое", undoEmpty: "Пока нет изменений для отката", undoConfirm: "Откатить к состоянию до этого изменения? Настройки обоих движков вернутся к тому моменту.",
    act_z2strat: "стратегия zapret2", act_z2quic: "тумблер QUIC", act_z2ipv6: "тумблер IPv6", act_z2autotoggle: "автообучение zapret2",
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
    confirmDel: n => "Будет удалено доменов: " + n + ". Продолжить?"
  },
  en: {
    h1: "Nipret · VPN + DPI-bypass",
    engNikki: "VPN (Nikki)", engZapret2: "DPI bypass (Zapret2)", engCommon: "General",
    modeSimple: "Simple", modeAdvanced: "Advanced",
    kioskTitle: "Unblock a site", kioskHint: "Type the address of a site that won't open and hit “Add” — it will go through the VPN. Below you can expand the added list and ready-made bundles (YouTube, Instagram, etc.). This page works from any device on the home network.",
    kioskCopy: "Copy link to this page", kioskCopied: "Link copied", kioskNoNikki: "VPN (nikki) isn't installed — VPN unblocking is unavailable.",
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
    strat_default: "Balanced (default)", strat_youtube: "YouTube: googlevideo QUIC blob",
    strat_aggressive: "Aggressive (TLS multidisorder + badsum)", strat_light: "Light (for weak routers)", strat_custom: "Custom (hand-edited config)",
    stratCustomNote: "This is a manual strategy from config — pick one of the presets to apply.", stratSame: "That strategy is already active",
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
    z2QuicLabel: "Block QUIC (force TCP)",
    z2QuicHint: "Drops LAN UDP/443 so browsers fall back to TCP, where the DPI bypass is more reliable. Won't help the mobile YouTube app — it needs a working QUIC desync, not a block.",
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
    pmShow: "Show contents", pmGeo: "A maintained domain/IP category — auto-updated from the DB. Only the extra IP subnets and domains are listed below.",
    tabNodes: "Nodes", nUnblock: "→ VPN (+nodes)",
    nodesHint: "Your own VPN exits. Drop a .conf or paste a config/link: AmneziaWG/WireGuard, vless://…, a subscription https://…, or raw clash YAML. Added nodes form the UNBLOCK group — pick «→ VPN (+nodes)» as a rule action.",
    nodeDrop: "Drop a .conf file here", nodeName: "name (optional)", nodeAdd: "Add & check",
    validating: "Adding & checking node…", nodeMs: "ms", nodeNoResp: "no response", nodeSub: "subscription",
    nodeProfile: "from profile", nodeOn: "on", nodeOff: "off",
    guardBad1: "⚠ Proxy-group ", guardBad2: " was not found in mihomo. «→ VPN» rules point at a nonexistent group. Set the base group to your profile's proxy-group name: ",
    guardFix: "uci set nikki-unblock.config.base_group='NAME' && uci commit",
    tabMgmt: "Manage",
    svcStart: "Start", svcStop: "Stop", svcRestart: "Restart service",
    svcReload: "Reload config", svcAutostart: "Toggle autostart",
    svcRunning: "nikki running", svcStopped: "nikki stopped",
    svcBoot: "Start on boot", svcOn: "on", svcOff: "off",
    mssLabel: "Fix download stalls (MSS clamp)", mssHint: "Turn on if large downloads or sites stall / load only halfway through the VPN while small stuff works fine. Fixes network packet size for the tunnel. Safe to leave on.",
    bkGroupTitle: "Settings backup",
    bkTitle: "Nikki (VPN)", bkDownload: "Create & download", bkRestore: "Restore from file", bkAuto: "Auto-backup (daily/weekly/monthly)",
    bkHint: "Saves nikki's rules, nodes, subscriptions and mixin (no geo databases, ~KB). Restore replaces current settings; a snapshot is taken first for rollback.",
    bkRestoreConfirm: "Restore from this file? Current settings will be replaced (an auto-snapshot is taken first for rollback).", bkRestoring: "Restoring…", kb: "KB",
    bkRestoreRow: "Restore", bkRestoreRotConfirm: "Restore settings from this backup? The current state of both engines will be replaced.",
    bk_daily: "Daily", bk_weekly: "Weekly", bk_monthly: "Monthly",
    undoTitle: "Undo changes", undoHint: "Before each toggle (strategy, QUIC, IPv6, auto-learn, presets) a snapshot of both engines is saved. If something broke after a change — put it back.",
    undoBtn: "↩ Undo last change", undoThis: "Revert to here", undoLast: "Undo last change", redoLast: "Redo undone change", undoEmpty: "No changes to undo yet", undoConfirm: "Revert to the state before this change? Both engines' settings return to that point.",
    act_z2strat: "zapret2 strategy", act_z2quic: "QUIC toggle", act_z2ipv6: "IPv6 toggle", act_z2autotoggle: "zapret2 auto-learn",
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
    confirmDel: n => "This will remove " + n + " domain(s). Continue?"
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
async function api(action, params){
  const r = await fetch("", { method:"POST", body: new URLSearchParams({ action, ...params }) });
  return r.json();
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
  else if (tb.dataset.view === "common") { loadVersions(); loadUpdCheck(); loadBackup(); loadZ2Backup(); loadUndo(); }   // Общее: updates + backup
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
function taggedSet(id){
  return new Set(RULES.filter(r => (" " + (r.src || "") + " ").indexOf(" " + id + " ") >= 0).map(r => r.matcher));
}
// on/off/partial for one facet
function listFacet(p){
  const L = new Set(p.domains || []);
  const tagged = taggedSet(p.id);
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
  // open the first available engine (prefer nikki, else zapret2, else common)
  const firstEng = document.querySelector('.tab-top:not([hidden])');
  selectEngine(firstEng ? firstEng.dataset.engine : "common");
  if (!CAPS.nikki && !CAPS.zapret2){ const g = $("#guard"); if (g){ g.textContent = t("noEngines"); g.hidden = false; } }
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
      '<span class="dom">' + escH(d) + '</span><button class="ghost" data-z2del="' + escH(d) + '">✕</button>';
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
const STRATS = ["default", "youtube", "aggressive", "light"];
function renderStrat(){
  const sel = $("#z2Strat");
  const cur = Z2.strategy || "default";
  // (re)build options, adding a read-only "custom" entry if the config was hand-edited
  const want = STRATS.concat(cur === "custom" || !STRATS.includes(cur) ? ["custom"] : []);
  if (sel.dataset.built !== want.join(",")){
    sel.innerHTML = "";
    want.forEach(id => { const o = document.createElement("option"); o.value = id;
      o.textContent = t("strat_" + id) || id; sel.appendChild(o); });
    sel.dataset.built = want.join(",");
  } else {
    [...sel.options].forEach(o => { o.textContent = t("strat_" + o.value) || o.value; });
  }
  sel.value = STRATS.includes(cur) ? cur : "custom";
}
$("#z2StratApply").addEventListener("click", async () => {
  const id = $("#z2Strat").value;
  if (id === "custom"){ setMsg($("#z2StratMsg"), t("stratCustomNote"), false); return; }
  if (id === Z2.strategy){ setMsg($("#z2StratMsg"), t("stratSame")); return; }
  const btn = $("#z2StratApply"); btn.disabled = true;
  showOverlay(t("applying")); setMsg($("#z2StratMsg"), t("applying"));
  let res; try { res = await api("z2strat", { id }); } catch(e){ res = {}; }
  hideOverlay(); btn.disabled = false;
  if (res && res.ok) setMsg($("#z2StratMsg"), t("done"));
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
$("#z2UserList").addEventListener("click", async e => {
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
    li.draggable = true; li.dataset.name = n.name; if (off) li.classList.add("off");
    const src = n.sub ? t("nodeFromSub") + " " + n.sub : (n.kind === "profile" ? t("nodeProfile") : (n.type + (n.host ? " · " + n.host : "")));
    const meta = src + (n.active ? " · " + t("nodeActive") : "");
    li.innerHTML =
      '<span class="drag" title="' + escH(t("dragHint")) + '">⠿</span>' +
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
    if (res.kind === "node") m += " · " + res.name + " — " + (res.delay === "x" ? t("nodeNoResp") : res.delay + " " + t("nodeMs"));
    else if (res.kind === "multi") m += " · " + t("subAdded") + res.added;
    setMsg($("#nodeMsg"), m, res.kind !== "node" || res.delay !== "x");
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
  const res = await api("migraterules", {});
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
}
let LASTSVC = null;
function renderGuard(s){
  const g = $("#guard"); if (!g) return;
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
  loadDomains(); loadPresets(); if (CAPS.zapret2) loadZapret2(); loadSvc(); loadVersions(); loadBackup(); loadUndo();
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
$("#updAll").addEventListener("click", () => doUpdate("all"));

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
  loadVersions(); loadUpdCheck(); loadBackup(); loadZ2Backup(); loadUndo();   // one availability check per session (cached)
  // resume the log view if an update is already running (started from another tab/session)
  try { const s = await (await fetch("?api=updatestatus")).json(); if (s && s.running) pollUpdate(); } catch(e){}
})();
