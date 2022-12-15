const LABEL_COLORS = {
  general: '#888',
  fid: 'purple',
  cls: '#c50',
  lcp: 'green',
  tbt: 'red',
  paint: '#b73',
};

const DEFAULT_OPTIONS = {
  cls: true,
  fid: true,
  lcp: true,
  tbt: true,
  paints: true,
  resources: true,
}

function log(message, time = new Date() - performance.timeOrigin, type = 'general') {
  const color = LABEL_COLORS[type] || LABEL_COLORS.general;
  console.log(
    `%c${Math.round(time).toString().padStart(5, ' ')}%c %c${type}%c ${message}`,
    'background-color: #444; padding: 3px; border-radius: 3px;',
    '',
    `background-color: ${color}; padding: 3px 5px; border-radius: 3px;`,
    '',
  );
}

function trackFirstInputDelay() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(JSON.stringify(entry), entry.processingStart - entry.startTime, 'fid');
    });
  });
  observer.observe({ type: 'first-input', buffered: true });
}

function trackLagestContentfulPaint() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(JSON.stringify(entry), entry.startTime, 'lcp');
      console.log(entry.element);
    });
  });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

function trackCumulativeLayoutShifts() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const to = entry.sources[0].currentRect;
      const from = entry.sources[0].previousRect;
      log(`${Math.round(entry.value * 100000) / 100000}
      from: ${from.top} ${from.right} ${from.bottom} ${from.left}
      to:   ${to.top} ${to.right} ${to.bottom} ${to.left}`, entry.startTime, 'cls');
      console.log(entry.sources[0].node);
    });
  });
  observer.observe({ type: 'layout-shift', buffered: true });
}

function trackLongTasks() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(JSON.stringify(entry), entry.startTime, 'tbt');
      entry.attribution.forEach((attributionEntry) => {
        console.log(attributionEntry);
      });
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
}

function trackPaints() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(JSON.stringify(entry), entry.startTime, 'paint');
    });
  });
  observer.observe({ type: 'paint', buffered: true });
}

function trackResources() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(`${entry.name} loaded`, Math.round(entry.startTime + entry.duration));
    });
  });
  observer.observe({ type: 'resource', buffered: true });
}

function registerPerformanceLogger() {
  try {
    const polcp = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        log(JSON.stringify(entry), entry.startTime, 'lcp');
        // eslint-disable-next-line no-console
        console.log(entry.element);
      });
    });
    polcp.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // no output
  }
}

export const init = (options) => {
  log('Starting Franklin performance logger');
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (config.fid) {
    trackFirstInputDelay();
  }
  if (config.lcp) {
    trackLagestContentfulPaint();
  }
  if (config.cls) {
    trackCumulativeLayoutShifts();
  }
  if (config.tbt) {
    trackLongTasks();
  }
  if (config.paints) {
    trackPaints();
  }
  if (config.resources) {
    trackResources();
  }
}
