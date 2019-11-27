const OriginalProxy = Proxy

let isEnable = false

export const enableProxyFormater = () => {
  if (typeof window === 'undefined') return

  if (isEnable) return

  isEnable = true

  // track all proxies in weakset (allows GC)
  const proxy_set = new WeakSet()

  window.Proxy = new OriginalProxy(OriginalProxy, {
    construct(target, args) {
      const proxy = new target(args[0], args[1])
      proxy_set.add(proxy)
      return proxy
    }
  })
  ;(window as any).devtoolsFormatters = [
    {
      header(obj: any) {
        try {
          if (!proxy_set.has(obj)) {
            return null
          }
          return ['object', { object: JSON.parse(JSON.stringify(obj)) }]
        } catch (e) {
          return null
        }
      },
      hasBody() {
        return false
      }
    }
  ]
}

export const disableProxyFormater = () => {
  isEnable = false
  delete (window as any).devtoolsFormatters
  window.Proxy = OriginalProxy
}
