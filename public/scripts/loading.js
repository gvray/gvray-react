/**
 * loading 占位
 * 解决首次加载时白屏的问题
 * Loader 动效参考 Uiverse.io by SelfMadeSystem
 */
(function () {
  // 提前解析存储的主题，让 loading 屏背景与即将挂载的应用一致，
  // 避免依赖 prefers-color-scheme 导致的亮/暗闪烁。
  try {
    var raw = localStorage.getItem('app-settings');
    var mode = raw ? JSON.parse(raw).state.theme : null;
    var resolved =
      mode === 'light' || mode === 'dark'
        ? mode
        : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    /* 解析失败时由下方 @media 兜底 */
  }

  const _app = document.querySelector('#root');
  if (_app && _app.innerHTML === '') {
    _app.innerHTML = `
      <style>
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 320px;
          background: #f5f5f5;
        }

        /* ---- Loader (Uiverse.io by SelfMadeSystem) ---- */
        .loader {
          display: flex;
          margin: 0.25em 0;
        }

        .absolute {
          position: absolute;
        }

        .inline-block {
          display: inline-block;
        }

        .w-2 {
          width: 0.5em;
        }

        .dash {
          animation: dashArray 2s ease-in-out infinite,
            dashOffset 2s linear infinite;
        }

        .spin {
          animation: spinDashArray 2s ease-in-out infinite,
            spin 8s ease-in-out infinite,
            dashOffset 2s linear infinite;
          transform-origin: center;
        }

        @keyframes dashArray {
          0% {
            stroke-dasharray: 0 1 359 0;
          }
          50% {
            stroke-dasharray: 0 359 1 0;
          }
          100% {
            stroke-dasharray: 359 1 0 0;
          }
        }

        @keyframes spinDashArray {
          0% {
            stroke-dasharray: 270 90;
          }
          50% {
            stroke-dasharray: 0 360;
          }
          100% {
            stroke-dasharray: 270 90;
          }
        }

        @keyframes dashOffset {
          0% {
            stroke-dashoffset: 365;
          }
          100% {
            stroke-dashoffset: 5;
          }
        }

        @keyframes spin {
          0% {
            rotate: 0deg;
          }
          12.5%,
          25% {
            rotate: 270deg;
          }
          37.5%,
          50% {
            rotate: 540deg;
          }
          62.5%,
          75% {
            rotate: 810deg;
          }
          87.5%,
          100% {
            rotate: 1080deg;
          }
        }

        html[data-theme='dark'] .loading-screen {
          background: #000;
        }
      </style>

      <div class="loading-screen">
        <div class="loader">
          <svg height="0" width="0" viewBox="0 0 64 64" class="absolute">
            <defs xmlns="http://www.w3.org/2000/svg">
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="b">
                <stop stop-color="#973BED"></stop>
                <stop stop-color="#007CFF" offset="1"></stop>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="c">
                <stop stop-color="#FFC800"></stop>
                <stop stop-color="#F0F" offset="1"></stop>
                <animateTransform repeatCount="indefinite" keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1" keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1" dur="8s" values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32" type="rotate" attributeName="gradientTransform"></animateTransform>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="d">
                <stop stop-color="#00E0ED"></stop>
                <stop stop-color="#00DA72" offset="1"></stop>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="e">
                <stop stop-color="#FF3D00"></stop>
                <stop stop-color="#FF9100" offset="1"></stop>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="f">
                <stop stop-color="#651FFF"></stop>
                <stop stop-color="#00E5FF" offset="1"></stop>
              </linearGradient>
            </defs>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#b)" d="M 48,16 A 23,23 0 1 0 48,48 M 48,32 L 32,32" class="dash" id="g" pathLength="360"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#c)" d="M 12,12 L 32,52 L 52,12" class="dash" id="v" pathLength="360"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#d)" d="M 16,12 L 38,12 A 13,13 0 0 1 38,38 L 16,38 L 16,52 M 30,38 L 50,52" class="dash" id="r" pathLength="360"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#e)" d="M 10,52 L 32,12 L 54,52 M 19,38 L 45,38" class="dash" id="a" pathLength="360"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
            <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#f)" d="M 12,12 L 32,34 L 52,12 M 32,34 L 32,52" class="dash" id="y" pathLength="360"></path>
          </svg>
        </div>
      </div>
    `;
  }
})();
