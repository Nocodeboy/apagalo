#!/usr/bin/env python3
"""Modelo de ingresos de ¡Apágalo! / Put It Out! en Android (anuncios AdMob + compras de Google Play).

Uso:
    python3 tools/revenue_model.py              # todas las tablas
    python3 tools/revenue_model.py ltv precios  # solo esas secciones

Secciones: supuestos, anuncios, ltv, paises, escenarios, palancas, economia, precios.
Imprime tablas en Markdown; docs/monetizacion.md copia exactamente esta salida.

Todos los datos de entrada están en el bloque SUPUESTOS. Los que salen de una fuente llevan la fuente
en el comentario (enlaces en docs/monetizacion.md, sección «Fuentes»); el resto dice «estimación».
Cambia lo que quieras y vuelve a ejecutar. Solo usa la biblioteca estándar.
Importes en USD salvo que se diga EUR. «LTV Dn» = ingresos netos por instalación en los días 0 a n-1.
"""
import sys
from math import log

# ============================================================================================
# SUPUESTOS
# ============================================================================================

# Tipos de cambio de referencia del BCE, 25 sept 2026: unidades de cada moneda por 1 EUR.
ECB_PER_EUR = {'EUR': 1.0, 'USD': 1.1403, 'GBP': 0.86045, 'JPY': 179.70, 'KRW': 1545.16,
               'CAD': 1.6127, 'AUD': 1.6220, 'MXN': 20.1816, 'BRL': 5.9091}
USD_PER_EUR = ECB_PER_EUR['USD']

# Comisión de Google Play por compra, primer millón de USD al año: 10 % + 5 % de facturación en
# EEE, Reino Unido y EE. UU. desde el 30 jun 2026; 15 % en el resto (nivel del 15 %).
PLAY_FEE = 0.15

# eCPM de Android en EE. UU. (USD por 1000 impresiones), antes del factor de realismo del escenario.
US_RV_ECPM = 9.0  # bonificado. Estimación anclada en TopOn H1 2025 (Europa+Norteamérica Android 8,90)
                  # y Appodeal Q4 2024 (Norteamérica Android 9,20)
US_IS_ECPM = 5.5  # intersticial. Estimación anclada en TopOn H1 2025 (Europa+Norteamérica Android 4,36)
                  # y MonetizeMore 2024 (EE. UU. 6,50-8,57, sin separar iOS/Android)

# País: (nombre, eCPM bonificado relativo a EE. UU., eCPM intersticial relativo, IVA que va dentro
#        del precio de la tienda (0 donde Play lo muestra sin impuestos), moneda, multiplicador de
#        gasto en compras relativo a EE. UU.)
# Relativos de GB/AU/JP/KR: Appodeal Q4 2024, media iOS+Android (bonificado EE. UU. 15,15; GB 10,65;
# AU 13,80; JP 10,80; KR 12,00 · intersticial EE. UU. 12,65; GB 7,25; AU 9,10; JP 7,20; KR 8,65).
# MX/BR: TopOn H1 2025 Latinoamérica frente a Europa+Norteamérica, Android (2,18/8,90 y 0,98/4,36).
# DE/FR/CA/ES/resto y todos los multiplicadores de compras: estimación (no hay dato público por país).
# IVA: Play pone precios con impuestos incluidos en todos estos países salvo EE. UU. y Canadá.
COUNTRIES = {
    'US': ('EE. UU.', 1.00, 1.00, 0.00, 'USD', 1.0),
    'GB': ('Reino Unido', 0.70, 0.57, 0.20, 'GBP', 1.0),
    'DE': ('Alemania', 0.65, 0.60, 0.19, 'EUR', 1.0),
    'FR': ('Francia', 0.55, 0.50, 0.20, 'EUR', 1.0),
    'CA': ('Canadá', 0.75, 0.65, 0.00, 'CAD', 1.0),
    'AU': ('Australia', 0.91, 0.72, 0.10, 'AUD', 1.0),
    'JP': ('Japón', 0.71, 0.57, 0.10, 'JPY', 1.0),
    'KR': ('Corea del Sur', 0.79, 0.68, 0.10, 'KRW', 1.0),
    'ES': ('España', 0.40, 0.35, 0.21, 'EUR', 0.7),
    'MX': ('México', 0.245, 0.225, 0.16, 'MXN', 0.4),
    'BR': ('Brasil', 0.245, 0.225, 0.00, 'BRL', 0.4),  # IVA 0: Play no publica el tipo (optimista)
    'ROW': ('Resto', 0.15, 0.15, 0.10, 'USD', 0.3),
}

