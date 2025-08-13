// Ensure appendToLog is available globally
// Debugging overlay removed. No-op if appendToLog is called.
if (typeof appendToLog !== 'function') {
    window.appendToLog = function(msg) {};
}

class CharacterStats {
    constructor() {
        // If currentStats exists, render stat block
        if (window.characterStats && window.characterStats.currentStats) { /* ...existing code... */ }
            // Initialize base stats for level 60 Paladin
            this.currentStats = {
                block: 5,
                parry: 5,
                maces: 300,
                swords: 300,
                polearms: 300,
                axes: 300,
                twohandedmaces: 300,
                twohandedswords: 300,
                defense: 300
            };
            // If race is selected, aggregate race stats
            if (window.gearData && window.gearData.race && window.gearData.race.name) {
                const raceObj = window.gearData.race;
                if (raceObj) {
                    Object.keys(raceObj).forEach(statKey => {
                        if (statKey !== 'name' && statKey !== 'equipped' && typeof raceObj[statKey] === 'number') {
                            this.currentStats[statKey] = (this.currentStats[statKey] || 0) + raceObj[statKey];
                        }
                    });
                }
            }
            // Aggregate equipped gear stats
            if (window.gearData) {
                Object.values(window.gearData).forEach(item => {
                    if (item && item.equipped) {
                        Object.keys(item).forEach(statKey => {
                            if (statKey !== 'name' && statKey !== 'equipped' && typeof item[statKey] === 'number') {
                                this.currentStats[statKey] = (this.currentStats[statKey] || 0) + item[statKey];
                            }
                        });
                    }
                });
            }
            // Calculate derived stats
            this.currentStats.health = (this.currentStats.stamina || 0) * 10;
            this.currentStats.mana = (this.currentStats.intellect || 0) * 15;
            this.currentStats.attackpower = (this.currentStats.strength || 0) * 2;
            this.currentStats.blockvalue = Math.floor((this.currentStats.strength || 0) / 20) + (this.currentStats.blockvalue ? this.currentStats.blockvalue : 0);
        }


    async initialize() {
        try {
            await this.loadItemDatabase();
            await this.loadTalentBonuses();
            this.updateAllStats();
        } catch (e) {
            // handle error if needed
        }
    }

    findItemByName(itemName) {
        if (!this.itemDatabase || !itemName) {
            return null;
        }
        const targetName = itemName.trim().toLowerCase();
        for (const category of this.itemDatabase) {
            if (category.items) {
                for (const item of category.items) {
                    if (item.name && item.name.trim().toLowerCase() === targetName) {
                        return item;
                    }
                }
            }
        }
        return null;
    }

    scanEquippedItems() {
        this.equippedItems = {};
        if (window.gearData) {
            Object.keys(window.gearData).forEach(slot => {
                const itemObj = window.gearData[slot];
                if (itemObj && itemObj.equipped && itemObj.name) {
                    // Try to find item in database, but always aggregate stats from itemObj
                    let itemStats = {};
                    const dbItem = this.findItemByName(itemObj.name);
                    if (dbItem) {
                        itemStats = dbItem;
                        this.equippedItems[slot] = dbItem;
                    } else {
                        // If not found, use itemObj directly
                        itemStats = itemObj;
                        this.equippedItems[slot] = itemObj;
                    }
                }
            });
        } else {
            // ...existing code...
        }
        // Aggregate item stats into currentStats, starting from base stats
        const baseStats = {
            block: 5,
            parry: 5,
            maces: 300,
            swords: 300,
            polearms: 300,
            axes: 300,
            twohandedmaces: 300,
            twohandedswords: 300,
            defense: 300,
        };
        this.currentStats = { ...baseStats };
        Object.values(this.equippedItems).forEach(item => {
            if (item && typeof item === 'object') {
                Object.keys(item).forEach(statKey => {
                    if (statKey !== 'name' && statKey !== 'equipped' && typeof item[statKey] === 'number') {
                        // Only add item stat if statKey is not already in baseStats, or always add and let baseStats be the true base
                        if (typeof baseStats[statKey] === 'undefined') {
                            this.currentStats[statKey] = (this.currentStats[statKey] || 0) + item[statKey];
                        } else {
                            this.currentStats[statKey] += item[statKey];
                        }
                    }
                });
            }
        });
    }

