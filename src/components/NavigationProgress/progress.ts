class ProgressManager {
  el: HTMLDivElement | null = null;
  progress = 0;
  timer: any = null;
  requests = 0;

  private getPrimaryColor(): string {
    // 优先从 CSS 变量读取，兼容动态主题切换
    if (typeof window !== 'undefined') {
      const val = getComputedStyle(document.documentElement).getPropertyValue(
        '--ant-primary-color',
      );
      if (val?.trim()) return val.trim();
    }
    return '#1677ff';
  }

  mount() {
    if (this.el) return;

    this.el = document.createElement('div');

    Object.assign(this.el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '2px',
      width: '0%',
      background: this.getPrimaryColor(),
      zIndex: '99999',
      opacity: '0',
      transition: 'width 0.2s ease, opacity 0.2s ease',
    });

    document.body.appendChild(this.el);
  }

  show() {
    if (!this.el) return;
    this.el.style.opacity = '1';
  }

  hide() {
    if (!this.el) return;

    this.el.style.opacity = '0';

    setTimeout(() => {
      if (this.el) {
        this.el.style.width = '0%';
      }
    }, 200);
  }

  render() {
    if (!this.el) return;
    this.el.style.width = `${this.progress}%`;
  }

  start() {
    this.mount();
    this.show();

    if (this.timer) clearInterval(this.timer);

    this.progress = Math.max(this.progress, 20);
    this.render();

    this.timer = setInterval(() => {
      if (this.requests > 0) return;

      if (this.progress < 90) {
        this.progress += Math.random() * 8;
        this.render();
      }
    }, 120);
  }

  inc() {
    this.requests++;
    this.start();
  }

  dec() {
    this.requests = Math.max(0, this.requests - 1);

    if (this.requests === 0) {
      this.finish();
    }
  }

  finish() {
    this.progress = 100;
    this.render();

    setTimeout(() => {
      this.hide();
      this.reset();
    }, 120);
  }

  reset() {
    this.progress = 0;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const progress = new ProgressManager();
