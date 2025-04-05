import stories from "./stories.js";
import pkQuestionPool from "./questions.js";

const morseCode = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  0: "-----",
  ", ": "--..--",
  ".": ".-.-.-",
  "?": "..--..",
  "/": "-..-.",
  "-": "-....-",
  "(": "-.--.",
  ")": "-.--.-",
};

function textToMorse(text) {
  text = text.toUpperCase();
  let morse = "";
  for (let i = 0; i < text.length; i++) {
    if (morseCode[text[i]]) {
      morse += morseCode[text[i]] + " ";
    } else {
      morse += " ";
    }
  }
  return morse.trim();
}

function morseToText(morse) {
  const morseArray = morse.split(" ");
  let text = "";
  for (let i = 0; i < morseArray.length; i++) {
    const char = Object.keys(morseCode).find(
      (key) => morseCode[key] === morseArray[i]
    );
    if (char) {
      text += char;
    } else {
      text += "?";
    }
  }
  return text;
}

const questionElement = document.getElementById("question");
const morseCodeDisplay = document.getElementById("morse-code-display");
const answerInput = document.getElementById("answer");
const submitButton = document.getElementById("submit-button");
const resultElement = document.getElementById("result");
const locationElement = document.getElementById("location");

const decryptModeButton = document.getElementById("decrypt-mode-button");
const pkModeButton = document.getElementById("pk-mode-button");
const storySelection = document.getElementById("story-selection");

const startScreen = document.getElementById("start-screen");
const decryptGame = document.getElementById("decrypt-game");
const pkGame = document.getElementById("pk-game");

// 修复音效文件路径问题，确保文件路径正确
const correctSound = new Audio("./assets/sounds/correct.mp3");
const wrongSound = new Audio("./assets/sounds/wrong.mp3");
const transitionSound = new Audio("./assets/sounds/transition.mp3");

// 修复音效播放逻辑，添加错误处理
function playSound(sound) {
  sound.play().catch((error) => {
    console.error("音效播放失败：", error);
  });
}

// 添加播放转场音效函数，解决未定义错误
function playTransitionSound() {
  playSound(transitionSound);
}

// 获取 header 元素
const pageHeader = document.querySelector(".page-header");

// 添加动态缩小效果
function shrinkHeader() {
  pageHeader.classList.add("shrink");
}

// 修复解密模式按钮点击逻辑
decryptModeButton.addEventListener("click", () => {
  shrinkHeader(); // 缩小 header
  startScreen.style.display = "none";
  storySelection.style.display = "block";
  playTransitionAnimation();
});

function playTransitionAnimation() {
  storySelection.style.animation = "fadeIn 0.5s ease-in-out";
  storySelection.style.opacity = "1";
}

// 修改故事选择逻辑，使用引入的 stories 数据
const storyButtons = document.querySelectorAll(".story-button");
storyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const storyKey = button.getAttribute("data-story");
    if (stories[storyKey]) {
      transitionSound.play();
      showTransitionMessage(`准备进入${stories[storyKey].title}的世界...`);
      setTimeout(() => {
        startStory(stories[storyKey]);
      }, 1500);
    }
  });
});

// 优化故事加载逻辑，确保过渡效果流畅
function startStory(story) {
  console.log("开始加载故事:", story.title);

  // 隐藏故事选择界面
  storySelection.style.display = "none";

  // 显示解密游戏界面
  decryptGame.style.display = "block";
  decryptGame.style.animation = "fadeIn 0.5s ease-in-out";

  // 设置故事标题和描述
  const storyTitle = document.getElementById("story-title");
  const storyDescription = document.getElementById("story-description");
  storyTitle.textContent = story.title;
  storyDescription.textContent = story.description;

  // 设置当前故事和索引
  currentStory = story;
  currentLocationIndex = 0;
  currentPuzzleIndex = 0;

  // 添加开场动画
  showStoryIntro(story, () => {
    console.log("开场动画结束，加载故事地点");
    loadStoryLocation();
  });
}

