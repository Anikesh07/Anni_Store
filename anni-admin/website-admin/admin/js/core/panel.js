/* =========================================
   GLOBAL SIDE PANEL CONTROLLER
========================================= */

const Panel = {

  panel: document.getElementById("sidePanel"),
  header: document.getElementById("panelHeader"),
  tabs: document.getElementById("panelTabs"),
  content: document.getElementById("panelContent"),
  footer: document.getElementById("panelFooter"),

  open({ header = "", tabs = "", content = "", footer = "" } = {}) {

    if (!this.panel) return;

    this.header.innerHTML = header;
    this.tabs.innerHTML = tabs;
    this.content.innerHTML = content;
    this.footer.innerHTML = footer;

    this.panel.classList.add("open");

  },

  close() {

    if (!this.panel) return;

    this.panel.classList.remove("open");

  }

};


/* =========================================
   CLOSE BUTTON
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const closeBtn = document.getElementById("panelCloseBtn");

  closeBtn?.addEventListener("click", () => {
    Panel.close();
  });

});


/* =========================================
   EXPORT
========================================= */

window.Panel = Panel;