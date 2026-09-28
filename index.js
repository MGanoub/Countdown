const title = "Memo & ror Vacation";
const target = new Date("2026-12-20T08:00:00");

document.getElementById("title").textContent = title;

function tick() {
  let diff = Math.floor((target - new Date()) / 1000);

  if (diff < 0) {
    document.querySelector(".clock").textContent = "It's here! 🎉";
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / 86400);
  diff %= 86400;
  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );
}

tick(); // run once right away
const timer = setInterval(tick, 1000);
