(() => {
  "use strict";
  const SUBJECTS = ["English", "Urdu", "Islamiyat", "Mathematics", "Computer Science", "Statistics", "Physics"];
  const STORAGE_KEY = "attashad-attendance-demo-v1";
  const sampleStudents = [
    {roll:"DEMO-001", name:"Sample Student One", department:"ICS", sample:true},
    {roll:"DEMO-002", name:"Sample Student Two", department:"Pre-Engineering", sample:true},
    {roll:"DEMO-003", name:"Sample Student Three", department:"ICS", sample:true},
    {roll:"DEMO-004", name:"Sample Student Four", department:"Pre-Engineering", sample:true},
    {roll:"DEMO-005", name:"Sample Student Five", department:"ICS", sample:true}
  ];
  const $ = id => document.getElementById(id);
  const localDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const prettyDate = value => {
    if (!value) return "—";
    const [y,m,d] = value.split("-").map(Number);
    return new Date(y,m-1,d).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const makeId = () => "s-" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  let state = loadState();
  let activeSession = null;
  let noticeTimer = null;

  function freshState(){ return {students:sampleStudents.map(s=>({...s})),sessions:[]}; }
  function loadState(){
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return freshState();
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.students) || !Array.isArray(parsed.sessions)) return freshState();
      return parsed;
    } catch { return freshState(); }
  }
  function persist(){ try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch { showNotice("Browser storage is unavailable. Changes may not be saved after closing this page.",true); } }
  function showNotice(message,error=false){
    const n=$("notice"); n.textContent=message; n.className="notice"+(error?" error":""); n.hidden=false;
    clearTimeout(noticeTimer); noticeTimer=setTimeout(()=>n.hidden=true,5500);
  }
  function fillSubjects(){
    ["quickSubject","subjectSelect"].forEach(id=>{
      $(id).innerHTML=SUBJECTS.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    });
    $("reportSubject").innerHTML='<option value="all">All subjects</option>'+SUBJECTS.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
  }
  function setDates(){
    $("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"});
    $("quickDate").value=localDate(); $("attendanceDate").value=localDate();
  }
  const pages={
    dashboard:["Dashboard","A clear view of your class attendance."],
    attendance:["Take attendance","Mark each student's status for a selected subject and class date."],
    students:["Students","Search and manage the demonstration student directory."],
    reports:["Reports","Review, print and export saved attendance records."]
  };
  function showView(name){
    if(!pages[name]) return;
    document.querySelectorAll(".view").forEach(el=>el.hidden=el.id!==`view-${name}`);
    document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.view===name));
    $("pageTitle").textContent=pages[name][0]; $("pageSubtitle").textContent=pages[name][1];
    if(name==="dashboard") renderDashboard();
    if(name==="students") renderStudents();
    if(name==="reports") renderReports();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function studentsInDepartment(dept){return state.students.filter(s=>s.department===dept).length;}
  function sessionsForToday(){return state.sessions.filter(s=>s.date===localDate());}
  function counts(session){
    const values=Object.values(session.records||{});
    return {present:values.filter(v=>v==="Present").length,absent:values.filter(v=>v==="Absent").length,late:values.filter(v=>v==="Late").length,marked:values.length,notMarked:Math.max(0,state.students.length-values.length)};
  }
  function renderDashboard(){
    $("totalStudents").textContent=state.students.length;
    $("icsCount").textContent=studentsInDepartment("ICS");
    $("preCount").textContent=studentsInDepartment("Pre-Engineering");
    const today=sessionsForToday();
    $("presentToday").textContent=today.reduce((n,s)=>n+counts(s).present,0);
    $("absentToday").textContent=today.reduce((n,s)=>n+counts(s).absent,0);
    $("presentNote").textContent=`Across ${today.length} saved session${today.length===1?"":"s"}`;
    const target=$("recentSessions");
    if(!state.sessions.length){target.innerHTML='<div class="empty-state compact"><p>No attendance sessions saved yet. Start one above.</p></div>';return;}
    target.innerHTML=state.sessions.slice().sort((a,b)=>(b.enteredAt||"").localeCompare(a.enteredAt||"")).slice(0,5).map(s=>{
      const c=counts(s);return `<div class="session-row"><div><strong>${escapeHtml(s.subject)}</strong><small>${escapeHtml(s.sessionName||"Class session")}</small></div><div>${prettyDate(s.date)}<small>Attendance date</small></div><div><span class="status-chip">${c.present} present</span><small>${c.absent} absent · ${c.notMarked} unmarked</small></div><button class="btn btn-outline" data-open-session="${escapeHtml(s.id)}" type="button">View</button></div>`;
    }).join("");
  }
  function renderStudents(){
    const q=$("studentSearch").value.trim().toLowerCase(),dept=$("departmentFilter").value;
    const list=state.students.filter(s=>(dept==="all"||s.department===dept)&&`${s.roll} ${s.name}`.toLowerCase().includes(q)).sort((a,b)=>a.roll.localeCompare(b.roll,undefined,{numeric:true}));
    $("studentsBody").innerHTML=list.length?list.map(s=>`<tr><td class="roll">${escapeHtml(s.roll)}</td><td><strong>${escapeHtml(s.name)}</strong></td><td><span class="department-chip ${s.department==="Pre-Engineering"?"pe":""}">${escapeHtml(s.department)}</span></td><td>${s.sample?'<span class="status-chip orange">Sample</span>':'<span class="status-chip">Demo entry</span>'}</td><td><button class="text-button" data-edit-student="${escapeHtml(s.roll)}" type="button">Edit</button> <button class="text-button" data-delete-student="${escapeHtml(s.roll)}" type="button">Delete</button></td></tr>`).join(""):'<tr><td colspan="5">No matching students found.</td></tr>';
  }
  function openSessionForm(subject,date,sessionName=""){
    $("subjectSelect").value=subject||SUBJECTS[0]; $("attendanceDate").value=date||localDate(); $("sessionName").value=sessionName;
    activeSession=null; renderAttendanceEmpty();
    showView("attendance");
    $("sessionForm").requestSubmit();
  }
  function renderAttendanceEmpty(){
    $("attendancePanel").innerHTML='<div class="empty-state"><div class="empty-icon">✓</div><h3>No session selected</h3><p>Choose a subject and attendance date, then select “Load students”.</p></div>';
  }
  function renderAttendanceSession(session){
    const already=!!session.id;
    const rows=state.students.slice().sort((a,b)=>a.roll.localeCompare(b.roll,undefined,{numeric:true})).map(s=>{
      const status=session.records[s.roll]||"";
      return `<tr><td class="roll">${escapeHtml(s.roll)}</td><td><strong>${escapeHtml(s.name)}</strong></td><td>${escapeHtml(s.department)}</td><td><div class="student-status">${["Present","Absent","Late"].map(v=>`<label><input type="radio" name="status-${escapeHtml(s.roll)}" value="${v}" data-roll="${escapeHtml(s.roll)}" ${status===v?"checked":""}><span>${v}</span></label>`).join("")}</div></td></tr>`;
    }).join("");
    $("attendancePanel").innerHTML=`<div class="attendance-meta"><div><strong>${escapeHtml(session.subject)} attendance</strong><small>${prettyDate(session.date)} · ${escapeHtml(session.sessionName||"Class session")} · ${already?"Existing saved session":"New session"}</small></div><div class="attendance-actions"><button class="btn btn-outline" id="markAllPresent" type="button">Mark all present</button><button class="btn btn-outline" id="clearMarks" type="button">Clear marks</button></div></div><div class="table-wrap"><table><thead><tr><th>Official roll number</th><th>Student name</th><th>Department</th><th>Attendance status</th></tr></thead><tbody>${rows}</tbody></table></div><div class="attendance-meta" style="border:0;margin:15px 0 0;padding:0"><small id="markCount">${Object.keys(session.records).length} of ${state.students.length} students marked</small><div class="attendance-actions"><button class="btn btn-primary" id="saveAttendance" type="button">Save attendance</button></div></div><p class="table-footnote">Entry time is recorded when you save. This demonstration stores records in this browser only.</p>`;
    $("markAllPresent").addEventListener("click",()=>{document.querySelectorAll('#attendancePanel input[type="radio"][value="Present"]').forEach(el=>el.checked=true);updateMarkCount();});
    $("clearMarks").addEventListener("click",()=>{document.querySelectorAll('#attendancePanel input[type="radio"]').forEach(el=>el.checked=false);updateMarkCount();});
    $("attendancePanel").querySelectorAll('input[type="radio"]').forEach(el=>el.addEventListener("change",updateMarkCount));
    $("saveAttendance").addEventListener("click",saveAttendance);
    updateMarkCount();
  }
  function updateMarkCount(){
    const rolls=new Set([...document.querySelectorAll('#attendancePanel input[type="radio"]:checked')].map(el=>el.dataset.roll));
    const node=$("markCount");if(node)node.textContent=`${rolls.size} of ${state.students.length} students marked`;
  }
  function findSession(subject,date,name){
    return state.sessions.find(s=>s.subject===subject&&s.date===date&&(s.sessionName||"")===(name||""));
  }
  function saveAttendance(){
    if(!activeSession)return;
    const records={};
    document.querySelectorAll('#attendancePanel input[type="radio"]:checked').forEach(el=>records[el.dataset.roll]=el.value);
    const existing=activeSession.id?state.sessions.find(s=>s.id===activeSession.id):findSession(activeSession.subject,activeSession.date,activeSession.sessionName);
    if(existing){
      existing.records=records;existing.enteredAt=new Date().toISOString();existing.corrected=true;
      activeSession=existing;
      persist();showNotice("Attendance updated. The latest entry time has been recorded; this demo does not keep a full audit history.");
    }else{
      const created={id:makeId(),subject:activeSession.subject,date:activeSession.date,sessionName:activeSession.sessionName,records,enteredAt:new Date().toISOString(),corrected:false};
      state.sessions.push(created);activeSession=created;persist();showNotice("Attendance saved successfully in this browser.");
    }
    renderAttendanceSession(activeSession);renderDashboard();
  }
  function renderReports(){
    const subject=$("reportSubject").value,date=$("reportDate").value;
    const sessions=state.sessions.filter(s=>(subject==="all"||s.subject===subject)&&(!date||s.date===date)).sort((a,b)=>b.date.localeCompare(a.date)||(b.enteredAt||"").localeCompare(a.enteredAt||""));
    let totalP=0,totalA=0,totalL=0,totalU=0;
    sessions.forEach(s=>{const c=counts(s);totalP+=c.present;totalA+=c.absent;totalL+=c.late;totalU+=c.notMarked;});
    $("reportSummary").innerHTML=`<span class="summary-pill">Sessions <strong>${sessions.length}</strong></span><span class="summary-pill">Present <strong>${totalP}</strong></span><span class="summary-pill">Absent <strong>${totalA}</strong></span><span class="summary-pill">Late <strong>${totalL}</strong></span><span class="summary-pill">Not marked <strong>${totalU}</strong></span>`;
    $("reportsBody").innerHTML=sessions.map(s=>{const c=counts(s);return `<tr><td>${prettyDate(s.date)}</td><td><strong>${escapeHtml(s.subject)}</strong></td><td>${escapeHtml(s.sessionName||"Class session")}</td><td>${c.present}</td><td>${c.absent}</td><td>${c.notMarked}</td><td>${s.enteredAt?new Date(s.enteredAt).toLocaleString():"—"}</td><td><button class="text-button" data-open-session="${escapeHtml(s.id)}" type="button">View / edit</button> <button class="text-button" data-delete-session="${escapeHtml(s.id)}" type="button">Delete</button></td></tr>`;}).join("");
    $("reportEmpty").hidden=sessions.length!==0;
  }
  function openStudentDialog(student=null){
    $("studentForm").reset();$("editingRoll").value=student?student.roll:"";
    $("studentDialogTitle").textContent=student?"Edit student":"Add sample student";
    $("newRoll").value=student?student.roll:"";$("newName").value=student?student.name:"";$("newDepartment").value=student?student.department:"ICS";
    $("newRoll").disabled=!!student?.sample; // sample IDs remain clearly labelled
    $("studentDialog").showModal();
  }
  function closeDialog(){$("studentDialog").close();$("newRoll").disabled=false;}
  function downloadCsv(){
    const subject=$("reportSubject").value,date=$("reportDate").value;
    const sessions=state.sessions.filter(s=>(subject==="all"||s.subject===subject)&&(!date||s.date===date));
    const rows=[["Attendance date","Subject","Session","Official roll number","Student name","Department","Status","Entry date/time"]];
    sessions.forEach(s=>state.students.forEach(st=>rows.push([s.date,s.subject,s.sessionName||"Class session",st.roll,st.name,st.department,s.records[st.roll]||"Not marked",s.enteredAt||""])));
    const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="attashad-attendance-demo.csv";a.click();URL.revokeObjectURL(url);
  }
  function resetDemo(){
    if(!confirm("Reset this browser's demo data to the five sample students and remove all saved attendance sessions? This cannot be undone."))return;
    state=freshState();persist();activeSession=null;setDates();renderDashboard();renderStudents();renderReports();renderAttendanceEmpty();showView("dashboard");showNotice("Demo data has been reset.");
  }
  document.querySelectorAll(".nav-item").forEach(el=>el.addEventListener("click",()=>showView(el.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",()=>showView(el.dataset.go)));
  $("quickForm").addEventListener("submit",e=>{e.preventDefault();openSessionForm($("quickSubject").value,$("quickDate").value);});
  $("sessionForm").addEventListener("submit",e=>{
    e.preventDefault();
    const subject=$("subjectSelect").value,date=$("attendanceDate").value,name=$("sessionName").value.trim();
    if(!date){showNotice("Please select the attendance date.",true);return;}
    if(date>localDate()){showNotice("The attendance date cannot be in the future for this demo.",true);return;}
    const found=findSession(subject,date,name);
    activeSession=found?{...found,records:{...found.records}}:{subject,date,sessionName:name,records:{}};
    renderAttendanceSession(activeSession);
  });
  $("studentSearch").addEventListener("input",renderStudents);
  $("departmentFilter").addEventListener("change",renderStudents);
  $("addStudentBtn").addEventListener("click",()=>openStudentDialog());
  $("closeStudentDialog").addEventListener("click",closeDialog);
  $("cancelStudent").addEventListener("click",closeDialog);
  $("studentForm").addEventListener("submit",e=>{
    e.preventDefault();
    const oldRoll=$("editingRoll").value,roll=$("newRoll").value.trim(),name=$("newName").value.trim(),department=$("newDepartment").value;
    const duplicate=state.students.some(s=>s.roll.toLowerCase()===roll.toLowerCase()&&s.roll!==oldRoll);
    if(duplicate){showNotice("That roll number already exists. Each student must have a unique roll number.",true);return;}
    if(oldRoll){
      const student=state.students.find(s=>s.roll===oldRoll);if(!student)return;
      const previous=student.roll;student.name=name;student.department=department;
      // When editing a non-sample roll number, allow corrections and keep attendance associated with the corrected official ID.
      if(!student.sample&&roll!==previous){student.roll=roll;state.sessions.forEach(s=>{if(s.records&&Object.prototype.hasOwnProperty.call(s.records,previous)){s.records[roll]=s.records[previous];delete s.records[previous];}});}
      showNotice("Student information updated.");
    }else{
      if(!roll.toUpperCase().startsWith("DEMO-")){showNotice("For this exhibition prototype, please use a DEMO- roll number. Add official college roll numbers when the real roster is provided.",true);return;}
      state.students.push({roll,name,department,sample:false});showNotice("Demo student added.");
    }
    persist();closeDialog();renderStudents();renderDashboard();if(activeSession)renderAttendanceSession(activeSession);
  });
  document.addEventListener("click",e=>{
    const open=e.target.closest("[data-open-session]");
    if(open){const s=state.sessions.find(x=>x.id===open.dataset.openSession);if(s)openSessionForm(s.subject,s.date,s.sessionName||"");}
    const edit=e.target.closest("[data-edit-student]");
    if(edit){const s=state.students.find(x=>x.roll===edit.dataset.editStudent);if(s)openStudentDialog(s);}
    const del=e.target.closest("[data-delete-student]");
    if(del){
      const roll=del.dataset.deleteStudent,student=state.students.find(x=>x.roll===roll);if(!student)return;
      if(!confirm(`Delete ${student.name} (${student.roll}) from this demo? Attendance history for this student will also be removed.`))return;
      state.students=state.students.filter(x=>x.roll!==roll);state.sessions.forEach(s=>{if(s.records)delete s.records[roll];});persist();renderStudents();renderDashboard();renderReports();if(activeSession)renderAttendanceSession(activeSession);showNotice("Student deleted from the demo.");
    }
    const delSession=e.target.closest("[data-delete-session]");
    if(delSession){const s=state.sessions.find(x=>x.id===delSession.dataset.deleteSession);if(!s)return;if(!confirm(`Delete the ${s.subject} session for ${prettyDate(s.date)}?`))return;state.sessions=state.sessions.filter(x=>x.id!==s.id);persist();renderReports();renderDashboard();showNotice("Attendance session deleted from this demo.");}
  });
  $("reportSubject").addEventListener("change",renderReports);$("reportDate").addEventListener("change",renderReports);
  $("clearReportFilters").addEventListener("click",()=>{$("reportSubject").value="all";$("reportDate").value="";renderReports();});
  $("exportCsv").addEventListener("click",downloadCsv);$("resetDemo").addEventListener("click",resetDemo);

  // QR scanner: reads QR content only; it does not authenticate students or save attendance.
  let qrScanner = null;
  let scannerRunning = false;
  let lastScannedText = "";
  async function startQrScanner(){
    if(scannerRunning) return;
    if(!window.Html5Qrcode){
      $("scannerStatus").textContent="Scanner library could not load. Check your internet connection and reload the page.";
      showNotice("QR scanner needs an internet connection to load its camera library.",true);
      return;
    }
    $("scannerStatus").textContent="Requesting camera permission…";
    $("startScanner").disabled=true;
    try{
      qrScanner = qrScanner || new Html5Qrcode("qr-reader");
      $("scannerPlaceholder").hidden=true;
      $("qr-reader").style.display="block";
      await qrScanner.start(
        {facingMode:"environment"},
        {fps:10, qrbox:{width:220,height:220}, aspectRatio:1.0},
        decodedText=>{
          if(decodedText===lastScannedText) return;
          lastScannedText=decodedText;
          $("scanText").textContent=decodedText;
          $("scanResult").hidden=false;
          $("scannerStatus").textContent="QR code detected. Scanner is still active.";
        },
        ()=>{}
      );
      scannerRunning=true;
      $("stopScanner").disabled=false;
      $("scannerStatus").textContent="Scanner is running. Point the camera at a QR code.";
    }catch(err){
      $("qr-reader").style.display="none";
      $("scannerPlaceholder").hidden=false;
      const msg=String(err && err.message ? err.message : err);
      $("scannerStatus").textContent=msg.toLowerCase().includes("permission")?"Camera permission was denied. Allow camera access in your browser settings and try again.":"Could not start the camera. Use the published HTTPS site, allow camera access, and check that another app is not using the camera.";
      $("startScanner").disabled=false;
      showNotice("Could not start the QR scanner. Check camera permission and browser support.",true);
    }
  }
  async function stopQrScanner(){
    if(qrScanner && scannerRunning){
      try{await qrScanner.stop();}catch(_){}
      try{qrScanner.clear();}catch(_){}
    }
    scannerRunning=false;qrScanner=null;lastScannedText="";
    $("qr-reader").innerHTML="";$("qr-reader").style.display="none";
    $("scannerPlaceholder").hidden=false;
    $("startScanner").disabled=false;$("stopScanner").disabled=true;
    $("scannerStatus").textContent="Scanner is not running.";
  }
  $("startScanner").addEventListener("click",startQrScanner);
  $("stopScanner").addEventListener("click",stopQrScanner);

  fillSubjects();setDates();renderDashboard();renderStudents();renderReports();renderAttendanceEmpty();
})();