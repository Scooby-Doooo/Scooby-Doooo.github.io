// --- CONFIGURATION ---
const RESOURCES = {
    debris: { id: 'debris', name: 'Debris', icon: '🧱', weight: 1, type: 'basic' },
    asteroid: { id: 'asteroid', name: 'Asteroid', icon: '☄️', weight: 6, type: 'basic' },
    moon: { id: 'moon', name: 'Moon', icon: '🌑', weight: 12, type: 'basic' },
    planet: { id: 'planet', name: 'Planet', icon: '🌍', weight: 36, type: 'basic' },
    star: { id: 'star', name: 'Star', icon: '☀️', weight: 72, type: 'win' },
    shieldDrone: { id: 'shieldDrone', name: 'Shield Drone', icon: '🛰️', weight: 6, type: 'protection' },
    defenseHub: { id: 'defenseHub', name: 'Defense Hub', icon: '🛡️', weight: 36, type: 'protection' }
};

const PREDATORS = {
    flare: { id: 'flare', name: 'Solar Flare', icon: '🔥', target: 'debris', blocker: 'shieldDrone' },
    blackHole: { id: 'blackHole', name: 'Black Hole', icon: '🕳️', target: 'all', blocker: 'defenseHub' }
};

// Rules of exchange
const RECIPES = [
    { from: 'debris', amount: 6, to: 'asteroid', result: 1 },
    { from: 'asteroid', amount: 2, to: 'moon', result: 1 },
    { from: 'moon', amount: 3, to: 'planet', result: 1 },
    { from: 'planet', amount: 2, to: 'star', result: 1 },
    { from: 'asteroid', amount: 1, to: 'shieldDrone', result: 1 },
    { from: 'planet', amount: 1, to: 'defenseHub', result: 1 }
];

// --- CLASSES ---

class CentralBank {
    constructor(playerCount) {
        this.limits = {
            debris: playerCount * 12,
            asteroid: playerCount * 6,
            moon: playerCount * 4,
            planet: Math.floor(playerCount * 2.5),
            star: Math.floor(playerCount * 1.2),
            shieldDrone: playerCount,
            defenseHub: Math.max(1, Math.floor(playerCount * 0.5))
        this.vault = { ...this.limits };
    }

    canAfford(type, amount) {
        return this.vault[type] >= amount;
    }

    take(type, amount) {
        if (this.vault[type] >= amount) {
            this.vault[type] -= amount;
            return amount;
        }
        const available = this.vault[type];
        this.vault[type] = 0;
        return available; 
    }

    put(type, amount) {
        this.vault[type] += amount;

    }

    findTakeoverVictim(resourceType, players, buyerIdx) {
        const candidates = players.filter((p, idx) => idx !== buyerIdx && p.inventory[resourceType] > 0);
        if (candidates.length === 0) return null;

        candidates.sort((a, b) => b.getNetWorth() - a.getNetWorth());
        
        return candidates[0];
    }
}

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.inventory = {
            debris: 1, 
            asteroid: 0, moon: 0, planet: 0, star: 0,
            shieldDrone: 0, defenseHub: 0
        };
    }

    getNetWorth() {
        let total = 0;
        for (let key in this.inventory) {
            total += this.inventory[key] * RESOURCES[key].weight;
        }
        return total;
    }

    checkWin() {
        return this.inventory.star > 0;
    }
}

class StellarEngine {
    constructor(playerNames) {
        this.players = playerNames.map((name, i) => new Player(i, name));
        this.bank = new CentralBank(this.players.length);
        this.turn = 0;
        
        this.dice1 = ['debris','debris','debris','debris','debris','debris', 'asteroid','asteroid','asteroid', 'moon','planet', 'flare'];
        this.dice2 = ['debris','debris','debris','debris','debris','debris', 'asteroid','asteroid', 'moon','moon', 'star', 'blackHole'];
    }

    getCurrentPlayer() {
        return this.players[this.turn % this.players.length];
    }

    nextTurn() {
        this.turn++;
        return this.getCurrentPlayer();
    }

