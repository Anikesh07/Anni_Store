/* =========================================================
   EMPLOYEE MODULE
========================================================= */

let employeeCache = [];

/* =========================================================
   LOAD MODULE
========================================================= */

window.loadEmployeeModule = async function () {

  const section = document.getElementById("employee");
  if (!section) return;

  section.innerHTML = `
  
  <div class="module-header">
      <h2>Employee Management</h2>
      <button id="createEmployeeBtn" class="btn-primary">
        + Add Employee
      </button>
  </div>

  <div class="employee-filters">

      <input 
        type="text" 
        id="employeeSearch"
        placeholder="Search employee..."
      />

      <select id="employeeStatusFilter">
        <option value="">All Status</option>
        <option value="INVITED">Invited</option>
        <option value="ACTIVE">Active</option>
        <option value="TERMINATED">Terminated</option>
        <option value="BLACKLISTED">Blacklisted</option>
      </select>

  </div>

  <div class="table-container">

    <table class="data-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Status</th>
          <th>Salary</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody id="employeeTableBody">
        <tr>
          <td colspan="5">Loading...</td>
        </tr>
      </tbody>

    </table>

  </div>
  
  `;

  attachEmployeeEvents();

  await loadEmployees();
};


/* =========================================================
   EVENTS
========================================================= */

function attachEmployeeEvents() {

  document
    .getElementById("createEmployeeBtn")
    ?.addEventListener("click", openCreateEmployeeModal);

  document
    .getElementById("employeeSearch")
    ?.addEventListener("input", filterEmployees);

  document
    .getElementById("employeeStatusFilter")
    ?.addEventListener("change", filterEmployees);

}


/* =========================================================
   LOAD EMPLOYEES
========================================================= */

async function loadEmployees() {

  const table = document.getElementById("employeeTableBody");

  try {

    const data = await api("/api/employee");

    /* Backend returns { employees, total, page } */
    employeeCache = data.employees || [];

    renderEmployeeTable(employeeCache);

  } catch (err) {

    console.error("Employee load error:", err);

    table.innerHTML = `
      <tr>
        <td colspan="5">Failed to load employees</td>
      </tr>
    `;
  }
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderEmployeeTable(list) {

  const table = document.getElementById("employeeTableBody");

  if (!list.length) {

    table.innerHTML = `
      <tr>
        <td colspan="5">No employees found</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = list.map(emp => {

    return `
      <tr>

        <td>${emp.personal?.name || "-"}</td>

        <td>${emp.professional?.departmentId?.name || "-"}</td>

        <td>
          <span class="status ${emp.employmentStatus}">
            ${emp.employmentStatus}
          </span>
        </td>

        <td>₹${emp.salary?.baseSalary || 0}</td>

        <td>

          <button class="btn-small"
            onclick="editEmployee('${emp._id}')">
            Edit
          </button>

          <button class="btn-small"
            onclick="salaryEditor('${emp._id}')">
            Salary
          </button>

          <button class="btn-small"
            onclick="hireEmployee('${emp._id}')">
            Hire
          </button>

          <button class="btn-small"
            onclick="terminateEmployee('${emp._id}')">
            Terminate
          </button>

        </td>

      </tr>
    `;

  }).join("");

}


/* =========================================================
   FILTER
========================================================= */

function filterEmployees() {

  const search =
    document.getElementById("employeeSearch")
      .value.toLowerCase();

  const status =
    document.getElementById("employeeStatusFilter")
      .value;

  const filtered = employeeCache.filter(emp => {

    const name = emp.personal?.name?.toLowerCase() || "";

    const matchName = name.includes(search);
    const matchStatus = !status || emp.employmentStatus === status;

    return matchName && matchStatus;

  });

  renderEmployeeTable(filtered);

}


/* =========================================================
   CREATE EMPLOYEE
========================================================= */

function openCreateEmployeeModal() {

  openModal(`

    <div class="modal-header">
      <h3>Create Employee</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <input id="empName" placeholder="Name"/>
    <input id="empEmail" placeholder="Email"/>
    <input id="empPhone" placeholder="Phone"/>

    <button id="saveEmployeeBtn" class="btn-primary">
      Create
    </button>

  `);

  document
    .getElementById("saveEmployeeBtn")
    .addEventListener("click", createEmployee);

}

async function createEmployee() {

  const name = document.getElementById("empName").value;
  const email = document.getElementById("empEmail").value;
  const phone = document.getElementById("empPhone").value;

  if (!name || !email) {
    alert("Name and email are required");
    return;
  }

  try {

async function createEmployee() {

  const name = document.getElementById("empName").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const phone = document.getElementById("empPhone").value.trim();

  if (!name || !email) {
    alert("Name and email are required");
    return;
  }

  try {

    await api("/api/employee", {
      method: "POST",
      body: {
        name: name,
        email: email,
        phone: phone,
        address: ""
      }
    });

    closeModal();
    await loadEmployees();

  } catch (err) {

    console.error(err);
    alert(err.message || "Failed to create employee");

  }

}

    closeModal();
    await loadEmployees();

  } catch (err) {

    alert(err.message || "Failed to create employee");

  }

}






/* =========================================================
   EDIT EMPLOYEE
========================================================= */

window.editEmployee = function (id) {

  const emp = employeeCache.find(e => e._id === id);
  if (!emp) return;

  openModal(`

    <div class="modal-header">
      <h3>Edit Employee</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <input id="editName" value="${emp.personal?.name || ""}">
    <input id="editPhone" value="${emp.personal?.phone || ""}">
    <input id="editAddress" value="${emp.personal?.address || ""}">

    <button id="updateEmployeeBtn" class="btn-primary">
      Update
    </button>

  `);

  document
    .getElementById("updateEmployeeBtn")
    .onclick = () => updateEmployee(id);

};

async function updateEmployee(id) {

  const token = localStorage.getItem("token");

  await fetch(`${window.API_BASE}/api/employee/update-salary/${id}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify({
      personal: {
        name: document.getElementById("editName").value,
        phone: document.getElementById("editPhone").value,
        address: document.getElementById("editAddress").value
      }
    })

  });

  closeModal();
  await loadEmployees();

}


