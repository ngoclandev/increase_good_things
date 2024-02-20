const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const NOTE_KEY = "Notes";
const notFoundUnitError = "Unit gì ngộ, tìm không thấy, thử unit khác đi ha!";
const emptyFieldError = "Chưa nhập mà đi tiếp z bà nội.";

const addBtn = $(".btn.add");
const titleInput = $("#good-thing");
const timeInput = $("#time-maked");
const jumpInput = $("#jump");
const notesBigParent = $(".things");
const notesContainer = $(".things-container");
const notesElement = $(".things-list");
const spinnerOverlay = $("#spinner-overlay");
const spinner = $(".spinner");
const rulesBtn = $(".rules-btn");
const rulesOverlay = $("#rules-overlay");

const notes = getNotes() ?? [];

Validator({
  form: "#form-add",
  formGroupSelector: ".form-group",
  errorMessageSelector: ".message",
  rules: [
    Validator.isRequired("#good-thing", emptyFieldError),
    Validator.isRequired("#time-maked", emptyFieldError),
  ],
  onSubmit(data) {
    const times = data["time-maked"].split(" ");

    if (times.length > 2) return;

    const [time, unitTime] = times;

    if (!displayFullUnitTime(unitTime)) {
      throwError(timeInput.parentElement, notFoundUnitError);
      return;
    }

    const thing = {
      title: data["good-thing"],
      jump: data["jump"] ? data["jump"] : 1,
      time: +time,
      unitTime,
    };

    console.log(thing);

    notes.push(thing);

    setNotes(notes);

    render(notes);
  },
});

function init() {
  render(notes);
  titleInput.focus();
}

function displayFullUnitTime(unitTime) {
  switch (unitTime) {
    case "min":
      return "min";
    case "hour":
      return "h";
    case "day":
      return "d";
    case "week":
      return "w";
    case "mon":
      return "mon";
    case "year":
      return "y";
  }
}

function showOverlay(overlay, show = true) {
  if (show) overlay.classList.remove("hidden");
  else overlay.classList.add("hidden");
}

function throwError(formGroup, message) {
  formGroup.classList.add("invalid");
  formGroup.querySelector(".message").textContent = message;
}

function clearInputs() {
  titleInput.value = timeInput.value = jumpInput.value = "";
}

function getNotes() {
  return JSON.parse(localStorage.getItem(NOTE_KEY));
}

function setNotes(notes) {
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
}

function getParent(element, className) {
  while (element.parentElement) {
    let parentElement = element.parentElement;
    if (parentElement.className !== className) element = parentElement;
    else return parentElement;
  }
}

function generateMarkup(notes) {
  if (notes.length < 1) {
    notesBigParent.classList.add("empty");
    notesContainer.classList.add("hidden");
  } else {
    notesBigParent.classList.remove("empty");
    notesContainer.classList.remove("hidden");
  }

  return notes
    .map((note, index) => {
      return `
        <div data-index='${index}' class="things-item-container">
            <li class="things-item">
                <div class="things-info">
                <span class="things-order">${index + 1}.</span>
                <span class="things-desc">${note.title}</span>
                </div>
                <div class="things-maintain">
                <button id="things-minus" class="btn things-btn">-</button>
                <span class="things-time"
                    > <span class='things-number-time'>${
                      note.time
                    }</span><span class="things-unit-time">${displayFullUnitTime(
        note.unitTime
      )}</span></span
                >
                <button id="things-increase" class="btn things-btn">+</button>
                </div>
            </li>

            <div class='things-item-delete'>&times;</div>
        </div>
    `;
    })
    .join("");
}

function updateTime(note) {
  $(".things-number-time").innerText = note.time;
}

function render(notes) {
  const markup = generateMarkup(notes);

  showOverlay(spinnerOverlay);
  setTimeout(() => {
    showOverlay(spinnerOverlay, false);
    notesElement.innerHTML = markup;
  }, 1000);
  clearInputs();
}

function deleteNote(idx) {
  notes.splice(idx, 1);
  setNotes(notes);
}

notesBigParent.onclick = (e) => {
  const id = e.target.id;

  if (id !== "things-increase" && id !== "things-minus") return;

  const parent = getParent($(`#${id}`), "things-item-container");
  const index = parent.dataset.index;
  const note = notes[index];

  console.log(parent);
  if (id === "things-increase") {
    note.time = note.time + Number(note.jump);
  } else if (id === "things-minus") {
    note.time = note.time - Number(note.jump);
  }

  updateTime(note);
  setNotes(notes);
};

// Swipe to delete
let startX,
  moveX,
  movingX,
  noteItem,
  threshold = -44,
  maxThreshold = -60;

const changeMoving = (move) =>
  (noteItem.style.transform = `translateX(${move}px)`);

notesElement.addEventListener("touchstart", (e) => {
  noteItem = e.target.closest(".things-item");

  if (!noteItem) return;

  startX = e.changedTouches[0].pageX;
});

notesElement.addEventListener("touchmove", (e) => {
  if (!noteItem) return;

  moveX = e.changedTouches[0].pageX;
  movingX = Math.trunc(moveX - startX);

  changeMoving(movingX);

  if (movingX < maxThreshold) changeMoving(maxThreshold);
  if (movingX > -1) changeMoving(0);
});

notesElement.addEventListener("touchend", () => {
  if (!noteItem) return;

  if (moveX - startX < threshold) changeMoving(threshold);
});

notesElement.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".things-item-delete");

  if (!deleteBtn) return;

  const index = deleteBtn.parentElement.dataset.index;
  deleteNote(index);
  render(notes);
});

rulesBtn.addEventListener("click", () => {
  showOverlay(rulesOverlay);
});

rulesOverlay.addEventListener("click", (e) => {
  if (e.target.closest(".rules")) return;
  showOverlay(rulesOverlay, false);
});

init();
