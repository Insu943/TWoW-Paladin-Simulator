class StatBreakdown {
    constructor() {
        this.characterStats = null;
        this.itemDatabase = [];
        this.equippedItems = {};
        this.selectedRace = null;
        this.talentBonuses = { block: 0, parry: 0, dodge: 0, spellCrit: 0 };
    }

// Initialize stat breakdown system
    initialize() {
        this.characterStats = window.characterStats;
        if (this.characterStats) {
            this.itemDatabase = this.characterStats.itemDatabase;
            this.equippedItems = this.characterStats.equippedItems;
            this.selectedRace = this.characterStats.selectedRace;
            this.talentBonuses = this.characterStats.talentBonuses;
            console.log('[DEBUG] StatBreakdown.initialize: characterStats found:', JSON.stringify(this.characterStats.currentStats));
        } else {
            console.log('[DEBUG] StatBreakdown.initialize: characterStats NOT found!');
        }
        this.createModalHTML();
        this.setupStatClickListeners();
    }

    createModalHTML() {
        const existingModal = document.getElementById('stat-breakdown-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="stat-breakdown-modal" class="stat-breakdown-modal" style="display: none;">
                <div class="stat-breakdown-overlay"></div>
                <div class="stat-breakdown-content">
                    <div class="stat-breakdown-header">
                        <h3 id="stat-breakdown-title">Stat Breakdown</h3>
                        <button class="stat-breakdown-close">&times;</button>
                    </div>
                    <div class="stat-breakdown-body" id="stat-breakdown-body">
                        <!-- Content will be populated here -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        const modal = document.getElementById('stat-breakdown-modal');
        const overlay = modal.querySelector('.stat-breakdown-overlay');
        const closeBtn = modal.querySelector('.stat-breakdown-close');

        overlay.addEventListener('click', () => this.hideStatBreakdown());
        closeBtn.addEventListener('click', () => this.hideStatBreakdown());

        // Add CSS styles
        this.addModalStyles();
    }

    addModalStyles() {
        const existingStyles = document.getElementById('stat-breakdown-styles');
        if (existingStyles) return;

        const styles = document.createElement('style');
        styles.id = 'stat-breakdown-styles';
        styles.textContent = `
            .stat-breakdown-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .stat-breakdown-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                cursor: pointer;
            }

            .stat-breakdown-content {
                position: relative;
                background: linear-gradient(135deg, #23233a 0%, #1a1a2e 100%);
                border: 2px solid #ffd700;
                border-radius: 8px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.5);
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: modalFadeIn 0.3s ease-out;
            }

            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .stat-breakdown-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
                color: #1a1a2e;
                border-radius: 6px 6px 0 0;
            }

            .stat-breakdown-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
            }

            .stat-breakdown-close {
                background: none;
                border: none;
                font-size: 24px;
                font-weight: bold;
                color: #1a1a2e;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
                transition: background 0.2s;
            }

            .stat-breakdown-close:hover {
                background: rgba(26, 26, 46, 0.1);
            }

            .stat-breakdown-body {
                padding: 20px;
                overflow-y: auto;
                color: #fff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
            }

            .total-stat {
                font-size: 16px;
                color: #ffd700;
                text-align: center;
                margin-bottom: 20px;
                padding: 10px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 4px;
                font-weight: bold;
            }

            .breakdown-section {
                margin-bottom: 20px;
            }

            .breakdown-section h4 {
                color: #ffd700;
                font-size: 14px;
                margin: 0 0 10px 0;
                border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                padding-bottom: 5px;
            }

            .breakdown-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .breakdown-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 10px;
                margin-bottom: 2px;
                border-radius: 3px;
                font-size: 13px;
            }

            .breakdown-item.source-race {
                background: rgba(163, 53, 238, 0.1);
                border-left: 3px solid #a335ee;
            }

            .breakdown-item.source-gear {
                background: rgba(0, 112, 221, 0.1);
                border-left: 3px solid #0070dd;
            }

            .breakdown-item.source-talent {
                background: rgba(163, 53, 238, 0.1);
                border-left: 3px solid #a335ee;
            }

            .breakdown-item.source-base {
                background: rgba(255, 128, 0, 0.1);
                border-left: 3px solid #ff8000;
            }

            .breakdown-item.source-derived {
                background: rgba(0, 112, 221, 0.05);
                border-left: 3px solid rgba(0, 112, 221, 0.3);
            }

            .breakdown-total {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 10px;
                margin-top: 5px;
                background: rgba(255, 215, 0, 0.15);
                border-radius: 3px;
                border: 1px solid rgba(255, 215, 0, 0.3);
                color: #ffd700;
                font-size: 13px;
                font-weight: bold;
            }

            .source-name {
                flex: 1;
                color: #fff;
            }

            .source-value {
                color: #4CAF50;
                font-weight: bold;
                font-family: 'Courier New', monospace;
            }

            .breakdown-empty {
                text-align: center;
                color: #ff6b9d;
                font-style: italic;
                padding: 30px 20px;
            }

            .breakdown-empty p {
                margin: 0;
            }

            /* Scrollbar styling */
            .stat-breakdown-body::-webkit-scrollbar {
                width: 8px;
            }

            .stat-breakdown-body::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }

            .stat-breakdown-body::-webkit-scrollbar-thumb {
                background: rgba(255, 215, 0, 0.3);
                border-radius: 4px;
            }

            .stat-breakdown-body::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 215, 0, 0.5);
            }
        `;

        document.head.appendChild(styles);
    }

    setupStatClickListeners() {
        // Debug: Log stat breakdown click events
        document.querySelectorAll('.stat-name').forEach(function(statNameEl) {
            statNameEl.addEventListener('click', function(e) {
                const statKey = statNameEl.getAttribute('data-stat') || statNameEl.textContent.trim().toLowerCase().replace(/\s+/g, '');
                console.log('[DEBUG] StatBreakdown clicked:', statKey);
            });
        });
        const statItems = document.querySelectorAll('.stat-item');
        
        statItems.forEach(item => {
            const statName = item.dataset.stat;
            const statLabel = item.querySelector('span:first-child');
            
            if (statLabel && statName) {
                statLabel.style.cursor = 'pointer';
                statLabel.style.color = '#ffd700';
                statLabel.style.textDecoration = 'underline';
                
                statLabel.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showStatBreakdown(statName);
                });
            }
        });
        
        const categoryItems = document.querySelectorAll('.stat-category-items .stat-item');
        categoryItems.forEach(item => {
            const statName = item.dataset.stat;
            const statLabel = item.querySelector('span:first-child');
            
            if (statLabel && statName) {
                statLabel.style.cursor = 'pointer';
                statLabel.style.color = '#ffd700';
                statLabel.style.textDecoration = 'underline';
                
                statLabel.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showStatBreakdown(statName);
                });
            }
        });
    }

    showStatBreakdown(statName) {
    this.updateData();
    console.log(`[DEBUG] showStatBreakdown: Showing breakdown for stat '${statName}'`);
    const breakdown = this.calculateStatBreakdown(statName);
    console.log(`[DEBUG] showStatBreakdown: Breakdown result for '${statName}':`, breakdown);
    const displayName = this.getStatDisplayName(statName);
    const modal = document.getElementById('stat-breakdown-modal');
    const title = document.getElementById('stat-breakdown-title');
    const body = document.getElementById('stat-breakdown-body');
    title.textContent = `${displayName} Breakdown`;
    body.innerHTML = this.generateBreakdownHTML(statName, breakdown);
    modal.style.display = 'flex';
    }

    hideStatBreakdown() {
        const modal = document.getElementById('stat-breakdown-modal');
        modal.style.display = 'none';
    }

    updateData() {
        if (window.characterStats) {
            this.characterStats = window.characterStats;
            this.equippedItems = window.characterStats.equippedItems || {};
            this.selectedRace = window.characterStats.selectedRace || null;
            this.talentBonuses = window.characterStats.talentBonuses || { block: 0, parry: 0, dodge: 0, spellCrit: 0 };
        }
    }

    getStatDisplayName(statName) {
        const displayNames = {
            health: 'Health',
            mana: 'Mana',
            attackpower: 'Attack Power',
            armorpen: 'Armor Pen',
            meleehit: 'Melee Hit',
            meleecrit: 'Melee Crit',
            meleehaste: 'Melee Haste',
            healingpower: 'Healing Power',
            spellpower: 'Spell Power',
            spellpen: 'Spell Penetration',
            spellhit: 'Spell Hit',
            spellcrit: 'Spell Crit',
            spellhaste: 'Spell Haste',
            blockvalue: 'Block Value',
            block: 'Block',
            parry: 'Parry',
            dodge: 'Dodge',
            stamina: 'Stamina',
            strength: 'Strength',
            agility: 'Agility',
            intellect: 'Intellect',
            spirit: 'Spirit',
            armor: 'Armor',
            defense: 'Defense',
            mp5: 'MP5',
            vampirism: 'Vampirism',
            spellstrike: 'Spellstrike',
            thorns: 'Thorns',
            axes: 'Axes',
            maces: 'Maces',
            polearms: 'Polearms',
            swords: 'Swords',
            twohandedmaces: 'Two-Handed Maces',
            twohandedswords: 'Two-Handed Swords',
            fireresist: 'Fire Resistance',
            natureresist: 'Nature Resistance',
            arcaneresist: 'Arcane Resistance',
            frostresist: 'Frost Resistance',
            shadowresist: 'Shadow Resistance'
        };
        return displayNames[statName] || statName.charAt(0).toUpperCase() + statName.slice(1);
    }

    calculateStatBreakdown(statName) {
        switch (statName) {
            case 'health':
                return this.calculateHealthBreakdown();
            case 'mana':
                return this.calculateManaBreakdown();
            case 'attackpower':
                return this.calculateAttackPowerBreakdown();
            case 'blockvalue':
                return this.calculateBlockValueBreakdown();
            case 'mp5':
                return this.calculateMP5Breakdown();
            case 'meleecrit':
                return this.calculateMeleeCritBreakdown();
            case 'spellcrit':
                return this.calculateSpellCritBreakdown();
            case 'dodge':
                return this.calculateDodgeBreakdown();
            case 'thorns':
                return this.calculateThornsBreakdown();
            case 'spellstrike':
                return this.calculateSpellstrikeBreakdown();
            case 'fireresist':
            case 'natureresist':
            case 'arcaneresist':
            case 'frostresist':
            case 'shadowresist':
                return this.calculateResistanceBreakdown(statName);
            case 'axes':
            case 'maces':
            case 'polearms':
            case 'swords':
                return this.calculateWeaponSkillBreakdown(statName);
            case 'twoHandedMaces':
                return this.calculateWeaponSkillBreakdown('twohandedmaces');
            case 'twoHandedSwords':
                return this.calculateWeaponSkillBreakdown('twohandedswords');
            default:
                return this.calculateGenericStatBreakdown(statName);
        }
    }

    calculateHealthBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentStamina = this.characterStats?.currentStats?.stamina || 0;
        
        if (this.selectedRace && this.selectedRace.health) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace.health,
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace.health);
        }
        
        if (currentStamina > 0) {
            const healthFromStamina = currentStamina * 10;
            breakdown.derivedSources.push({
                source: `Stamina Conversion (${currentStamina} × 10)`,
                value: healthFromStamina,
                type: 'derived'
            });
            breakdown.total += healthFromStamina;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.health) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.health,
                    type: 'gear'
                });
                breakdown.total += Number(item.health);
            }
        });

        return breakdown;
    }

    calculateManaBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentIntellect = this.characterStats?.currentStats?.intellect || 0;
        
        if (this.selectedRace && this.selectedRace.mana) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace.mana,
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace.mana);
        }
        
        if (currentIntellect > 0) {
            const manaFromIntellect = currentIntellect * 15;
            breakdown.derivedSources.push({
                source: `Intellect Conversion (${currentIntellect} × 15)`,
                value: manaFromIntellect,
                type: 'derived'
            });
            breakdown.total += manaFromIntellect;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.mana) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.mana,
                    type: 'gear'
                });
                breakdown.total += Number(item.mana);
            }
        });

        return breakdown;
    }

    calculateAttackPowerBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentStrength = this.characterStats?.currentStats?.strength || 0;
        
        if (this.selectedRace && this.selectedRace.attackpower) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace.attackpower,
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace.attackpower);
        }
        
        if (currentStrength > 0) {
            const apFromStrength = currentStrength * 2;
            breakdown.derivedSources.push({
                source: `Strength Conversion (${currentStrength} × 2)`,
                value: apFromStrength,
                type: 'derived'
            });
            breakdown.total += apFromStrength;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.attackpower) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.attackpower,
                    type: 'gear'
                });
                breakdown.total += Number(item.attackpower);
            }
        });

        return breakdown;
    }

    calculateBlockValueBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentStrength = this.characterStats?.currentStats?.strength || 0;
        
        if (currentStrength > 0) {
            const blockValueFromStrength = Math.floor(currentStrength / 20);
            if (blockValueFromStrength > 0) {
                breakdown.derivedSources.push({
                    source: `Strength Conversion (${currentStrength} ÷ 20)`,
                    value: blockValueFromStrength,
                    type: 'derived'
                });
                breakdown.total += blockValueFromStrength;
            }
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.blockvalue) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.blockvalue,
                    type: 'gear'
                });
                breakdown.total += Number(item.blockvalue);
            }
        });

        return breakdown;
    }

    calculateMP5Breakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        const currentSpirit = this.characterStats?.currentStats?.spirit || 0;
        if (currentSpirit > 0 && typeof window.calculateMP5FromSpirit === 'function') {
            const mp5FromSpirit = window.calculateMP5FromSpirit(currentSpirit);
            if (mp5FromSpirit > 0) {
                breakdown.derivedSources.push({
                    source: `Spirit Conversion (${currentSpirit} spirit, MP5 formula)`,
                    value: mp5FromSpirit,
                    type: 'derived'
                });
                breakdown.total += mp5FromSpirit;
            }
        }
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.mp5) {
                const convertedMP5 = Math.round(Number(item.mp5) * 2 / 5);
                breakdown.sources.push({
                    source: `${item.name} (${item.mp5} → ${convertedMP5})`,
                    value: convertedMP5,
                    type: 'gear'
                });
                breakdown.total += convertedMP5;
            }
        });
        return breakdown;
    }

    calculateMeleeCritBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentAgility = this.characterStats?.currentStats?.agility || 0;
        
        if (currentAgility > 0) {
            const meleeCritFromAgility = (currentAgility * 0.0614) / (1 + currentAgility / 1406.1);
            breakdown.derivedSources.push({
                source: `Agility Conversion (${currentAgility} agility, DR formula)`,
                value: meleeCritFromAgility,
                type: 'derived'
            });
            breakdown.total += meleeCritFromAgility;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.meleecrit) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.meleecrit,
                    type: 'gear'
                });
                breakdown.total += Number(item.meleecrit);
            }
        });

        return breakdown;
    }

    calculateSpellCritBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentIntellect = this.characterStats?.currentStats?.intellect || 0;
        
        if (currentIntellect > 0) {
            const spellCritFromIntellect = currentIntellect * 0.04047;
            breakdown.derivedSources.push({
                source: `Intellect Conversion (${currentIntellect} × 0.04047%)`,
                value: spellCritFromIntellect,
                type: 'derived'
            });
            breakdown.total += spellCritFromIntellect;
        }
        
        if (this.talentBonuses.spellCrit > 0) {
            breakdown.sources.push({
                source: 'Talents',
                value: this.talentBonuses.spellCrit,
                type: 'talent'
            });
            breakdown.total += this.talentBonuses.spellCrit;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.spellcrit) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.spellcrit,
                    type: 'gear'
                });
                breakdown.total += Number(item.spellcrit);
            }
        });

        return breakdown;
    }

    calculateDodgeBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const currentAgility = this.characterStats?.currentStats?.agility || 0;
        const currentDefense = this.characterStats?.currentStats?.defense || 300;
        
        if (this.selectedRace && this.selectedRace.dodge) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace.dodge,
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace.dodge);
        }
        
        if (currentAgility > 0) {
            const dodgeFromAgility = (currentAgility * 0.0607) / (1 + currentAgility / 1406.1);
            breakdown.derivedSources.push({
                source: `Agility Conversion (${currentAgility} agility, DR formula)`,
                value: dodgeFromAgility,
                type: 'derived'
            });
            breakdown.total += dodgeFromAgility;
        }
        
        if (currentDefense > 300) {
            const defenseAboveBase = currentDefense - 300;
            const dodgeFromDefense = defenseAboveBase * 0.04;
            breakdown.derivedSources.push({
                source: `Defense Conversion (${defenseAboveBase} defense above 300)`,
                value: dodgeFromDefense,
                type: 'derived'
            });
            breakdown.total += dodgeFromDefense;
        }
        
        if (this.talentBonuses.dodge > 0) {
            breakdown.sources.push({
                source: 'Talents',
                value: this.talentBonuses.dodge,
                type: 'talent'
            });
            breakdown.total += this.talentBonuses.dodge;
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item.dodge) {
                breakdown.sources.push({
                    source: item.name,
                    value: item.dodge,
                    type: 'gear'
                });
                breakdown.total += Number(item.dodge);
            }
        });

        return breakdown;
    }

    calculateThornsBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            let itemTotalThorns = 0;
            const thornsVariants = [];
            
            if (item.thorns) {
                thornsVariants.push(`${item.thorns} Thorns`);
                itemTotalThorns += Number(item.thorns);
            }
            if (item.arcanethorns) {
                thornsVariants.push(`${item.arcanethorns} Arcane Thorns`);
                itemTotalThorns += Number(item.arcanethorns);
            }
            if (item.firethorns) {
                thornsVariants.push(`${item.firethorns} Fire Thorns`);
                itemTotalThorns += Number(item.firethorns);
            }
            if (item.naturethorns) {
                thornsVariants.push(`${item.naturethorns} Nature Thorns`);
                itemTotalThorns += Number(item.naturethorns);
            }
            if (item.shadowthorns) {
                thornsVariants.push(`${item.shadowthorns} Shadow Thorns`);
                itemTotalThorns += Number(item.shadowthorns);
            }
            if (item.frostthorns) {
                thornsVariants.push(`${item.frostthorns} Frost Thorns`);
                itemTotalThorns += Number(item.frostthorns);
            }
            
            if (itemTotalThorns > 0) {
                breakdown.sources.push({
                    source: item.name,
                    value: itemTotalThorns,
                    type: 'gear',
                    breakdown: thornsVariants.join(', ')
                });
                breakdown.total += itemTotalThorns;
            }
        });

        return breakdown;
    }

    calculateSpellstrikeBreakdown() {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            let totalSpellstrike = 0;
            const spellstrikeVariants = [];
            
            if (item.spellstrike) { totalSpellstrike += Number(item.spellstrike); spellstrikeVariants.push('Spellstrike'); }
            if (item.arcanespellstrike) { totalSpellstrike += Number(item.arcanespellstrike); spellstrikeVariants.push('Arcane'); }
            if (item.firespellstrike) { totalSpellstrike += Number(item.firespellstrike); spellstrikeVariants.push('Fire'); }
            if (item.naturespellstrike) { totalSpellstrike += Number(item.naturespellstrike); spellstrikeVariants.push('Nature'); }
            if (item.shadowspellstrike) { totalSpellstrike += Number(item.shadowspellstrike); spellstrikeVariants.push('Shadow'); }
            if (item.frostspellstrike) { totalSpellstrike += Number(item.frostspellstrike); spellstrikeVariants.push('Frost'); }
            
            if (totalSpellstrike > 0) {
                breakdown.sources.push({
                    source: item.name,
                    value: totalSpellstrike,
                    type: 'gear',
                    breakdown: `(${spellstrikeVariants.join(' + ')} Spellstrike)`
                });
                breakdown.total += totalSpellstrike;
            }
        });

        return breakdown;
    }

    calculateResistanceBreakdown(statName) {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const resistancePropertyMap = {
            'fireresist': ['fireresist', 'fireResistance'],
            'natureresist': ['natureresist', 'natureResistance'], 
            'arcaneresist': ['arcaneresist', 'arcaneResistance'],
            'frostresist': ['frostresist', 'frostResistance'],
            'shadowresist': ['shadowresist', 'shadowResistance']
        };
        
        const possibleProperties = resistancePropertyMap[statName] || [statName];
        
        if (this.selectedRace) {
            possibleProperties.forEach(prop => {
                if (this.selectedRace[prop]) {
                    breakdown.sources.push({
                        source: `${this.selectedRace.name} (Race)`,
                        value: this.selectedRace[prop],
                        type: 'race'
                    });
                    breakdown.total += Number(this.selectedRace[prop]);
                }
            });
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            let itemResistanceValue = 0;
            
            possibleProperties.forEach(prop => {
                if (item[prop]) {
                    itemResistanceValue += Number(item[prop]);
                }
            });
            
            if (itemResistanceValue > 0) {
                breakdown.sources.push({
                    source: item.name,
                    value: itemResistanceValue,
                    type: 'gear'
                });
                breakdown.total += itemResistanceValue;
            }
        });

        return breakdown;
    }

    calculateWeaponSkillBreakdown(weaponSkillProperty) {
        const breakdown = { total: 300, sources: [], derivedSources: [] }; // Base 300
        
        breakdown.sources.push({
            source: 'Base Skill',
            value: 300,
            type: 'base'
        });
        
        if (this.selectedRace && this.selectedRace[weaponSkillProperty]) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace[weaponSkillProperty],
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace[weaponSkillProperty]);
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item[weaponSkillProperty]) {
                breakdown.sources.push({
                    source: item.name,
                    value: item[weaponSkillProperty],
                    type: 'gear'
                });
                breakdown.total += Number(item[weaponSkillProperty]);
            }
        });

        return breakdown;
    }

    calculateGenericStatBreakdown(statName) {
        const breakdown = { total: 0, sources: [], derivedSources: [] };
        
        const baseValue = this.getBaseStat(statName);
        if (baseValue > 0) {
            breakdown.sources.push({
                source: 'Base',
                value: baseValue,
                type: 'base'
            });
            breakdown.total += baseValue;
        }
        
        if (this.selectedRace && this.selectedRace[statName]) {
            breakdown.sources.push({
                source: `${this.selectedRace.name} (Race)`,
                value: this.selectedRace[statName],
                type: 'race'
            });
            breakdown.total += Number(this.selectedRace[statName]);
        }
        
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            if (item[statName]) {
                breakdown.sources.push({
                    source: item.name,
                    value: item[statName],
                    type: 'gear'
                });
                breakdown.total += Number(item[statName]);
            }
        });

        return breakdown;
    }

    getBaseStat(statName) {
        const baseStats = {
            'defense': 300,
            'block': 5,
            'parry': 5,
        };
        return baseStats[statName] || 0;
    }

    generateBreakdownHTML(statName, breakdown) {
        const displayName = this.getStatDisplayName(statName);
        const isPercentage = ['meleecrit', 'spellcrit', 'block', 'parry', 'dodge'].includes(statName);
        const unit = isPercentage ? '%' : '';
        
        let html = `
            <div class='total-stat'>
                Total ${displayName}: ${breakdown.total.toFixed(2)}${unit}
            </div>
        `;

        if (breakdown.sources.length > 0) {
            html += `
                <div class='breakdown-section'>
                    <h4>Direct Sources:</h4>
                    <ul class='breakdown-list'>
            `;
            
            breakdown.sources.forEach(source => {
                const typeClass = `source-${source.type}`;
                let displayValue = source.value;
                let suffix = unit;
                
                if ((statName === 'thorns' || statName === 'spellstrike') && source.breakdown) {
                    html += `
                        <li class='breakdown-item ${typeClass}'>
                            <span class='source-name'>${source.source}</span>
                            <span class='source-value'>+${displayValue}${suffix}</span>
                        </li>
                        <li class='breakdown-item source-derived' style='padding-left: 20px; font-size: 11px; color: #aaa;'>
                            <span class='source-name'>${source.breakdown}</span>
                            <span class='source-value'></span>
                        </li>
                    `;
                } else {
                    html += `
                        <li class='breakdown-item ${typeClass}'>
                            <span class='source-name'>${source.source}</span>
                            <span class='source-value'>+${displayValue}${suffix}</span>
                        </li>
                    `;
                }
            });
            
            html += `</ul></div>`;
        }

        if (breakdown.derivedSources.length > 0) {
            html += `
                <div class='breakdown-section'>
                    <h4>Conversions:</h4>
                    <ul class='breakdown-list'>
            `;
            
            breakdown.derivedSources.forEach(source => {
                const typeClass = `source-${source.type}`;
                let displayValue = isPercentage ? source.value.toFixed(2) : Math.round(source.value);
                let suffix = unit;
                
                html += `
                    <li class='breakdown-item ${typeClass}'>
                        <span class='source-name'>${source.source}</span>
                        <span class='source-value'>+${displayValue}${suffix}</span>
                    </li>
                `;
            });
            
            html += `</ul></div>`;
        }

        if (breakdown.sources.length === 0 && breakdown.derivedSources.length === 0) {
            html += `
                <div class='breakdown-empty'>
                    <p>No sources found for this stat.</p>
                </div>
            `;
        }

        return html;
    }
}

// Remove retry loop for stat breakdown initialization

// --- StatBreakdown polling initialization ---
function pollForStatBreakdownInit() {
    if (window.characterStats && window.characterStats.currentStats && typeof window.triggerStatBreakdownInit === 'function' && typeof window.StatBreakdown === 'function') {
        window.triggerStatBreakdownInit();
        // Only initialize once
        pollForStatBreakdownInit._done = true;
    } else if (!pollForStatBreakdownInit._done) {
        setTimeout(pollForStatBreakdownInit, 100);
    }
}
pollForStatBreakdownInit();