    rollDie(faces) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return faces[array[0] % 12];
    }

    executeRoll() {
        const player = this.getCurrentPlayer();
        const r1 = this.rollDie(this.dice1);
        const r2 = this.rollDie(this.dice2);
        const logs = [];

        let flareActive = (r1 === 'flare' || r2 === 'flare'); 
        let holeActive = (r2 === 'blackHole'); 

        if (flareActive) {
            if (player.inventory.shieldDrone > 0) {
                player.inventory.shieldDrone--;
                this.bank.put('shieldDrone', 1);
                logs.push(`⚠️ Solar Flare! Shield Drone sacrificed.`);
            } else if (player.inventory.debris > 0) {
                const lost = player.inventory.debris;
                player.inventory.debris = 0;
                this.bank.put('debris', lost);
                logs.push(`🔥 Solar Flare burned ${lost} Debris.`);
            }
        }

        if (holeActive) {
            if (player.inventory.defenseHub > 0) {
                player.inventory.defenseHub--;
                this.bank.put('defenseHub', 1);
                logs.push(`⚠️ Black Hole! Defense Hub collapsed.`);
            } else {
                const typesToLose = ['asteroid', 'moon', 'planet'];
                typesToLose.forEach(type => {
                    if (player.inventory[type] > 0) {
                        this.bank.put(type, player.inventory[type]);
                        player.inventory[type] = 0;
                    }
                });
                logs.push(`🕳️ Black Hole swallowed sector assets!`);
            }
        }
        const processGrowth = (type) => {
            if (RESOURCES[type]) { 
                const current = player.inventory[type];
                const onDice = (r1 === type ? 1 : 0) + (r2 === type ? 1 : 0);

                if (onDice > 0) {
                   const growth = Math.floor((current + onDice) / 2);
                   if (growth > 0) {
                       const actualGain = this.bank.take(type, growth);
                       player.inventory[type] += actualGain;
                       if (actualGain < growth) logs.push(`Bank limit reached for ${type}!`);
                       if (actualGain > 0) logs.push(`Synthesized ${actualGain} ${type}.`);
                   }
                }
            }
        };

        const rolledTypes = [...new Set([r1, r2])];
        rolledTypes.forEach(t => processGrowth(t));

        return { r1, r2, logs };
    }
}

// --- UI CONTROLLER ---
class UIController {
    constructor() {
        this.selectedPlayerCount = 2;
        this.pendingTrade = { type: null, amount: 0, costType: null, costAmount: 0, isTakeover: false };
    }

    setPlayerCount(n) {
        this.selectedPlayerCount = n;
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.generateNameInputs();
    }

    generateNameInputs() {
        const container = document.getElementById('names-container');
        container.innerHTML = '';
        for (let i = 1; i <= this.selectedPlayerCount; i++) {
            const savedName = localStorage.getItem(`p${i}`) || `Corp ${i}`;
            container.innerHTML += `<input type="text" id="p${i}-input" class="player-input" value="${savedName}" placeholder="Name ${i}">`;
        }
    }

    startGame() {
        const names = [];
        for (let i = 1; i <= this.selectedPlayerCount; i++) {
            const val = document.getElementById(`p${i}-input`).value;
            localStorage.setItem(`p${i}`, val);
            names.push(val);
        }
        window.game = new StellarEngine(names);
        
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.updateUI();
        this.log("Engine Started. Market Stabilized.");
    }

    log(msg) {
        const box = document.getElementById('game-log');
        const line = document.createElement('div');
        line.className = 'log-entry';
        line.innerText = `> ${msg}`;
        box.insertBefore(line, box.firstChild);
    }

    updateUI() {
        const player = game.getCurrentPlayer();
        document.getElementById('player-name-display').innerText = player.name;
        
        // Render Inventory
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        Object.values(RESOURCES).forEach(res => {
            const count = player.inventory[res.id];
            const div = document.createElement('div');
            div.className = `inv-card ${count > 0 ? 'active-prod' : ''}`;
            div.innerHTML = `
                <span class="inv-icon">${res.icon}</span>
                <span class="inv-count">${count}</span>
                <span class="inv-name">${res.name}</span>
            `;
            grid.appendChild(div);
        });

        // Check Win
        if (player.checkWin()) {
            setTimeout(() => alert(`${player.name} has ignited the STAR! VICTORY!`), 100);
        }
    }

