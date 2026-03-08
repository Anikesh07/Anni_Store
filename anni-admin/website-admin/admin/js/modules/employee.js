/* =========================================
   EMPLOYEE MODULE
========================================= */

(() => {

let employees = [];
let filteredEmployees = [];
let departments = [];
let currentPage = 1;
const pageSize = 10;
let totalEmployees = 0;

const roles = [
"EMPLOYEE",
"MANAGER",
"HR",
"COMPANY_OWNER"
];

const employmentTypes = [
"FULL_TIME",
"PART_TIME",
"CONTRACT",
"TRAINEE"
];

const statuses = [
"INVITED",
"ACTIVE",
"TERMINATED",
"BLACKLISTED"
];


/* =========================================
   LOAD MODULE
========================================= */

window.loadEmployeeModule = async function(){

const container = document.getElementById("employee");
if(!container) return;

container.innerHTML = `

<div id="employeeStats" class="employee-stats"></div>

<div class="employee-toolbar">

<input id="employeeSearch"
class="employee-search"
placeholder="Search employee">

<select id="filterRole">
<option value="">Role</option>
${roles.map(r=>`<option value="${r}">${r}</option>`).join("")}
</select>

<select id="filterDepartment">
<option value="">Department</option>
</select>

<select id="filterType">
<option value="">Employment Type</option>
${employmentTypes.map(t=>`<option value="${t}">${t}</option>`).join("")}
</select>

<select id="filterStatus">
<option value="">Status</option>
${statuses.map(s=>`<option value="${s}">${s}</option>`).join("")}
</select>

<button id="addEmployeeBtn" class="btn-primary">
+ Add Employee
</button>

</div>

<div id="employeeTable" class="employee-table"></div>

<div class="employee-pagination-wrapper">
<div id="employeePagination" class="employee-pagination"></div>
</div>

`;

document
.getElementById("addEmployeeBtn")
.addEventListener("click",openAddEmployeeModal);

document
.getElementById("employeeSearch")
.addEventListener("input",handleSearch);

document
.getElementById("filterRole")
.addEventListener("change",applyFilters);

document
.getElementById("filterDepartment")
.addEventListener("change",applyFilters);

document
.getElementById("filterType")
.addEventListener("change",applyFilters);

document
.getElementById("filterStatus")
.addEventListener("change",applyFilters);

await loadDepartments();
await loadEmployees();

};


/* =========================================
   LOAD DEPARTMENTS
========================================= */

async function loadDepartments(){

try{

const res = await api.get("/department");
departments = res || [];

const select = document.getElementById("filterDepartment");

select.innerHTML += departments.map(d=>`
<option value="${d._id}">${d.name}</option>
`).join("");

}catch(err){

console.error("Department load failed",err);

}

}


/* =========================================
   FETCH EMPLOYEES
========================================= */

async function loadEmployees(){

try{

const res = await api.get(
`/employee?page=${currentPage}&limit=${pageSize}`
);

employees = res.employees || [];
filteredEmployees = [...employees];
totalEmployees = res.total || employees.length;

renderStats();
renderTable(filteredEmployees);
renderPagination();

}catch(err){

console.error("Employee load failed",err);

document.getElementById("employeeTable").innerHTML=
`<div class="empty-state">Failed to load employees</div>`;

}

}


/* =========================================
   FILTERS
========================================= */

function applyFilters(){

const role = document.getElementById("filterRole").value;
const department = document.getElementById("filterDepartment").value;
const type = document.getElementById("filterType").value;
const status = document.getElementById("filterStatus").value;

filteredEmployees = employees.filter(emp=>{

if(role && emp.user?.role !== role) return false;

if(department &&
emp.professional?.departmentId?._id !== department) return false;

if(type &&
emp.professional?.employmentType !== type) return false;

if(status &&
emp.employmentStatus !== status) return false;

return true;

});

renderTable(filteredEmployees);

}


/* =========================================
   STATS
========================================= */

function renderStats(){

const stats = document.getElementById("employeeStats");

const active =
employees.filter(e=>e.employmentStatus==="ACTIVE").length;

const invited =
employees.filter(e=>e.employmentStatus==="INVITED").length;

const terminated =
employees.filter(e=>e.employmentStatus==="TERMINATED").length;

stats.innerHTML=`

<div class="stat-card">
<div class="stat-value">${totalEmployees}</div>
<div class="stat-label">Total Employees</div>
</div>

<div class="stat-card">
<div class="stat-value">${active}</div>
<div class="stat-label">Active</div>
</div>

<div class="stat-card">
<div class="stat-value">${invited}</div>
<div class="stat-label">Invited</div>
</div>

<div class="stat-card">
<div class="stat-value">${terminated}</div>
<div class="stat-label">Terminated</div>
</div>

`;

}


/* =========================================
   TABLE
========================================= */

function renderTable(data){

const table=document.getElementById("employeeTable");

if(!data.length){

table.innerHTML=
`<div class="empty-state">No employees found</div>`;
return;

}

const rows=data.map(emp=>{

const name=emp.personal?.name||"-";
const email=emp.personal?.email||"-";
const role=emp.user?.role||"-";
const department=emp.professional?.departmentId?.name||"-";
const type=emp.professional?.employmentType||"-";
const status=emp.employmentStatus||"-";

const initial=name.charAt(0).toUpperCase();

const isTerminated = status==="TERMINATED";

return`

<tr class="${isTerminated?"terminated-row":""}">

<td class="employee-name"
onclick="openEmployeePanel('${emp._id}')">

<div class="employee-avatar">${initial}</div>
<span class="employee-name-text">${name}</span>

</td>

<td>${email}</td>
<td>${role}</td>
<td>${department}</td>
<td>${type}</td>

<td>
<span class="status-badge status-${status.toLowerCase()}">
${status}
</span>
</td>

<td class="employee-actions">

${
isTerminated
?
`<span class="terminated-reason">
${emp.blacklistReason || "Terminated"}
</span>`
:
`
<button class="btn-secondary"
onclick="event.stopPropagation(); openEmployeePanel('${emp._id}')">
Edit
</button>

${status==="INVITED"
? `<button class="btn-success"
onclick="event.stopPropagation(); hireEmployee('${emp._id}')">
Hire
</button>` : ""}

<button class="btn-danger"
onclick="event.stopPropagation(); terminateEmployee('${emp._id}')">
Terminate
</button>
`
}

</td>

</tr>

`;

}).join("");

table.innerHTML=`

<div class="table-wrapper">

<table class="employee-table-ui">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Department</th>
<th>Employment Type</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>

</table>

</div>

`;

}


/* =========================================
   SEARCH
========================================= */

function handleSearch(e){

const term=e.target.value.toLowerCase();

filteredEmployees=
employees.filter(emp=>

emp.personal?.name?.toLowerCase().includes(term) ||
emp.personal?.email?.toLowerCase().includes(term)

);

renderTable(filteredEmployees);

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination(){

const container=document.getElementById("employeePagination");

const totalPages=Math.ceil(totalEmployees/pageSize);

if(totalPages<=1){
container.innerHTML="";
return;
}

let buttons="";

for(let i=1;i<=totalPages;i++){

buttons+=`

<button class="page-btn
${i===currentPage?"active":""}"
data-page="${i}">
${i}
</button>

`;

}

container.innerHTML=buttons;

container.querySelectorAll(".page-btn")
.forEach(btn=>{

btn.onclick=async()=>{

currentPage=Number(btn.dataset.page);
await loadEmployees();

};

});

}


/* =========================================
   ADD EMPLOYEE MODAL
========================================= */

window.openAddEmployeeModal = function(){

const modal = document.getElementById("globalModal");
const box = document.getElementById("modalBox");

box.innerHTML = `

<div class="modal">

<div class="modal-header">
<h3>Add Employee</h3>
<button onclick="closeEmployeeModal()">✕</button>
</div>

<form id="employeeForm" class="employee-form">

<div class="form-grid">

<div>
<label>Name</label>
<input name="name" required>
</div>

<div>
<label>Email</label>
<input name="email" required>
</div>

<div>
<label>Role</label>
<select name="role">
${roles.map(r=>`<option value="${r}">${r}</option>`).join("")}
</select>
</div>

<div>
<label>Department</label>
<select name="departmentId">
${departments.map(d=>`
<option value="${d._id}">
${d.name}
</option>`).join("")}
</select>
</div>

<div>
<label>Employment Type</label>
<select name="employmentType">
<option value="TRAINEE">Trainee</option>
<option value="FULL_TIME">Full Time</option>
<option value="PART_TIME">Part Time</option>
</select>
</div>

<div>
<label>Experience</label>
<select name="experienceLevel">
<option value="JUNIOR">Junior</option>
<option value="MID">Mid</option>
<option value="SENIOR">Senior</option>
</select>
</div>

</div>

<div class="modal-actions">

<button type="button" onclick="closeEmployeeModal()">
Cancel
</button>

<button type="submit" class="btn-primary">
Create Employee
</button>

</div>

</form>

</div>

`;

modal.classList.remove("hidden");

document
.getElementById("employeeForm")
.addEventListener("submit",submitEmployeeForm);

};


window.closeEmployeeModal=function(){

document
.getElementById("globalModal")
.classList.add("hidden");

};


/* =========================================
   CREATE EMPLOYEE
========================================= */

window.submitEmployeeForm = async function(e){

e.preventDefault();

const form=e.target;
const data=new FormData(form);

const payload={

name:data.get("name"),
email:data.get("email"),
role:data.get("role"),

professional:{
departmentId:data.get("departmentId"),
employmentType:data.get("employmentType"),
experienceLevel:data.get("experienceLevel")
}

};

try{

await api.post("/employee",payload);

closeEmployeeModal();

showToast("Employee invited successfully");

await loadEmployees();

}catch(err){

console.error(err);
showToast(err.message,"error");

}

};


/* =========================================
   EDIT PANEL
========================================= */

window.openEmployeePanel = async function(id){

try{

const emp = await api.get(`/employee/${id}`);

Panel.open({

title:`Employee • ${emp.personal?.name || ""}`,

content:`

<div class="employee-tabs">

<button class="tab-btn active" data-tab="personal">Personal</button>
<button class="tab-btn" data-tab="professional">Professional</button>
<button class="tab-btn" data-tab="salary">Salary</button>
<button class="tab-btn" data-tab="leave">Leave</button>

</div>


<div class="tab-content active" id="tab-personal">

<div class="form-grid">

<div>
<label>Name</label>
<input id="empName" value="${emp.personal?.name || ""}">
</div>

<div>
<label>Email</label>
<input id="empEmail" value="${emp.personal?.email || ""}">
</div>

<div>
<label>Phone</label>
<input id="empPhone" value="${emp.personal?.phone || ""}">
</div>

<div>
<label>Address</label>
<input id="empAddress" value="${emp.personal?.address || ""}">
</div>

</div>

</div>


<div class="tab-content" id="tab-professional">

<div class="form-grid">

<div>
<label>Role</label>
<select id="empRole">
${roles.map(r=>`
<option value="${r}" ${emp.user?.role===r?"selected":""}>
${r}
</option>
`).join("")}
</select>
</div>

<div>
<label>Department</label>
<select id="empDepartment">
${departments.map(d=>`
<option value="${d._id}"
${emp.professional?.departmentId?._id===d._id?"selected":""}>
${d.name}
</option>
`).join("")}
</select>
</div>

<div>
<label>Employment Type</label>
<select id="empType">

<option value="TRAINEE" ${emp.professional?.employmentType==="TRAINEE"?"selected":""}>Trainee</option>
<option value="FULL_TIME" ${emp.professional?.employmentType==="FULL_TIME"?"selected":""}>Full Time</option>
<option value="PART_TIME" ${emp.professional?.employmentType==="PART_TIME"?"selected":""}>Part Time</option>
<option value="CONTRACT" ${emp.professional?.employmentType==="CONTRACT"?"selected":""}>Contract</option>

</select>
</div>

<div>
<label>Experience</label>
<select id="empExp">

<option value="JUNIOR" ${emp.professional?.experienceLevel==="JUNIOR"?"selected":""}>Junior</option>
<option value="MID" ${emp.professional?.experienceLevel==="MID"?"selected":""}>Mid</option>
<option value="SENIOR" ${emp.professional?.experienceLevel==="SENIOR"?"selected":""}>Senior</option>
<option value="LEAD" ${emp.professional?.experienceLevel==="LEAD"?"selected":""}>Lead</option>

</select>
</div>

</div>

</div>


<div class="tab-content" id="tab-salary">

<div class="form-grid">

<div>
<label>Base Salary</label>
<input id="empSalary" value="${emp.salary?.baseSalary || 0}">
</div>

<div>
<label>Bonus</label>
<input id="empBonus" value="${emp.salary?.bonus || 0}">
</div>

<div>
<label>Medical Allowance</label>
<input id="empMedical" value="${emp.salary?.medicalAllowance || 0}">
</div>

</div>

</div>


<div class="tab-content" id="tab-leave">

<div class="form-grid">

<div>
<label>Total Leave</label>
<input id="empLeaveTotal"
value="${emp.leaveBalance?.total || 0}">
</div>

<div>
<label>Used Leave</label>
<input id="empLeaveUsed"
value="${emp.leaveBalance?.used || 0}">
</div>

<div>
<label>Remaining</label>
<input disabled
value="${emp.leaveBalance?.remaining || 0}">
</div>

</div>

</div>

`,

footer:`

<button class="btn-primary"
onclick="updateEmployee('${id}')">
Save Changes
</button>

`

});


/* TAB SYSTEM */

setTimeout(()=>{

document.querySelectorAll(".tab-btn").forEach(btn=>{

btn.onclick=()=>{

document
.querySelectorAll(".tab-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

const tab = btn.dataset.tab;

document
.querySelectorAll(".tab-content")
.forEach(c=>c.classList.remove("active"));

document
.getElementById("tab-"+tab)
.classList.add("active");

};

});

},50)

}catch(err){

console.error("Panel failed",err);

}

}


/* =========================================
   UPDATE EMPLOYEE
========================================= */

window.updateEmployee=async function(id){

try{

const payload={

personal:{
name:document.getElementById("empName").value,
email:document.getElementById("empEmail").value,
phone:document.getElementById("empPhone").value,
address:document.getElementById("empAddress").value
},

professional:{
departmentId:document.getElementById("empDepartment").value,
employmentType:document.getElementById("empType").value,
experienceLevel:document.getElementById("empExp").value
},

role:document.getElementById("empRole").value

};

await api.put(`/employee/${id}`,payload);

Panel.close();

showToast("Employee updated");

await loadEmployees();

}catch(err){

console.error(err);
showToast("Update failed","error");

}

};


/* =========================================
   HIRE
========================================= */

window.hireEmployee=async function(id){

await api.put(`/employee/hire/${id}`);
await loadEmployees();

};


/* =========================================
   TERMINATE
========================================= */

window.terminateEmployee=async function(id){

const reason = prompt("Enter termination reason");

if(!reason) return;

await api.put(`/employee/terminate/${id}`,{
reason
});

await loadEmployees();

};

})();