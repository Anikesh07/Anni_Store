/* =========================================
   UI TRANSITION HELPER
========================================= */

const Transition = (() => {

  function fadeOut(element, duration = 200) {

    return new Promise(resolve => {

      if (!element) {
        resolve();
        return;
      }

      element.style.opacity = 1;
      element.style.transition = `opacity ${duration}ms ease`;

      requestAnimationFrame(() => {
        element.style.opacity = 0;
      });

      setTimeout(() => {

        element.style.transition = "";
        resolve();

      }, duration);

    });

  }


  function fadeIn(element, duration = 250) {

    return new Promise(resolve => {

      if (!element) {
        resolve();
        return;
      }

      element.style.opacity = 0;
      element.style.transition = `opacity ${duration}ms ease`;

      requestAnimationFrame(() => {
        element.style.opacity = 1;
      });

      setTimeout(() => {

        element.style.transition = "";
        resolve();

      }, duration);

    });

  }


  return {
    fadeOut,
    fadeIn
  };

})();