# Reparto por país de las instalaciones (estimación; sustituir por datos reales de Play Console).
ORGANIC_MIX = {'US': .15, 'GB': .04, 'DE': .04, 'FR': .03, 'CA': .02, 'AU': .02, 'JP': .02, 'KR': .01,
               'ES': .15, 'MX': .08, 'BR': .10, 'ROW': .34}
PAID_MIX = {'US': .50, 'GB': .15, 'CA': .10, 'AU': .10, 'DE': .10, 'FR': .05}  # campaña de primer nivel

# Parte de los ingresos por compras de los primeros 90 días que ya ha entrado en el día n
# (estimación; Mistplay 2024: el 79 % de los pagadores hace su primera compra el primer mes).
# El punto de 365 días (+25 %) es una extrapolación sin fuente.
IAP_SHARE = {0: 0.0, 7: 0.55, 30: 0.80, 90: 1.0, 365: 1.25}

# Escenarios. Retención: puntos D1/D7/D30 anclados en GameAnalytics 2026 (datos de 2025: mediana
# D1 ~22 %, D7 ~4 %, D30 ~0,7 %; top 25 % D1 ~30 %, D7 6-7 %, D30 1,6-1,8 %; top 10 % D1 ~40 %,
# D7 11-12 %). D90 y todo lo demás: estimación.
SCENARIOS = {
    'pesimista': dict(
        retention={1: .25, 7: .05, 30: .012, 90: .004},
        level_ends=3.0,            # finales de nivel por jugador activo y día
        x2_take=.20,               # % de pantallas finales en las que ve el anuncio de x2 monedas
        continue_offers=.4,        # ofertas de +30 s por jugador activo y día
        continue_take=.30,
        free_coin_views=.25,       # anuncios de «+150 monedas» por jugador activo y día (máx. 3)
        is_every=2,                # finales de nivel entre intersticiales (diseño: >= 2)
        fill=.85,                  # anuncios servidos / pedidos
        ecpm_factor=.6,            # solo AdMob, poco volumen, sin consentimiento en parte del EEE
        payer_d90=.005,            # % de instalaciones que compran algo en 90 días
        arppu_d90=2.5,             # gasto bruto por pagador en 90 días (precios de EE. UU.)
        organic_installs_day=5, paid_budget_eur=100, paid_cpi=2.5),
    'base': dict(
        retention={1: .32, 7: .08, 30: .025, 90: .010},
        level_ends=4.5, x2_take=.30, continue_offers=.5, continue_take=.35, free_coin_views=.5,
        is_every=2, fill=.90, ecpm_factor=.8, payer_d90=.012, arppu_d90=3.5,
        organic_installs_day=15, paid_budget_eur=200, paid_cpi=1.75),
    'optimista': dict(
        retention={1: .40, 7: .12, 30: .045, 90: .020},
        level_ends=6.0, x2_take=.40, continue_offers=.6, continue_take=.40, free_coin_views=.9,
        is_every=2, fill=.95, ecpm_factor=1.0, payer_d90=.025, arppu_d90=5.0,
        organic_installs_day=40, paid_budget_eur=300, paid_cpi=1.2),
}
BASE = 'base'

# CPI de referencia en Norteamérica, todos los géneros (Adjust, Gaming App Insights 2026, vía FoxData).
MARKET_CPI_NA = 1.68
# Relación iOS/Android del eCPM en Europa+Norteamérica (TopOn H1 2025): bonificado 12,24/8,90,
# intersticial 10,27/4,36. Solo para la tabla de palancas (iOS aún no existe).
IOS_RV_MULT, IOS_IS_MULT = 12.24 / 8.90, 10.27 / 4.36

