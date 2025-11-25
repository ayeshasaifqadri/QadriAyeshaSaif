// --- Cursor logic (desktop + touch) ---
      (function () {
        var crsr = document.getElementById('cursor');
        var blur = document.getElementById('cursor-blur');

        // Helper to set position
        function setPos(x, y) {
          crsr.style.left = x + 'px';
          crsr.style.top = y + 'px';
          blur.style.left = x + 'px';
          blur.style.top = y + 'px';
        }

        // Desktop mouse movement
        function onMouseMove(e) {
          setPos(e.clientX, e.clientY);
        }
        document.addEventListener('mousemove', onMouseMove);

        // Touch support: emulate cursor on touchstart / touchmove, hide on touchend
        var touchTimeout;
        function onTouchStart(e) {
          if (!e.touches || e.touches.length === 0) return;
          var t = e.touches[0];
          setPos(t.clientX, t.clientY);
          crsr.style.display = 'block';
          blur.style.display = 'block';
          // make cursor slightly larger on touch for finger visibility
          crsr.style.transform = 'translate(-50%, -50%) scale(1.4)';
          clearTimeout(touchTimeout);
        }
        function onTouchMove(e) {
          if (!e.touches || e.touches.length === 0) return;
          var t = e.touches[0];
          setPos(t.clientX, t.clientY);
        }
        function onTouchEnd(e) {
          // hide after short delay so user sees click effect
          clearTimeout(touchTimeout);
          touchTimeout = setTimeout(function () {
            crsr.style.transform = 'translate(-50%, -50%) scale(1)';
            crsr.style.display = 'none';
            blur.style.display = 'none';
          }, 220);
        }

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });

        // Pointer interactions for interactive elements (scroller items, audio toggle)
        function scaleCursorBig() {
          crsr.style.transform = 'translate(-50%, -50%) scale(3)';
          crsr.style.border = '1px solid #fff';
          crsr.style.backgroundColor = 'transparent';
        }
        function resetCursor() {
          crsr.style.transform = 'translate(-50%, -50%) scale(1)';
          crsr.style.border = '0px solid #95C11E';
          crsr.style.backgroundColor = '#95C11E';
        }

        // Attach to scroller h4 items and audio toggle
        var interactiveItems = document.querySelectorAll('#scroller h4, #audio-toggle');
        interactiveItems.forEach(function (elem) {
          elem.addEventListener('mouseenter', scaleCursorBig);
          elem.addEventListener('mouseleave', resetCursor);
          // touch-friendly: on touchstart briefly scale
          elem.addEventListener('touchstart', function () {
            scaleCursorBig();
            setTimeout(resetCursor, 280);
          }, { passive: true });
        });

        // Arrow click: on mobile, scroll down one viewport
        var arrow = document.getElementById('arrow');
        if (arrow) {
          arrow.addEventListener('click', function () {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          });
          arrow.addEventListener('touchstart', function () {
            // show quick press feedback
            crsr.style.transform = 'translate(-50%, -50%) scale(1.8)';
            setTimeout(function () { crsr.style.transform = 'translate(-50%, -50%) scale(1)'; }, 220);
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }, { passive: true });
        }

        // Start with cursor hidden on touch devices until touch happens
        if ('ontouchstart' in window) {
          crsr.style.display = 'none';
          blur.style.display = 'none';
        }

      })();

      // --- Audio Toggle Logic ---
      (function () {
          const video = document.getElementById('hero-video'); 
          const audioToggle = document.getElementById('audio-toggle');
          const icon = audioToggle ? audioToggle.querySelector('i') : null;

          if (!video || !audioToggle || !icon) return;

          audioToggle.addEventListener('click', toggleAudio);
          audioToggle.addEventListener('keypress', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleAudio();
              }
          });

          function toggleAudio() {
              if (video.muted) {
                  video.muted = false;
                  video.play().catch(e => {
                      console.warn("Play failed after unmute, user interaction might be required.", e);
                  }); 
                  icon.className = 'ri-volume-up-fill';
                  audioToggle.setAttribute('aria-label', 'Mute Audio');
              } else {
                  video.muted = true;
                  icon.className = 'ri-volume-mute-fill';
                  audioToggle.setAttribute('aria-label', 'Unmute Audio');
              }
          }
      })();

      // --- TEXT CYCLING LOGIC ---
      (function () {
          if (typeof gsap === 'undefined') return;

          const strokeText = document.getElementById('stroke-text');
          const mainText = document.getElementById('main-text');
          const container = document.getElementById('animated-title');

          if (!strokeText || !mainText || !container) return;

          const texts = [
              "عائشة سيف قادري",
              "عائشة",
              "سيف"
          ];
          let currentIndex = 0;
          const duration = 3000; // 3 seconds per cycle

          function updateText(newText) {
              strokeText.textContent = newText;
              mainText.textContent = newText;
          }

          function cycleText() {
              // 1. Fade out the text (0.5s duration)
              gsap.to([strokeText, mainText], {
                  opacity: 0,
                  duration: 0.5,
                  ease: "power1.inOut",
                  onComplete: () => {
                      // 2. Update the index and text content
                      currentIndex = (currentIndex + 1) % texts.length;
                      const nextText = texts[currentIndex];
                      updateText(nextText);

                      // 3. Fade in the new text (0.5s duration)
                      gsap.to([strokeText, mainText], {
                          opacity: 1,
                          duration: 0.5,
                          ease: "power1.inOut",
                          delay: 0.1 // Small delay after text change
                      });
                  }
              });
          }

          // Start the cycle after the initial text displays for the first time
          setInterval(cycleText, duration);
      })();


      // --- GSAP scroll triggers (guarded for missing elements) ---
      try {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);

          // Safe checks
          if (document.querySelector('#main')) {
            gsap.to('#main', {
              backgroundColor: '#000',
              scrollTrigger: {
                trigger: '#main',
                scroller: 'body',
                start: 'top -25%',
                end: 'top -70%',
                scrub: 2,
              },
            });
          }

          if (document.querySelector('#page3 #colon1')) {
            gsap.from('#page3 #colon1', {
              y: -70,
              x: -70,
              scrollTrigger: {
                trigger: '#page3',
                scroller: 'body',
                start: 'top 55%',
                end: 'top 45%',
                scrub: 4,
              },
            });
          }
          if (document.querySelector('#page3 #colon2')) {
            gsap.from('#page3 #colon2', {
              y: 70,
              x: 70,
              scrollTrigger: {
                trigger: '#page3',
                scroller: 'body',
                start: 'top 55%',
                end: 'top 45%',
                scrub: 4,
              },
            });
          }
          if (document.querySelector('#page4 h1')) {
            gsap.from('#page4 h1', {
              y: 50,
              scrollTrigger: {
                trigger: '#page4 h1',
                scroller: 'body',
                start: 'top 75%',
                end: 'top 70%',
                scrub: 3,
              },
            });
          }
        }
      } catch (err) {
        // Fail silently if GSAP not available or triggers error
        console.warn('GSAP/ScrollTrigger issue:', err);
      }

      // --- Optional: auto-scroll for large screens only (keeps original animated scroller feel) ---
      (function () {
        var scroller = document.getElementById('scroller');
        // apply continuous animation for all screens including mobile
        if (scroller && window.innerWidth > 0) {
          var scrollers = document.querySelectorAll('#scroller-in');
          scrollers.forEach(function (el, idx) {
            el.style.animationName = 'scroll';
            el.style.animationDuration = (idx === 0 ? '40s' : '40s');
            el.style.animationTimingFunction = 'linear';
            el.style.animationIterationCount = 'infinite';
          });
          // Keyframes are injected dynamically to avoid overriding mobile behavior
          var style = document.createElement('style');
          style.innerHTML = '@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }';
          document.head.appendChild(style);
        }
      })();

