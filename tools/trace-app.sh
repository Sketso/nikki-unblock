#!/bin/sh
# trace-app.sh — ловит трафик, который УШЁЛ МИМО тоннеля.
#
# Зачем: панель показывает правила nikki, а mihomo — только те соединения, которые до него дошли.
# Всё, что nikki не перехватила на уровне nftables (порт вне proxy_tcp_dport, UDP, IPv6, исключённое
# устройство), в логах mihomo НЕ ВИДНО ВООБЩЕ — а именно это и выглядит как «часть сервиса не
# работает». Скрипт смотрит с двух сторон одновременно:
#   1) conntrack — ВСЕ потоки устройства, включая невидимые для mihomo;
#   2) mihomo /logs — решение по каждому потоку, который до mihomo дошёл (правило + узел).
# Совмещение даёт три класса: ушло в тоннель / mihomo решил DIRECT / вообще мимо mihomo (утечка).
#
# Запуск на роутере (только чтение, ничего не меняет):
#   sh trace-app.sh -t 60 -c 192.168.1.151
#
# Порядок работы: запустить, на устройстве воспроизвести проблему (открыть медиа), дождаться отчёта.

T=60; CLIENT=""; DEV=""
while [ $# -gt 0 ]; do
	case "$1" in
		-t) T="$2"; shift 2 ;;
		-c) CLIENT="$2"; shift 2 ;;
		-d) DEV="$2"; shift 2 ;;
		-h|--help) sed -n '2,22p' "$0"; exit 0 ;;
		*) echo "unknown arg: $1"; exit 1 ;;
	esac
done

# -d ищет устройство по имени в аренде DHCP: перепутанный IP — самая частая причина пустой трассы
if [ -n "$DEV" ]; then
	CLIENT=$(awk -v n="$DEV" 'tolower($4) ~ tolower(n) {print $3; exit}' /tmp/dhcp.leases 2>/dev/null)
	[ -z "$CLIENT" ] && { echo "устройство '$DEV' не найдено в /tmp/dhcp.leases"; exit 1; }
fi
CNAME=""
[ -n "$CLIENT" ] && CNAME=$(awk -v ip="$CLIENT" '$3 == ip {print $4; exit}' /tmp/dhcp.leases 2>/dev/null)

CT=/proc/net/nf_conntrack
[ -r "$CT" ] || { echo "нет $CT — модуль conntrack не загружен"; exit 1; }

SECRET=$(uci -q get nikki.mixin.api_secret)
LISTEN=$(uci -q get nikki.mixin.api_listen); API="127.0.0.1:${LISTEN##*:}"
REDIR=$(uci -q get nikki.mixin.redir_port); [ -z "$REDIR" ] && REDIR=7891
TPROXY=$(uci -q get nikki.mixin.tproxy_port); [ -z "$TPROXY" ] && TPROXY=7892
PORTS=$(uci -q get nikki.proxy.proxy_tcp_dport)
UPORTS=$(uci -q get nikki.proxy.proxy_udp_dport)
ROUTER_IP=$(uci -q get network.lan.ipaddr); [ -z "$ROUTER_IP" ] && ROUTER_IP=$(ip -4 addr show br-lan | sed -n 's/.*inet \([0-9.]*\).*/\1/p' | head -1)
LANNET=$(ip -4 route show dev br-lan proto kernel 2>/dev/null | awk '{print $1; exit}')
[ -z "$LANNET" ] && LANNET="${ROUTER_IP%.*}.0/24"

# nikki's port list is space-separated and may contain ranges ("0-65535", "80 443"), so a plain
# substring test would call every port "not intercepted" the moment a range is used.
port_covered() {   # $1=port $2=list — 0(true) if the port falls inside the list
	case "$1" in ''|*[!0-9]*) return 1 ;; esac
	for _r in $2; do
		case "$_r" in
			*-*) [ "$1" -ge "${_r%%-*}" ] && [ "$1" -le "${_r##*-}" ] && return 0 ;;
			*)   [ "$1" = "$_r" ] && return 0 ;;
		esac
	done
	return 1
}

