let ticking = false;
let last_known_scroll_position = 0;

function isScrolledIntoView(el) {
  let rect = el.getBoundingClientRect();
  // Add 250px to make sure at least halfway scrolled past before starting animation
  return (rect.top + 250) < window.innerHeight;
}

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function() {
      // Run scroll listeners to trigger animations
      scrollChangedOutput(last_known_scroll_position);
      scrollChangedInvestment(last_known_scroll_position);
      ticking = false;
    });

    ticking = true;
  }
});

