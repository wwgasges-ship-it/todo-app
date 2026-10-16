"use strict";
// 서버 없이 현재 브라우저에만 저장합니다. 사용자 입력은 textContent로 표시합니다.
const STORAGE_KEY = "chagok-tasks-v1";
const $ = (selector) => document.querySelector(selector);
let tasks = [], filter = "all", deleted = null, noticeTimer;
function notify(message, undo = false) {
  clearTimeout(noticeTimer);
  $("#notice-text").textContent = message;
  $("#undo").hidden = !undo;
  $("#notice").hidden = false;
  noticeTimer = setTimeout(() => { $("#notice").hidden = true; deleted = null; }, 7000);
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(t => t && typeof t.id === "string" && typeof t.text === "string" && typeof t.done === "boolean") || new Set(data.map(t => t.id)).size !== data.length) throw new Error("invalid data");
    tasks = data;
  } catch { notify("저장된 목록을 읽지 못했어요. 브라우저 저장 설정을 확인해 주세요."); }
}
// 저장에 실패하면 이전 목록을 유지해 저장된 것으로 오해하지 않게 합니다.
function commit(next) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch { notify("저장하지 못했어요. 저장 공간이나 비공개 모드 설정을 확인해 주세요."); return false; }
  tasks = next; render(); return true;
}
function render() {
  const done = tasks.filter(t => t.done).length;
  $("#all-count").textContent = tasks.length;
  $("#remaining").textContent = `남은 할 일 ${tasks.length - done}개`;
  $("#progress-count").replaceChildren(document.createTextNode(String(done)));
  const count = document.createElement("span"); count.textContent = ` / ${tasks.length}`; $("#progress-count").append(count);
  $("#progress").max = tasks.length || 1; $("#progress").value = done;
  $("#progress-text").textContent = tasks.length ? (done === tasks.length ? "모두 해냈어요! 잘했어요." : `${tasks.length - done}개의 할 일이 기다려요`) : "가볍게 시작해 볼까요?";
  $("#encouragement").textContent = done ? `${done}개의 작은 실천을 해냈어요.` : "오늘의 작은 할 일을 적어보세요.";
  document.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
  const visible = tasks.filter(t => filter === "all" || (filter === "done" ? t.done : !t.done));
  $("#task-list").replaceChildren();
  for (const task of visible) {
    const row = document.createElement("li"); row.classList.toggle("completed", task.done);
    const label = document.createElement("label"); label.className = "check-label";
    const check = document.createElement("input"); check.type = "checkbox"; check.checked = task.done;
    check.addEventListener("change", () => { const index = visible.indexOf(task); commit(tasks.map(t => t.id === task.id ? {...t, done: check.checked} : t)); const checks = document.querySelectorAll(".check-label input"); (checks[Math.min(index, checks.length - 1)] || document.querySelector(`[data-filter="${filter}"]`)).focus(); });
    const text = document.createElement("span"); text.className = "task-text"; text.textContent = task.text;
    label.append(check, text);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-button"; remove.textContent = "×"; remove.setAttribute("aria-label", `${task.text} 삭제`);
    remove.addEventListener("click", () => { const index = tasks.findIndex(t => t.id === task.id); if (commit(tasks.filter(t => t.id !== task.id))) { deleted = {task, index}; notify("할 일을 삭제했어요.", true); $("#undo").focus(); } });
    row.append(label, remove); $("#task-list").append(row);
  }
  $("#empty").hidden = visible.length > 0;
  $("#empty-title").textContent = filter === "done" ? "완료한 일이 여기에 모여요" : filter === "active" && tasks.length ? "남은 할 일이 없어요!" : "새로운 시작을 기다리고 있어요";
  $("#empty-description").textContent = filter === "done" ? "끝낸 일의 체크 상자를 눌러보세요." : filter === "active" && tasks.length ? "잠깐 쉬어가도 좋아요." : "작은 일 하나부터 추가해 보세요.";
}
$("#add-form").addEventListener("submit", event => {
  event.preventDefault(); const input = $("#task-input"), text = input.value.trim();
  if (!text) { notify("할 일을 입력해 주세요."); input.focus(); return; }
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (commit([...tasks, {id, text, done: false}])) { input.value = ""; if (filter === "done") { filter = "all"; render(); } notify("할 일을 추가했어요."); input.focus(); }
});
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => { filter = button.dataset.filter; render(); }));
$("#undo").addEventListener("click", () => { if (!deleted) return; const next = [...tasks]; next.splice(deleted.index, 0, deleted.task); if (commit(next)) { deleted = null; notify("삭제를 취소했어요."); $("#task-input").focus(); } });
window.addEventListener("storage", event => { if (event.key === STORAGE_KEY || event.key === null) { deleted = null; $("#notice").hidden = true; tasks = []; load(); render(); } });
$("#date").textContent = new Intl.DateTimeFormat("ko-KR", {month:"long", day:"numeric", weekday:"long"}).format(new Date());
load(); render();
