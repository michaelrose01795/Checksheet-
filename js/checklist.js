// ------------------------------
// SAFETY-CRITICAL BASE CHECKS
// ------------------------------
const safetyChecks = [
  "Torque all road wheels",
  "Confirm all safety-critical bolts are tightened",
  "LWNK in car",
  "Visual check for leaks, damage, or interference",
  "Final road test vehicle"
];

// ------------------------------
// JOB CHECKLISTS
// ------------------------------
let jobTypes = {
  "Brake Pads": [
    "Secure vehicle on ramps/jacks",
    "Check wheel nuts for torque",
    "Remove road wheels",
    "Inspect pads for wear",
    "Check pad sensor connections",
    "Clean caliper sliding pins",
    "Install new pads",
    "Torque caliper bolts to spec",
    "Check brake fluid level",
    "Refit wheels and torque nuts",
    ...safetyChecks
  ],
  "Brake Pads & Discs": [
    "Secure vehicle on ramps/jacks",
    "Remove wheels",
    "Inspect discs for run-out and wear",
    "Install new discs and pads",
    "Torque caliper bolts to spec",
    "Check brake fluid level",
    "Refit wheels",
    ...safetyChecks
  ],
  "Track Rod Ends": [
    "Secure vehicle on ramps/jacks",
    "Check steering play",
    "Remove road wheel",
    "Remove split pin/cotter pin",
    "Loosen lock nut",
    "Remove track rod end",
    "Install new track rod end to same length",
    "Torque lock nut and ball joint nut to spec",
    "Set steering straight and test drive",
    ...safetyChecks
  ],
  "Shock Absorbers / Springs": [
    "Secure vehicle and support suspension arm",
    "Remove wheel",
    "Check for leaks or damage",
    "Remove lower and upper shock bolts",
    "Compress spring (if applicable) safely",
    "Install new unit and torque all bolts",
    "Refit wheel",
    ...safetyChecks
  ],
  "Exhaust": [
    "Raise vehicle securely",
    "Inspect old exhaust and mounting points",
    "Remove old system",
    "Check exhaust hangers and gaskets",
    "Fit new exhaust system",
    "Tighten all clamps and joints",
    "Check for leaks after start-up",
    ...safetyChecks
  ],
  "Wheel Bearing": [
    "Raise vehicle securely",
    "Check play in wheel bearing",
    "Remove road wheel and brake components",
    "Remove hub assembly",
    "Press out old bearing, clean hub",
    "Press in new bearing",
    "Reassemble and torque to spec",
    ...safetyChecks
  ],
  "Service": [
    "Secure vehicle",
    "Check oil level",
    "Drain old engine oil",
    "Replace sump washer and tighten",
    "Install new oil filter",
    "Replace air/fuel/cabin filters",
    "Top up fluids",
    "Check belts and hoses",
    "Inspect tyres and pressures",
    "Reset service indicators",
    ...safetyChecks
  ],
  "Tyres": [
    "Inspect tyre tread depth and condition",
    "Check for damage and age cracks",
    "Set correct tyre pressures",
    "Torque wheel nuts",
    ...safetyChecks
  ],
  "Other Job": []
};

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
renderButtons();

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