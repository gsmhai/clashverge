import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'
import { requestService } from '@/services/service-request'

/**
 * Toggle handlers shared by the settings switches and the header quick buttons.
 * Both entry points must route TUN through the privileged-service request, so
 * the flow lives here instead of being written twice.
 */
export const useProxyToggles = () => {
  const { verge, mutateVerge, patchVerge } = useVerge()
  // Display the observed OS state, not the requested configuration.
  const { indicator, toggleSystemProxy } = useSystemProxyState()
  const { runState, isTunModeAvailable, isLoading } = useSystemState()

  const { enable_tun_mode } = verge ?? {}

  const applySystemProxyToggle = async (value: boolean) => {
    // Enabling needs a running core; disabling only writes OS state and must
    // stay available.
    if (value && !isLoading && runState.mode === 'NotRunning') {
      showNotice.error('settings.feedback.errors.sysproxy.coreNotReady')
      return false
    }
    await toggleSystemProxy(value)
    return true
  }

  const toggleTunMode = async (value: boolean) => {
    if (value && !isTunModeAvailable) {
      requestService({
        reason: 'tunNeedsService',
        restore: { enable_tun_mode: value },
      })
      return false
    }
    mutateVerge({ ...verge, enable_tun_mode: value }, false)
    await patchVerge({ enable_tun_mode: value })
    return true
  }

  return {
    systemProxyEnabled: indicator,
    tunModeEnabled: (enable_tun_mode && isTunModeAvailable) || false,
    tunModeAvailable: isTunModeAvailable,
    serviceUsable: runState.serviceUsable,
    toggleSystemProxy: applySystemProxyToggle,
    toggleTunMode,
  }
}
