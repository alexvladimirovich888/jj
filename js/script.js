// Конфигурация путей
const REPO_URL = "https://raw.githubusercontent.com/alexvladimirovich888/jj/main/";
const IMG_BASE = REPO_URL + "images/"; // Предполагаем, что папка называется images или jjs

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Section snap scrolling
const sections = ["#pfp-generator", "#lore", "#hero", "#gallery", "#whack-game"];
let currentSectionIndex = 0;
let isScrolling = false;
let scrollCooldown = 1000;

function getCurrentSectionIndex() {
  const scrollPosition = window.scrollY + window.innerHeight / 2;
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.querySelector(sections[i]);
    if (section && scrollPosition >= section.offsetTop) return i;
  }
  return 0;
}

function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;
  const section = document.querySelector(sections[index]);
  if (section) {
    isScrolling = true;
    currentSectionIndex = index;
    section.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { isScrolling = false; }, scrollCooldown);
  }
}

function handleWheel(e) {
  if (isScrolling) { e.preventDefault(); return; }
  currentSectionIndex = getCurrentSectionIndex();
  if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
    e.preventDefault();
    scrollToSection(currentSectionIndex + 1);
  } else if (e.deltaY < 0 && currentSectionIndex > 0) {
    e.preventDefault();
    scrollToSection(currentSectionIndex - 1);
  }
}

window.addEventListener("wheel", handleWheel, { passive: false });

// Floating JJ configuration
const totalJJImages = 6156;
const floatingJJSections = {};
const sectionConfigs = {
  "#hero": { centerExclusion: true, maxJJs: 20 },
  "#pfp-generator": { centerExclusion: true, maxJJs: 15 },
  "#lore": { centerExclusion: false, maxJJs: 12 },
  "#gallery": { centerExclusion: false, maxJJs: 10 },
  "#whack-game": { centerExclusion: true, maxJJs: 8 },
};

function getRandomJJImage() {
  return Math.floor(Math.random() * totalJJImages) + 1;
}

function createBubbleWrapper(container, containerRect, sectionId) {
  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";
  const jj = document.createElement("img");
  jj.className = "float-jj";
  // Путь к маленьким JJ
  jj.src = `${IMG_BASE}jjs/smol/${getRandomJJImage()}.webp`;

  wrapper.appendChild(jj);
  container.appendChild(wrapper);

  const jjSize = 80;
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = Math.random() * containerRect.width; y = -jjSize; }
  else if (edge === 1) { x = containerRect.width; y = Math.random() * containerRect.height; }
  else if (edge === 2) { x = Math.random() * containerRect.width; y = containerRect.height; }
  else { x = -jjSize; y = Math.random() * containerRect.height; }

  const data = {
    x: x, y: y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    wrapper: wrapper,
    popTime: Date.now() + 2000 + Math.random() * 3000,
    sectionId: sectionId
  };

  wrapper.style.left = x + "px";
  wrapper.style.top = y + "px";
  return data;
}

function animateFloatingJJs() {
  const now = Date.now();
  Object.keys(floatingJJSections).forEach((sectionId) => {
    const sectionData = floatingJJSections[sectionId];
    for (let i = sectionData.length - 1; i >= 0; i--) {
      const data = sectionData[i];
      data.x += data.vx;
      data.y += data.vy;
      data.wrapper.style.left = data.x + "px";
      data.wrapper.style.top = data.y + "px";
      if (now > data.popTime) {
        data.wrapper.remove();
        sectionData.splice(i, 1);
      }
    }
  });
  requestAnimationFrame(animateFloatingJJs);
}

