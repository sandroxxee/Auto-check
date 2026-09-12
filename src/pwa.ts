import { registerSW } from 'virtual:pwa-register';

// Registra o service worker automaticamente com suporte a recarregamento automático
export function registerPWA(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.info('[PWA] Nova versão do AutoCheck Brasil disponível. Atualizando cache...');
      },
      onOfflineReady() {
        console.info('[PWA] AutoCheck Brasil pronto para uso offline.');
      },
      onRegistered(r) {
        console.info('[PWA] Service Worker registrado com sucesso:', r?.scope);
      },
      onRegisterError(error) {
        console.warn('[PWA] Falha ao registrar Service Worker:', error);
      },
    });
  }
}
