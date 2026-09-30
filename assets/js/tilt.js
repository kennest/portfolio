/* ============================================================
   tilt.js — Effet tilt 3D sur les cartes projets
   Vanilla JS (aucune dépendance). Rotation X/Y suivant la
   souris + reflet lumineux (glare). Désactivé sur écran
   tactile et si prefers-reduced-motion est actif.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  if (reducedMotion || isTouch) return;

  var MAX_TILT = 8; // degrés

  function initTilt() {
    var cards = document.querySelectorAll('.st-portfolio-single');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var inner = card.querySelector('.st-portfolio');
      if (!inner || inner.dataset.tiltBound) return;
      inner.dataset.tiltBound = 'true';

      // Reflet lumineux
      var glare = document.createElement('div');
      glare.className = 'tilt-glare';
      inner.style.position = inner.style.position || 'relative';
      inner.appendChild(glare);

      card.addEventListener('mousemove', function (e) {
        var rect = inner.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * MAX_TILT * 2;
        var rotateX = (0.5 - py) * MAX_TILT * 2;

        inner.style.transition = 'transform 0.06s linear';
        inner.style.transform =
          'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' +
          rotateY.toFixed(2) + 'deg) translateZ(6px)';

        inner.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
        inner.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
        card.classList.add('tilt-active');
      });

      card.addEventListener('mouseleave', function () {
        inner.style.transition = 'transform 0.5s ease';
        inner.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        card.classList.remove('tilt-active');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
  } else {
    initTilt();
  }
})();
