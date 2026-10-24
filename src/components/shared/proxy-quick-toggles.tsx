import { ComputerRounded, TroubleshootRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useProxyToggles } from '@/hooks/use-proxy-toggles'
import { showNotice } from '@/services/notice-service'

/**
 * Header quick buttons for the two switches users toggle most. Behaviour and
 * reported state come from the same hook as the settings switches, so the
 * header can never disagree with the card below it.
 */
export const ProxyQuickToggles = () => {
  const { t } = useTranslation()
  const {
    systemProxyEnabled,
    tunModeEnabled,
    tunModeAvailable,
    toggleSystemProxy,
    toggleTunMode,
  } = useProxyToggles()
  const [pending, setPending] = useState(false)

  const run = async (
    toggle: (value: boolean) => Promise<boolean>,
    next: boolean,
  ) => {
    setPending(true)
    try {
      await toggle(next)
    } catch (error) {
      showNotice.error(error)
    } finally {
      setPending(false)
    }
  }

  const tunStatus = !tunModeAvailable
    ? t('home.components.proxyTun.status.tunModeServiceRequired')
    : tunModeEnabled
      ? t('home.components.proxyTun.status.tunModeEnabled')
      : t('home.components.proxyTun.status.tunModeDisabled')

  const systemProxyStatus = systemProxyEnabled
    ? t('home.components.proxyTun.status.systemProxyEnabled')
    : t('home.components.proxyTun.status.systemProxyDisabled')

  const buttons = [
    {
      key: 'tun',
      icon: TroubleshootRounded,
      label: t('settings.sections.system.toggles.tunMode'),
      status: tunStatus,
      active: tunModeEnabled,
      onClick: () => run(toggleTunMode, !tunModeEnabled),
    },
    {
      key: 'system-proxy',
      icon: ComputerRounded,
      label: t('settings.sections.system.toggles.systemProxy'),
      status: systemProxyStatus,
      active: systemProxyEnabled,
      onClick: () => run(toggleSystemProxy, !systemProxyEnabled),
    },
  ]

  return buttons.map(({ key, icon: Icon, label, status, active, onClick }) => (
    <IconButton
      key={key}
      size="medium"
      color="inherit"
      title={`${label} · ${status}`}
      aria-label={label}
      aria-pressed={active}
      disabled={pending}
      onClick={onClick}
    >
      <Icon
        fontSize="inherit"
        sx={{
          // Off keeps full-strength text colour (the disabled grey read as
          // invisible); on switches to the theme primary and inherits a fat
          // SVG stroke, since these icons are filled paths, not real strokes.
          color: active ? 'primary.main' : 'text.primary',
          ...(active && {
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          }),
        }}
      />
    </IconButton>
  ))
}
