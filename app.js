(() => {
  "use strict";
  const TOTAL_SECONDS = 90 * 60;
  const TOTAL_QUESTIONS = 25;
  const $ = (selector) => document.querySelector(selector);
  const screens = { start: $("#start-screen"), quiz: $("#quiz-screen"), result: $("#result-screen") };
  const form = $("#identity-form");
  const fields = { name: $("#student-name"), nis: $("#student-nis"), className: $("#student-class") };
  const state = {
    student: null, questions: [], index: 0, answers: [], startedAt: null,
    deadline: null, timerId: null, finished: false, submitted: false
  };

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => node.classList.toggle("d-none", key !== name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cleanText(value) { return value.trim().replace(/\s+/g, " "); }

  function validateIdentity() {
    let valid = true;
    const name = cleanText(fields.name.value);
    const nis = cleanText(fields.nis.value);
    const className = cleanText(fields.className.value);
    fields.name.classList.toggle("is-invalid", name.length < 2);
    fields.nis.classList.toggle("is-invalid", nis.length < 2 || nis.length > 30);
    fields.className.classList.toggle("is-invalid", className.length < 1);
    if (name.length < 2 || name.length > 100) valid = false;
    if (nis.length < 2 || nis.length > 30) valid = false;
    if (className.length < 1 || className.length > 30) valid = false;
    return valid ? { name, nis, className } : null;
  }

  function startAssessment(student) {
    if (!Array.isArray(window.ASSESSMENT_QUESTIONS) || window.ASSESSMENT_QUESTIONS.length !== TOTAL_QUESTIONS) {
      $("#start-error").textContent = "Data soal tidak lengkap. Muat ulang halaman atau hubungi pengelola asesmen.";
      $("#start-error").classList.remove("d-none");
      return;
    }
    state.student = student;
    state.questions = shuffle(window.ASSESSMENT_QUESTIONS).map((q) => {
      const options = shuffle(q.options.map(([letter, text]) => ({ originalLetter: letter, text })));
      return { ...q, shuffledOptions: options };
    });
    state.index = 0;
    state.answers = Array(TOTAL_QUESTIONS).fill(null);
    state.startedAt = Date.now();
    state.deadline = state.startedAt + TOTAL_SECONDS * 1000;
    state.finished = false;
    state.submitted = false;
    $("#start-error").classList.add("d-none");
    showScreen("quiz");
    renderQuestion();
    updateTimer();
    state.timerId = window.setInterval(updateTimer, 250);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updateTimer() {
    if (!state.deadline || state.finished) return;
    const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    $("#timer").textContent = formatTime(remaining);
    $("#timer-box").classList.toggle("timer-warning", remaining <= 300);
    if (remaining <= 0) finishAssessment(true);
  }

  function renderQuestion() {
    if (state.finished) return;
    const q = state.questions[state.index];
    $("#progress-label").textContent = `Soal ${state.index + 1} dari ${TOTAL_QUESTIONS}`;
    $("#answered-label").textContent = `${state.answers.filter(Boolean).length} terjawab`;
    const progress = (state.answers.filter(Boolean).length / TOTAL_QUESTIONS) * 100;
    $("#progress-bar").style.width = `${progress}%`;
    $("#quiz-progress").setAttribute("aria-valuenow", String(state.answers.filter(Boolean).length));
    $("#question-number").textContent = `QUESTION ${String(state.index + 1).padStart(2, "0")}`;
    $("#topic-label").textContent = q.topic.toUpperCase();
    $("#difficulty-label").textContent = q.difficulty;
    $("#question-text").textContent = q.question;
    $("#options-list").replaceChildren();
    $("#feedback").className = "feedback-panel d-none mt-4";
    $("#feedback").replaceChildren();
    $("#next-button").classList.add("d-none");

    q.shuffledOptions.forEach((option, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.originalLetter = option.originalLetter;
      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + i);
      const text = document.createElement("span");
      text.textContent = option.text;
      button.append(letter, text);
      button.addEventListener("click", () => submitAnswer(option.originalLetter));
      $("#options-list").append(button);
    });
    $("#options-list").querySelector("button")?.focus({ preventScroll: true });
  }

  function submitAnswer(originalLetter) {
    if (state.finished || state.submitted || state.answers[state.index] !== null) return;
    if (Date.now() >= state.deadline) { finishAssessment(true); return; }
    const q = state.questions[state.index];
    state.answers[state.index] = {
      questionId: q.id,
      selected: originalLetter,
      correct: originalLetter === q.answer
    };
    state.submitted = true;
    $("#options-list").querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      const optionLetter = button.dataset.originalLetter;
      if (optionLetter === q.answer) button.classList.add("is-correct");
      if (optionLetter === originalLetter && originalLetter !== q.answer) button.classList.add("is-wrong");
    });
    showFeedback(q, originalLetter === q.answer);
    $("#answered-label").textContent = `${state.answers.filter(Boolean).length} terjawab`;
    $("#progress-bar").style.width = `${(state.answers.filter(Boolean).length / TOTAL_QUESTIONS) * 100}%`;
    $("#quiz-progress").setAttribute("aria-valuenow", String(state.answers.filter(Boolean).length));
    $("#next-button").textContent = state.index === TOTAL_QUESTIONS - 1 ? "Lihat Hasil →" : "Soal Berikutnya →";
    $("#next-button").classList.remove("d-none");
    $("#next-button").focus({ preventScroll: true });
  }

  function showFeedback(q, isCorrect) {
    const panel = $("#feedback");
    panel.className = `feedback-panel mt-4 ${isCorrect ? "correct" : "incorrect"}`;
    const title = document.createElement("div");
    title.className = "feedback-title";
    const emoji = document.createElement("span");
    emoji.className = "feedback-emoji";
    emoji.textContent = isCorrect ? "😊" : "😢";
    const heading = document.createElement("span");
    heading.textContent = isCorrect ? "GOOD JOB" : "Belum tepat";
    title.append(emoji, heading);
    panel.append(title);
    if (!isCorrect) {
      const answer = document.createElement("p");
      answer.className = "answer-reveal";
      const correctOption = q.options.find(([letter]) => letter === q.answer);
      const shuffledIndex = q.shuffledOptions.findIndex((option) => option.originalLetter === q.answer);
      const displayedLetter = shuffledIndex >= 0 ? String.fromCharCode(65 + shuffledIndex) : q.answer;
      answer.textContent = `Jawaban yang benar: ${displayedLetter}. ${correctOption ? correctOption[1] : ""}`;
      panel.append(answer);
    }
    const explanation = document.createElement("p");
    explanation.textContent = q.explanation;
    panel.append(explanation);
  }

  function finishAssessment(timeExpired = false) {
    if (state.finished) return;
    state.finished = true;
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    const correct = state.answers.filter((a) => a && a.correct).length;
    const incorrectOrBlank = TOTAL_QUESTIONS - correct;
    const score = Math.round((correct / TOTAL_QUESTIONS) * 100);
    const elapsedSeconds = Math.min(TOTAL_SECONDS, Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)));
    $("#result-name").textContent = state.student.name;
    $("#result-nis").textContent = state.student.nis;
    $("#result-class").textContent = state.student.className;
    $("#result-duration").textContent = `${formatTime(elapsedSeconds)} (${Math.floor(elapsedSeconds / 60)} menit ${elapsedSeconds % 60} detik)`;
    $("#correct-count").textContent = String(correct);
    $("#wrong-count").textContent = String(incorrectOrBlank);
    $("#final-score").textContent = String(score);
    $("#score-bar").style.width = `${score}%`;
    $("#timeout-note").classList.toggle("d-none", !timeExpired);
    $("#result-emoji").textContent = score >= 85 ? "🏆" : score >= 70 ? "🎉" : score >= 50 ? "💪" : "📚";
    let message;
    if (score >= 85) message = "Hebat! Pemahamanmu sangat baik. Pertahankan dan terus kembangkan kemampuan Bahasa Inggrismu.";
    else if (score >= 70) message = "Bagus! Kamu sudah memahami banyak materi. Terus berlatih agar hasilmu semakin baik.";
    else if (score >= 50) message = "Usaha yang baik. Pelajari kembali ungkapan opini dan ciri-ciri descriptive text, lalu terus berlatih.";
    else message = "Jangan menyerah! Tinjau kembali materi, baca pembahasan, dan berlatih lagi untuk meningkatkan pemahaman.";
    if (timeExpired) message += " Waktu pengerjaan telah habis; jawaban yang belum dipilih dihitung sebagai tidak benar.";
    $("#result-feedback").textContent = message;
    showScreen("result");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const student = validateIdentity();
    if (!student) {
      $("#start-error").textContent = "Periksa kembali identitas. Semua kolom wajib diisi dengan benar.";
      $("#start-error").classList.remove("d-none");
      form.querySelector(".is-invalid")?.focus();
      return;
    }
    startAssessment(student);
  });

  [fields.name, fields.nis, fields.className].forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("is-invalid");
      $("#start-error").classList.add("d-none");
    });
  });

  $("#next-button").addEventListener("click", () => {
    if (!state.submitted || state.finished) return;
    if (state.index >= TOTAL_QUESTIONS - 1) {
      finishAssessment(false);
      return;
    }
    state.index += 1;
    state.submitted = false;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#print-button").addEventListener("click", () => window.print());
  $("#restart-button").addEventListener("click", () => {
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    state.student = null;
    state.questions = [];
    state.answers = [];
    state.finished = false;
    state.submitted = false;
    form.reset();
    Object.values(fields).forEach((field) => field.classList.remove("is-invalid"));
    showScreen("start");
  });

  // Back-navigation is guarded while an assessment is active.
  window.addEventListener("beforeunload", (event) => {
    if (!state.finished && state.startedAt && !screens.quiz.classList.contains("d-none")) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
})();