# Economía (diseño en curso; ver docs/monetizacion.md).
COINS_BASE = 50               # por final de nivel
COINS_PER_STAR = 50
COINS_SAVED_PER_PCT = 0.5     # bonus por % salvado: 0-50 monedas (estimación de cómo se implementa)
DAILY_COINS_AVG = 200         # reto diario: 100-300
FREE_COINS = 150              # anuncio de la tienda, máx. 3 al día
UPGRADE_COSTS = [200, 500, 1000, 2000, 4000]
UPGRADE_TRACKS = 4
# Perfiles de jugador (estimación): finales de nivel/día, % victorias, estrellas medias al ganar,
# % salvado al ganar / al perder, % de x2 que ve, % de días que juega el reto, anuncios de +150/día.
PROFILES = {
    'casual': (3.0, .60, 1.2, 55, 35, .20, .40, 0.3),
    'típico': (4.5, .70, 1.6, 65, 40, .30, .60, 0.8),
    'implicado': (7.0, .85, 2.3, 80, 50, .45, .90, 2.0),
}

# Catálogo (src/monetize/types.ts): precio base USD y monedas.
PRODUCTS = {'coins_s': (0.99, 1000), 'starter_pack': (1.99, 3000), 'remove_ads': (2.99, 500),
            'coins_m': (4.99, 6000), 'coins_l': (9.99, 14000)}

# ============================================================================================
# CÁLCULO
# ============================================================================================


def retention_curve(anchors, days=365):
    """Retención diaria r(t), t = 0..days-1, con r(0) = 1. Interpola en escala log-log entre los
    puntos dados y extrapola con la pendiente del último tramo."""
    pts = sorted(anchors.items())
    curve = [1.0]
    for t in range(1, days):
        if t <= pts[0][0]:
            curve.append(pts[0][1])
            continue
        seg = next(((a, b) for a, b in zip(pts, pts[1:]) if t <= b[0]), (pts[-2], pts[-1]))
        (d0, r0), (d1, r1) = seg
        slope = (log(r1) - log(r0)) / (log(d1) - log(d0))
        curve.append(r0 * (t / d0) ** slope)
    return curve


def piecewise(points, x):
    pts = sorted(points.items())
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return pts[-1][1]


def ads_per_day(s):
    """Impresiones por jugador activo y día. El intersticial pide >= 2 finales de nivel desde el
    anterior y nunca sale en la primera sesión: se modela como 0 el día 0 y finales/is_every después."""
    rv = (s['level_ends'] * s['x2_take'] + s['continue_offers'] * s['continue_take']
          + s['free_coin_views']) * s['fill']
    inter = s['level_ends'] / s['is_every'] * s['fill']
    return rv, inter


def ecpms(c, s):
    _, rv_r, is_r, *_ = COUNTRIES[c]
    return (US_RV_ECPM * rv_r * s['ecpm_factor'] * s.get('rv_mult', 1),
            US_IS_ECPM * is_r * s['ecpm_factor'] * s.get('is_mult', 1))


def ad_arpdau(c, s, returning=True):
    rv, inter = ads_per_day(s)
    e_rv, e_is = ecpms(c, s)
    return (rv * e_rv + (inter * e_is if returning else 0)) / 1000


def iap_net_factor(c):
    vat = COUNTRIES[c][3]
    return (1 - PLAY_FEE) / (1 + vat)


def ltv(c, s, n, curve):
    """(anuncios, compras) netos por instalación en los días 0..n-1."""
    ads = curve[0] * ad_arpdau(c, s, returning=False) + sum(curve[1:n]) * ad_arpdau(c, s)
    iap = s['payer_d90'] * s['arppu_d90'] * piecewise(IAP_SHARE, n) * COUNTRIES[c][5] * iap_net_factor(c)
    return ads, iap


def ltv_mix(mix, s, n, curve):
    a = sum(w * ltv(c, s, n, curve)[0] for c, w in mix.items())
    i = sum(w * ltv(c, s, n, curve)[1] for c, w in mix.items())
    return a, i


def steady_state(s):
    curve = retention_curve(s['retention'])
    org = s['organic_installs_day']
    paid = s['paid_budget_eur'] * USD_PER_EUR / 30 / s['paid_cpi']
    dau = (org + paid) * sum(curve[:90])
    lo, lp = sum(ltv_mix(ORGANIC_MIX, s, 90, curve)), sum(ltv_mix(PAID_MIX, s, 90, curve))
    daily = org * lo + paid * lp
    ads_daily = org * ltv_mix(ORGANIC_MIX, s, 90, curve)[0] + paid * ltv_mix(PAID_MIX, s, 90, curve)[0]
    return dict(curve=curve, org=org, paid=paid, dau=dau, daily=daily, ads_share=ads_daily / daily,
                arpdau=daily / dau, month_usd=30 * daily, month_eur=30 * daily / USD_PER_EUR,
                spend_eur=s['paid_budget_eur'],
                roas={n: sum(ltv_mix(PAID_MIX, s, n, curve)) / s['paid_cpi'] for n in (7, 30, 90)})


