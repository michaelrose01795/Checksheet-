// file: js/checklist.js
// ------------------------------
// LOAD CHECKLISTS FROM JSON FILE
// ------------------------------
let jobTypes = {};
let safetyChecks = [];

async function loadChecklists() {
  try {
    const res = await fetch('checklists.json');
    if (!res.ok) throw new Error('Failed to load checklists.json');
    const data = await res.json();
    safetyChecks = data.safetyChecks || [];
    jobTypes = data.jobTypes || {};
    renderButtons();
  } catch (err) {
    console.error('Error loading checklists:', err);
    document.getElementById('jobGrid').innerHTML = `<p style="color:red;">Failed to load checklists.json</p>`;
  }
}

// ------------------------------
// RENDER JOB BUTTONS
// ------------------------------
const grid = document.getElementById('jobGrid');
function renderButtons() {
  grid.innerHTML = "";
  Object.keys(jobTypes).forEach(job => {
    const btn = document.createElement('button');
    btn.textContent = job;
    btn.className = 'job-btn';
    btn.onclick = () => openChecklist(job);
    grid.appendChild(btn);
  });
}

// ------------------------------
// MODAL SETUP
// ------------------------------
const modal = document.getElementById('checkModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
let currentJob = null;

// ------------------------------
// OPEN CHECKLIST
// ------------------------------
function openChecklist(job) {
  modal.classList.add('active');
  modalTitle.textContent = job;
  currentJob = job;

  const saved = JSON.parse(localStorage.getItem('checklist_' + job) || '{}');
  modalBody.innerHTML = `
    <label>Job Number: <input id="jobNum" type="text" value="${saved.jobNum || ''}"></label>
    <label>Date/Time: <input id="jobDate" type="text" value="${saved.date || new Date().toLocaleString()}" readonly></label>
    <hr>
    <div class="editable-section"></div>
    <button id="addPointBtn" class="mini-btn">+ Add Check Point</button>
    <hr>
  `;

  const editableSection = modalBody.querySelector('.editable-section');
  jobTypes[job].forEach((item, i) => {
    const checked = saved['check' + i] ? 'checked' : '';
    editableSection.innerHTML += `
      <div class="check-item">
        <input type="checkbox" id="check${i}" ${checked}>
        <input type="text" class="editable-text" value="${item}">
        <button class="delete-btn" onclick="deleteCheckpoint(${i})">🗑</button>
      </div>`;
  });

  modalBody.innerHTML += `<hr><label><input type="checkbox" id="confirm" ${saved.confirm ? 'checked' : ''}> I confirm the vehicle is safe and ready for release.</label>`;
  document.getElementById('addPointBtn').onclick = addCheckpoint;
  updateCompleteButton();
}

// ------------------------------
// ADD / DELETE CHECKPOINTS
// ------------------------------
function addCheckpoint() {
  jobTypes[currentJob].push("New checkpoint");
  openChecklist(currentJob);
}
function deleteCheckpoint(index) {
  jobTypes[currentJob].splice(index, 1);
  openChecklist(currentJob);
}

// ------------------------------
// SAVE / CLEAR / CLOSE
// ------------------------------
const saveBtn = document.querySelector('.save-btn');
const clearBtn = document.querySelector('.clear-btn');
const closeBtn = document.querySelector('.close-btn');
const completeBtn = document.querySelector('.complete-btn');

saveBtn.onclick = () => {
  if (!currentJob) return;
  const data = {
    jobNum: document.getElementById('jobNum').value,
    date: document.getElementById('jobDate').value
  };
  const newList = [];
  modalBody.querySelectorAll('.check-item').forEach((div, i) => {
    const txt = div.querySelector('.editable-text').value;
    newList.push(txt);
    data['check' + i] = div.querySelector('input[type=checkbox]').checked;
  });
  data.confirm = document.getElementById('confirm').checked;
  jobTypes[currentJob] = newList; // Save any edits
  localStorage.setItem('checklist_' + currentJob, JSON.stringify(data));
  alert('Saved');
  updateCompleteButton();
};

clearBtn.onclick = () => {
  if (!currentJob) return;
  localStorage.removeItem('checklist_' + currentJob);
  openChecklist(currentJob);
  alert('Cleared');
};

closeBtn.onclick = () => modal.classList.remove('active');
modalBody.addEventListener('change', updateCompleteButton);

function updateCompleteButton() {
  if (!currentJob) return;
  const checks = [...modalBody.querySelectorAll('input[type=checkbox]')];
  const allChecked = checks.length && checks.every(c => c.checked);
  completeBtn.disabled = !allChecked;
  completeBtn.classList.toggle('active', allChecked);
}

// ------------------------------
// COMPLETE SUMMARY
// ------------------------------
const summaryModal = document.getElementById('summaryModal');
const summaryText = document.getElementById('summaryText');

completeBtn.onclick = () => {
  const job = currentJob;
  const jobNum = document.getElementById('jobNum').value;
  const date = document.getElementById('jobDate').value;
  let body = `Job Type: ${job}\nJob Number: ${jobNum}\nDate/Time: ${date}\n\nCompleted Checks:\n`;
  jobTypes[job].forEach(item => body += `✓ ${item}\n`);
  body += `\nFinal Confirmation: ✓ Vehicle safe and ready for release.\n`;

  summaryText.textContent = body;
  summaryModal.classList.add('active');

  const mailBody = encodeURIComponent(body);
  const mailSubject = encodeURIComponent(`Completed Safety Checklist – ${job}`);
  const mailTo = `mailto:soren@humphriesandparks.co.uk,Darrell@humphriesandparks.co.uk,michaelrose01795@icloud.com?subject=${mailSubject}&body=${mailBody}`;
  window.open(mailTo, '_blank');
};

// SUMMARY BUTTONS
document.querySelector('.print-btn').onclick = () => window.print();
document.querySelector('.copy-btn').onclick = () => {
  navigator.clipboard.writeText(summaryText.textContent)
    .then(() => alert('Summary copied'))
    .catch(err => alert('Copy failed: ' + err));
};
document.querySelector('.close-summary').onclick = () => summaryModal.classList.remove('active');

// ------------------------------
// INITIAL LOAD
// ------------------------------
loadChecklists();