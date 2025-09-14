const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const remainingEl = document.getElementById("remaining");
const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const overlay = document.getElementById("overlay");
const msgBox = document.getElementById("msg");
const startBtn = document.getElementById("startBtn");

let santa = { x: canvas.width/2, y: 40, width: 40, height: 40, speed: 6 };
let gifts = [];
let chimneys = [];
let bgX = 0, bgSpeed = 2;
let score = 0, level = 1, remainingGifts = 0, timeLeft = 0;
let gameRunning = false;
let timerInterval;
let keys = {};

let levelData = [
  { gifts:5, time:30, goal:3, chimneys:2, speed:1, giftSpeed:4 },
  { gifts:6, time:30, goal:4, chimneys:2, speed:1.2, giftSpeed:4 },
  { gifts:7, time:35, goal:5, chimneys:3, speed:1.5, giftSpeed:4 },
  { gifts:8, time:35, goal:6, chimneys:3, speed:1.8, giftSpeed:5 },
  { gifts:9, time:40, goal:7, chimneys:4, speed:2, giftSpeed:5 },
  { gifts:10,time:40,goal:8,chimneys:4, speed:2.2, giftSpeed:5 },
  { gifts:11,time:45,goal:9,chimneys:5, speed:2.5, giftSpeed:6 },
  { gifts:12,time:45,goal:10,chimneys:5, speed:2.7, giftSpeed:6 },
  { gifts:13,time:50,goal:11,chimneys:6, speed:3, giftSpeed:7 },
  { gifts:15,time:50,goal:13,chimneys:6, speed:3.2, giftSpeed:7 }
];

// 키보드 입력
document.addEventListener("keydown", e => { keys[e.key]=true; if(e.key===" ") dropGift(); });
document.addEventListener("keyup", e => keys[e.key]=false);

// 모바일 터치
canvas.addEventListener("touchmove", e => {
  let touch = e.touches[0];
  santa.x = touch.clientX - canvas.getBoundingClientRect().left - santa.width/2;
});
canvas.addEventListener("click", dropGift);

startBtn.addEventListener("click", startGame);

function startGame(){
  score = 0;
  level = 1;
  setupLevel(level);
  overlay.style.display = "none";
  gameRunning = true;

  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if(!gameRunning) return;
    timeLeft--;
    timeEl.textContent = timeLeft;
    if(timeLeft <= 0) gameOver();
  }, 1000);

  requestAnimationFrame(gameLoop);
}

function setupLevel(lvl){
  gifts = [];
  chimneys = [];
  remainingGifts = levelData[lvl-1].gifts;
  timeLeft = levelData[lvl-1].time;
  levelEl.textContent = lvl;
  remainingEl.textContent = remainingGifts;
  scoreEl.textContent = score;
  placeChimneys(levelData[lvl-1].chimneys);
}

function placeChimneys(count){
  chimneys = [];
  let spacing = canvas.width / count;
  for(let i=0;i<count;i++){
    chimneys.push({
      x: spacing*i + 30,
      y: canvas.height - 40,
      width:60,
      height:40
    });
  }
}

function dropGift(){
  if(!gameRunning || remainingGifts<=0) return;
  gifts.push({
    x: santa.x + santa.width/2 - 8,
    y: santa.y + santa.height,
    size:16,
    speed: levelData[level-1].giftSpeed
  });
  remainingGifts--;
  remainingEl.textContent = remainingGifts;
}

function gameLoop(){
  if(!gameRunning) return;
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update(){
  // 산타 이동
  if(keys["ArrowLeft"] && santa.x>0) santa.x -= santa.speed;
  if(keys["ArrowRight"] && santa.x<canvas.width - santa.width) santa.x += santa.speed;

  // 배경 이동
  bgX -= bgSpeed;
  if(bgX <= -canvas.width) bgX = 0;

  // 선물 낙하
  gifts.forEach((gift,i)=>{
    gift.y += gift.speed;
    chimneys.forEach(ch=>{
      if(gift.x+gift.size>ch.x && gift.x<ch.x+ch.width && gift.y+gift.size>ch.y && gift.y<ch.y+ch.height){
        gifts.splice(i,1);
        score++;
        scoreEl.textContent = score;
      }
    });
    if(gift.y>canvas.height) gifts.splice(i,1);
  });

  // 굴뚝 이동
  chimneys.forEach(ch=>{
    ch.x -= levelData[level-1].speed;
    if(ch.x + ch.width < 0) ch.x = canvas.width;
  });

  // 레벨 업
  if(score >= levelData[level-1].goal){
    if(level<10){
      level++;
      setupLevel(level);
      showLevelUp();
    } else {
      gameOver();
    }
  }
}

function render(){
  // 배경
  ctx.fillStyle="#0b3a47";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // 산타
  ctx.fillStyle="red";
  ctx.fillRect(santa.x,santa.y,santa.width,santa.height);

  // 선물
  ctx.fillStyle="gold";
  gifts.forEach(g=>ctx.fillRect(g.x,g.y,g.size,g.size));

  // 굴뚝
  ctx.fillStyle="brown";
  chimneys.forEach(ch=>ctx.fillRect(ch.x,ch.y,ch.width,ch.height));
}

function gameOver(){
  gameRunning = false;
  clearInterval(timerInterval);
  overlay.style.display="flex";
  msgBox.innerHTML = `<div style="font-size:20px;font-weight:800">Game Over 🎄</div>
  <div>최종 레벨: ${level}, 점수: ${score}</div>
  <button id="startBtn2" class="big">재시작</button>`;
  document.getElementById("startBtn2").addEventListener("click", startGame);
}

function showLevelUp(){
  overlay.style.display="flex";
  msgBox.innerHTML = `<div style="font-size:20px;font-weight:800">Level Up! 🎉</div>
  <div>현재 레벨: ${level}</div>
  <button id="nextBtn" class="big">계속</button>`;
  document.getElementById("nextBtn").addEventListener("click", () => {
    overlay.style.display="none";
    requestAnimationFrame(gameLoop);
  });
}