W=/tmp/trace-app.$$
mkdir -p "$W" || exit 1
trap 'rm -rf "$W"' EXIT INT TERM

echo "== trace-app: ${T}с, клиент=${CLIENT:-все}${CNAME:+ ($CNAME)}, роутер=$ROUTER_IP"
echo "== nikki перехватывает TCP-порты: ${PORTS:-?}   UDP-порты: ${UPORTS:-?}"
echo "== воспроизводите проблему на устройстве ПРЯМО СЕЙЧАС..."

# 1) поток решений mihomo (что дошло до прокси и куда ушло)
if [ -n "$SECRET" ]; then
	curl -sN -m "$T" -H "Authorization: Bearer $SECRET" "http://$API/logs?level=info" > "$W/mihomo.log" 2>/dev/null &
	curl -s -m 10 -H "Authorization: Bearer $SECRET" "http://$API/connections" > "$W/conn.start" 2>/dev/null
fi

# 2) семплирование conntrack: короткоживущие потоки иначе исчезнут между замерами
i=0
while [ "$i" -lt "$T" ]; do
	cat "$CT" >> "$W/ct.raw" 2>/dev/null
	i=$((i + 2)); sleep 2
done
[ -n "$SECRET" ] && curl -s -m 10 -H "Authorization: Bearer $SECRET" "http://$API/connections" > "$W/conn.end" 2>/dev/null
wait 2>/dev/null

# --- разбор conntrack -------------------------------------------------------
# Формат: ... src=A dst=B sport=P dport=Q packets=.. bytes=.. src=C dst=D sport=R ...
# Первая четвёрка — оригинал, вторая — обратное направление. При REDIRECT в mihomo обратный src
# становится IP роутера, а sport — redir/tproxy-портом; если там настоящий адрес назначения —
# поток ушёл В ИНТЕРНЕТ МИМО mihomo.
awk -v client="$CLIENT" -v router="$ROUTER_IP" -v lannet="$LANNET" -v redir="$REDIR" -v tproxy="$TPROXY" '
function ip2n(a,  p) { split(a, p, "."); return ((p[1]*256+p[2])*256+p[3])*256+p[4] }
function innet(a, cidr,  q, n, b, m) {
	if (a !~ /^[0-9.]+$/ || cidr == "") return 0
	split(cidr, q, "/"); n = ip2n(a); b = ip2n(q[1]); m = q[2]
	return int(n / 2^(32-m)) == int(b / 2^(32-m))
}
function tg(a,  n, i, base, bits) {
	if (a !~ /^[0-9.]+$/) return 0
	n = ip2n(a)
	for (i = 1; i <= NC; i++) {
		base = CB[i]; bits = CM[i]
		if (int(n / 2^(32-bits)) == int(base / 2^(32-bits))) return 1
	}
	return 0
}
BEGIN {
	# официальный https://core.telegram.org/resources/cidr.txt (только IPv4)
	split("91.108.56.0/22 91.108.4.0/22 91.108.8.0/22 91.108.16.0/22 91.108.12.0/22 " \
	      "149.154.160.0/20 91.105.192.0/23 91.108.20.0/22 185.76.151.0/24 95.161.64.0/20", L, " ")
	for (k in L) { split(L[k], q, "/"); NC++; CB[NC] = ip2n(q[1]); CM[NC] = q[2] }
}
{
	proto = $3; ns = 0; nd = 0; np = 0; nq = 0; npk = 0; nby = 0
	osrc = odst = osp = odp = rsrc = rsp = ""; pk = 0; by = 0; rby = 0
	for (f = 1; f <= NF; f++) {
		if ($f ~ /^src=/)   { ns++; if (ns == 1) osrc = substr($f, 5); else rsrc = substr($f, 5) }
		if ($f ~ /^dst=/)   { nd++; if (nd == 1) odst = substr($f, 5) }
		if ($f ~ /^sport=/) { np++; if (np == 1) osp = substr($f, 7); else rsp = substr($f, 7) }
		if ($f ~ /^dport=/) { nq++; if (nq == 1) odp = substr($f, 7) }
		if ($f ~ /^packets=/) { npk++; if (npk == 1) pk = substr($f, 9) }
		if ($f ~ /^bytes=/)   { nby++; if (nby == 1) by = substr($f, 7); else rby = substr($f, 7) }
	}
	# ТОЛЬКО клиенты LAN. Трафик самого роутера отбрасываем: исходящие соединения mihomo (и тоннель
	# к узлу) в conntrack выглядят как «неперехваченные» и дали бы гору ложных срабатываний.
	if (!innet(osrc, lannet) || osrc == router) next
	if (client != "" && osrc != client) next
	if (innet(odst, lannet) || odst ~ /^127\.|^224\.|^239\.|^255\./) next
	key = proto "|" osrc "|" odst "|" odp "|" osp
	if (rsrc == router && (rsp == redir || rsp == tproxy)) via[key] = "tunnel"
	else if (!(key in via)) via[key] = "ESCAPED"
	# sport в ключе обязателен: без него переподключения к тому же адресу слипаются и счётчики,
	# которые растут только внутри одного соединения, перестают быть монотонными.
	if (pk + 0 > pkts[key]) pkts[key] = pk + 0
	if (by + 0 > byts[key]) byts[key] = by + 0
	if (rby + 0 > rbyts[key]) rbyts[key] = rby + 0
	if (!(key in bmin)) { bmin[key] = by + 0; rmin[key] = rby + 0 }
	seen[key]++
	if (tg(odst)) istg[key] = 1
}
END {
	for (k in via) printf "%s\t%s\t%d\t%d\t%d\t%d\t%s\t%d\t%d\n", via[k], k, pkts[k], byts[k], rbyts[k], \
		seen[k], (k in istg ? "TELEGRAM" : "-"), byts[k] - bmin[k], rbyts[k] - rmin[k]
}
' "$W/ct.raw" | sort > "$W/flows.tsv"

