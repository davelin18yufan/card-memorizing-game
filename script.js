const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃spade
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心heart
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊diamond
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花club
]
//MVC format
const view = {
  //To get the tail of cards
  getCardElement(index) {
    return `<div data-index=${index} class="card back"></div>`
  },
  //To get the heads of card
  getCardContent(index) {
    //get number from 1 to 13
    const number = this.transformNumber((index % 13) + 1);
    //get array index from 0 to 3, cause index might be 0~51
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>`
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("");
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number;
    }
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return
      }
      card.classList.add("back");
      card.innerHTML = null;
    })
  },
  pairedCards(...cards) {
    cards.map(card => {
      card.classList.add("paired");
    })
  },
  renderScore(scores) {
    document.querySelector(".score").textContent = `Score ${scores}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've Tried ${times} Times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong");
      card.addEventListener("animationend", event =>
        event.target.classList.remove("wrong"), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Completed!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`;
    const header = document.querySelector("#header");
    header.before(div);
  }
}
const utility = {
  getRandomNumberArray(count) {
    let number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]];
    }
    return number;
  },
}

const model = {
  revealCards: [],

  isRevealedCardMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13;
  },

  score: 0,

  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      //furst step
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      //second step
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealCards.push(card);
        if (model.isRevealedCardMatched()) {
          //Matched
          this.currentState = GAME_STATE.CardsMatched;
          view.renderScore(model.score += 10)
          view.pairedCards(...model.revealCards);
          model.revealCards = [];
          if (model.score === 260) {
            console.log("Game Finished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            //finish the function here
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //MatchedFailed
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealCards);
          setTimeout(this.resetCards, 1000)
        }
        break;
    }
    console.log(this.currentState, model.revealCards)
  },
  resetCards() {
    view.flipCards(...model.revealCards);
    model.revealCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
}



//main opration
controller.generateCards();
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    //using card instead event.target, cause we're targeting the whole card element
    controller.dispatchCardAction(card);
  })
})