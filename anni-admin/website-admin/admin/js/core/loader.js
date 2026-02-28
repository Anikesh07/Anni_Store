const Loader = (() => {
  const loader = document.getElementById("topLoader");
  let isActive = false;
  let startTime = 0;
  const MIN_TIME = 400;

  function start() {
    if (isActive) return;
    isActive = true;
    startTime = Date.now();
    loader.classList.add("active");
  }

  function stop() {
    if (!isActive) return;

    const elapsed = Date.now() - startTime;
    const remaining = MIN_TIME - elapsed;

    const finish = () => {
      loader.classList.remove("active");
      isActive = false;
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