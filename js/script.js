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
const sections = [
  "#pfp-generator",
  "#lore",
  "#hero",
  "#gallery",
  "#whack-game",
];
let currentSectionIndex = 0;
let isScrolling = false;
let scrollCooldown = 1000; // ms to wait before allowing another scroll

function getCurrentSectionIndex() {
  const scrollPosition = window.scrollY + window.innerHeight / 2;

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.querySelector(sections[i]);
    if (section && scrollPosition >= section.offsetTop) {
      return i;
    }
  }
  return 0;
}

function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;

  const section = document.querySelector(sections[index]);
  if (section) {
    isScrolling = true;
    currentSectionIndex = index;

    section.scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrolling = false;
    }, scrollCooldown);
  }
}

function handleWheel(e) {
  if (isScrolling) {
    e.preventDefault();
    return;
  }

  currentSectionIndex = getCurrentSectionIndex();

  if (e.deltaY > 0) {
    // Scrolling down
    if (currentSectionIndex < sections.length - 1) {
      e.preventDefault();
      scrollToSection(currentSectionIndex + 1);
    }
  } else if (e.deltaY < 0) {
    // Scrolling up
    if (currentSectionIndex > 0) {
      e.preventDefault();
      scrollToSection(currentSectionIndex - 1);
    }
  }
}

// Use passive: false to allow preventDefault
window.addEventListener("wheel", handleWheel, { passive: false });

// Touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.touches[0].clientY;
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  (e) => {
    if (isScrolling) return;

    touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    currentSectionIndex = getCurrentSectionIndex();

    if (Math.abs(deltaY) > 50) {
      // Minimum swipe distance
      if (deltaY > 0 && currentSectionIndex < sections.length - 1) {
        // Swipe up (scroll down)
        scrollToSection(currentSectionIndex + 1);
      } else if (deltaY < 0 && currentSectionIndex > 0) {
        // Swipe down (scroll up)
        scrollToSection(currentSectionIndex - 1);
      }
    }
  },
  { passive: true },
);

// Floating JJ configuration
const totalJJImages = 6156;
const floatingJJSections = {}; // Store floating JJ data per section
const maxFloatingJJsPerSection = 20; // Maximum number of floating JJs per section
const minPopTime = 2000; // Minimum time before a bubble can pop (ms)
const maxPopTime = 5000; // Maximum time before a bubble pops (ms)
const spawnInterval = 1500; // Time between spawning new JJs (ms)
const centerExclusionRadius = 250; // Radius around center to avoid (main JJ area)

// Section-specific configurations
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

function getEdgeSpawnPosition(containerRect, jjSize) {
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Pick a random edge (0=top, 1=right, 2=bottom, 3=left)
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  switch (edge) {
    case 0: // Top edge
      x = Math.random() * (containerRect.width - jjSize);
      y = Math.random() * 100;
      break;
    case 1: // Right edge
      x = containerRect.width - jjSize - Math.random() * 100;
      y = Math.random() * (containerRect.height - jjSize);
      break;
    case 2: // Bottom edge
      x = Math.random() * (containerRect.width - jjSize);
      y = containerRect.height - jjSize - Math.random() * 100;
      break;
    case 3: // Left edge
      x = Math.random() * 100;
      y = Math.random() * (containerRect.height - jjSize);
      break;
  }

  return { x, y, edge };
}

function getEdgeVelocity(x, y, containerRect) {
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Calculate direction away from center
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize and add some randomness, biased toward edges
  const baseSpeed = 0.5 + Math.random() * 1;
  let vx = (dx / distance) * baseSpeed + (Math.random() - 0.5) * 0.5;
  let vy = (dy / distance) * baseSpeed + (Math.random() - 0.5) * 0.5;

  return { vx, vy };
}

function isInCenterZone(x, y, containerRect, jjSize) {
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  const jjCenterX = x + jjSize / 2;
  const jjCenterY = y + jjSize / 2;

  const dx = jjCenterX - centerX;
  const dy = jjCenterY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < centerExclusionRadius;
}

