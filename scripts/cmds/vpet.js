
const fs = require("fs");

class VirtualPet {
  constructor(name) {
    this.name = name;
    this.happiness = 50;
    this.hunger = 50;
    this.energy = 100;
    this.coins = 0;
    this.lastRestTime = null;
    this.foods = ["🍒", "🍎", "🍉", "🍑", "🍊", "🥭", "🍍", "🌶️", "🍋", "🍈", "🍏", "🍐", "🥝", "🍇", "🥥", "🍅", "🥕", "🍠", "🌽", "🥦", "🥒", "🥬", "🥑", "🍆", "🥔", "🌰", "🥜", "🍞", "🥐", "🥖", "🥯", "🥞", "🍳", "🥚", "🧀", "🥓", "🥩", "🍗", "🍖", "🍔", "🌭", "🥪", "🥨", "🍟", "🍕", "🌮", "🌯", "🥙", "🥘", "🍝", "🥫", "🥣", "🥗", "🍲", "🍛", "🍜", "🦞", "🍣", "🍤", "🥡", "🍚", "🥟", "🥟", "🍢", "🍙", "🍘", "🍥", "🍡", "🥠", "🥮", "🍧", "🍨", "🍦", "🥧", "🍰", "🍮", "🎂", "🧁", "🍭", "🍫", "🍫", "🍩", "🍪", "🍯", "🧂", "🍿", "🥤", "🥛", "🍵", "☕", "🍹", "🍶"];
  }

  feed() {
    if (this.hunger >= 10) {
      const randomFood = this.foods[Math.floor(Math.random() * this.foods.length)];
      this.hunger -= 10;
      this.happiness += 5;
      this.energy += 2;
      this.coins -= 10;
      return `Your ${this.name} pet happy to eat this ${randomFood}.\nYour pet have ${this.eneergy} energy , ${this.happiness} happiness & ${this.hunger} hunger.\nYou earned $10 for feeding your ${this.name} pet.`;
    } else {
      return `${this.name} is already full!`;
    }
  }

  play() {
    if (this.energy >= 10) {
      this.happiness += 10;
      this.energy -= 5;
      this.coins += 5;
      return `Your ${this.name} pet happy to play with you.\nNow your pet have ${this.happiness} happiness & ${this.energy} energy.\nYou earned $5`;
    } else {
      return `Your ${this.name} pet is too tired to play right now.`;
    }
  }

  rest() {
    const currentTime = Date.now();
    if (!this.lastRestTime || (currentTime - this.lastRestTime) >= 7200000) {
      this.energy += 10;
      this.happiness += 5;
      this.lastRestTime = currentTime;
      return `Your ${this.name} pet get energy: ${this.energy} & happiness: ${this.happiness}`;
    } else {
      const remainingTime = Math.floor((7200000 - (currentTime - this.lastRestTime)) / 60000);
      return `Your ${this.name} pet taking rest. Your pet need ${remainingTime} minutes to fix your pet weakness.`;
    }
  }

  getStatus() {
    return `Your pet Status is here:\n Your pet name: ${this.name}.\nYour pet have ${this.energy} energy, ${this.happiness} & ${this.hunger} hunger.\nYou earned coins: ${this.coins}`;
  }
}

const petDataFile = "petData.json";
const userPets = loadPetData();

function loadPetData() {
  try {
    const data = fs.readFileSync(petDataFile);
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function savePetData() {
  fs.writeFileSync(petDataFile, JSON.stringify(userPets, null, 2));
}

module.exports = {
  config: {
    name: 'vpet',
    version: '1.0',
    author: 'UPoL The MiMis MoMo ☺️🌸',
 //credit: 'Luffy',
    countDown: 5,
    role: 0,
    shortDescription: 'Pet game',
    longDescription: {
      en: 'The game of pet game'
    },
    category: 'game',
    guide: {
      en: '{pn} [action] [pet_name]'}
  },
  onStart: async function ({ api, event, args, usersData }) {
    const action = args[0];
    const petName = args[1];

    if (!action) {
      return api.sendMessage("Pet Ations:\n1.{pn}vpet Create\n2.{pn}vpet Feed\n3.{pn}vpet Play\n4.{pn}vpet Rest\n5.{pn}vpet Status\n6.{pn}vpet Balance\n7.{pn}vpet Reset", event.threadID, event.messageID);
    }

    if (action === "create") {
      if (userPets[event.senderID]) {
        return api.sendMessage(`You already have a pet named "${userPets[event.senderID].name}". You can't create another one.`, event.threadID, event.messageID);
      }

      if (!petName) {
        return api.sendMessage("Please specify a name for your pet when creating one.", event.threadID, event.messageID);
      }

      userPets[event.senderID] = new VirtualPet(petName);
      savePetData();
      return api.sendMessage(`You've created a pet named ${petName}.`, event.threadID, event.messageID);
    }

    if (!userPets[event.senderID]) {
      return api.sendMessage("You need to create a pet first. Use {pn}vpet create [name].", event.threadID, event.messageID);
    }

    const pet = userPets[event.senderID];
    let result = "";

    switch (action) {
      case "create":
        result = `You've created a pet named ${pet.name}.`;
        break;
      case "feed":
        result = pet.feed();
        break;
      case "play":
        result = pet.play();
        break;
      case "rest":
        result = pet.rest();
        break;
      case "status":
        result = pet.getStatus();
        break;
      case "balance":
        result = `Your ${pet.name} pet's balance: ${pet.coins}`;
        break;
      case "reset":
        if (!petName) {
          return api.sendMessage("Please specify the pet's name to reset.", event.threadID, event.messageID);
        }
        if (pet.name !== petName) {
          return api.sendMessage(`You can only reset your own pet. Your pet is named "${pet.name}".`, event.threadID, event.messageID);
        }
        delete userPets[event.senderID];
        savePetData();
        return api.sendMessage(`Pet "${petName}" has been reset. Use !Pet create [name] to create a new pet.`, event.threadID, event.messageID);
      default:
        result = "Pet Ations:\n{pn}vpet Create {pn}vpet Feed  {pn}vpet Play  {pn}vpet Rest  {pn}vpet Status  {pn}vpet Balance  {pn}vpet Reset";
    }

    savePetData();
    return api.sendMessage(result, event.threadID, event.messageID);
  }
};
