(function () {
  'use strict';

  var STORAGE_KEY = 'install-guide-progress';
  var totalSteps = 0;

  function getSteps() {
    return document.querySelectorAll('.step-check');
  }

  function save(states) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (_) {
      // localStorage may be unavailable; silently ignore
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function updateProgress() {
    var checks = getSteps();
    var completed = 0;
    checks.forEach(function (cb) {
      var step = cb.closest('.step');
      if (cb.checked) {
        completed++;
        step.classList.add('done');
      } else {
        step.classList.remove('done');
      }
    });

    var pct = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressLabel').textContent =
      completed + ' of ' + totalSteps + ' step' + (totalSteps !== 1 ? 's' : '') + ' completed';

    var banner = document.getElementById('completionBanner');
    if (completed === totalSteps && totalSteps > 0) {
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  function persistState() {
    var states = Array.from(getSteps()).map(function (cb) {
      return cb.checked;
    });
    save(states);
  }

  function restoreState() {
    var states = load();
    if (!states) return;
    var checks = getSteps();
    states.forEach(function (checked, i) {
      if (checks[i]) {
        checks[i].checked = checked;
      }
    });
  }

  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var codeEl = btn.previousElementSibling;
        if (!codeEl) return;
        var text = codeEl.textContent || '';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            showCopied(btn);
          }).catch(function () {
            fallbackCopy(text, btn);
          });
        } else {
          fallbackCopy(text, btn);
        }
      });
    });
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (_) {
      // copy failed silently
    }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
    }, 1500);
  }

  function init() {
    var checks = getSteps();
    totalSteps = checks.length;

    restoreState();
    updateProgress();

    checks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        updateProgress();
        persistState();
      });
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      getSteps().forEach(function (cb) {
        cb.checked = false;
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
      updateProgress();
    });

    initCopyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