    addItemStats(item) {
        if (!item || typeof item !== 'object') {
            return;
        }
        for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'number') {
                if (!this.currentStats[key]) this.currentStats[key] = 0;
                this.currentStats[key] += value;
            }
        }
    }

    calculateMeleeCritStat() {
        const agility = this.currentStats.agility || 0;
        const meleeCritFromAgility = (agility * 0.0614) / (1 + agility / 1406.1);
        const meleeCritFromTalents = this.talentBonuses && this.talentBonuses.meleeCrit ? this.talentBonuses.meleeCrit : 0;
        this.currentStats.meleeCrit = meleeCritFromAgility + meleeCritFromTalents;
    }

    calculateAvoidanceStats() {
    // No-op: Avoidance stats are now calculated only in updateAllStats to prevent double-counting.
    }

    calculateMP5Stat() {
        // MP5 calculation not implemented yet. Stub to prevent errors.
    }

    calculateSpellCritStat() {
        const intellect = this.currentStats.intellect || 0;
        let spellCritFromIntellect = (typeof window.calculateSpellCritFromIntellect === 'function')
            ? window.calculateSpellCritFromIntellect(intellect)
            : intellect * 0.04;
        let spellCritFromTalents = this.talentBonuses && this.talentBonuses.spellCrit ? this.talentBonuses.spellCrit : 0;
        this.currentStats.spellCrit = spellCritFromIntellect + spellCritFromTalents;
    }

    // Call this after stats are updated
    updateAllStats() {
        this.scanEquippedItems();
        // Always start with base stats
        const baseStats = {
            block: 5,
            parry: 5,
            defense: 300,
            maces: 300,
            swords: 300,
            polearms: 300,
            axes: 300,
            twohandedmaces: 300,
            twohandedswords: 300,
            daggers: 300,
            bows: 300,
            crossbows: 300,
            guns: 300,
            thrown: 300,
            fistweapons: 300,
            staves: 300,
            wands: 300,
            unarmed: 300,
            arcane: 0,
            fire: 0,
            frost: 0,
            nature: 0,
            shadow: 0,
            thorns: 0,
            spellstrike: 0
        };
        // Aggregate equipped item stats for resistances, thorns, spellstrike, and all other stats
        this.currentStats = { ...baseStats };
        Object.values(this.equippedItems).forEach(item => {
            if (item && typeof item === 'object') {
                Object.keys(item).forEach(statKey => {
                    if (typeof item[statKey] === 'number') {
                        if (typeof this.currentStats[statKey] === 'undefined') {
                            this.currentStats[statKey] = item[statKey];
                        } else {
                            this.currentStats[statKey] += item[statKey];
                        }
                    }
                });
            }
        });

        // Derived stats
        this.currentStats.health = (this.currentStats.stamina || 0) * 10;
        this.currentStats.mana = (this.currentStats.intellect || 0) * 15;
        this.currentStats.attackpower = (this.currentStats.strength || 0) * 2;
        this.currentStats.blockvalue = Math.floor((this.currentStats.strength || 0) / 20) + (this.currentStats.blockvalue ? this.currentStats.blockvalue : 0);

        // Avoidance stats: aggregate only once
        // Dodge
        const agility = this.currentStats.agility || 0;
    const defense = this.currentStats.defense || 0;
        const dodgeFromAgility = typeof window.calculateDodgeFromAgilityDirect === 'function'
            ? window.calculateDodgeFromAgilityDirect(agility)
            : (agility * 0.0607) / (1 + agility / 1406.1);
        const defenseAboveBase = Math.max(0, defense - 300);
        const dodgeFromDefense = defenseAboveBase * 0.04;
        const dodgeFromTalents = this.talentBonuses && this.talentBonuses.dodge ? this.talentBonuses.dodge : 0;
        // Only add item dodge, not base again
        const dodgeFromItems = Object.values(this.equippedItems).reduce((sum, item) => sum + (item.dodge || 0), 0);
    this.currentStats.dodge = dodgeFromAgility + dodgeFromDefense + dodgeFromTalents + dodgeFromItems;

        // Parry
        const parryFromTalents = this.talentBonuses && this.talentBonuses.parry ? this.talentBonuses.parry : 0;
        const parryFromItems = Object.values(this.equippedItems).reduce((sum, item) => sum + (item.parry || 0), 0);
    this.currentStats.parry = parryFromTalents + parryFromItems;

        // Block
        const blockFromTalents = this.talentBonuses && this.talentBonuses.block ? this.talentBonuses.block : 0;
        const blockFromItems = Object.values(this.equippedItems).reduce((sum, item) => sum + (item.block || 0), 0);
    this.currentStats.block = blockFromTalents + blockFromItems;

        // Crit
        this.currentStats.meleecrit = ((this.currentStats.agility || 0) * 0.04) + (this.currentStats.meleecrit || 0);
        this.currentStats.spellcrit = ((this.currentStats.intellect || 0) * 0.04) + (this.currentStats.spellcrit || 0);

        this.calculateMeleeCritStat();
        this.calculateMP5Stat();
        this.calculateSpellCritStat();

        // Apply High Elf agility bonus AFTER all calculations
        if (window.gearData && window.gearData.race && window.gearData.race.name === 'High Elf') {
            if (typeof this.currentStats.agility === 'number') {
                this.currentStats.agility = Math.round(this.currentStats.agility * 1.02);
            }
        }
        
        // Do NOT call calculateAvoidanceStats again
        if (typeof window.renderStatBlock === 'function') {
            window.renderStatBlock(this.currentStats);
        }
    }

    calculateMeleeHitCap() {
        const baseHitCap = 8.0;
        const weaponSkill = this.getEquippedWeaponSkill();
        const weaponSkillAbove300 = Math.max(0, weaponSkill - 300);
        
        // Each point of weapon skill above 300 reduces hit cap by 0.2%
        // Max reduction is at 315 weapon skill (15 points above 300)
        const cappedWeaponSkillBonus = Math.min(weaponSkillAbove300, 15);
        const hitCapReduction = cappedWeaponSkillBonus * 0.2;
        
        // Calculate actual hit cap (minimum 5% at 315 weapon skill)
        const actualHitCap = Math.max(baseHitCap - hitCapReduction, 5.0);
        
        return {
            hitCap: actualHitCap,
            weaponSkill: weaponSkill,
            weaponType: this.getEquippedWeaponType(),
            hitCapReduction: hitCapReduction,
            weaponSkillAbove300: weaponSkillAbove300
        };
    }

    checkForCapWarnings() {
        const warnings = [];
        
        // Check melee hit cap (only if weapon is equipped)
        if (this.equippedItems.mainhand) {
            const hitCapInfo = this.calculateMeleeHitCap();
            const currentMeleeHit = this.currentStats.meleeHit || 0;
            
            if (currentMeleeHit > hitCapInfo.hitCap) {
                const wastedHit = currentMeleeHit - hitCapInfo.hitCap;
                const weaponName = this.equippedItems.mainhand.name || 'equipped weapon';
                const weaponSkillText = hitCapInfo.weaponSkillAbove300 > 0 
                    ? ` (${hitCapInfo.weaponSkill} ${hitCapInfo.weaponType} skill)` 
                    : '';
                    
                warnings.push(`Melee Hit: ${currentMeleeHit.toFixed(2)}% exceeds the ${hitCapInfo.hitCap.toFixed(2)}% cap for ${weaponName}${weaponSkillText} (${wastedHit.toFixed(2)}% wasted)`);
            }
        }
        
        // Check spell hit cap
        const currentSpellHit = this.currentStats.spellHit || 0;
        const spellHitCap = 16.0;
        if (currentSpellHit > spellHitCap) {
            const wastedSpellHit = currentSpellHit - spellHitCap;
            warnings.push(`Spell Hit: ${currentSpellHit.toFixed(2)}% exceeds the ${spellHitCap.toFixed(2)}% cap (${wastedSpellHit.toFixed(2)}% wasted)`);
        }
        
        // Check weapon skill caps (315 is the effective cap)
        const weaponSkillCap = 315;
        const weaponSkills = {
                'Axes': this.currentStats.axes,
                'Maces': this.currentStats.maces,
                'Polearms': this.currentStats.polearms,
                'Swords': this.currentStats.swords,
                'Two-Handed Maces': this.currentStats.twohandedmaces,
                'Two-Handed Swords': this.currentStats.twohandedswords
        };
        
        Object.entries(weaponSkills).forEach(([skillName, skillValue]) => {
            if (skillValue > weaponSkillCap) {
                const wastedSkill = skillValue - weaponSkillCap;
                warnings.push(`${skillName}: ${skillValue} exceeds the ${weaponSkillCap} cap (${wastedSkill} wasted)`);
            }
        });
        
        // Avoidance = dodge + parry + block (all as percentages)
        const dodge = Number(this.currentStats.dodge) || 0;
        const parry = Number(this.currentStats.parry) || 0;
        const block = Number(this.currentStats.block) || 0;
        const totalAvoidance = dodge + parry + block;
        if (totalAvoidance > 100) {
            warnings.push(`Warning: Your total avoidance (dodge + parry + block) is ${totalAvoidance.toFixed(2)}%. Any value above 100% is wasted.`);
        }

        this.latestCapWarnings = warnings;
        
        if (warnings.length > 0) {
            this.showStatCapWarning(warnings);
        }
    }

    getLatestCapWarnings() {
        return this.latestCapWarnings && this.latestCapWarnings.length > 0
            ? this.latestCapWarnings.slice()
            : [];
    }

    showStatCapWarning(warnings) {
        let popup = document.getElementById('stat-warning-popup');
        if (!popup) {
            popup = this.createStatWarningPopup();
        }
        
        const messageElement = document.getElementById('stat-warning-message');
        const confirmButton = document.getElementById('stat-warning-confirm');

        if (!popup || !messageElement) return;

        let message;
        if (warnings.length === 1) {
            message = warnings[0];
        } else {
            message = "Multiple stat caps exceeded:\n\n" + warnings.join('\n');
        }

        messageElement.innerHTML = message.replace(/\n/g, '<br>');
        popup.style.display = 'flex';
        
        const closePopup = () => {
            popup.style.display = 'none';
        };
        
        if (confirmButton) {
            confirmButton.onclick = closePopup;
        }
        
        popup.onclick = (e) => {
            if (e.target === popup) {
                closePopup();
            }
        };
        
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }

    createStatWarningPopup() {
        const existingPopup = document.getElementById('stat-warning-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupHTML = `
            <div id="stat-warning-popup" class="stat-warning-popup" style="display: none;">
                <div class="stat-warning-overlay"></div>
                <div class="stat-warning-content">
                    <div class="stat-warning-header">
                        <h3>Stat Cap Warning</h3>
                    </div>
                    <div class="stat-warning-body">
                        <p id="stat-warning-message"></p>
                        <button id="stat-warning-confirm" class="stat-warning-btn">OK</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
        this.addStatWarningStyles();
        return document.getElementById('stat-warning-popup');
    }

    addStatWarningStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .stat-warning-popup {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .stat-warning-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
            }
            .stat-warning-content {
                position: relative;
                background: #2c2f33;
                border-radius: 8px;
                padding: 20px;
                max-width: 500px;
                width: 100%;
                z-index: 10001;
            }
            .stat-warning-header h3 {
                margin: 0;
                color: #ffffff;
                font-size: 18px;
            }
            .stat-warning-body {
                margin-top: 10px;
            }
            .stat-warning-body p {
                margin: 0;
                color: #ffffff;
                font-size: 14px;
            }
            .stat-warning-btn {
                background: #7289da;
                color: #ffffff;
                border: none;
                border-radius: 4px;
                padding: 10px 15px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s;
            }
            .stat-warning-btn:hover {
                background: #5b6eae;
            }
        `;
        document.head.appendChild(style);
    }
}

// Force window.characterStats and currentStats to be ready before DOMContentLoaded
if (!window.characterStats || !(window.characterStats instanceof CharacterStats)) {
    window.characterStats = new CharacterStats();
    // Synchronously initialize base stats and currentStats
    if (typeof window.characterStats.initializeBaseStats === 'function') {
        window.characterStats.initializeBaseStats();
    }
    if (!window.characterStats.currentStats) {
        window.characterStats.currentStats = { ...window.characterStats.baseStats };
    }
} else {
    // ...existing code...
}

// Render stat block UI from stats object
window.renderStatBlock = function(stats) {
    // ...existing code...
    var statBlock = document.querySelector('.stat-block');
    const statOrder = [
        'health', 'mana', 'armor', 
        'stamina', 'strength', 'agility', 'intellect', 'spirit',
        'attackpower', 'armorpen', 'meleehit', 'meleecrit', 'meleehaste',
        'healingpower', 'spellpower', 'spellpen', 'spellhit', 'spellcrit', 'spellhaste',
        'defense', 'blockvalue', 'block', 'parry', 'dodge'
    ];
    var mainPanel = document.querySelector('.main-panel');
    if (!mainPanel) return;
    var statBlock = mainPanel.querySelector('.stat-block');
    if (!statBlock) return;
    statBlock.innerHTML = '';
    // Add stat block title
    var titleDiv = document.createElement('div');
    titleDiv.className = 'stat-block-header';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.fontSize = '18px';
    titleDiv.style.color = '#ffd700';
    titleDiv.style.textAlign = 'center';
    titleDiv.textContent = 'Stats - Level 60';
    statBlock.appendChild(titleDiv);

    // ...removed spacer after title...

    // Check if anything is equipped
    var equipped = false;
    if (window.gearData) {
        for (let slot in window.gearData) {
            if (window.gearData[slot] && window.gearData[slot].equipped) {
                equipped = true;
                break;
            }
        }
    }

    // Helper to create a stat block spacer
    function createStatBlockSpacer() {
        var spacer = document.createElement('div');
        spacer.className = 'stat-block-spacer';
        spacer.style.height = '12px';
        return spacer;
    }

    statOrder.forEach(function(statKey, idx) {
        let value = 0;
        if (equipped && stats && typeof stats[statKey] !== 'undefined' && stats[statKey] !== null) {
            value = stats[statKey];
        } else if (stats && typeof stats[statKey] !== 'undefined' && stats[statKey] !== null) {
            value = 0;
        }
        // Format percent stats
        const percentStats = ["block", "parry", "dodge", "meleecrit", "spellcrit", "crit", "meleehit", "spellhit", "meleehaste", "spellhaste", "haste", "hit"];
        let displayValue = value;
        if (percentStats.includes(statKey.toLowerCase())) {
            if (typeof value === "number") {
                displayValue = value.toFixed(2) + "%";
            } else if (typeof value === "string" && value.match(/^\d+(\.\d+)?%?$/)) {
                let num = parseFloat(value);
                if (!isNaN(num)) displayValue = num.toFixed(2) + "%";
            }
        }
        var row = document.createElement('div');
        row.className = 'stat-row';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'stat-name';
            // Map for multi-word stat display names
            var statDisplayNames = {
                attackpower: 'Attack Power',
                armorpen: 'Armor Penetration',
                meleehit: 'Melee Hit',
                meleecrit: 'Melee Crit',
                meleehaste: 'Melee Haste',
                healingpower: 'Healing Power',
                spellpower: 'Spell Power',
                spellpen: 'Spell Penetration',
                spellhit: 'Spell Hit',
                spellcrit: 'Spell Crit',
                spellhaste: 'Spell Haste',
                blockvalue: 'Block Value'
            };
            var displayName = statDisplayNames[statKey] || (statKey.charAt(0).toUpperCase() + statKey.slice(1));
            nameSpan.textContent = displayName;
        var valueSpan = document.createElement('span');
        valueSpan.className = 'stat-value';
        valueSpan.textContent = displayValue;
        row.appendChild(nameSpan);
        row.appendChild(valueSpan);
        statBlock.appendChild(row);

        // Insert spacers after the requested stat rows using the unified spacer
        if (['armor','spirit','meleehaste','spellhaste'].includes(statKey)) {
            statBlock.appendChild(createStatBlockSpacer());
        }
    });
}

function updateCharacterStats() {
    if (window.characterStats && typeof window.characterStats.updateAllStats === 'function') {
        window.characterStats.updateAllStats();
    }
}

function calculateDodgeFromAgilityDirect(agility) {
    return (agility * 0.0607) / (1 + agility / 1406.1);
}