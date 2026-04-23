import { useEffect } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return

    const el = ref.current
    const getFocusable = () => [...el.querySelectorAll(FOCUSABLE)]

    const handler = (e) => {
      if (e.key !== 'Tab') return
      const nodes = getFocusable()
      if (!nodes.length) return
      const first = nodes[0]
      const last  = nodes[nodes.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !el.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last || !el.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    el.addEventListener('keydown', handler)
    // Foca o primeiro elemento ao montar
    const firstFocusable = getFocusable()[0]
    firstFocusable?.focus()

    return () => el.removeEventListener('keydown', handler)
  }, [ref, active])
}
