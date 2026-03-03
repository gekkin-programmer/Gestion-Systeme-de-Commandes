/**
 * Lordicon CDN icon map.
 * Browse & verify at https://lordicon.com/icons
 * Format: https://cdn.lordicon.com/{id}.json
 */
export const ICONS = {
  // Navigation & UI
  cart:         'https://cdn.lordicon.com/pbrgppbb.json',
  close:        'https://cdn.lordicon.com/nqtddedc.json',
  back:         'https://cdn.lordicon.com/xbbgqjhm.json',
  home:         'https://cdn.lordicon.com/cnpvyndp.json',
  settings:     'https://cdn.lordicon.com/ijprrnkp.json',
  edit:         'https://cdn.lordicon.com/wkqslmxq.json',
  trash:        'https://cdn.lordicon.com/jmkrnisz.json',
  download:     'https://cdn.lordicon.com/qlwtyuqk.json',
  search:       'https://cdn.lordicon.com/msoeawqm.json',
  plus:         'https://cdn.lordicon.com/zrkkrrpl.json',
  language:     'https://cdn.lordicon.com/jnzhohhs.json',

  // Status & Feedback
  loading:      'https://cdn.lordicon.com/xjovhxra.json',
  check:        'https://cdn.lordicon.com/oqdmuxru.json',
  success:      'https://cdn.lordicon.com/lupuorrc.json',
  warning:      'https://cdn.lordicon.com/lecprnjb.json',
  error:        'https://cdn.lordicon.com/tdrtiskw.json',
  bell:         'https://cdn.lordicon.com/yvvdxted.json',

  // Restaurant domain
  restaurant:   'https://cdn.lordicon.com/lgtrsqmw.json',
  food:         'https://cdn.lordicon.com/nzixoeyn.json',
  table:        'https://cdn.lordicon.com/rbbnmpcf.json',
  receipt:      'https://cdn.lordicon.com/qnpnbtrj.json',
  qr:           'https://cdn.lordicon.com/hbvyhtse.json',

  // Payment
  cash:         'https://cdn.lordicon.com/qhgmphtg.json',
  phone:        'https://cdn.lordicon.com/srsgifqc.json',
  payment:      'https://cdn.lordicon.com/lfqzielk.json',

  // User & Auth
  user:         'https://cdn.lordicon.com/bgebyztv.json',
  logout:       'https://cdn.lordicon.com/vduvxizq.json',
  lock:         'https://cdn.lordicon.com/mecwbjnp.json',

  // Stats
  chart:        'https://cdn.lordicon.com/iatkgziy.json',
  orders:       'https://cdn.lordicon.com/uigyuiez.json',
  revenue:      'https://cdn.lordicon.com/qhkfolyd.json',
} as const;

export type IconName = keyof typeof ICONS;