function createBubbleWrapper(container, containerRect, sectionId) {
  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";

  const jj = document.createElement("img");
  jj.className = "float-jj";
  jj.src = `img/jjs/smol/${getRandomJJImage()}.webp`;

  wrapper.appendChild(jj);
  container.appendChild(wrapper);

  const jjSize = 80; // Default size
  const { x, y } = getEdgeSpawnPosition(containerRect, jjSize);
  const { vx, vy } = getEdgeVelocity(x, y, containerRect);

  const data = {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    wrapper: wrapper,
    element: jj,
    popTime:
      Date.now() + minPopTime + Math.random() * (maxPopTime - minPopTime),
    isPopping: false,
    sectionId: sectionId,
  };

  wrapper.style.left = x + "px";
  wrapper.style.top = y + "px";
  wrapper.style.width = jjSize + "px";
  wrapper.style.height = jjSize + "px";

  // Trigger spawn animation
  requestAnimationFrame(() => {
    wrapper.classList.add("spawning");
  });

  return data;
}

function popBubble(data) {
  if (data.isPopping) return;
  data.isPopping = true;

  const wrapper = data.wrapper;
  wrapper.classList.remove("spawning");
  wrapper.classList.add("popping");

  // Remove after animation completes
  setTimeout(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
    // Find and remove from section array by reference
    const sectionData = floatingJJSections[data.sectionId];
    if (sectionData) {
      const index = sectionData.indexOf(data);
      if (index > -1) {
        sectionData.splice(index, 1);
      }
    }
  }, 400);
}

function spawnNewJJ(sectionId) {
  const section = document.querySelector(sectionId);
  if (!section) return;

  const container = section.querySelector(".floating-jjs");
  if (!container) return;

  const config = sectionConfigs[sectionId] || { maxJJs: 10 };
  const sectionData = floatingJJSections[sectionId] || [];

  // Only spawn if below max for this section
  if (sectionData.length >= config.maxJJs) return;

  const containerRect = container.getBoundingClientRect();
  const newData = createBubbleWrapper(container, containerRect, sectionId);
  floatingJJSections[sectionId].push(newData);
}

function initializeFloatingJJsForSection(sectionId) {
  const section = document.querySelector(sectionId);
  if (!section) return;

  const container = section.querySelector(".floating-jjs");
  if (!container) return;

  // Clear any existing JJs
  container.innerHTML = "";
  floatingJJSections[sectionId] = [];

  const config = sectionConfigs[sectionId] || { maxJJs: 10 };
  const containerRect = container.getBoundingClientRect();

  // Spawn initial JJs with staggered timing
  const initialCount = Math.floor(Math.random() * 3) + 3; // 3-6 initial JJs
  for (let i = 0; i < initialCount; i++) {
    setTimeout(() => {
      const sectionData = floatingJJSections[sectionId];
      if (sectionData && sectionData.length < config.maxJJs) {
        const newData = createBubbleWrapper(
          container,
          containerRect,
          sectionId,
        );
        floatingJJSections[sectionId].push(newData);
      }
    }, i * 300); // Stagger spawns by 300ms
  }

  // Periodically spawn new JJs for this section
  setInterval(() => spawnNewJJ(sectionId), spawnInterval);
}

function initializeFloatingJJs() {
  // Initialize floating JJs for all sections
  Object.keys(sectionConfigs).forEach((sectionId) => {
    initializeFloatingJJsForSection(sectionId);
  });
}

