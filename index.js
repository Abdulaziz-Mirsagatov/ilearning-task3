const crypto = require("crypto");
const readlineSync = require("readline-sync");
const { Table } = require("console-table-printer");

class RandomKey {
  generateRandomKey(bits) {
    const bytes = bits / 8;
    const buffer = new Uint8Array(bytes);

    // Generate random values and fill the buffer
    crypto.getRandomValues(buffer);

    // Convert the buffer to a hex string
    const hexKey = Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");

    return hexKey;
  }
}

class HMAC {
  generateHMAC(move, secretKey) {
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(move)
      .digest("hex");

    return hmac;
  }
}

class Winner {
  // Returns 0 if it's a tie, -1 if the user wins, and 1 if the computer wins
  determineWinner(userMove, computerMove, moves) {
    const userIndex = moves.indexOf(userMove);
    const computerIndex = moves.indexOf(computerMove);
    const numMoves = moves.length;
    const half = Math.floor(numMoves / 2);

    return Math.sign(
      ((userIndex - computerIndex + half + numMoves) % numMoves) - half
    );
  }
}

class Rules {
  printRules(moves) {
    const p = new Table();
    const winner = new Winner();
    const combinations = {
      0: "Draw",
      1: "Lose",
      "-1": "Win",
    };
    moves.forEach((move) => {
      const row = {
        "v PC/User >": move,
      };

      moves.forEach((m) => {
        row[m] = combinations[winner.determineWinner(move, m, moves)];
      });

      p.addRow(row);
    });

    p.printTable();
  }
}

class Computer {
  move(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

const moves = process.argv.slice(2);
const numMoves = moves.length;

if (numMoves < 3) {
  console.log("Not enough moves. Please enter at least 3 moves.");
} else if (numMoves % 2 === 0) {
  console.log("Invalid number of moves. Please enter an odd number of moves.");
} else if (Array.from(new Set(moves)).length !== numMoves) {
  console.log("Duplicate moves. Please enter unique moves.");
} else {
  while (true) {
    const computer = new Computer();
    const randomKeyGenerator = new RandomKey();
    const hmacGenerator = new HMAC();
    const winner = new Winner();
    const rules = new Rules();

    const randomMove = computer.move(moves);
    const key = randomKeyGenerator.generateRandomKey(256);
    const hmac = hmacGenerator.generateHMAC(key, randomMove);

    console.log(`HMAC: ${hmac}`);
    console.log("Available moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - Exit");
    console.log("? - Help");

    const input = readlineSync.question("Enter your move: ");

    if (input === "?") {
      rules.printRules(moves);
      continue;
    }
    const move = parseInt(input);
    if (Number.isNaN(move)) {
      console.log("Invalid input. Please try again.\n");
      continue;
    }
    if (move === 0) return;
    else if (move < 1 || move > numMoves) {
      console.log("Invalid move. Please try again.");
    } else {
      const m = moves[move - 1];
      const res = winner.determineWinner(m, randomMove, moves);
      const msg =
        res === 0 ? "It's a tie!" : res === 1 ? "You win!" : "You lose!";
      console.log(`Your move: ${m}`);
      console.log(`Computer's move: ${randomMove}`);
      console.log(msg);
      console.log(`HMAC key: ${key}]\n`);
    }
  }
}
