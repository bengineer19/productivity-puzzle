let ticking = false;
let lastKnownScrollPos = 0;

function isScrolledIntoView(el) {
  let rect = el.getBoundingClientRect();
  // Add 250px to make sure at least halfway scrolled past before starting animation
  return (rect.top + 250) < window.innerHeight;
}

window.addEventListener('scroll', function(e) {
  lastKnownScrollPos = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function() {
      // Run scroll listeners to trigger animations
      scrollChangedG7Prod(lastKnownScrollPos);
      scrollChangedOutput(lastKnownScrollPos);
      scrollChangedInvestment(lastKnownScrollPos);
      ticking = false;
    });

    ticking = true;
  }
});


setTimeout(() => {
  // If the graphs are in view without scrolling
  scrollChangedG7Prod(0);
  scrollChangedOutput(0);
  scrollChangedInvestment(0);
}, 500)
