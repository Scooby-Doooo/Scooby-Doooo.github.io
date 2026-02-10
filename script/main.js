// Animation Timeline
const animationTimeline = () => {
  // Spit chars that needs to be animated individually
  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd = document.getElementsByClassName("wish-hbd")[0];

  textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
    .split("")
    .join("</span><span>")}</span`;

  hbd.innerHTML = `<span>${hbd.innerHTML
    .split("")
    .join("</span><span>")}</span`;

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg",
  };

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg",
  };

  // Question Interaction Logic
  const questionContainer = document.querySelector(".question-container");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const loveBtn = document.getElementById("loveBtn");

  const noTexts = [
    "Are you sure?",
    "Think again!",
    "Last chance!",
    "Surely not?",
    "You might regret this!",
    "Give it another thought!",
    "Are you absolutely certain?",
    "This could be a mistake!",
    "Have a heart!",
    "Don't be so cold!",
    "Change of heart?",
    "Wouldn't you reconsider?",
    "Is that your final answer?",
    "You're breaking my heart ;(",
  ];
  let noClickCount = 0;

  noBtn.addEventListener("click", () => {
    if (noClickCount < noTexts.length) {
      noBtn.innerText = noTexts[noClickCount];
      noClickCount++;
      // Optional: Add random movement or shake effect here
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 100 - 50;
      TweenMax.to(noBtn, 0.2, { x: randomX, y: randomY });
    } else {
      TweenMax.to(noBtn, 0.5, { opacity: 0, display: "none" });
    }
  });

  const resumeTimeline = () => {
    TweenMax.to(questionContainer, 0.5, {
      opacity: 0,
      pointerEvents: "none",
      onComplete: () => {
        tl.resume();
      },
    });
  };

  // yesBtn.addEventListener("click", resumeTimeline); 
  loveBtn.addEventListener("click", resumeTimeline);

  const tl = new TimelineMax();

  tl.to(".container", 0.1, {
    visibility: "visible",
  })
    .from(".one", 0.7, {
      opacity: 0,
      y: 10,
    })
    .from(".two", 0.4, {
      opacity: 0,
      y: 10,
    })
    .to(
      ".one",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=2.5"
    )
    .to(
      ".two",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "-=1"
    )
    .from(".three", 0.7, {
      opacity: 0,
      y: 10,
      // scale: 0.7
    })
    .to(
      ".three",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=2"
    )
    .from(".four", 0.7, {
      scale: 0.2,
      opacity: 0,
    })
    .from(".fake-btn", 0.3, {
      scale: 0.2,
      opacity: 0,
    })
    .staggerTo(
      ".hbd-chatbox span",
      0.5,
      {
        visibility: "visible",
      },
      0.05
    )
    .to(".fake-btn", 0.1, {
      backgroundColor: "rgb(127, 206, 248)",
    })
    .to(
      ".four",
      0.5,
      {
        scale: 0.2,
        opacity: 0,
        y: -150,
      },
      "+=0.7"
    )
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, {
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(21, 161, 237)",
      color: "#fff",
    })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(
      ".idea-5",
      0.7,
      {
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0,
      },
      "+=0.5"
    )
    .to(
      ".idea-5 span",
      0.7,
      {
        rotation: 90,
        x: 8,
      },
      "+=0.4"
    )
    .to(
      ".idea-5",
      0.7,
      {
        scale: 0.2,
        opacity: 0,
      },
      "+=2"
    )
    .staggerFrom(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: Expo.easeOut,
      },
      0.2
    )
    .staggerTo(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: Expo.easeOut,
      },
      0.2,
      "+=1"
    )
    .call(() => {
      tl.pause();
      showGame();
    })
    .staggerFromTo(
      ".baloons img",
      2.5,
      {
        opacity: 0.9,
        y: 1400,
      },
      {
        opacity: 1,
        y: -1000,
      },
      0.2
    )
    .from(
      ".girl-dp",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45,
      },
      "-=2"
    )
    .from(".hat", 0.5, {
      x: -100,
      y: 350,
      rotation: -180,
      opacity: 0,
    })
    .staggerFrom(
      ".wish-hbd span",
      0.7,
      {
        opacity: 0,
        y: -50,
        // scale: 0.3,
        rotation: 150,
        skewX: "30deg",
        ease: Elastic.easeOut.config(1, 0.5),
      },
      0.1
    )
    .staggerFromTo(
      ".wish-hbd span",
      0.7,
      {
        scale: 1.4,
        rotationY: 150,
      },
      {
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: Expo.easeOut,
      },
      0.1,
      "party"
    )
    .from(
      ".wish h5",
      0.5,
      {
        opacity: 0,
        y: 10,
        skewX: "-15deg",
      },
      "party"
    )
    // .staggerTo(
    //   ".eight svg",
    //   1.5,
    //   {
    //     visibility: "visible",
    //     opacity: 0,
    //     scale: 80,
    //     repeat: 3,
    //     repeatDelay: 1.4,
    //   },
    //   0.3
    // )
    .call(() => {
      tl.pause();
      const six = document.querySelector(".six");
      six.style.cursor = "pointer";
      six.setAttribute("title", "Click to continue");

      const resumeClick = () => {
        six.removeEventListener("click", resumeClick);
        six.style.cursor = "default";
        six.removeAttribute("title");
        tl.resume();
      };

      six.addEventListener("click", resumeClick);
    })
    .to(".six", 0.5, {
      opacity: 0,
      y: 30,
      zIndex: "-1",
    })
    .call(() => {
      tl.pause();
      TweenMax.to(questionContainer, 0.5, {
        opacity: 1,
        pointerEvents: "all",
      });
    })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .to(
      ".last-smile",
      0.5,
      {
        rotation: 90,
      },
      "+=1"
    );

  // tl.seek("currentStep");
  // tl.timeScale(2);

  // Restart Animation on click
  const replyBtn = document.getElementById("replay");
  replyBtn.addEventListener("click", () => {
    tl.restart();
  });

  // Minigame Logic
  const gameContainer = document.getElementById("gameContainer");
  const gameStats = document.getElementById("gameStats");
  const scoreSpan = document.getElementById("score");
  const timerSpan = document.getElementById("timer");
  const heartsArea = document.getElementById("heartsArea");
  const startGameBtn = document.getElementById("startGameBtn");
  const retryBtn = document.getElementById("retryBtn");
  const gameTitle = document.getElementById("gameTitle");
  const gameInstruction = document.getElementById("gameInstruction");

  let gameScore = 0;
  let gameTime = 15;
  let gameInterval;
  let spawnInterval;
  const targetScore = 10;

  function showGame() {
    TweenMax.to(gameContainer, 0.5, {
      opacity: 1,
      pointerEvents: "all",
      display: "flex"
    });
  }

  function hideGame() {
    TweenMax.to(gameContainer, 0.5, {
      opacity: 0,
      pointerEvents: "none",
      onComplete: () => {
        gameContainer.style.display = "none";
      }
    });
  }

  function startGame() {
    gameScore = 0;
    gameTime = 15;
    scoreSpan.innerText = gameScore;
    timerSpan.innerText = gameTime;

    gameTitle.style.display = "none";
    gameInstruction.style.display = "none";
    startGameBtn.style.display = "none";
    retryBtn.style.display = "none";
    gameStats.style.display = "flex";

    heartsArea.innerHTML = "";

    gameInterval = setInterval(gameLoop, 1000);
    spawnInterval = setInterval(spawnHeart, 600);
  }

  function gameLoop() {
    gameTime--;
    timerSpan.innerText = gameTime;

    if (gameTime <= 0) {
      endGame(false);
    }
  }

  function spawnHeart() {
    const heart = document.createElement("div");
    heart.classList.add("game-heart");

    // Random position
    const x = Math.random() * (window.innerWidth - 60);
    const y = Math.random() * (window.innerHeight - 60);

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    heart.addEventListener("click", () => collectHeart(heart));

    heartsArea.appendChild(heart);

    // Remove heart after 2 seconds to make it harder
    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, 2000);
  }

  function collectHeart(heart) {
    if (heart.parentNode) {
      heart.remove();
      gameScore++;
      scoreSpan.innerText = gameScore;

      if (gameScore >= targetScore) {
        endGame(true);
      }
    }
  }

  function endGame(win) {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    heartsArea.innerHTML = "";

    if (win) {
      gameTitle.innerText = "Ти виграла!";
      gameInstruction.innerText = "Пишаюся тобою! Я завжди знав, що ти з усім впораєшся! Нехай перемоги супроводжують тебе і надалі!";
      gameTitle.style.display = "block";
      gameInstruction.style.display = "block";
      gameStats.style.display = "none";

      setTimeout(() => {
        hideGame();
        // Show proper question container
        TweenMax.to(questionContainer, 0.5, {
          opacity: 1,
          pointerEvents: "all",
        });
      }, 6000);
    } else {
      gameTitle.innerText = "Час вийшов!";
      gameInstruction.innerText = "Спробуй ще раз, я в тебе вірю!";
      gameTitle.style.display = "block";
      gameInstruction.style.display = "block";
      retryBtn.style.display = "inline-block";
      gameStats.style.display = "none";
    }
  }

  startGameBtn.addEventListener("click", startGame);
  retryBtn.addEventListener("click", startGame);

};

// Run animation
animationTimeline();