// 修改开场动画逻辑，确保加载完成后调用回调函数
function showStoryIntro(story, callback) {
  const introElement = document.createElement("div");
  introElement.className = "story-intro";
  introElement.innerHTML = `
        <h2>${story.title}</h2>
        <p>${story.description}</p>
        <div class="loading-animation"></div>
    `;
  document.body.appendChild(introElement);

  setTimeout(() => {
    introElement.remove();
    console.log("开场动画已移除");
    if (callback) {
      console.log("调用回调函数");
      callback(); // 确保加载完成后调用回调函数
    }
  }, 2000);
}

// 修改 narrative 展示逻辑，动态更新故事内容
function loadStoryLocation() {
  if (!currentStory) {
    console.error("当前故事未定义");
    return;
  }

  if (currentPuzzleIndex >= currentStory.puzzles.length) {
    showTransitionMessage(currentStory.transitions[currentLocationIndex - 1]);
    resultElement.textContent = "恭喜你，完成了整个故事！";
    morseCodeDisplay.textContent = "";
    answerInput.style.display = "none";
    submitButton.style.display = "none";
    return;
  }

  locationElement.textContent = `当前地点：${currentStory.locations[currentLocationIndex]}`;
  const puzzle = currentStory.puzzles[currentPuzzleIndex];
  morseCodeDisplay.textContent = puzzle.morse;
  questionElement.textContent = `请解密摩斯密码：${puzzle.hint}`;

  // 动态更新 narrative 部分
  const narrativeElement = document.getElementById("narrative");
  const narrativeToShow = currentStory.narrativeParts[currentPuzzleIndex];
  narrativeElement.textContent = narrativeToShow;

  // 启动倒计时修改为60秒
  startCountdown(60, () => {
    playEncouragementAudio("时间到了！请再接再厉！");
    resultElement.textContent = "时间到了！请再试一次！";
    resultElement.style.color = "red";
  });
}

let player1Questions = [];
let player2Questions = [];
let player1Score = 0;
let player2Score = 0;
let player1Index = 0;
let player2Index = 0;

// 修改 PK 模式加载逻辑，确保题目固定，但左右顺序随机
function startPKGame() {
  const shuffled = pkQuestionPool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 10); // 确定的10道题目

  // 随机化左右双方的题目顺序
  player1Questions = [...selected].sort(() => Math.random() - 0.5);
  player2Questions = [...selected].sort(() => Math.random() - 0.5);

  player1Index = 0;
  player2Index = 0;
  player1Score = 0;
  player2Score = 0;

  // 新增：显示PK动画效果，中间闪现“PK”
  const pkAnim = document.createElement("div");
  pkAnim.className = "pk-animation";
  pkAnim.textContent = "PK";
  pkGame.appendChild(pkAnim);
  setTimeout(() => {
    pkAnim.remove();
  }, 1000);

  loadPKQuestion(1);
  loadPKQuestion(2);
}

function loadPKQuestion(player) {
  const question =
    player === 1
      ? player1Questions[player1Index]
      : player2Questions[player2Index];
  if (!question) return; // 如果没有更多题目，直接返回

  const questionElement = document.getElementById(`player${player}-question`);
  const optionsElement = document.getElementById(`player${player}-options`);
  questionElement.textContent = question.question;
  optionsElement.innerHTML = "";

  // 随机化选项顺序
  const shuffledOptions = question.options.sort(() => Math.random() - 0.5);
  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => handlePKAnswer(player, option));
    optionsElement.appendChild(button);
  });
}

