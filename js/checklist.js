const checklists = {
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
    "Refit wheels and torque nuts"
  ],
  "Brake Pads & Discs": [
    "Secure vehicle on ramps/jacks",
    "Remove wheels",
    "Inspect discs for run-out and wear",
    "Install new discs and pads",
    "Torque caliper bolts to spec",
    "Check brake fluid level",
    "Refit wheels"
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
    "Set steering straight and test drive"
  ],
  "Shock Absorbers / Springs": [
    "Secure vehicle and support suspension arm",
    "Remove wheel",
    "Check for leaks or damage",
    "Remove lower and upper shock bolts",
    "Compress spring (if applicable) safely",
    "Install new unit and torque all bolts",
    "Refit wheel"
  ],
  "Exhaust": [
    "Raise vehicle securely",
    "Inspect old exhaust and mounting points",
    "Remove old system",
    "Check exhaust hangers and gaskets",
    "Fit new exhaust system",
    "Tighten all clamps and joints",
    "Check for leaks after start-up"
  ],
  "Wheel Bearing": [
    "Raise vehicle securely",
    "Check play in wheel bearing",
    "Remove road wheel and brake components",
    "Remove hub assembly",
    "Press out old bearing, clean hub",
    "Press in new bearing",
    "Reassemble and torque to spec"
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
    "Reset service indicators"
  ],
  "Tyres": [
    "Inspect tyre tread depth and condition",
    "Check for damage and age cracks",
    "Set correct tyre pressures",
    "Torque wheel nuts"
  ],
  "Other Job": []
};

const checkers = ["Glen", "Darrell", "Soren", "Jake", "Scott", "Paul", "Cheryl"];

function renderChecklist(jobName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem('checklist_' + jobName) || '{}');

  container.innerHTML = `
    <h2>${jobName}</h2>
    <label>Job Number: <input id="jobNum" type="text" value="${saved.jobNum || ''}"></label>
    <label>Date/Time: <input id="jobDate" type="text" value="${saved.date || new Date().toLocaleString()}" readonly></label>
    <hr>
    <div id="checklist-items"></div>
    <button id="addPointBtn" class="mini-btn">+ Add Check Point</button>
    <hr>
    <label><input type="checkbox" id="confirm" ${saved.confirm ? 'checked' : ''}> I confirm the vehicle is safe and ready for release.</label>
    <label>Double checked by: 
      <select id="doubleChecker" class="modern-select">
        ${checkers.map(name => `<option value="${name}" ${saved.doubleChecker === name ? 'selected' : ''}>${name}</option>`).join('')}
      </select>
      <input type="checkbox" id="allOk" ${saved.allOk ? 'checked' : ''}> All OK
    </label>
    <div class="modal-footer">
      <button id="saveBtn">Save</button>
      <button id="clearBtn">Clear</button>
      <button id="completeBtn">Complete & Send</button>
      <button onclick="location.href='../index.html'">Back</button>
    </div>
  `;

  const checklistItems = document.getElementById('checklist-items');

  checklists[jobName].forEach((item, i) => {
    const checked = saved['check' + i] ? 'checked' : '';
    const div = document.createElement('div');
    div.className = 'check-item';
    div.innerHTML = `
      <input type="checkbox" id="check${i}" ${checked}>
      <input type="text" class="editable-text" value="${item}">
      <button onclick="deleteCheckpoint(${i}, '${jobName}')">🗑</button>
    `;
    checklistItems.appendChild(div);
  });

  document.getElementById('addPointBtn').onclick = () => addCheckpoint(jobName);
  document.getElementById('saveBtn').onclick = () => saveChecklist(jobName);
  document.getElementById('clearBtn').onclick = () => clearChecklist(jobName);
  document.getElementById('completeBtn').onclick = () => completeChecklist(jobName);
}

function addCheckpoint(jobName) {
  checklists[jobName].push("New checkpoint");
  renderChecklist(jobName, 'checklist-container');
}

function deleteCheckpoint(index, jobName) {
  checklists[jobName].splice(index, 1);
  renderChecklist(jobName, 'checklist-container');
}

function saveChecklist(jobName) {
  const data = {
    jobNum: document.getElementById('jobNum').value,
    date: document.getElementById('jobDate').value,
    doubleChecker: document.getElementById('doubleChecker').value,
    allOk: document.getElementById('allOk').checked
  };
  document.querySelectorAll('.check-item').forEach((div, i) => {
    data['check' + i] = div.querySelector('input[type=checkbox]').checked;
    checklists[jobName][i] = div.querySelector('input.editable-text').value;
  });
  data.confirm = document.getElementById('confirm').checked;
  localStorage.setItem('checklist_' + jobName, JSON.stringify(data));
  alert('Saved');
}

function clearChecklist(jobName) {
  localStorage.removeItem('checklist_' + jobName);
  renderChecklist(jobName, 'checklist-container');
  alert('Cleared');
}

function completeChecklist(jobName) {
  const jobNum = document.getElementById('jobNum').value;
  const date = document.getElementById('jobDate').value;
  const doubleChecker = document.getElementById('doubleChecker').value;
  const allOk = document.getElementById('allOk').checked ? '✓' : '✗';

  let body = `Job Type: ${jobName}\nJob Number: ${jobNum}\nDate/Time: ${date}\n\nCompleted Checks:\n`;
  checklists[jobName].forEach(item => body += `✓ ${item}\n`);
  body += `\nFinal Confirmation: ✓ Vehicle safe and ready for release.\n`;
  body += `Double Checked By: ${doubleChecker} – ${allOk} All OK\n`;

  const mailBody = encodeURIComponent(body);
  const mailSubject = encodeURIComponent(`Completed Safety Checklist – ${jobName}`);
  const mailTo = `mailto:soren@humphriesandparks.co.uk,Darrell@humphriesandparks.co.uk,michaelrose01795@icloud.com?subject=${mailSubject}&body=${mailBody}`;
  window.open(mailTo, '_blank');
}