esc=$(awk -F'\t' '$1=="ESCAPED"' "$W/flows.tsv" | wc -l)
tun=$(awk -F'\t' '$1=="tunnel"' "$W/flows.tsv" | wc -l)

echo
echo "=========== ИТОГ ==========="
echo "потоков перехвачено nikki: $tun,  ушло мимо nikki: $esc"

if [ "$esc" -gt 0 ]; then
	# IP устройств, ИСКЛЮЧЁННЫХ из проксирования (nikki матчит их по MAC — переводим в IP через ARP)
	EXC=""
	j=0
	while uci -q get "nikki.@lan_access_control[$j]" >/dev/null 2>&1; do
		if [ "$(uci -q get "nikki.@lan_access_control[$j].proxy")" = "0" ]; then
			m=$(uci -q get "nikki.@lan_access_control[$j].mac")
			[ -n "$m" ] && EXC="$EXC $(ip neigh 2>/dev/null | grep -i "$m" | awk '{print $1}' | tr '\n' ' ')"
		fi
		j=$((j + 1))
	done
	echo
	echo "--- УШЛИ МИМО ТОННЕЛЯ (nftables их не перехватил, mihomo их не видел) ---"
	echo "     proto  источник         назначение              порт   пакетов  байт      метка      почему"
	awk -F'\t' '$1=="ESCAPED" {
		split($2, a, "|")
		printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n", a[1], a[2], a[3], a[4], $3, $4, $7
	}' "$W/flows.tsv" | sort -t"$(printf '\t')" -k2 | head -60 | while IFS="$(printf '\t')" read -r pr src dst dp pk by tag; do
		why="соединение старше правил (напр. установлено в окно перезагрузки nikki)"
		case " $EXC " in *" $src "*) why="устройство исключено из проксирования" ;; esac
		if [ "$pr" = udp ]; then
			port_covered "$dp" "$UPORTS" || why="UDP-порт вне перехвата ($UPORTS)"
		elif [ "$pr" = tcp ]; then
			port_covered "$dp" "$PORTS" || why="TCP-порт вне перехвата ($PORTS)"
		else
			why="$pr не проксируется"
		fi
		printf "     %-6s %-16s %-23s %-6s %-8s %-9s %-10s %s\n" "$pr" "$src" "$dst" "$dp" "$pk" "$by" "$tag" "$why"
	done
	echo
	echo "  ^ строки с меткой TELEGRAM — это и есть «неотловленные источники»:"
	echo "    прямой доступ к DC Telegram из RU-сетей режется, поэтому такое соединение просто виснет,"
	echo "    и в панели/логах mihomo этого НЕ ВИДНО — трафик до него не доходил."