/* =========================================================
   SALARY EDITOR
========================================================= */

window.salaryEditor = function (id) {

  openModal(`

    <div class="modal-header">
      <h3>Update Salary</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <input id="salaryBase" placeholder="Base Salary">
    <input id="salaryBonus" placeholder="Bonus">
    <input id="salaryMedical" placeholder="Medical Allowance">

    <button id="saveSalaryBtn" class="btn-primary">
      Update
    </button>

  `);

  document
    .getElementById("saveSalaryBtn")
    .onclick = () => updateSalary(id);

};

async function updateSalary(id) {

  const token = localStorage.getItem("token");

  await fetch(`${window.API_BASE}/api/employee/update-salary/${id}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify({
      baseSalary: Number(document.getElementById("salaryBase").value),
      bonus: Number(document.getElementById("salaryBonus").value),
      medicalAllowance: Number(document.getElementById("salaryMedical").value)
    })

  });

  closeModal();
  await loadEmployees();

}


/* =========================================================
   LIFECYCLE
========================================================= */

window.hireEmployee = async function (id) {

  const token = localStorage.getItem("token");

await api(`/api/employee/hire/${id}`, {
  method: "PUT"
});

  await loadEmployees();
};  

window.terminateEmployee = async function (id) {

  const token = localStorage.getItem("token");

  await fetch(`${window.API_BASE}/api/employee/terminate/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  await loadEmployees();
};


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(content) {

  const modal = document.getElementById("globalModal");
  const box = document.getElementById("modalBox");

  box.innerHTML = content;

  modal.classList.remove("hidden");

  modal.onclick = function(e){
    if(e.target === modal){
      closeModal();
    }
  };

}

function closeModal() {

  const modal = document.getElementById("globalModal");
  modal.classList.add("hidden");

}