# ============================================================================================
# SALIDA
# ============================================================================================

def table(headers, rows, align=None):
    align = align or ['l'] + ['r'] * (len(headers) - 1)
    sep = ['---:' if a == 'r' else '---' for a in align]
    print('| ' + ' | '.join(headers) + ' |')
    print('|' + '|'.join(sep) + '|')
    for r in rows:
        print('| ' + ' | '.join(str(x) for x in r) + ' |')
    print()


def pct(x, d=1):
    return f'{x * 100:.{d}f} %'.replace('.', ',')


def num(x, d=2):
    s = f'{x:,.{d}f}'
    return s.replace(',', ' ').replace('.', ',').replace(' ', '.')


def money(x, d=2, sym='$'):
    return f'{num(x, d)} {sym}'


def sec_supuestos():
    print('### Supuestos por escenario\n')
    rows = []
    keys = [('D1 / D7 / D30 / D90', lambda s: ' / '.join(pct(s['retention'][d], 1) for d in (1, 7, 30, 90))),
            ('Finales de nivel por jugador y día', lambda s: num(s['level_ends'], 1)),
            ('% que ve x2 al final', lambda s: pct(s['x2_take'], 0)),
            ('Ofertas de +30 s por día · % que acepta', lambda s: f"{num(s['continue_offers'], 1)} · {pct(s['continue_take'], 0)}"),
            ('Anuncios de +150 monedas por día', lambda s: num(s['free_coin_views'], 2)),
            ('Relleno (fill)', lambda s: pct(s['fill'], 0)),
            ('Factor de realismo del eCPM', lambda s: num(s['ecpm_factor'], 1)),
            ('Pagadores en 90 días · gasto bruto por pagador', lambda s: f"{pct(s['payer_d90'], 1)} · {money(s['arppu_d90'])}"),
            ('Instalaciones orgánicas al día', lambda s: num(s['organic_installs_day'], 0)),
            ('Presupuesto de pago al mes · CPI medio', lambda s: f"{s['paid_budget_eur']} € · {money(s['paid_cpi'])}")]
    for label, f in keys:
        rows.append([label] + [f(SCENARIOS[k]) for k in SCENARIOS])
    table(['Supuesto'] + list(SCENARIOS), rows, ['l', 'r', 'r', 'r'])


def sec_anuncios():
    print('### Anuncios por jugador activo y día\n')
    rows = []
    for k, s in SCENARIOS.items():
        rv, inter = ads_per_day(s)
        e_rv, e_is = ecpms('US', s)
        rows.append([k, num(rv), num(inter), money(e_rv), money(e_is),
                     money(ad_arpdau('US', s), 4), money(ad_arpdau('US', s, returning=False), 4)])
    table(['Escenario', 'Bonificados', 'Intersticiales (desde el día 1)', 'eCPM bonif. EE. UU.',
           'eCPM inters. EE. UU.', 'ARPDAU anuncios EE. UU.', 'Ídem el día 0'], rows)


def sec_ltv():
    s = SCENARIOS[BASE]
    curve = retention_curve(s['retention'])
    print(f'### LTV y CPI de equilibrio por país (escenario {BASE}, Android)\n')
    print('CPI de equilibrio = LTV D90 (recuperar la inversión en 90 días). «ROAS D7 objetivo» = '
          'LTV D7 / LTV D90: el ROAS a 7 días que indica que la cohorte va camino de recuperarse.\n')
    rows = []
    for c in COUNTRIES:
        name = COUNTRIES[c][0]
        l7, l30, l90, l365 = (sum(ltv(c, s, n, curve)) for n in (7, 30, 90, 365))
        a90, i90 = ltv(c, s, 90, curve)
        be = {k: sum(ltv(c, v, 90, retention_curve(v['retention']))) for k, v in SCENARIOS.items()}
        rows.append([name, money(ad_arpdau(c, s), 3), money(l7, 3), money(l30, 3), money(l90, 3),
                     money(l365, 3), pct(a90 / l90, 0), pct(l7 / l90, 0),
                     money(be['pesimista'], 2), money(be['base'], 2), money(be['optimista'], 2)])
    table(['País', 'ARPDAU anuncios', 'LTV D7', 'LTV D30', 'LTV D90', 'LTV D365 (extrap.)', '% anuncios (D90)',
           'ROAS D7 objetivo',
           'CPI equilibrio pesim.', 'CPI equilibrio base', 'CPI equilibrio optim.'], rows)