function handlePKAnswer(player, answer) {
  const question =
    player === 1
      ? player1Questions[player1Index]
      : player2Questions[player2Index];
  const resultElement = document.getElementById(`player${player}-result`);

  if (answer === question.answer) {
    resultElement.textContent = "正确！";
    resultElement.style.color = "green";
    if (player === 1) player1Score++;
    if (player === 2) player2Score++;
  } else {
    resultElement.textContent = "错误！";
    resultElement.style.color = "red";
  }

  if (player === 1) {
    player1Index++;
    if (player1Index >= 10) {
      endPKGame();
      return;
    }
    loadPKQuestion(1);
  }

  if (player === 2) {
    player2Index++;
    if (player2Index >= 10) {
      endPKGame();
      return;
    }
    loadPKQuestion(2);
  }
}

function endPKGame() {
  const winner =
    player1Score > player2Score
      ? "玩家1获胜！"
      : player2Score > player1Score
      ? "玩家2获胜！"
      : "平局！";
  alert(
    `游戏结束！\n玩家1得分：${player1Score}\n玩家2得分：${player2Score}\n${winner}`
  );

  // 返回初始界面
  resetToInitialScreen();
}

// 新增：返回初始界面
function resetToInitialScreen() {
  pkGame.style.display = "none";
  decryptGame.style.display = "none";
  storySelection.style.display = "none";
  startScreen.style.display = "block";
  startScreen.style.animation = "fadeIn 1s ease-in-out";
  pageHeader.classList.remove("shrink"); // 恢复 header 样式
}

let currentStory = null;
let currentLocationIndex = 0;
let currentPuzzleIndex = 0;

// 修复提交答案逻辑，确保用户输入正确处理
submitButton.addEventListener("click", () => {
  const userAnswer = answerInput.value.toUpperCase();
  const puzzle = currentStory.puzzles[currentPuzzleIndex];

  if (userAnswer === puzzle.answer) {
    playSound(correctSound); // 播放正确音效
    playEncouragementAudio("太棒了！你答对了！");
    showRewardAnimation();
    resultElement.textContent = "太棒了！你解开了密码！";
    resultElement.style.color = "green";

    currentPuzzleIndex++;
    currentLocationIndex++;
    stopCountdown(); // 停止倒计时

    if (currentPuzzleIndex < currentStory.puzzles.length) {
      setTimeout(() => {
        showTransitionMessage(
          currentStory.transitions[currentLocationIndex - 1]
        );
        loadStoryLocation();
      }, 1500);
    } else {
      completeStory();
    }
  } else {
    playSound(wrongSound); // 播放错误音效
    playEncouragementAudio("别灰心，再试一次！");
    resultElement.textContent = "密码错误，请再试一次！";
    resultElement.style.color = "red";
    answerInput.classList.add("shake");
    setTimeout(() => {
      answerInput.classList.remove("shake");
    }, 500);
  }
  answerInput.value = "";
});

// 获取跳过按钮
const skipButton = document.getElementById("skip-button");

// 跳过按钮逻辑
skipButton.addEventListener("click", () => {
  currentPuzzleIndex++;
  currentLocationIndex++;
  stopCountdown(); // 停止倒计时
  if (currentPuzzleIndex < currentStory.puzzles.length) {
    loadStoryLocation();
  } else {
    completeStory();
  }
});

// 删除重复的 completeStory 函数声明
function completeStory() {
  showTransitionMessage(currentStory.transitions[currentLocationIndex - 1]);
  setTimeout(() => {
    const completionMessage = `
        <div class="story-completion">
            <h2>恭喜你完成了故事！</h2>
            <p>你成功解开了所有的谜题</p>
            <button id="return-to-selection">选择新的故事</button>
        </div>
    `;
    decryptGame.innerHTML = completionMessage;

    // 添加返回故事选择界面的逻辑
    const returnButton = document.getElementById("return-to-selection");
    returnButton.addEventListener("click", () => {
      decryptGame.style.display = "none";
      storySelection.style.display = "block";
      playTransitionAnimation();
    });
  }, 2000);
}

