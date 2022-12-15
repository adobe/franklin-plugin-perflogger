/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const LABEL_COLORS = {
  misc: '#444',
  fcp: '#0a0',
  fid: 'purple',
  cls: '#c50',
  lcp: 'green',
  tbt: 'red',
  fp: '#b73',
  load: '#888',
};

const DEFAULT_OPTIONS = {
  debug: false,
  cls: true,
  fcp: true,
  fid: true,
  fp: true,
  lcp: true,
  tbt: true,
  resources: true,
}

function log(message, time = new Date() - performance.timeOrigin, type = 'misc') {
  const color = LABEL_COLORS[type] || LABEL_COLORS.misc;
  console.log(
    `%c${Math.round(time).toString().padStart(5, ' ')}%c %c${type}%c ${message}`,
    'background-color: #444; padding: 3px; border-radius: 3px;',
    '',
    `background-color: ${color}; padding: 3px 5px; border-radius: 3px;`,
    '',
  );
}

function trackFirstContentfulPaint(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntriesByName('first-contentful-paint').forEach((entry) => {
      log('', entry.startTime, 'fcp');
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'paint', buffered: true });
}

function trackFirstInputDelay(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(JSON.stringify(entry), entry.processingStart - entry.startTime, 'fid');
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'first-input', buffered: true });
}

function trackLagestContentfulPaint(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(entry.url, entry.startTime, 'lcp');
      console.log(entry.element);
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

function trackCumulativeLayoutShifts(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      let source = entry.sources[0];
      const to = entry.sources[0].currentRect;
      const from = entry.sources[0].previousRect;
      log(`${Math.round(entry.value * 100000) / 100000}
        from: ${from.top} ${from.right} ${from.bottom} ${from.left}
        to:   ${to.top} ${to.right} ${to.bottom} ${to.left}`, entry.startTime, 'cls');
      let { node } = entry.sources[0];
      console.log(node.nodeType === Node.TEXT_NODE ? node.parentElement : node);
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'layout-shift', buffered: true });
}

function trackLongTasks(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(`${entry.duration}ms`, entry.startTime, 'tbt');
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'longtask', buffered: true });
}

function trackFirstPaint(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntriesByName('first-paint').forEach((entry) => {
      log('', entry.startTime, 'fp');
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'paint', buffered: true });
}

function trackResources(options) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      log(entry.name, Math.round(entry.startTime + entry.duration), 'load');
      if (options.debug) {
        console.log(JSON.stringify(entry));
      }
    });
  });
  observer.observe({ type: 'resource', buffered: true });
}

export const init = (options) => {
  log('Starting Franklin performance logger');
  const config = { ...DEFAULT_OPTIONS, ...options };
  try {
    if (config.fcp) {
      trackFirstContentfulPaint(options);
    }
    if (config.fp) {
      trackFirstPaint(options);
    }
    if (config.fid) {
      trackFirstInputDelay(options);
    }
    if (config.lcp) {
      trackLagestContentfulPaint(options);
    }
    if (config.cls) {
      trackCumulativeLayoutShifts(options);
    }
    if (config.tbt) {
      trackLongTasks(options);
    }
    if (config.resources) {
      trackResources(options);
    }
  } catch (e) {
    // no output
  }
}