fi

# Второй класс отказа: поток В ТОННЕЛЕ, но ответа нет. Именно так выглядит «картинка не грузится»:
# запрос ушёл, ответ не идёт. Признак — ПРИРОСТ за окно: отправлено выросло, принято не выросло
# совсем. Просто «мало байт» не годится: у Telegram при простое висят keepalive-коннекты, у которых
# трафика мало в ОБЕ стороны, и они бы засоряли отчёт.
STALL='$1=="tunnel" && $6 >= 3 && $8 >= 200 && $9 == 0'
stall=$(awk -F'\t' "$STALL" "$W/flows.tsv" | wc -l)
if [ "$stall" -gt 0 ]; then
	echo
	echo "--- ЗАПРОС УШЁЛ В ТОННЕЛЬ, ОТВЕТА НЕТ (за окно отправлено ≥200 Б, принято 0) ---"
	echo "     источник         назначение              порт   отпр.+Б    принято+Б  метка"
	awk -F'\t' "$STALL"' {
		split($2, a, "|")
		printf "     %-16s %-23s %-6s %-10s %-10s %s\n", a[2], a[3], a[4], $8, $9, $7
	}' "$W/flows.tsv" | sort -k2 | head -30
	echo
	echo "  ^ если тут TELEGRAM — перехват работает, ломается уже ЗА тоннелем (узел или DC)."
fi

if [ -s "$W/mihomo.log" ]; then
	echo
	echo "--- РЕШЕНИЯ mihomo (что дошло до прокси) ---"
	CF="."; [ -n "$CLIENT" ] && CF="$CLIENT:"
	grep -o '\[TCP\][^"]*' "$W/mihomo.log" | grep "$CF" > "$W/dec.txt"
	sed 's/.*--> //; s/ match / | /; s/ using / | /' "$W/dec.txt" | sort | uniq -c | sort -rn | head -40
	[ -s "$W/dec.txt" ] || echo "  (пусто) клиент за окно не открыл НИ ОДНОГО соединения — не тот IP или приложение молчало"
	echo
	echo "--- ОШИБКИ/ПРЕДУПРЕЖДЕНИЯ mihomo за окно ---"
	grep -E '"(warning|error)"' "$W/mihomo.log" | sed 's/.*"payload":"//; s/"}$//' | grep "$CF" | head -20
	dr=$(grep -c 'using DIRECT' "$W/dec.txt" 2>/dev/null)
	echo
	echo "  соединений этого клиента, отправленных mihomo НАПРЯМУЮ: ${dr:-0}"
	echo "  если среди них есть домены нужного сервиса — не хватает правила/пресета."
fi

