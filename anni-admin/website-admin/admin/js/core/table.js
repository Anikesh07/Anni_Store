/* =========================================
   ADMIN TABLE ENGINE
========================================= */

const AdminTable = {

  render({ container, columns = [], data = [], actions = [] }) {

    const el = document.querySelector(container);
    if (!el) return;

    const headers = columns.map(col =>
      `<th>${col.label}</th>`
    ).join("");

    const rows = data.map(row => {

      const cells = columns.map(col => {

        const value = row[col.key] ?? "-";
        return `<td>${value}</td>`;

      }).join("");

      const actionButtons = actions.length
        ? `<td>${renderActions(actions, row)}</td>`
        : "";

      return `<tr>${cells}${actionButtons}</tr>`;

    }).join("");

    el.innerHTML = `
      <table class="admin-table">

        <thead>
          <tr>
            ${headers}
            ${actions.length ? "<th>Actions</th>" : ""}
          </tr>
        </thead>

        <tbody>
          ${rows || emptyState()}
        </tbody>

      </table>
    `;

  }

};


/* =========================================
   ACTION BUTTONS
========================================= */

function renderActions(actions, row) {

  let buttons = "";

  if (actions.includes("edit")) {
    buttons += `<button class="btn-small edit-btn" data-id="${row._id}">Edit</button>`;
  }

  if (actions.includes("delete")) {
    buttons += `<button class="btn-small danger delete-btn" data-id="${row._id}">Delete</button>`;
  }

  return buttons;

}


/* =========================================
   EMPTY STATE
========================================= */

function emptyState() {
  return `
    <tr>
      <td colspan="10" class="loading-state">
        No data found
      </td>
    </tr>
  `;
}


/* =========================================
   EXPORT
========================================= */

window.AdminTable = AdminTable;