// 修复过渡消息逻辑，确保显示效果正常
function showTransitionMessage(message) {
  const existingTransition = document.querySelector(".story-transition");
  if (existingTransition) {
    document.body.removeChild(existingTransition);
  }

  const transitionElement = document.createElement("div");
  transitionElement.className = "story-transition";
  transitionElement.innerHTML = `
        <div class="transition-content">
            <div class="transition-image"></div>
            <p class="transition-text">${message}</p>
            <div class="sparkles"></div>
        </div>
    `;
  document.body.appendChild(transitionElement);
  playTransitionSound();
  setTimeout(() => {
    document.body.removeChild(transitionElement);
  }, 3000);
}

// 添加奖励动画，增强用户体验
function showRewardAnimation() {
  const rewards = ["🌟", "🎈", "🎉", "🎊", "🌈", "⭐", "🦄", "🎨"];
  const container = document.createElement("div");
  container.className = "reward-container";

  // 创建多个奖励元素
  for (let i = 0; i < 15; i++) {
    const reward = document.createElement("span");
    reward.textContent = rewards[Math.floor(Math.random() * rewards.length)];
    reward.style.left = `${Math.random() * 100}%`;
    reward.style.animationDelay = `${Math.random() * 2}s`;
    reward.className = "floating-reward";
    container.appendChild(reward);
  }

  document.body.appendChild(container);

  setTimeout(() => {
    document.body.removeChild(container);
  }, 3000);
}

// 修复 PK 模式按钮点击逻辑
pkModeButton.addEventListener("click", () => {
  shrinkHeader(); // 缩小 header
  startScreen.style.display = "none";
  pkGame.style.display = "block";
  pkGame.style.animation = "fadeIn 0.5s ease-in-out";
  startPKGame();
});

// 修改 playEncouragementAudio 函数
function playEncouragementAudio(message) {
  let soundPath = null;
  if (message.includes("时间到了！请再接再厉！")) {
    soundPath = "assets/sounds/时间到了！请再接再厉！.mp3";
  } else if (message.includes("太棒了！你答对了！")) {
    soundPath = "assets/sounds/太棒了！你答对了！.mp3";
  } else if (message.includes("别灰心，再试一次！")) {
    soundPath = "assets/sounds/别灰心，再试一次！.mp3";
  }
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.error("音频播放失败：", error);
    });
  } else {
    // 保留原有语音朗读逻辑
    const audio = new SpeechSynthesisUtterance(message);
    audio.lang = "zh-CN";
    audio.pitch = 1.2;
    audio.rate = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(audio);
  }
}