/* -------------------------
   BUBBLE SYSTEM (modified to appear only at page end)
   ------------------------- */
function createBubble(sourceElementId, bubbleText) {
          const source = document.getElementById(sourceElementId);
          const container = document.getElementById('bubble-container');
          if (!source || !container) return;

          const bubble = document.createElement('div');
          bubble.className = 'bubble';
          bubble.innerText = bubbleText;

          // container is fixed so its getBoundingClientRect is viewport-based
          const sourceRect = source.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Calculate initial X position to center the bubble over the source word
          // 30px is half the bubble width (60px/2)
          const initialX = (sourceRect.left + (sourceRect.width / 2)) - containerRect.left;
          bubble.style.left = `${initialX - 30}px`; 

          // Function to burst the bubble (visually remove it)
          const burstBubble = (b) => {
            // Quick visual change for bursting
            b.style.transition = 'opacity 0.1s, transform 0.1s';
            b.style.opacity = '0';
            b.style.transform = 'scale(1.5)';
            // Remove the element after a brief moment
            setTimeout(() => b.remove(), 100);
          };

          // Add click handler to burst it immediately
          bubble.addEventListener('click', function() {
            burstBubble(bubble);
            // Clear the auto-burst timeout if the user bursts it manually
            clearTimeout(bubble.autoBurstTimer);
          });
          
          container.appendChild(bubble);

          // Set timeout for auto-burst (2 seconds, as required)
          // This matches the CSS animation duration, so it bursts as it fades out naturally
          bubble.autoBurstTimer = setTimeout(() => {
            if (document.body.contains(bubble)) {
              burstBubble(bubble);
            }
          }, 2000); // 2000ms = 2 seconds
        }

        function generateRandomBubble() {
          // Alternate between left and right source
          const sourceId = Math.random() < 0.5 ? 'source-left' : 'source-right';
          createBubble(sourceId, 'عائشة'); // Bubble content must be 'عائشة'
        }

/* New logic:
   - Only start generating bubbles when user reaches bottom of the page.
   - Stop generating when user scrolls away from bottom.
   - Show the container (opacity) only when at bottom.
*/
(function () {
    const container = document.getElementById('bubble-container');
    if (!container) return;

    // ensure container is fixed (defensive)
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.right = '0';

    let bubbleInterval = null;
    let initialCreated = false;

    function isAtPageBottom(tolerance = 10) {
        return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - tolerance);
    }

    function startBubbles() {
        if (bubbleInterval) return;
        // show container
        container.classList.add('visible');
        container.setAttribute('aria-hidden', 'false');
        // immediate one for feedback
        generateRandomBubble();
        // then keep creating at 800ms interval
        bubbleInterval = setInterval(generateRandomBubble, 800);
    }

    function stopBubbles() {
        if (!bubbleInterval) return;
        clearInterval(bubbleInterval);
        bubbleInterval = null;
        // hide container (it will still host any active bubbles until they fade)
        container.classList.remove('visible');
        container.setAttribute('aria-hidden', 'true');
    }

    // On scroll, toggle start/stop depending on whether user is at bottom
    function onScrollCheck() {
        if (isAtPageBottom()) {
            startBubbles();
        } else {
            stopBubbles();
        }
    }

    // Also check on resize (page length may change)
    window.addEventListener('scroll', onScrollCheck, { passive: true });
    window.addEventListener('resize', onScrollCheck);

    // Check on load in case user opens the page already at bottom
    window.addEventListener('load', function () {
       // small delay to ensure correct document.body.offsetHeight
       setTimeout(onScrollCheck, 120);
    });
})();
