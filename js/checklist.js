// js/checklist.js

// ------------------------------
// DETAILED JOB CHECKLISTS
// ------------------------------
const jobTypes = {
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
    "Pedal feel test",
    "Road test vehicle"
  ],
  "Brake Pads & Discs": [
    "Secure vehicle on ramps/jacks",
    "Check wheel nuts for torque",
    "Remove road wheels",
    "Inspect discs for run-out and wear",
    "Remove old pads",
    "Clean caliper and mounts",
    "Install new discs",
    "Install new pads",
    "Torque caliper bolts to spec",
    "Check brake fluid level",
    "Refit wheels and torque nuts",
    "Pedal feel test",
    "Road test vehicle"
  ],
  "Service": [
    "Secure vehicle",
    "Check oil level",
    "Drain old engine oil",
    "Replace sump bung washer and tighten",
    "Install new oil filter",
    "Replace air/fuel/cabin filters",
    "Top up all fluids",
    "Check belts and hoses",
    "Inspect tyres and pressures",
    "Torque road wheels",
    "Reset service indicators",
    "Road test vehicle"
  ],
  "Tyres": [
    "Secure vehicle",
    "Inspect tyre tread depth",
    "Check for tyre damage",
    "Set correct tyre pressures",
    "Check wheel nuts for torque",
    "Fit valve caps",
    "Torque wheels properly",
    "Road test vehicle"
  ]
  // Add other jobs the same way...
};

// ------------------------------
// CREATE JOB BUTTONS
// ------------------------------
const grid = document.getElementById('jobGrid');
Object.keys(jobTypes).forEach(job => {
  const btn = document.createElement('button');
  btn.textContent = job;
  btn.className = 'job-btn';
  btn.onclick = () => openChecklist(job);
  grid.appendChild(btn);
});

// ------------------------------
// MODAL LOGIC
// ------------------------------
const modal = document.getElementById('checkModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
let currentJob = null;

function openChecklist(job){
  modal.classList.add('active');
  modalTitle.textContent = job;
  currentJob = job;

  const saved = JSON.parse(localStorage.getItem('checklist_'+job) || '{}');
  modalBody.innerHTML = `
    <label>Job Number: <input id="jobNum" type="text" value="${saved.jobNum || ''}"></label>
    <label>Date/Time: <input id="jobDate" type="text" value="${saved.date || new Date().toLocaleString()}" readonly></label>
    <hr>
  `;

  jobTypes[job].forEach((item,i)=>{
    const checked = saved['check'+i] ? 'checked' : '';
    modalBody.innerHTML += `<label><input type="checkbox" id="check${i}" ${checked}> ${item}</label>`;
  });

  modalBody.innerHTML += `<hr><label><input type="checkbox" id="confirm" ${saved.confirm?'checked':''}> I have double-checked all work and confirm the vehicle is safe and ready for release.</label>`;
  updateCompleteButton();
}

// ------------------------------
// BUTTON ACTIONS
// ------------------------------
const saveBtn = document.querySelector('.save-btn');
const clearBtn = document.querySelector('.clear-btn');
const closeBtn = document.querySelector('.close-btn');
const completeBtn = document.querySelector('.complete-btn');

saveBtn.onclick = ()=>{
  if(!currentJob) return;
  const data = { jobNum: document.getElementById('jobNum').value, date: document.getElementById('jobDate').value };
  jobTypes[currentJob].forEach((_,i)=> data['check'+i] = document.getElementById('check'+i).checked );
  data.confirm = document.getElementById('confirm').checked;
  localStorage.setItem('checklist_'+currentJob, JSON.stringify(data));
  alert('Saved');
  updateCompleteButton();
};

clearBtn.onclick = ()=>{
  if(!currentJob) return;
  localStorage.removeItem('checklist_'+currentJob);
  openChecklist(currentJob);
  alert('Cleared');
};

closeBtn.onclick = ()=> modal.classList.remove('active');

modalBody.addEventListener('change', updateCompleteButton);

function updateCompleteButton(){
  if(!currentJob) return;
  const checks = [...modalBody.querySelectorAll('input[type=checkbox]')];
  const allChecked = checks.every(c=>c.checked);
  completeBtn.disabled = !allChecked;
  completeBtn.classList.toggle('active', allChecked);
}

// ------------------------------
// COMPLETE & SEND
// ------------------------------
const summaryModal = document.getElementById('summaryModal');
const summaryText = document.getElementById('summaryText');

completeBtn.onclick = ()=>{
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

// Summary buttons
document.querySelector('.print-btn').onclick = () => window.print();
document.querySelector('.copy-btn').onclick = () => {
  navigator.clipboard.writeText(summaryText.textContent).then(()=>alert('Summary copied')).catch(err=>alert('Copy failed: '+err));
};
document.querySelector('.close-summary').onclick = ()=> summaryModal.classList.remove('active');