# --- что именно скачал ЭТОТ клиент через тоннель ----------------------------
# Соединения mihomo дают то, чего нет в conntrack: сколько байт реально пришло по каждому потоку за
# окно. Разложение по клиенту важно — общая цифра ниже включает весь дом и легко вводит в заблуждение.
conn_tsv() {   # $1=json $2=выходной TSV: id sourceIP dest port download
	# jsonfilter печатает по строке на элемент, включая пустые, — параллельные списки не разъезжаются
	for _f in id metadata.sourceIP metadata.destinationIP metadata.destinationPort download metadata.host; do
		jsonfilter -i "$1" -e "@.connections[*].$_f" > "$W/fld_${_f##*.}" 2>/dev/null
	done
	awk 'FILENAME ~ /fld_id$/          { id[FNR] = $0; n = FNR }
	     FILENAME ~ /fld_sourceIP$/    { sip[FNR] = $0 }
	     FILENAME ~ /fld_destinationIP$/   { dip[FNR] = $0 }
	     FILENAME ~ /fld_destinationPort$/ { dpt[FNR] = $0 }
	     FILENAME ~ /fld_download$/    { dl[FNR] = $0 }
	     FILENAME ~ /fld_host$/        { h[FNR] = $0 }
	     END { for (i = 1; i <= n; i++) printf "%s\t%s\t%s\t%s\t%s\n", id[i], sip[i],
	            (dip[i] != "" ? dip[i] : h[i]), dpt[i], dl[i] + 0 }
	' "$W/fld_id" "$W/fld_sourceIP" "$W/fld_destinationIP" "$W/fld_destinationPort" \
	  "$W/fld_download" "$W/fld_host" > "$2"
}
if [ -s "$W/conn.start" ] && [ -s "$W/conn.end" ] && command -v jsonfilter >/dev/null 2>&1; then
	conn_tsv "$W/conn.start" "$W/cs.tsv"; conn_tsv "$W/conn.end" "$W/ce.tsv"
	echo
	echo "--- СКОЛЬКО ПРИНЯЛ ЭТОТ КЛИЕНТ ПО КАЖДОМУ СОЕДИНЕНИЮ ---"
	awk -F'\t' -v client="$CLIENT" -v T="$T" '
	FNR == NR { was[$1] = $5; next }
	{
		if (client != "" && $2 != client) next
		d = $5 - ($1 in was ? was[$1] : 0); if (d < 0) d = $5
		if (d > 0) printf "%d\t%s\t%s\n", d, $3, $4
	}' "$W/cs.tsv" "$W/ce.tsv" > "$W/perconn.tsv"
	sort -rn "$W/perconn.tsv" | head -20 | awk -F'\t' -v T="$T" \
		'{printf "     %-28s :%-6s %9.1f КБ   %7.1f КБ/с\n", $2, $3, $1/1024, $1/1024/T}'
	awk -F'\t' -v T="$T" '{s += $1} END {
		printf "     ИТОГО клиенту: %.1f МБ за %d с = %.0f КБ/с\n", s/1048576, T, s/1024/T
		if (s == 0) print "     (клиент за окно ничего не качал — репродукция не попала в окно)"
	}' "$W/perconn.tsv"
	echo "     учтены только соединения, дожившие до конца окна"
fi

# --- скорость по тоннелю за окно (весь дом) --------------------------------
if [ -s "$W/conn.start" ] && [ -s "$W/conn.end" ]; then
	echo
	echo "--- ТРАФИК ЧЕРЕЗ ТОННЕЛЬ ЗА ОКНО ---"
	for f in start end; do
		tr '{' '\n' < "$W/conn.$f" | grep -o '"download":[0-9]*' | cut -d: -f2 \
			| awk -v t="$f" '{s+=$1} END {print t, s+0}'
	done | awk -v T="$T" '{v[$1]=$2} END {
		d = v["end"] - v["start"]; if (d < 0) d = v["end"]
		printf "  скачано через прокси: %.1f МБ за окно (%.0f КБ/с в среднем)\n", d/1048576, d/1024/T
	}'
fi

echo
echo "Подсказки:"
echo " • пусто в «мимо тоннеля» и медиа всё равно тормозит → дело не в перехвате, смотрите узел VPN"
echo "   (задержка/скорость) и раздел «решения mihomo»."
echo " • TELEGRAM-строки в «мимо тоннеля» → расширить nikki.proxy.proxy_tcp_dport."
