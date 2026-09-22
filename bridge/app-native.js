/* AppNative — ponte entre o seu site e as funções nativas do app.
 * Inclua este arquivo no seu site:  <script src="/app-native.js"></script>
 * Tudo aqui só funciona dentro do app; no navegador comum isApp === false.
 */
(function () {
  var Cap = window.Capacitor;
  var isApp = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var P = (Cap && Cap.Plugins) || {};

  function need(name) {
    if (!isApp || !P[name]) throw new Error("Função nativa indisponível: " + name);
    return P[name];
  }

  var AppNative = {
    isApp: isApp,
    platform: isApp ? Cap.getPlatform() : "web",

    // Barra de status e splash
    hideSplash: function () { return isApp && P.SplashScreen ? P.SplashScreen.hide() : Promise.resolve(); },

    // Rede
    isOnline: function () {
      return isApp && P.Network ? P.Network.getStatus().then(function (s) { return s.connected; })
        : Promise.resolve(navigator.onLine);
    },

    share: function (opts) { return need("Share").share(opts || {}); },
    camera: {
      takePhoto: function (opts) {
        return need("Camera").getPhoto(Object.assign(
          { quality: 80, resultType: "dataUrl", source: "CAMERA" }, opts || {}));
      },
      pickImage: function (opts) {
        return need("Camera").getPhoto(Object.assign(
          { quality: 80, resultType: "dataUrl", source: "PHOTOS" }, opts || {}));
      }
    },
  };

  // Links externos abrem no navegador do sistema
  if (isApp && P.Browser) {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!/^https?:/i.test(href)) return;
      if (new URL(href, location.href).host === location.host) return;
      e.preventDefault();
      P.Browser.open({ url: href });
    }, true);
  }

  window.AppNative = AppNative;
  if (isApp && P.SplashScreen) {
    window.addEventListener("load", function () { setTimeout(function () { P.SplashScreen.hide(); }, 300); });
  }
})();