    toggleBankInfo() {
        const modal = document.getElementById('bank-modal');
        if (modal.classList.contains('hidden')) {
            const list = document.getElementById('bank-reserves-list');
            list.innerHTML = '';
            Object.keys(game.bank.vault).forEach(key => {
                list.innerHTML += `<div class="trade-row"><span>${RESOURCES[key].icon} ${RESOURCES[key].name}</span> <b>${game.bank.vault[key]}</b></div>`;
            });
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    // --- GAME ACTIONS ---

    openTradeTerminal() {
        document.getElementById('trade-modal').classList.remove('hidden');
        this.renderTradeList();
        this.pendingTrade = null;
        document.getElementById('trade-preview').innerText = "Оберіть операцію...";
        document.getElementById('confirm-trade-btn').disabled = true;
    }

    closeTradeTerminal() {
        document.getElementById('trade-modal').classList.add('hidden');
    }

    renderTradeList() {
        const list = document.getElementById('trade-list');
        list.innerHTML = '';
        const player = game.getCurrentPlayer();
        const tradeables = ['asteroid', 'moon', 'planet', 'star', 'shieldDrone', 'defenseHub'];
        
        tradeables.forEach(type => {
            const res = RESOURCES[type];
            const recipe = RECIPES.find(r => r.to === type);
            if (!recipe) return;

            const fromRes = RESOURCES[recipe.from];
            
            const div = document.createElement('div');
            div.className = 'trade-row';
            div.innerHTML = `
                <button class="trade-ctrl" onclick="ui.setTrade('${type}', -1)">-</button>
                <div class="trade-info">
                    ${res.icon} ${res.name}
                </div>
                <button class="trade-ctrl" onclick="ui.setTrade('${type}', 1)">+</button>
            `;
            list.appendChild(div);
        });
    }

    setTrade(targetType, direction) {
        if (this.pendingTrade && this.pendingTrade.type !== targetType) {
            this.pendingTrade = null;
        }

        const player = game.getCurrentPlayer();
        const recipe = RECIPES.find(r => r.to === targetType);

        if (direction > 0) {

            const inBank = game.bank.vault[targetType];
            let cost = recipe.amount;
            let isTakeover = false;

            if (inBank <= 0) {
                // HOSTILE TAKEOVER MODE
                cost = cost * 2;
                isTakeover = true;
                const victim = game.bank.findTakeoverVictim(targetType, game.players, game.players.indexOf(player));
                if (!victim) {
                    document.getElementById('trade-preview').innerText = "Банк пустий і ні в кого немає ресурсу!";
                    return;
                }
            }

            if (player.inventory[recipe.from] < cost) {
                document.getElementById('trade-preview').innerText = `Недостатньо ${RESOURCES[recipe.from].name} (${cost})`;
                return;
            }

            this.pendingTrade = { 
                type: targetType, 
                amount: 1, 
                costType: recipe.from, 
                costAmount: cost, 
                isTakeover: isTakeover 
            };
            
            const actionText = isTakeover ? "☠️ HOSTILE TAKEOVER" : "BUY";
            document.getElementById('trade-preview').innerText = 
                `${actionText}: 1 ${RESOURCES[targetType].name} за ${cost} ${RESOURCES[recipe.from].name}`;
            
            const btn = document.getElementById('confirm-trade-btn');
            btn.disabled = false;
            if (isTakeover) btn.classList.add('hostile');
            else btn.classList.remove('hostile');

        } 
        else {
            if (player.inventory[targetType] < 1) return;

            const gainAmount = recipe.amount; 
            
            this.pendingTrade = {
                type: targetType,
                amount: -1,
                costType: recipe.from,
                costAmount: gainAmount,
                isTakeover: false
            };

            document.getElementById('trade-preview').innerText = 
                `SELL: 1 ${RESOURCES[targetType].name} за ${gainAmount} ${RESOURCES[recipe.from].name}`;
            document.getElementById('confirm-trade-btn').disabled = false;
            document.getElementById('confirm-trade-btn').classList.remove('hostile');
        }
    }
}


StellarEngine.prototype.rollDice = function() {

    const diceDiv = document.getElementById('dice-result');
    diceDiv.innerHTML = '<div class="die">🎲</div><div class="die">🎲</div>';
    
    setTimeout(() => {
        const result = this.executeRoll();
        const icon1 = RESOURCES[result.r1]?.icon || PREDATORS[result.r1]?.icon;
        const icon2 = RESOURCES[result.r2]?.icon || PREDATORS[result.r2]?.icon;
        
        diceDiv.innerHTML = `<div class="die">${icon1}</div><div class="die">${icon2}</div>`;
        
        result.logs.forEach(l => ui.log(l));
        ui.updateUI();
        

        setTimeout(() => {
            this.nextTurn();
            ui.updateUI();
            ui.log(`Turn: ${this.getCurrentPlayer().name}`);
        }, 2000);
    }, 500);
};

StellarEngine.prototype.executeTrade = function() {
    const trade = ui.pendingTrade;
    const player = this.getCurrentPlayer();

    if (!trade) return;

    if (trade.amount > 0) {

        player.inventory[trade.costType] -= trade.costAmount;
        this.bank.put(trade.costType, trade.costAmount); 

        if (trade.isTakeover) {
            const victim = this.bank.findTakeoverVictim(trade.type, this.players, this.players.indexOf(player));
            victim.inventory[trade.type]--;
            player.inventory[trade.type]++;
            

            const compensation = trade.costAmount / 2;
            this.bank.take(trade.costType, compensation); 
            victim.inventory[trade.costType] += compensation;
            
            ui.log(`☠️ TAKEOVER! ${player.name} seized ${trade.type} from ${victim.name}!`);
        } else {
            const gained = this.bank.take(trade.type, 1);
            player.inventory[trade.type] += gained;
            ui.log(`Trade: Bought 1 ${trade.type}`);
        }
    } else {

        player.inventory[trade.type] -= 1;
        this.bank.put(trade.type, 1);
        
        const gained = this.bank.take(trade.costType, trade.costAmount);
        player.inventory[trade.costType] += gained;
        ui.log(`Trade: Sold 1 ${trade.type}`);
    }

    ui.closeTradeTerminal();
    ui.updateUI();
    this.nextTurn();
    ui.log(`Turn: ${this.getCurrentPlayer().name}`);
};

// Start UI
const ui = new UIController();
ui.generateNameInputs();