function animateFloatingJJs() {
  const now = Date.now();

  // Iterate through all sections
  Object.keys(floatingJJSections).forEach((sectionId) => {
    const section = document.querySelector(sectionId);
    if (!section) return;

    const container = section.querySelector(".floating-jjs");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const config = sectionConfigs[sectionId] || { centerExclusion: false };
    const sectionData = floatingJJSections[sectionId];

    // Iterate in reverse to safely remove items
    for (let i = sectionData.length - 1; i >= 0; i--) {
      const data = sectionData[i];
      if (!data || !data.wrapper || data.isPopping) continue;

      const jjSize = 80;

      // Check if it's time to pop
      if (now >= data.popTime) {
        popBubble(data);
        continue;
      }

      // Update position
      data.x += data.vx;
      data.y += data.vy;

      // Push away from center zone (only for sections with centerExclusion)
      if (config.centerExclusion) {
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const jjCenterX = data.x + jjSize / 2;
        const jjCenterY = data.y + jjSize / 2;
        const dx = jjCenterX - centerX;
        const dy = jjCenterY - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distanceFromCenter < centerExclusionRadius) {
          // Push away from center with force inversely proportional to distance
          const pushStrength =
            0.1 * (1 - distanceFromCenter / centerExclusionRadius);
          data.vx += (dx / distanceFromCenter) * pushStrength;
          data.vy += (dy / distanceFromCenter) * pushStrength;
        }
      }

      // Bounce off walls
      if (data.x <= 0 || data.x >= containerRect.width - jjSize) {
        data.vx *= -1;
        data.x = Math.max(0, Math.min(data.x, containerRect.width - jjSize));
      }
      if (data.y <= 0 || data.y >= containerRect.height - jjSize) {
        data.vy *= -1;
        data.y = Math.max(0, Math.min(data.y, containerRect.height - jjSize));
      }

      // Limit max speed
      const speed = Math.sqrt(data.vx * data.vx + data.vy * data.vy);
      const maxSpeed = 2;
      if (speed > maxSpeed) {
        data.vx = (data.vx / speed) * maxSpeed;
        data.vy = (data.vy / speed) * maxSpeed;
      }

      // Apply position to wrapper
      data.wrapper.style.left = data.x + "px";
      data.wrapper.style.top = data.y + "px";
    }
  });

  requestAnimationFrame(animateFloatingJJs);
}

// Rotate main JJ emoji periodically
function rotateMainJJ() {
  const mainJJ = document.querySelector(".jj-main");
  if (!mainJJ) return;

  setInterval(() => {
    const randomNum = Math.floor(Math.random() * totalJJImages) + 1;
    mainJJ.style.opacity = "0";

    setTimeout(() => {
      // Preload the new image before showing
      const newImage = new Image();
      newImage.onload = () => {
        mainJJ.src = newImage.src;
        mainJJ.style.opacity = "1";
      };
      newImage.src = `img/jjs/smol/${randomNum}.webp`;
    }, 300);
  }, 3000);
}