// 修改解密模式倒计时逻辑，确保时间到后不再重新倒计时
let countdownInterval;
function startCountdown(duration, onComplete) {
  clearInterval(countdownInterval); // 清除之前的计时器
  let timeLeft = duration;
  const countdownElement = document.createElement("div");
  countdownElement.id = "countdown-timer";
  countdownElement.style.position = "absolute";
  countdownElement.style.top = "100px";
  countdownElement.style.right = "10px";
  countdownElement.style.backgroundColor = "#f39c12";
  countdownElement.style.color = "#fff";
  countdownElement.style.padding = "10px";
  countdownElement.style.borderRadius = "8px";
  countdownElement.style.fontSize = "18px";
  countdownElement.style.zIndex = "1000";
  document.body.appendChild(countdownElement);

  countdownInterval = setInterval(() => {
    countdownElement.textContent = `剩余时间：${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      document.body.removeChild(countdownElement);
      countdownInterval = null; // 确保倒计时不会重新开始
      onComplete();
    }
    timeLeft--;
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = null; // 确保倒计时状态被重置
  const countdownElement = document.getElementById("countdown-timer");
  if (countdownElement) {
    document.body.removeChild(countdownElement);
  }
}

// 修改故事选择按钮的事件监听逻辑
storyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const storyKey = button.getAttribute("data-story");
    console.log("选择故事:", storyKey); // 添加调试日志
    if (stories[storyKey]) {
      // 播放过渡动画和音效
      playSound(transitionSound);
      showTransitionMessage(`准备进入${stories[storyKey].title}的世界...`);
      // 延迟启动故事
      setTimeout(() => {
        startStory(stories[storyKey]);
      }, 1500);
    } else {
      console.error("故事未找到:", storyKey); // 添加错误日志
    }
  });
});

// 新增：为增加互动性，点击页眉显示随机快乐表情
function showHappyEmoji() {
  const emojis = ["😊", "😄", "😃", "😁", "🤩", "🥳"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const tipDiv = document.createElement("div");
  tipDiv.textContent = emoji;
  tipDiv.style.position = "fixed";
  tipDiv.style.top = "50%";
  tipDiv.style.left = "50%";
  tipDiv.style.transform = "translate(-50%, -50%)";
  tipDiv.style.fontSize = "72px";
  tipDiv.style.zIndex = "3000";
  tipDiv.style.opacity = "1";
  document.body.appendChild(tipDiv);
  setTimeout(() => {
    tipDiv.style.transition = "opacity 1s";
    tipDiv.style.opacity = "0";
    setTimeout(() => {
      tipDiv.remove();
    }, 1000);
  }, 1000);
}
// 为页眉添加点击事件，增加互动效果
pageHeader.addEventListener("click", () => {
  showHappyEmoji();
});

// 新增：添加更多的童趣互动效果

// 定时添加飞舞的蝴蝶效果
function addButterflyEffect() {
  for (let i = 0; i < 3; i++) {
    const butterfly = document.createElement("div");
    butterfly.className = "butterfly";
    butterfly.style.top = Math.random() * 100 + "vh";
    butterfly.style.left = Math.random() * 100 + "vw";
    document.body.appendChild(butterfly);
    // 每8秒更新一次位置以营造飘动效果
    setInterval(() => {
      butterfly.style.top = Math.random() * 100 + "vh";
      butterfly.style.left = Math.random() * 100 + "vw";
    }, 8000);
  }
}

// 定时添加糖果飞舞效果
function addCandyEffect() {
  setInterval(() => {
    const candy = document.createElement("div");
    candy.className = "candy";
    candy.style.top = "100vh";
    candy.style.left = Math.random() * 100 + "vw";
    document.body.appendChild(candy);
    // 10秒后移除该元素
    setTimeout(() => {
      if (candy.parentNode) {
        candy.parentNode.removeChild(candy);
      }
    }, 10000);
  }, 3000);
}

// 鼠标点击时产生彩色星星效果
document.addEventListener("click", function (e) {
  const star = document.createElement("div");
  star.className = "click-star";
  star.textContent = "⭐";
  star.style.top = e.clientY - 20 + "px";
  star.style.left = e.clientX - 20 + "px";
  document.body.appendChild(star);
  setTimeout(() => {
    if (star.parentNode) {
      star.parentNode.removeChild(star);
    }
  }, 800);
});

// 初始化所有童趣互动效果
window.addEventListener("load", function () {
  addButterflyEffect();
  addCandyEffect();
});

// 删除重复的欢迎界面处理逻辑，合并如下：
document.addEventListener("DOMContentLoaded", function () {
  const welcomeScreen = document.getElementById("welcome-screen");
  const enterButton = document.getElementById("enter-button");
  const startScreen = document.getElementById("start-screen");

  // 检查是否已访问，若是则隐藏欢迎界面，直接显示开始界面
  if (localStorage.getItem("visited")) {
    console.log("用户已访问过，直接进入主界面");
    welcomeScreen.style.display = "none";
    startScreen.style.display = "block";
  } else {
    console.log("首次访问，显示欢迎界面");
    welcomeScreen.style.display = "flex";
    enterButton.addEventListener("click", () => {
      console.log("点击了进入游戏按钮");
      welcomeScreen.style.transition = "opacity 1s";
      welcomeScreen.style.opacity = "0";
      setTimeout(() => {
        welcomeScreen.style.display = "none";
        startScreen.style.display = "block";
        startScreen.style.animation = "fadeIn 1s ease-in-out";
        localStorage.setItem("visited", "true");
      }, 1000);
    });
  }
});
