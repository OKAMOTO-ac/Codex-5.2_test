const STORAGE_KEY = "schedule-items";

const scheduleForm = document.querySelector("#schedule-form");
const scheduleList = document.querySelector("#schedule-list");
const taskCount = document.querySelector("#task-count");
const todayLabel = document.querySelector("#today");
const template = document.querySelector("#schedule-item-template");
const filterDate = document.querySelector("#filter-date");
const searchInput = document.querySelector("#search-input");
const editModal = document.querySelector("#edit-modal");
const editForm = document.querySelector("#edit-form");
const closeModalButton = document.querySelector("#close-modal");

let schedules = [];
let editingId = null;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

const formatTime = (time) => time;

const loadSchedules = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  schedules = stored ? JSON.parse(stored) : [];
};

const saveSchedules = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

const updateCount = () => {
  taskCount.textContent = `${schedules.length} 件`;
};

const clearList = () => {
  scheduleList.innerHTML = "";
};

const getFilteredSchedules = () => {
  const dateValue = filterDate.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return schedules
    .filter((item) => (!dateValue ? true : item.date === dateValue))
    .filter((item) => {
      if (!keyword) {
        return true;
      }
      const haystack = `${item.title} ${item.notes}`.toLowerCase();
      return haystack.includes(keyword);
    })
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time}`;
      const bKey = `${b.date} ${b.time}`;
      return aKey.localeCompare(bKey);
    });
};

const renderSchedules = () => {
  clearList();
  const filtered = getFilteredSchedules();

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "該当する予定がありません。";
    scheduleList.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const node = template.content.cloneNode(true);
    const title = node.querySelector(".schedule-item__title");
    const meta = node.querySelector(".schedule-item__meta");
    const notes = node.querySelector(".schedule-item__notes");
    const badge = node.querySelector(".schedule-item__badge");
    const editButton = node.querySelector(".edit");
    const deleteButton = node.querySelector(".delete");

    title.textContent = item.title;
    meta.textContent = `${formatDate(item.date)} ・ ${formatTime(item.time)}`;
    notes.textContent = item.notes || "メモはありません。";
    badge.textContent = item.category;

    editButton.addEventListener("click", () => openEditModal(item.id));
    deleteButton.addEventListener("click", () => deleteSchedule(item.id));

    scheduleList.appendChild(node);
  });
};

const addSchedule = (data) => {
  const newSchedule = {
    id: crypto.randomUUID(),
    ...data,
  };
  schedules.push(newSchedule);
  saveSchedules();
  updateCount();
  renderSchedules();
};

const deleteSchedule = (id) => {
  schedules = schedules.filter((item) => item.id !== id);
  saveSchedules();
  updateCount();
  renderSchedules();
};

const openEditModal = (id) => {
  const item = schedules.find((schedule) => schedule.id === id);
  if (!item) {
    return;
  }
  editingId = id;
  editForm.title.value = item.title;
  editForm.date.value = item.date;
  editForm.time.value = item.time;
  editForm.category.value = item.category;
  editForm.notes.value = item.notes;
  editModal.classList.remove("hidden");
};

const closeEditModal = () => {
  editModal.classList.add("hidden");
  editingId = null;
};

const updateSchedule = (data) => {
  schedules = schedules.map((item) =>
    item.id === editingId ? { ...item, ...data } : item
  );
  saveSchedules();
  updateCount();
  renderSchedules();
};

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(scheduleForm);
  const payload = Object.fromEntries(formData.entries());
  addSchedule(payload);
  scheduleForm.reset();
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!editingId) {
    return;
  }
  const formData = new FormData(editForm);
  const payload = Object.fromEntries(formData.entries());
  updateSchedule(payload);
  closeEditModal();
});

closeModalButton.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

[filterDate, searchInput].forEach((input) =>
  input.addEventListener("input", renderSchedules)
);

const init = () => {
  todayLabel.textContent = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  loadSchedules();
  updateCount();
  renderSchedules();
};

init();