// Slot Machine
function initSlotMachine() {
  const spinBtn = document.getElementById("spin-btn");
  const slotReel = document.getElementById("slot-reel");
  const resultInfo = document.getElementById("result-info");
  const downloadBtn = document.getElementById("download-btn");
  const slotWaiting = document.getElementById("slot-waiting");

  if (!spinBtn || !slotReel) return;

  let isSpinning = false;

  function prefetchImages(imageNumbers) {
    return Promise.all(
      imageNumbers.map((num) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(num);
          img.onerror = () => resolve(num);
          img.src = `img/jjs/smol/${num}.webp`;
        });
      }),
    );
  }

  function startSpin() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    resultInfo.textContent = "";
    resultInfo.classList.remove("revealed");
    if (downloadBtn) downloadBtn.classList.remove("visible");
    if (bgPickerBtn) {
      bgPickerBtn.classList.remove("visible");
      bgPickerPopup.classList.remove("open");
    }

    // Create multiple JJ images for the spinning effect
    const spinCount = 10; // Number of images to cycle through
    const images = [];
    for (let i = 0; i < spinCount; i++) {
      images.push(Math.floor(Math.random() * totalJJImages) + 1);
    }
    // Final result
    const finalJJ = Math.floor(Math.random() * totalJJImages) + 1;
    images.push(finalJJ);

    // Show waiting animation and hide the reel
    slotReel.style.opacity = "0";
    if (slotWaiting) slotWaiting.classList.add("active");

    // Prefetch all images before starting the spin
    prefetchImages(images).then(() => {
      // Hide waiting animation and show the reel
      if (slotWaiting) slotWaiting.classList.remove("active");
      slotReel.style.opacity = "1";

      // Build the reel
      slotReel.innerHTML = "";
      images.forEach((num) => {
        const img = document.createElement("img");
        img.src = `img/jjs/smol/${num}.webp`;
        img.alt = "JJ";
        img.className = "slot-jj";
        slotReel.appendChild(img);
      });

      // Animate the spin
      // Get actual height of slot items after they're rendered
      const firstItem = slotReel.querySelector(".slot-jj");
      const itemHeight = firstItem ? firstItem.offsetHeight : 180;
      const totalItems = images.length;
      const spinDuration = 1000; // Total spin time in ms
      const startTime = Date.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function animateSpin() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const easedProgress = easeOutCubic(progress);

        // Calculate position to end at the last item (index totalItems - 1)
        const finalPosition = (totalItems - 1) * itemHeight;
        const currentPosition = easedProgress * finalPosition;

        slotReel.style.transform = `translateY(-${currentPosition}px)`;

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          // Ensure we're exactly at the final position
          slotReel.style.transform = `translateY(-${finalPosition}px)`;
          isSpinning = false;
          spinBtn.disabled = false;

          // Show download and background picker buttons
          if (downloadBtn) {
            downloadBtn.classList.add("visible");
            downloadBtn.dataset.jjNumber = finalJJ;
          }
          if (bgPickerBtn) {
            bgPickerBtn.classList.add("visible");
          }
        }
      }

      // Small delay to ensure images are rendered before getting height
      requestAnimationFrame(() => {
        requestAnimationFrame(animateSpin);
      });
    });
  }

  spinBtn.addEventListener("click", startSpin);

  // Background Picker
  const bgPickerBtn = document.getElementById("bg-picker-btn");
  const bgPickerPopup = document.getElementById("bg-picker-popup");
  const slotBg = document.getElementById("slot-bg");
  const bgImageRow = document.getElementById("bg-image-row");

  // Image backgrounds - add filenames here as images are added to img/pfpbgs/
  const bgImages = [
    "space.jpg",
    "minastirith.jpg",
    "winxp.jpg",
    "matrix.jpg",
    "hogwarts.jpg",
    "upsidedown.jpg",
  ];
  const bgImageSlots = 6;

  // Inject image swatches into the image row
  bgImages.slice(0, bgImageSlots).forEach((filename) => {
    const btn = document.createElement("button");
    btn.className = "bg-swatch bg-swatch-img";
    btn.dataset.bg = "image";
    btn.dataset.color = `img/pfpbgs/${filename}`;
    btn.style.backgroundImage = `url('img/pfpbgs/${filename}')`;
    btn.title = filename.replace(/\.[^.]+$/, "");
    bgImageRow.appendChild(btn);
  });

  // Fill remaining slots with placeholders
  for (let i = bgImages.length; i < bgImageSlots; i++) {
    const btn = document.createElement("button");
    btn.className = "bg-swatch placeholder";
    btn.dataset.bg = "image";
    btn.disabled = true;
    btn.title = "Coming soon";
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
    bgImageRow.appendChild(btn);
  }

  const swatches = bgPickerPopup.querySelectorAll(".bg-swatch");
  let selectedBg = { type: "none", value: null };

  bgPickerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    bgPickerPopup.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!bgPickerPopup.contains(e.target) && e.target !== bgPickerBtn) {
      bgPickerPopup.classList.remove("open");
    }
  });

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", (e) => {
      e.stopPropagation();
      const bgType = swatch.dataset.bg;
      if (bgType === "image" && swatch.classList.contains("placeholder"))
        return;

      swatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");

      if (bgType === "none") {
        selectedBg = { type: "none", value: null };
        slotBg.style.background = "transparent";
        customDialog.classList.remove("open");
      } else if (bgType === "custom") {
        customDialog.classList.toggle("open");
        selectedBg = { type: "solid", value: customWheel.value };
        slotBg.style.background = customWheel.value;
      } else if (bgType === "image") {
        selectedBg = { type: "image", value: swatch.dataset.color };
        slotBg.style.background = `url('${swatch.dataset.color}') center/cover`;
        customDialog.classList.remove("open");
      } else {
        selectedBg = { type: bgType, value: swatch.dataset.color };
        slotBg.style.background = swatch.dataset.color;
        customDialog.classList.remove("open");
      }
    });
  });

  // Custom color picker
  const customBtn = document.getElementById("bg-custom-btn");
  const customDialog = document.getElementById("bg-custom-dialog");
  const customWheel = document.getElementById("bg-custom-wheel");
  const customHex = document.getElementById("bg-custom-hex");
  const customR = document.getElementById("bg-custom-r");
  const customG = document.getElementById("bg-custom-g");
  const customB = document.getElementById("bg-custom-b");

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function applyCustomColor(hex) {
    selectedBg = { type: "solid", value: hex };
    slotBg.style.background = hex;
  }

  function syncFromHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    customWheel.value = hex;
    customHex.value = hex;
    customR.value = rgb.r;
    customG.value = rgb.g;
    customB.value = rgb.b;
    applyCustomColor(hex);
  }

  function syncFromRgb() {
    const r = parseInt(customR.value) || 0;
    const g = parseInt(customG.value) || 0;
    const b = parseInt(customB.value) || 0;
    const hex = rgbToHex(r, g, b);
    customWheel.value = hex;
    customHex.value = hex;
    applyCustomColor(hex);
  }

  customWheel.addEventListener("input", () => {
    syncFromHex(customWheel.value);
  });

  customHex.addEventListener("input", () => {
    let val = customHex.value;
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      syncFromHex(val);
    }
  });

  customR.addEventListener("input", syncFromRgb);
  customG.addEventListener("input", syncFromRgb);
  customB.addEventListener("input", syncFromRgb);

  function drawBgOnCanvas(ctx, size) {
    if (selectedBg.type === "none") return;

    if (selectedBg.type === "solid") {
      ctx.fillStyle = selectedBg.value;
      ctx.fillRect(0, 0, size, size);
    } else if (selectedBg.type === "gradient") {
      // Parse "linear-gradient(135deg, #color1, #color2)"
      const match = selectedBg.value.match(
        /linear-gradient\(\s*([\d]+)deg\s*,\s*(#[0-9a-fA-F]+)\s*,\s*(#[0-9a-fA-F]+)\s*\)/,
      );
      if (match) {
        const angle = (parseFloat(match[1]) * Math.PI) / 180;
        const c1 = match[2];
        const c2 = match[3];
        const cx = size / 2;
        const cy = size / 2;
        const len = size * 0.7071; // sqrt(2)/2
        const x0 = cx - Math.cos(angle) * len;
        const y0 = cy - Math.sin(angle) * len;
        const x1 = cx + Math.cos(angle) * len;
        const y1 = cy + Math.sin(angle) * len;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }
    }
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function downloadWithBackground(jjNumber) {
    const bgIsImage = selectedBg.type === "image";
    const promises = [loadImage(`img/jjs/${jjNumber}.png`)];
    if (bgIsImage) {
      promises.push(loadImage(selectedBg.value));
    }

    Promise.all(promises).then(([jjImg, bgImg]) => {
      if (!jjImg) return;

      const canvas = document.createElement("canvas");
      const size = 1000;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (bgIsImage && bgImg) {
        // Cover-fit the background image
        const scale = Math.max(size / bgImg.width, size / bgImg.height);
        const w = bgImg.width * scale;
        const h = bgImg.height * scale;
        ctx.drawImage(bgImg, (size - w) / 2, (size - h) / 2, w, h);
      } else {
        drawBgOnCanvas(ctx, size);
      }

      ctx.drawImage(jjImg, 0, 0, size, size);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `jj-${jjNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  downloadBtn.addEventListener("click", () => {
    const jjNumber = downloadBtn.dataset.jjNumber;
    if (!jjNumber) return;

    if (selectedBg.type === "none") {
      // Direct download, no canvas needed
      const link = document.createElement("a");
      link.href = `img/jjs/${jjNumber}.png`;
      link.download = `jj-${jjNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      downloadWithBackground(jjNumber);
    }
  });
}

// Add transition for main JJ
// Gallery
function initGallery() {
  const galleryImages = [
    "img/gallery/2025-12-02 12.56.53.jpg",
    "img/gallery/2025-12-02 12.57.25.jpg",
    "img/gallery/2025-12-02 12.57.31.jpg",
    "img/gallery/2025-12-02 12.58.04.jpg",
    "img/gallery/2025-12-02 12.58.08.jpg",
    "img/gallery/2025-12-02 12.58.11.jpg",
    "img/gallery/2025-12-02 12.58.15.jpg",
    "img/gallery/2025-12-02 12.58.18.jpg",
    "img/gallery/2025-12-02 12.58.21.jpg",
    "img/gallery/2025-12-02 12.58.24.jpg",
    "img/gallery/2025-12-02 12.58.26.jpg",
    "img/gallery/2025-12-02 12.58.29.jpg",
    "img/gallery/2025-12-02 12.58.32.jpg",
    "img/gallery/2025-12-02 12.58.35.jpg",
    "img/gallery/2025-12-02 12.58.38.jpg",
    "img/gallery/2025-12-02 12.58.41.jpg",
    "img/gallery/2025-12-02 12.58.44.jpg",
  ];

  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  const mainImg = document.getElementById("gallery-main-img");
  const prevImg = document.getElementById("gallery-prev-img");
  const nextImg = document.getElementById("gallery-next-img");
  const dotsContainer = document.getElementById("gallery-dots");

  if (!prevBtn || !nextBtn || !mainImg) return;

  let currentIndex = 0;

  function getIndex(offset) {
    return (
      (currentIndex + offset + galleryImages.length) % galleryImages.length
    );
  }

  function updateGallery() {
    mainImg.src = galleryImages[currentIndex];
    prevImg.src = galleryImages[getIndex(-1)];
    nextImg.src = galleryImages[getIndex(1)];

    // Update dots
    const dots = dotsContainer.querySelectorAll(".gallery-dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function goNext() {
    currentIndex = getIndex(1);
    updateGallery();
  }

  function goPrev() {
    currentIndex = getIndex(-1);
    updateGallery();
  }

  // Create dots
  galleryImages.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "gallery-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      currentIndex = i;
      updateGallery();
    });
    dotsContainer.appendChild(dot);
  });

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  // Initialize
  updateGallery();
}

