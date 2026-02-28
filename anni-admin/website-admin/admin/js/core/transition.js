const Transition = (() => {

  function fadeOut(element, duration = 200) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = 0;

      setTimeout(resolve, duration);
    });
  }

  function fadeIn(element, duration = 250) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = 1;

      setTimeout(resolve, duration);
    });
  }

  return {
    fadeOut,
    fadeIn
  };

})();