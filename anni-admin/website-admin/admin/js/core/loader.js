/* =========================================
   GLOBAL TOP LOADER
========================================= */

const Loader = (() => {

  const loader = document.getElementById("topLoader");

  let isActive = false;
  let startTime = 0;

  const MIN_TIME = 400;
  const MAX_TIME = 10000; // emergency auto-stop

  let safetyTimeout = null;


  /* =========================================
     START LOADER
  ========================================= */

  function start() {

    if (!loader) return;
    if (isActive) return;

    isActive = true;
    startTime = Date.now();

    loader.classList.add("active");

    /* Emergency stop protection */
    safetyTimeout = setTimeout(() => {
      console.warn("Loader safety stop triggered");
      stop();
    }, MAX_TIME);

  }


  /* =========================================
     STOP LOADER
  ========================================= */

  function stop() {

    if (!loader) return;
    if (!isActive) return;

    const elapsed = Date.now() - startTime;
    const remaining = MIN_TIME - elapsed;

    const finish = () => {

      loader.classList.remove("active");

      clearTimeout(safetyTimeout);

      isActive = false;
      startTime = 0;

    };

    if (remaining > 0) {
      setTimeout(finish, remaining);
    } else {
      finish();
    }

  }


  return {
    start,
    stop
  };

})();