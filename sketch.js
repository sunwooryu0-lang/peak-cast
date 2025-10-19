let mountains = [
  {name: '북한산', lat: 37.6583, lon: 126.9885},
  {name: '설악산', lat: 38.1199, lon: 128.4656},
  {name: '지리산', lat: 35.3587, lon: 127.7327},
  {name: '한라산', lat: 33.3617, lon: 126.5292}
];

const API_KEY = 'e597e4160f8442e38b5182601251910';
let mountainWeather = [null, null, null, null];
let selectedMountain = null;
let bgImage, myFont;
let mountainImages = [];
let emojiAnimSize = 86;
let emojiAnimGrowing = true;
const ICON_MAX_HEIGHT = 48;
const ICON_Y = 350;
const ICONS_AREA_MARGIN = 40;
const POPUP_RADIUS = 20;

let hoverIndex = -1, iconScale = [1,1,1,1];

function preload() {
  bgImage = loadImage('bg.png');
  mountainImages[0] = loadImage('bukhansan.png');
  mountainImages[1] = loadImage('seoraksan.png');
  mountainImages[2] = loadImage('jirisan.png');
  mountainImages[3] = loadImage('hallasan.png');
  myFont = loadFont('Pretendard-SemiBold.otf');
}

function setup() {
  createCanvas(600, 400);
  textFont(myFont);
  loadAllWeather();
}

function draw() {
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  // 아이콘 위치 계산
  let ws = [], aspect = [], totalIconsWidth = 0;
  for (let i = 0; i < 4; i++) {
    aspect[i] = mountainImages[i].width / mountainImages[i].height;
    ws[i] = ICON_MAX_HEIGHT * aspect[i];
    totalIconsWidth += ws[i];
  }
  let totalGap = width - 2 * ICONS_AREA_MARGIN - totalIconsWidth;
  let gap = totalGap / 3;
  if (gap < ICON_MAX_HEIGHT / 2) gap = ICON_MAX_HEIGHT / 2;
  let xs = [], curX = ICONS_AREA_MARGIN + ws[0] / 2;
  for (let i = 0; i < 4; i++) {
    xs.push(curX);
    curX += ws[i] / 2 + (i < 3 ? ws[i + 1] / 2 + gap : 0);
  }

  // 산 아이콘
  for (let i = 0; i < 4; i++) {
    let over = (hoverIndex == i) && (selectedMountain === null);
    let target = over ? 1.13 : 1.0;
    iconScale[i] += (target - iconScale[i]) * 0.18;
    let x = xs[i], y = ICON_Y, scaleVal = iconScale[i];
    let iconW = ws[i] * scaleVal, iconH = ICON_MAX_HEIGHT * scaleVal;
    imageMode(CENTER);
    image(mountainImages[i], x, y, iconW, iconH);
  }
  imageMode(CORNER);

  // 팝업
  if (selectedMountain !== null && mountainWeather[selectedMountain]) {
    let data = mountainWeather[selectedMountain];
    let pw = width * 0.78, ph = 260, px = (width - pw) / 2, py = (height - ph) / 2;
    let centerX = px + pw / 2, centerY = py + ph / 2;
    fill(255, 255, 240, 191); noStroke();
    rect(px, py, pw, ph, POPUP_RADIUS);

    let darkGreen = color(21, 62, 50);
    textFont(myFont);
    textAlign(CENTER, CENTER);
    fill(darkGreen);

    // 일정 간격 유지
    let textGap = 40;
    textSize(54);
    text(`${nf(data.temp, 1, 1)}°C`, centerX, centerY - textGap);

    textSize(38);
    text(data.description, centerX, centerY + textGap);

    // 이모지
    textFont('sans-serif');
    let emoji = getWeatherEmoji(data.description);
    textSize(emojiAnimSize);
    text(emoji, centerX + 140, centerY);
    textFont(myFont);
  }

  // 이모지 애니메이션
  if (selectedMountain !== null) {
    if (emojiAnimGrowing) {
      emojiAnimSize += 0.65;
      if (emojiAnimSize > 112) emojiAnimGrowing = false;
    } else {
      emojiAnimSize -= 0.65;
      if (emojiAnimSize < 86) emojiAnimGrowing = true;
    }
  } else emojiAnimSize = 86;
}

function mouseMoved() {
  if (selectedMountain !== null) { hoverIndex = -1; return; }
  let ws = [], aspect = [], totalIconsWidth = 0;
  for (let i = 0; i < 4; i++) { aspect[i] = mountainImages[i].width / mountainImages[i].height; ws[i] = ICON_MAX_HEIGHT * aspect[i]; totalIconsWidth += ws[i]; }
  let gap = Math.max((width - 2 * ICONS_AREA_MARGIN - totalIconsWidth) / 3, ICON_MAX_HEIGHT / 2);
  let xs = [], curX = ICONS_AREA_MARGIN + ws[0] / 2;
  for (let i = 0; i < 4; i++) { xs.push(curX); curX += ws[i] / 2 + (i < 3 ? ws[i + 1] / 2 + gap : 0); }
  hoverIndex = -1;
  for (let i = 0; i < 4; i++)
    if (mouseX > xs[i] - ws[i] / 2 && mouseX < xs[i] + ws[i] / 2 && mouseY > ICON_Y - ICON_MAX_HEIGHT / 2 && mouseY < ICON_Y + ICON_MAX_HEIGHT / 2) hoverIndex = i;
}

function mousePressed() {
  if (selectedMountain !== null) { selectedMountain = null; return; }
  let ws = [], aspect = [], totalIconsWidth = 0;
  for (let i = 0; i < 4; i++) { aspect[i] = mountainImages[i].width / mountainImages[i].height; ws[i] = ICON_MAX_HEIGHT * aspect[i]; totalIconsWidth += ws[i]; }
  let gap = Math.max((width - 2 * ICONS_AREA_MARGIN - totalIconsWidth) / 3, ICON_MAX_HEIGHT / 2);
  let xs = [], curX = ICONS_AREA_MARGIN + ws[0] / 2;
  for (let i = 0; i < 4; i++) { xs.push(curX); curX += ws[i] / 2 + (i < 3 ? ws[i + 1] / 2 + gap : 0); }
  for (let i = 0; i < 4; i++) {
    if (mouseX > xs[i] - ws[i] / 2 && mouseX < xs[i] + ws[i] / 2 && mouseY > ICON_Y - ICON_MAX_HEIGHT / 2 && mouseY < ICON_Y + ICON_MAX_HEIGHT / 2)
      selectedMountain = i;
  }
}

function loadAllWeather() {
  mountains.forEach((mountain, idx) => {
    let url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${mountain.lat},${mountain.lon}&lang=ko`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        mountainWeather[idx] = {
          name: mountain.name,
          temp: data.current.temp_c,
          description: data.current.condition.text,
          icon: data.current.condition.icon
        };
      })
      .catch(() => {
        mountainWeather[idx] = {
          name: mountain.name,
          temp: 0,
          description: "데이터 오류",
          icon: ""
        };
      });
  });
}

function getWeatherEmoji(description) {
  if (description.includes("맑")) return "☀️";
  if (description.includes("구름")) return "☁️";
  if (description.includes("비")) return "🌧️";
  if (description.includes("눈")) return "❄️";
  if (description.includes("안개") || description.includes("박무")) return "🌫️";
  if (description.includes("뇌우")) return "⛈️";
  return "❓";
}