def sec_paises():
    print('### ARPDAU total y LTV D30 por país en los tres escenarios\n')
    print('ARPDAU total = (anuncios + compras) de los primeros 90 días / días activos en ese periodo. '
          'El LTV D90 de cada escenario es la columna «CPI equilibrio» de la tabla anterior.\n')
    curves = {k: retention_curve(v['retention']) for k, v in SCENARIOS.items()}
    rows = []
    for c in COUNTRIES:
        arpdau = [sum(ltv(c, v, 90, curves[k])) / sum(curves[k][:90]) for k, v in SCENARIOS.items()]
        l30 = [sum(ltv(c, v, 30, curves[k])) for k, v in SCENARIOS.items()]
        rows.append([COUNTRIES[c][0], ' · '.join(money(x, 3) for x in arpdau),
                     ' · '.join(money(x, 3) for x in l30)])
    table(['País', 'ARPDAU total (pesim. · base · optim.)', 'LTV D30 (pesim. · base · optim.)'], rows)


def sec_escenarios():
    print('### Escenarios: estado estable tras 90 días de instalaciones constantes\n')
    res = {k: steady_state(s) for k, s in SCENARIOS.items()}
    rows = [
        ['Instalaciones orgánicas / día'] + [num(r['org'], 1) for r in res.values()],
        ['Instalaciones de pago / día'] + [num(r['paid'], 1) for r in res.values()],
        ['Días activos por instalación (90 días)'] + [num(sum(r['curve'][:90]), 2) for r in res.values()],
        ['DAU'] + [num(r['dau'], 0) for r in res.values()],
        ['ARPDAU total'] + [money(r['arpdau'], 3) for r in res.values()],
        ['% de ingresos por anuncios'] + [pct(r['ads_share'], 0) for r in res.values()],
        ['Ingresos netos al mes'] + [money(r['month_eur'], 0, '€') for r in res.values()],
        ['Gasto en publicidad al mes'] + [money(r['spend_eur'], 0, '€') for r in res.values()],
        ['Resultado al mes'] + [money(r['month_eur'] - r['spend_eur'], 0, '€') for r in res.values()],
        ['ROAS D7 / D30 / D90 de la cohorte de pago'] + [' / '.join(pct(r['roas'][n], 0) for n in (7, 30, 90)) for r in res.values()],
    ]
    table(['Métrica'] + list(res), rows)


def sec_palancas():
    b, o = SCENARIOS['base'], SCENARIOS['optimista']
    mon = {k: v for k, v in o.items() if k not in ('retention',)}
    cases = [
        ('base', b),
        ('base con la retención del optimista', {**b, 'retention': o['retention']}),
        ('base con la monetización del optimista', {**mon, 'retention': b['retention']}),
        ('optimista', o),
        ('optimista + intersticial en cada final de nivel', {**o, 'is_every': 1}),
        ('optimista + eCPM de iOS (versión futura)', {**o, 'rv_mult': IOS_RV_MULT, 'is_mult': IOS_IS_MULT}),
    ]
    print(f'### Palancas: LTV D90 en EE. UU. frente a un CPI de {money(MARKET_CPI_NA)}\n')
    rows = []
    for label, sc in cases:
        l90 = sum(ltv('US', sc, 90, retention_curve(sc['retention'])))
        rows.append([label, money(ad_arpdau('US', sc), 3), money(l90, 3), pct(l90 / MARKET_CPI_NA, 0),
                     num(MARKET_CPI_NA / l90, 1) + ' ×'])
    table(['Caso', 'ARPDAU anuncios EE. UU.', 'LTV D90 EE. UU.', 'Cubre del CPI', 'Falta multiplicar por'], rows)


