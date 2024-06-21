(function () {
  // Database URLs
  const databaseUrl =
    "https://rock-paper-scissors-game-998ae-default-rtdb.europe-west1.firebasedatabase.app/winners.json";
  const dbUrl =
    "https://rock-paper-scissors-game-998ae-default-rtdb.europe-west1.firebasedatabase.app";

  const inputName = document.querySelector("#inputName");
  const username = document.querySelector("#username");
  const submitNameButton = document.querySelector("#save");
  const rockButton = document.querySelector("#ROCK");
  const paperButton = document.querySelector("#PAPER");
  const scissorsButton = document.querySelector("#SCISSORS");
  const randomResult = document.querySelector("#random");
  const usersChoiceResult = document.querySelector("#user-choice");
  const message = document.querySelector("#message");
  const userScores = document.querySelector("#user-scores");
  const compScores = document.querySelector("#comp-scores");
  const resetGameButton = document.querySelector("#reset-game");
  const resetNameButton = document.querySelector("#reset-name");
  const playerList = document.querySelector("#player-list");
  const buttons = document.querySelectorAll(".choice");
  const image = document.querySelector("img"); // Assuming there's an img tag in the HTML
  let playerName = "User";
  let compScoresCounter = 0;
  let customId = -1;
  let sortedPlayers;

  // Function for counting and resetting user's scores
  const countScores = () => {
    let counter = 0;
    const countUp = () => {
      counter++;
    };
    const reset = () => {
      counter = 0;
    };
    const getCount = () => {
      return counter;
    };
    return {
      countUp: countUp,
      reset: reset,
      getCount: getCount,
    };
  };
  const userScoresCounter = countScores();

  // Function for getting players from the database
  const getTopPlayers = () => {
    fetch(databaseUrl)
      .then((resp) => resp.json())
      .then((data) => {
        customId = data.length - 1;
        displayTopPlayers(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  getTopPlayers();

  // Function for displaying top 5 players on the list in DOM
  const displayTopPlayers = (players) => {
    // Sort players according to scores - from highest to lowest
    sortedPlayers = players.sort((player1, player2) => {
      return Number.parseInt(player2.scores) - Number.parseInt(player1.scores);
    });
    console.log("All players: ", players);
    playerList.innerHTML = "";

    // Show only 5 players with top 5 highscores
    for (let i = 0; i < 5 && i < players.length; i++) {
      let pName = players[i].name;
      let pScores = players[i].scores;
      let playerEl = document.createElement("li");
      playerEl.innerText = `${pName}: Scores: ${pScores}`;
      playerList.appendChild(playerEl);
    }
  };

  // Function for saving username
  const saveName = () => {
    playerName = inputName.value.trim();
    if (playerName === "") {
      alert("You have to enter your name!");
    } else {
      username.innerText = playerName;
      inputName.value = "";
      submitNameButton.setAttribute("disabled", "");
    }
  };

  // Function for setting user's choice (ROCK, PAPER, SCISSORS)
  const setUserChoice = (usersChoice) => {
    submitNameButton.setAttribute("disabled", "");
    resetNameButton.setAttribute("disabled", "");
    usersChoiceResult.innerText = usersChoice;
    setCompChoice(usersChoice);
  };

  // Function for setting computer's choice (random)
  const setCompChoice = (uChoice) => {
    let randomNum = Math.floor(Math.random() * 3) + 1;
    checkNumberAndSetText(randomNum);
    compareResults(randomNum, uChoice);
  };

  // Function for checking random result and setting it in DOM
  const checkNumberAndSetText = (number) => {
    if (number === 1) {
      randomResult.innerText = "ROCK";
    } else if (number === 2) {
      randomResult.innerText = "PAPER";
    } else {
      randomResult.innerText = "SCISSORS";
    }
  };

  // Function for comparing user's and computer's result
  const compareResults = (number, choice) => {
    if (
      (number === 1 && choice === "ROCK") ||
      (number === 2 && choice === "PAPER") ||
      (number === 3 && choice === "SCISSORS")
    ) {
      message.innerText = "It's a tie!";
    } else if (
      (number === 1 && choice === "PAPER") ||
      (number === 2 && choice === "SCISSORS") ||
      (number === 3 && choice === "ROCK")
    ) {
      message.innerText = `${playerName} wins!`;
      userScoresCounter.countUp();
      userScores.innerText = `Scores: ${userScoresCounter.getCount()}`;
    } else if (
      (number === 1 && choice === "SCISSORS") ||
      (number === 2 && choice === "ROCK") ||
      (number === 3 && choice === "PAPER")
    ) {
      message.innerText = "Computer wins! Game over!";
      compScoresCounter++;
      compScores.innerText = `Scores: ${compScoresCounter}`;
      gameOver();
    }
  };

  const gameOver = () => {
    let addedToList = false;
    for (let i = 0; i < 5; i++) {
      if (userScoresCounter.getCount() > sortedPlayers[i].scores) {
        if (!addedToList) {
          image.src = "img/celebration.gif";
          let player = document.createElement("li");
          player.innerText = `${playerName}: Scores: ${userScoresCounter.getCount()}`;
          playerList.appendChild(player);
          addPlayerToDatabase();
          addedToList = true;
        }
      }
    }
    resetNameButton.removeAttribute("disabled");
    disableChoiceButtons();
  };

  const addPlayerToDatabase = () => {
    customId++;
    let newPlayer = {
      name: playerName,
      scores: userScoresCounter.getCount(),
      customId: customId,
    };

    const headerObject = {
      "Content-type": "application/json; charset=UTF-8",
    };

    const init = {
      method: "PUT",
      body: JSON.stringify(newPlayer),
      headers: headerObject,
    };

    fetch(`${dbUrl}/winners/${customId}.json`, init)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        getTopPlayers();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const disableChoiceButtons = () => {
    rockButton.setAttribute("disabled", "");
    paperButton.setAttribute("disabled", "");
    scissorsButton.setAttribute("disabled", "");
  };

  const resetName = () => {
    submitNameButton.removeAttribute("disabled");
    username.innerText = "User";
    playerName = "User";
    inputName.value = "";
  };

  const resetGame = () => {
    if (image) {
      image.src = "img/rps.gif";
    }
    message.innerText = "Let's play!";
    usersChoiceResult.innerText = "";
    randomResult.innerText = "";
    userScoresCounter.reset();
    compScoresCounter = 0;
    userScores.innerText = "Scores: 0";
    compScores.innerText = "Scores: 0";
    rockButton.removeAttribute("disabled");
    paperButton.removeAttribute("disabled");
    scissorsButton.removeAttribute("disabled");
    submitNameButton.removeAttribute("disabled");
    resetNameButton.removeAttribute("disabled");
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      setUserChoice(event.target.id);
    });
  });

  submitNameButton.addEventListener("click", saveName);

  resetNameButton.addEventListener("click", resetName);

  resetGameButton.addEventListener("click", resetGame);
})();