document.addEventListener("DOMContentLoaded", () => {
  const mainJJ = document.querySelector(".jj-main");
  if (mainJJ) {
    mainJJ.style.transition = "opacity 0.3s ease";
  }

  initializeFloatingJJs();
  animateFloatingJJs();
  rotateMainJJ();
  initSlotMachine();
  initGallery();
  initWhackGame();
});

// Whack-a-JJ Game
function initWhackGame() {
  const gameBoard = document.getElementById("game-board");
  const gameScore = document.getElementById("game-score");
  const gameTimer = document.getElementById("game-timer");
  const gameFinalScore = document.getElementById("game-final-score");
  const gameStartBtn = document.getElementById("game-start-btn");
  const gameCursor = document.getElementById("game-cursor");
  const gameHoles = document.querySelectorAll(".game-hole");
  const gameSection = document.getElementById("whack-game");

  if (!gameBoard || !gameStartBtn) return;

  let whackSound = null;

  // Preload audio on first user interaction
  function initAudio() {
    if (!whackSound) {
      whackSound = new Audio();
      whackSound.src = "img/game/smash.mp3";
      whackSound.preload = "auto";
      whackSound.load();
    }
  }

  // Initialize audio on any click in game section
  gameSection.addEventListener("click", initAudio, { once: true });
  gameStartBtn.addEventListener("click", initAudio);
  let score = 0;
  let timeLeft = 30;
  let gameInterval = null;
  let isGameRunning = false;
  let cursorInGame = false;

  // Cursor handling
  function updateCursor(e) {
    if (gameCursor && cursorInGame) {
      gameCursor.style.top = e.pageY + "px";
      gameCursor.style.left = e.pageX + "px";
    }
  }

  function checkCursorInGame() {
    const rect = gameSection.getBoundingClientRect();
    return true; // Always show cursor when game is running
  }

  gameSection.addEventListener("mouseenter", () => {
    if (isGameRunning) {
      cursorInGame = true;
      gameCursor.classList.add("visible");
      gameSection.style.cursor = "none";
    }
  });

  gameSection.addEventListener("mouseleave", () => {
    cursorInGame = false;
    gameCursor.classList.remove("visible");
    gameSection.style.cursor = "default";
  });

  window.addEventListener("mousemove", updateCursor);

  gameSection.addEventListener("mousedown", () => {
    if (cursorInGame) {
      gameCursor.classList.add("active");
    }
  });

  gameSection.addEventListener("mouseup", () => {
    gameCursor.classList.remove("active");
  });

  // Get random JJ image
  function getRandomJJ() {
    return Math.floor(Math.random() * totalJJImages) + 1;
  }

  // Spawn a JJ in a random hole
  function spawnJJ() {
    if (!isGameRunning) return;

    const availableHoles = [...gameHoles].filter(
      (hole) => !hole.querySelector(".game-jj"),
    );
    if (availableHoles.length === 0) return;

    const randomHole =
      availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const jjImg = document.createElement("img");
    jjImg.className = "game-jj";
    jjImg.src = "img/jjs/smol/" + getRandomJJ() + ".webp";

    randomHole.appendChild(jjImg);

    // Remove JJ after delay if not whacked
    setTimeout(() => {
      if (jjImg.parentNode && !jjImg.classList.contains("whacked")) {
        jjImg.parentNode.removeChild(jjImg);
      }
    }, 1200);
  }

  // Handle whacking - support both click and touch
  function whackHole(hole) {
    if (!isGameRunning) return;

    const jj = hole.querySelector(".game-jj");
    if (jj && !jj.classList.contains("whacked")) {
      jj.classList.add("whacked");
      score += 10;
      gameScore.textContent = score;
      if (whackSound) {
        whackSound.currentTime = 0;
        whackSound.play().catch(() => {});
      }

      setTimeout(() => {
        if (jj.parentNode) {
          jj.parentNode.removeChild(jj);
        }
      }, 300);
    }
  }

  gameHoles.forEach((hole) => {
    // Click for desktop
    hole.addEventListener("click", (e) => {
      e.preventDefault();
      whackHole(hole);
    });

    // Touch for mobile - use touchstart for faster response
    hole.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        initAudio();
        whackHole(hole);
      },
      { passive: false },
    );
  });

  // Start game
  function startGame() {
    score = 0;
    timeLeft = 30;
    isGameRunning = true;

    gameScore.textContent = "0";
    gameTimer.textContent = "30";
    gameFinalScore.classList.remove("visible");
    gameFinalScore.innerHTML = "";
    gameStartBtn.classList.add("hidden");
    gameBoard.style.display = "grid";

    // Enable cursor
    cursorInGame = true;
    gameCursor.classList.add("visible");
    gameSection.style.cursor = "none";

    // Clear any existing JJs
    gameHoles.forEach((hole) => {
      const jj = hole.querySelector(".game-jj");
      if (jj) hole.removeChild(jj);
    });

    // Start timer
    gameInterval = setInterval(() => {
      timeLeft--;
      gameTimer.textContent = timeLeft < 10 ? "0" + timeLeft : timeLeft;

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    // Spawn JJs
    spawnJJ();
    const spawnInterval = setInterval(() => {
      if (!isGameRunning) {
        clearInterval(spawnInterval);
        return;
      }
      spawnJJ();
      // Occasionally spawn multiple
      if (Math.random() > 0.7) {
        setTimeout(spawnJJ, 200);
      }
    }, 800);
  }

  // End game
  function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);

    // Hide cursor
    cursorInGame = false;
    gameCursor.classList.remove("visible");
    gameSection.style.cursor = "default";

    // Clear remaining JJs
    gameHoles.forEach((hole) => {
      const jj = hole.querySelector(".game-jj");
      if (jj) hole.removeChild(jj);
    });

    // Show final score
    gameFinalScore.innerHTML =
      "<h3>Your Final Score</h3><h1>" + score + "</h1>";
    gameFinalScore.classList.add("visible");
    gameStartBtn.textContent = "Play Again";
    gameStartBtn.classList.remove("hidden");
  }

  gameStartBtn.addEventListener("click", startGame);
}