def sec_economia():
    total = sum(UPGRADE_COSTS) * UPGRADE_TRACKS
    tier2 = sum(UPGRADE_COSTS[:2]) * UPGRADE_TRACKS
    tier3 = sum(UPGRADE_COSTS[:3]) * UPGRADE_TRACKS
    print(f'### Ritmo de la economía (maximizar todo = {num(total, 0)} monedas)\n')
    rows = []
    for name, (le, win, stars, saved_w, saved_l, x2, daily, free) in PROFILES.items():
        per_win = COINS_BASE + COINS_PER_STAR * stars + COINS_SAVED_PER_PCT * saved_w
        per_loss = COINS_BASE + COINS_SAVED_PER_PCT * saved_l
        per_end = (win * per_win + (1 - win) * per_loss) * (1 + x2)
        day = le * per_end + daily * DAILY_COINS_AVG + free * FREE_COINS
        rows.append([name, num(le, 1), num(per_end, 0), num(day, 0), num(tier2 / day, 1),
                     num(tier3 / day, 1), num(total / day, 1),
                     num(PRODUCTS['coins_m'][1] / day, 1), num(PRODUCTS['coins_l'][1] / day, 1)])
    table(['Perfil', 'Finales/día', 'Monedas por final (con x2)', 'Monedas por día activo',
           f'Días hasta nivel 2 en todo ({num(tier2, 0)})', f'Días hasta nivel 3 en todo ({num(tier3, 0)})',
           'Días hasta el máximo', 'coins_m equivale a (días)', 'coins_l equivale a (días)'], rows)
    print('Monedas por dólar de cada producto: ' + ', '.join(
        f'{p} {num(c / usd, 0)}' for p, (usd, c) in PRODUCTS.items()) + '.\n')


def round_local(value, cur):
    if cur == 'JPY':
        return round(value, -2) if value >= 1000 else round(value, -1)
    if cur == 'KRW':
        return round(value, -2)
    if cur == 'MXN':
        cands = [10 * k + 9 for k in range(0, 200)]
        return min(cands, key=lambda v: abs(v - value))
    ends = (.49, .99) if value < 10 else (.99,)
    cands = [k + e for k in range(0, 500) for e in ends]
    return min(cands, key=lambda v: abs(v - value))


def fmt_local(v, cur):
    sym = {'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'KRW': '₩', 'CAD': 'C$', 'AUD': 'A$',
           'MXN': 'MX$', 'BRL': 'R$'}[cur]
    d = 0 if cur in ('JPY', 'KRW', 'MXN') else 2
    return f'{num(v, d)} {sym}'


def sec_precios():
    print('### Precios locales propuestos (paridad con el precio en USD, con impuestos donde Play los incluye)\n')
    print('Última columna: lo que te llega por una venta de coins_s (0,99 USD de base) '
          'tras quitar impuestos y la comisión del 15 %.\n')
    rows = []
    for c in ['US', 'GB', 'DE', 'FR', 'ES', 'CA', 'AU', 'JP', 'KR', 'MX', 'BR']:
        name, _, _, vat, cur, _ = COUNTRIES[c]
        fx = ECB_PER_EUR[cur] / USD_PER_EUR
        prices = [round_local(usd * fx * (1 + vat), cur) if c != 'US' else usd for usd, _ in PRODUCTS.values()]
        net_s = prices[0] / (1 + vat) / fx * (1 - PLAY_FEE)
        rows.append([name] + [fmt_local(p, cur) for p in prices] + [money(net_s)])
    table(['País'] + [f'{p} ({money(u)})' for p, (u, _) in PRODUCTS.items()] + ['Neto por coins_s'], rows)


SECTIONS = {'supuestos': sec_supuestos, 'anuncios': sec_anuncios, 'ltv': sec_ltv,
            'paises': sec_paises, 'escenarios': sec_escenarios, 'palancas': sec_palancas, 'economia': sec_economia,
            'precios': sec_precios}

if __name__ == '__main__':
    wanted = sys.argv[1:] or list(SECTIONS)
    for name in wanted:
        if name not in SECTIONS:
            sys.exit(f'Sección desconocida: {name}. Opciones: {", ".join(SECTIONS)}')
        SECTIONS[name]()