// Slot Machine
function initSlotMachine() {
  const spinBtn = document.getElementById("spin-btn");
  const slotReel = document.getElementById("slot-reel");
  const downloadBtn = document.getElementById("download-btn");
  const slotBg = document.getElementById("slot-bg");

  if (!spinBtn || !slotReel) return;

  spinBtn.addEventListener("click", () => {
    const finalJJ = getRandomJJImage();
    slotReel.innerHTML = `<img src="${IMG_BASE}jjs/smol/${finalJJ}.webp" class="slot-jj">`;
    if (downloadBtn) {
      downloadBtn.classList.add("visible");
      downloadBtn.dataset.jjNumber = finalJJ;
    }
  });

  // Backgrounds
  const bgImages = ["space.jpg", "minastirith.jpg", "winxp.jpg", "matrix.jpg", "hogwarts.jpg", "upsidedown.jpg"];
  const bgImageRow = document.getElementById("bg-image-row");

  bgImages.forEach(img => {
    const btn = document.createElement("button");
    btn.className = "bg-swatch";
    btn.style.backgroundImage = `url('${IMG_BASE}pfpbgs/${img}')`;
    btn.onclick = () => {
        slotBg.style.backgroundImage = `url('${IMG_BASE}pfpbgs/${img}')`;
        slotBg.style.backgroundSize = "cover";
    };
    bgImageRow.appendChild(btn);
  });
}

// Gallery
function initGallery() {
  const galleryImages = [
    "2025-12-02%2012.56.53.jpg", "2025-12-02%2012.57.25.jpg", "2025-12-02%2012.57.31.jpg",
    "2025-12-02%2012.58.04.jpg", "2025-12-02%2012.58.08.jpg", "2025-12-02%2012.58.11.jpg",
    "2025-12-02%2012.58.15.jpg", "2025-12-02%2012.58.18.jpg", "2025-12-02%2012.58.21.jpg",
    "2025-12-02%2012.58.24.jpg", "2025-12-02%2012.58.26.jpg", "2025-12-02%2012.58.29.jpg",
    "2025-12-02%2012.58.32.jpg", "2025-12-02%2012.58.35.jpg", "2025-12-02%2012.58.38.jpg",
    "2025-12-02%2012.58.41.jpg", "2025-12-02%2012.58.44.jpg"
  ].map(name => `${IMG_BASE}gallery/${name}`);

  const mainImg = document.getElementById("gallery-main-img");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  let currentIndex = 0;

  if (!mainImg) return;

  const update = () => { mainImg.src = galleryImages[currentIndex]; };
  nextBtn.onclick = () => { currentIndex = (currentIndex + 1) % galleryImages.length; update(); };
  prevBtn.onclick = () => { currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length; update(); };
  update();
}

// Whack-a-JJ
function initWhackGame() {
  const gameHoles = document.querySelectorAll(".game-hole");
  const gameStartBtn = document.getElementById("game-start-btn");
  const gameScore = document.getElementById("game-score");
  let score = 0;
  let isRunning = false;

  gameStartBtn.onclick = () => {
    score = 0;
    gameScore.textContent = score;
    isRunning = true;
    spawnLoop();
    setTimeout(() => { isRunning = false; alert("Game Over! Score: " + score); }, 30000);
  };

  function spawnLoop() {
    if (!isRunning) return;
    const hole = gameHoles[Math.floor(Math.random() * gameHoles.length)];
    const jj = document.createElement("img");
    jj.className = "game-jj";
    jj.src = `${IMG_BASE}jjs/smol/${getRandomJJImage()}.webp`;
    jj.onclick = () => {
        score += 10;
        gameScore.textContent = score;
        jj.remove();
    };
    hole.appendChild(jj);
    setTimeout(() => { if(jj.parentNode) jj.remove(); }, 1000);
    setTimeout(spawnLoop, 800);
  }
}

// Инициализация всего
document.addEventListener("DOMContentLoaded", () => {
  initSlotMachine();
  initGallery();
  initWhackGame();
  animateFloatingJJs();
  
  // Добавляем интервал для спауна летающих JJ
  Object.keys(sectionConfigs).forEach(id => {
    floatingJJSections[id] = [];
    setInterval(() => {
        const container = document.querySelector(`${id} .floating-jjs`);
        if (container && floatingJJSections[id].length < sectionConfigs[id].maxJJs) {
            floatingJJSections[id].push(createBubbleWrapper(container, container.getBoundingClientRect(), id));
        }
    }, 1500);
  });
});
