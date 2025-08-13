// Load Race.json into window.raceDatabase before stats aggregation
if (!window.raceDatabase) {
    fetch('../Data/Database/Race.json')
        .then(response => response.json())
        .then(data => {
            window.raceDatabase = data;
        })
}

// --- Dropdown Stat Logic ---
const miscStats = [
    'mp5', 'thorns', 'spellstrike'
];
const weaponSkillStats = [
    'maces', 'swords', 'axes', 'polearms', 'twohandedmaces', 'twohandedswords'
];
const resistanceStats = [
    'arcane', 'fire', 'frost', 'nature', 'shadow'
];
// F11 log overlay and log patching removed. Logs will only show in the console.
window.unequipAllGear = function() {
    const slots = [
        'helmet','neck','shoulders','cloak','chest','wrist','gloves','belt','pants','boots',
        'ring1','ring2','trinket1','trinket2','mainhand','offhand','libram'
    ];
        window.gearData = window.gearData || {};
        slots.forEach(slotType => {
            window.gearData[slotType] = { name: '', equipped: false };
            // Update gear slot UI to empty icon and name
            const slotEl = document.querySelector(`.gear-slot.gear-${slotType}`);
            if (slotEl) {
                const iconEl = slotEl.querySelector('.gear-icon');
                if (iconEl) {
                    iconEl.src = `../assets/gear-icon/${slotType}-empty.jpg`;
                }
                const nameEl = slotEl.querySelector('.gear-name');
                if (nameEl) {
                    nameEl.textContent = '';
                    nameEl.className = 'gear-name quality-common';
                }
            }
        });
        // Handle race slot separately
        window.gearData.race = null;
        const raceSlotEl = document.querySelector('.gear-slot.gear-race');
        if (raceSlotEl) {
            const iconEl = raceSlotEl.querySelector('.gear-icon');
            if (iconEl) {
                iconEl.src = '../assets/gear-icon/race-empty.jpg';
            }
            const nameEl = raceSlotEl.querySelector('.gear-name');
            if (nameEl) {
                nameEl.textContent = '';
                nameEl.className = 'gear-name quality-common';
            }
        }
        // Reset stats and update UI
        if (typeof updateCharacterStats === 'function') {
            updateCharacterStats();
        }
        if (window.characterStats && window.characterStats.currentStats && typeof window.renderStatBlock === 'function') {
            window.characterStats.currentStats = {};
            window.renderStatBlock(window.characterStats.currentStats);
        }
        if (typeof updateCharacterStats === 'function') {
            updateCharacterStats();
        }
        if (window.characterStats && window.characterStats.currentStats && typeof window.renderStatBlock === 'function') {
            window.renderStatBlock(window.characterStats.currentStats);
        }
    }

// Confirmation modal logic
document.addEventListener('DOMContentLoaded', function() {
    // On startup, render stat block with all stat values set to 0, including weapon skills
    if (typeof window.renderStatBlock === 'function') {
        window.renderStatBlock({
            health: 0,
            mana: 0,
            armor: 0,
            stamina: 0,
            strength: 0,
            agility: 0,
            intellect: 0,
            spirit: 0,
            attackpower: 0,
            armorpen: 0,
            meleehit: 0,
            meleecrit: 0,
            meleehaste: 0,
            healingpower: 0,
            spellpower: 0,
            spellpen: 0,
            spellhit: 0,
            spellcrit: 0,
            spellhaste: 0,
            defense: 0,
            blockvalue: 0,
            block: 0,
            parry: 0,
            dodge: 0,
        });
    }

    // Wire up race slot to use the same item menu as other gear slots
    setTimeout(function() {
        const raceSlotIcon = document.querySelector('.gear-slot.gear-race .gear-icon');
        if (raceSlotIcon) {
            raceSlotIcon.onclick = function(e) {
                e.stopPropagation();
                if (window.showItemMenu) {
                    window.showItemMenu(raceSlotIcon.closest('.gear-slot'), 'race');
                }
            };
        }
    }, 500);


        // Wire up race slot to use the same item menu as other gear slots
        setTimeout(function() {
            const raceSlot = document.querySelector('.gear-slot.gear-race .gear-icon');
            if (raceSlot) {
                raceSlot.onclick = function(e) {
                    e.stopPropagation();
                    if (window.showItemMenu) {
                        window.showItemMenu(raceSlot, 'race');
                    }
                };
            }
        }, 500);
    // Unequip All confirmation
    const unequipBtn = document.getElementById('unequip-all-btn');
    const confirmUnequipModal = document.getElementById('confirm-unequip-modal');
    const confirmUnequipYes = document.getElementById('confirm-unequip-yes');
    const confirmUnequipNo = document.getElementById('confirm-unequip-no');
    if (unequipBtn && confirmUnequipModal && confirmUnequipYes && confirmUnequipNo) {
        unequipBtn.onclick = function(e) {
            e.preventDefault();
            confirmUnequipModal.style.display = 'flex';
        };
        confirmUnequipYes.onclick = function() {
            confirmUnequipModal.style.display = 'none';
            if (typeof window.unequipAllGear === 'function') window.unequipAllGear();
        };
        confirmUnequipNo.onclick = function() {
            confirmUnequipModal.style.display = 'none';
        };
    }

    // Delete Preset confirmation
    const deletePresetBtn = document.getElementById('delete-preset-btn');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const confirmDeleteYes = document.getElementById('confirm-delete-yes');
    const confirmDeleteNo = document.getElementById('confirm-delete-no');
    if (deletePresetBtn && confirmDeleteModal) {
        deletePresetBtn.onclick = function(e) {
            e.preventDefault();
            confirmDeleteModal.style.display = 'flex';
        };
        confirmDeleteYes.onclick = function() {
            confirmDeleteModal.style.display = 'none';
            // Call your delete preset logic here
            if (typeof window.deletePreset === 'function') window.deletePreset();
        };
        confirmDeleteNo.onclick = function() {
            confirmDeleteModal.style.display = 'none';
        };
    }

    // Initialize StatBreakdown once
    if (window.StatBreakdown && typeof window.StatBreakdown === 'function' && !window.statBreakdown) {
        window.statBreakdown = new window.StatBreakdown();
        window.statBreakdown.initialize();
    }

    // Force stat block and dropdowns to render base stats on page load
    if (typeof window.updateCharacterStats === 'function') {
        window.updateCharacterStats();
        if (typeof updateAllDropdownStats === 'function') updateAllDropdownStats();
    }

    // Function to wire up stat name click events
    function wireStatNameClicks() {
        // Attach click event to all .stat-name elements in stat block and dropdowns
        document.querySelectorAll('.stat-name').forEach(function(statNameEl) {
            statNameEl.classList.add('stat-name-clickable');
            statNameEl.style.cursor = 'pointer';
            var statKey = statNameEl.getAttribute('data-stat') || statNameEl.textContent.trim().toLowerCase().replace(/\s+/g, '');
            statNameEl.setAttribute('data-stat', statKey);
            statNameEl.onclick = function(e) {
                e.stopPropagation();
                if (window.statBreakdown && typeof window.statBreakdown.showStatBreakdown === 'function') {
                    window.statBreakdown.showStatBreakdown(statKey);
                }
            };
        });
    }

        function getStatDisplayName(statKey) {
            const names = {
                mp5: 'MP5', armorpen: 'Armor Penetration', spellpen: 'Spell Penetration', thorns: 'Thorns', spellstrike: 'Spellstrike',
                maces: 'Maces', swords: 'Swords', axes: 'Axes', polearms: 'Polearms', twohandedmaces: '2H Maces', twohandedswords: '2H Swords', defense: 'Defense',
                arcane: 'Arcane Resist', fire: 'Fire Resist', frost: 'Frost Resist', nature: 'Nature Resist', shadow: 'Shadow Resist'
            };
            return names[statKey] || statKey;
        }

        function renderDropdownStats(dropdownId, statKeys) {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;
            const content = dropdown.querySelector('.stat-dropdown-content');
            if (!content) return;
            content.innerHTML = '';
            // Always start with 0 for all stats until race/gear is equipped
            statKeys.forEach(function(statKey) {
                let value = 0;
                // Aggregate equipped gear stats
                if (window.gearData) {
                    Object.values(window.gearData).forEach(function(item) {
                        if (item && item.equipped && typeof item[statKey] !== 'undefined') {
                            value += item[statKey];
                        }
                    });
                }
                // If race is equipped, add race stat
                if (window.gearData && window.gearData.race && window.gearData.race.name && window.raceDatabase) {
                    const raceObj = window.raceDatabase.find(r => r.name === window.gearData.race.name);
                    if (raceObj && typeof raceObj[statKey] !== 'undefined') {
                        value += raceObj[statKey];
                    }
                }
                const row = document.createElement('div');
                row.className = 'stat-row';
                const nameDiv = document.createElement('div');
                nameDiv.className = 'stat-name';
                nameDiv.textContent = getStatDisplayName(statKey);
                const valueDiv = document.createElement('div');
                valueDiv.className = 'stat-value';
                valueDiv.textContent = value;
                row.appendChild(nameDiv);
                row.appendChild(valueDiv);
                content.appendChild(row);
            });
        }

        function updateAllDropdownStats() {
            renderDropdownStats('misc-stats-dropdown', miscStats);
            renderDropdownStats('weapon-skill-dropdown', weaponSkillStats);
            renderDropdownStats('resistances-dropdown', resistanceStats);
        }

        // Make toggleDropdown globally available for inline HTML onclick
        window.toggleDropdown = function(dropdownId) {
            var dropdown = document.getElementById(dropdownId);
            if (!dropdown) {
                return;
            }
            var content = dropdown.querySelector('.stat-dropdown-content');
            if (!content) {
                return;
            }
            // Toggle display
            if (content.style.display === '' || content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
            // Optionally rotate arrow
            var arrow = dropdown.querySelector('.dropdown-arrow');
            if (arrow) {
                arrow.style.transform = (content.style.display === 'block') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }

        // Initial render
        updateAllDropdownStats();
        wireDropdownHeaderClicks();
        // Remove inline onclick attributes if present and wire up via JS
        document.querySelectorAll('.stat-dropdown-header').forEach(function(header) {
            header.removeAttribute('onclick');
        });

        // Ensure dropdown headers are always clickable after dropdowns are rendered
        function wireDropdownHeaderClicks() {
            document.querySelectorAll('.stat-dropdown-header').forEach(function(header) {
                header.onclick = function(e) {
                    e.stopPropagation();
                    const parent = header.closest('.stat-dropdown');
                    if (parent && parent.id) {
                        window.toggleDropdown(parent.id);
                    }
                };
            });
        }

        // Update stat block and dropdowns whenever stats are updated
        if (typeof window.updateCharacterStats === 'function') {
            const origUpdate = window.updateCharacterStats;
            window.updateCharacterStats = function() {
                origUpdate();
                if (typeof window.renderStatBlock === 'function' && window.characterStats && window.characterStats.currentStats) {
                    window.renderStatBlock(window.characterStats.currentStats);
                }
                updateAllDropdownStats();
                wireDropdownHeaderClicks();
            };
        }

    // Wire up stat name clicks after initial load
    setTimeout(wireStatNameClicks, 500);

    // Re-wire stat name clicks whenever stats are updated
    if (typeof window.updateCharacterStats === 'function') {
        const origUpdateCharacterStats = window.updateCharacterStats;
        window.updateCharacterStats = function() {
            origUpdateCharacterStats.apply(this, arguments);
            wireStatNameClicks();
        };
    }
});

// DEBUG: Confirm main.js loaded
console.log('[DEBUG] main.js script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] DOMContentLoaded fired in main.js');
    const gearSlots = document.querySelectorAll('.gear-slot');
    console.log('[DEBUG] [main.js] Number of gear slots found:', gearSlots.length, gearSlots);
});

// Delete preset logic
window.deletePreset = async function() {
    // Get selected preset name from dropdown or UI
    let presetDropdown = document.querySelector('.preset-dropdown');
    if (!presetDropdown) {
        alert('No preset selected.');
        return;
    }
    let presetName = presetDropdown.value;
    if (!presetName || presetName.trim() === '') {
        alert('No preset selected.');
        return;
    }

    // Use IPC to delete preset file
    if (window.safeIpcInvoke) {
        try {
            await window.safeIpcInvoke('delete-preset', presetName);
            alert('Preset deleted: ' + presetName);
            // Optionally refresh preset list here
        } catch (err) {
            alert('Failed to delete preset: ' + err);
        }
    } else {
        alert('IPC not available. Cannot delete preset.');
    }
}

// GLOBAL EQUIP ITEM FUNCTION
// window.gearData is a global object that stores currently equipped items for each slot.
// It is initialized at the bottom of this file and updated by equipItem and unequipAllGear.
window.equipItem = function(slotType, item) {
    const slot = document.querySelector(`.gear-slot[data-slot="${slotType}"]`) || document.querySelector(`.gear-slot.gear-${slotType}`);
    // Remove the item popup menu if present
    if (typeof removeItemMenu === 'function') removeItemMenu();
    if (!slot) return;

    let icon = slot.querySelector('.gear-icon');
    let name = slot.querySelector('.gear-name');

    // Ensure .gear-icon exists
    if (!icon) {
        icon = document.createElement('img');
        icon.className = 'gear-icon empty';
        slot.appendChild(icon);
    }
    // Ensure .gear-name exists
    if (!name) {
        name = document.createElement('div');
        name.className = 'gear-name';
        slot.appendChild(name);
    }


    // Special handling for race slot
    if (slotType === 'race') {
        let raceImg = '../assets/gear-icon/race-empty.jpg';
        if (item && item.name) {
            if (item.name.toLowerCase() === 'human') raceImg = '../assets/backgrounds/race-human.jpg';
            else if (item.name.toLowerCase() === 'dwarf') raceImg = '../assets/backgrounds/race-dwarf.jpg';
            else if (item.name.toLowerCase() === 'high elf') raceImg = '../assets/backgrounds/race-highelf.jpg';
            icon.src = raceImg;
            icon.className = 'gear-icon equipped';
            name.textContent = item.name;
            name.className = 'gear-name quality-common';
            window.gearData.race = { ...item, equipped: true };
        } else {
            icon.src = raceImg;
            icon.className = 'gear-icon empty';
            name.textContent = '';
            name.className = 'gear-name quality-common';
            window.gearData.race = null;
        }
        if (typeof window.updateCharacterStats === 'function') window.updateCharacterStats();
        if (window.characterStats && window.characterStats.currentStats && typeof window.renderStatBlock === 'function') window.renderStatBlock(window.characterStats.currentStats);
        if (typeof updateAllDropdownStats === 'function') updateAllDropdownStats();
        return;
    }

        // Helper for slot asset name
        const baseType = (slotType === 'ring1' || slotType === 'ring2') ? 'ring'
            : (slotType === 'trinket1' || slotType === 'trinket2') ? 'trinket'
            : slotType;

        if (item && item.name === '') {
            // Unequip: reset icon and name to empty state
            const emptyIconPath = `../assets/gear-icon/${baseType}-empty.jpg`;
            if (icon.tagName === 'IMG') {
                icon.src = emptyIconPath;
            } else {
                icon.style.backgroundImage = `url('${emptyIconPath}')`;
            }
            icon.className = 'gear-icon empty';
            icon.removeAttribute('data-quality');
            icon.style.border = '2px solid #ffffff'; // Always white for empty
            // Reset gear name to default slot name
            const slotNames = {
                helmet: 'Helmet', neck: 'Neck', shoulders: 'Shoulders', cloak: 'Cloak', chest: 'Chest', wrist: 'Wrist', gloves: 'Gloves', belt: 'Belt', pants: 'Pants', boots: 'Boots',
                ring1: 'Ring 1', ring2: 'Ring 2', trinket1: 'Trinket 1', trinket2: 'Trinket 2', mainhand: 'Main Hand', offhand: 'Off Hand', libram: 'Libram', race: 'Race'
            };
            name.textContent = slotNames[slotType] || slotType;
            name.className = 'gear-name';
            name.style.color = '#ffffff';
            // Reset gearData for slot
            window.gearData[slotType] = { name: '', equipped: false };
            // If unequipping race, also set gearData.race to null
            if (slotType === 'race') {
                window.gearData.race = null;
            }
            // Force stat update and stat block re-render
            if (window.characterStats && typeof window.characterStats.updateAllStats === 'function') {
                window.characterStats.updateAllStats();
            }
            if (typeof window.updateCharacterStats === 'function') {
                window.updateCharacterStats();
            }
            if (typeof window.renderStatBlock === 'function' && window.characterStats && window.characterStats.currentStats) {
                window.renderStatBlock(window.characterStats.currentStats);
            }
            if (typeof window.updateAllDropdownStats === 'function') {
                window.updateAllDropdownStats();
            }
            return;
        } else if (item && item.name) {
            const equippedIconPath = `../assets/gear-icon/${baseType}-equipped.jpg`;
            if (icon.tagName === 'IMG') {
                icon.src = equippedIconPath;
            } else {
                icon.style.backgroundImage = `url('${equippedIconPath}')`;
            }
            icon.className = 'gear-icon equipped';
            icon.setAttribute('data-quality', item.quality || '');
            // Set border color based on item quality
            let borderColor = '#cccccc'; // Default to gray for common
            if (item.quality === 2) borderColor = '#1eff00'; // Uncommon
            else if (item.quality === 3) borderColor = '#0070dd'; // Rare
            else if (item.quality === 4) borderColor = '#a335ee'; // Epic
            else if (item.quality === 5) borderColor = '#ff8000'; // Legendary
            icon.style.border = `2px solid ${borderColor}`;
            name.textContent = item.name || '';
            // Set gear name color class based on quality
            let qualityClass = '';
            if (item.quality === 2) qualityClass = 'quality-uncommon';
            else if (item.quality === 3) qualityClass = 'quality-rare';
            else if (item.quality === 4) qualityClass = 'quality-epic';
            else if (item.quality === 5) qualityClass = 'quality-legendary';
            else qualityClass = 'quality-common';
            name.className = `gear-name ${qualityClass}`;
            name.style.color = '';
    }
        // Map slotType to base asset name for rings/trinkets
        function getBaseSlotType(type) {
            if (type === 'ring1' || type === 'ring2') return 'ring';
            if (type === 'trinket1' || type === 'trinket2') return 'trinket';
            return type;
        }

        if (item && item.name === '') {
            // Unequip: reset icon and name to empty state
            if (icon) {
                let emptyIconPath;
                if (slotType === 'race') {
                    emptyIconPath = '../assets/gear-icon/race-empty.jpg';
                } else {
                    const baseType = getBaseSlotType(slotType);
                    emptyIconPath = `../assets/gear-icon/${baseType}-empty.jpg`;
                }
                if (icon.tagName === 'IMG') {
                    icon.src = emptyIconPath;
                } else {
                    icon.style.backgroundImage = `url('${emptyIconPath}')`;
                }
                icon.className = 'gear-icon empty';
                icon.removeAttribute('data-quality');
                // Remove border
                icon.style.border = '';
            }
            // For race slot, clear the name
            if (slotType === 'race' && name) {
                name.textContent = '';
                name.className = 'gear-name quality-common';
            }
        } else {
            if (icon) {
                const baseType = getBaseSlotType(slotType);
                const equippedIconPath = `../assets/gear-icon/${baseType}-equipped.jpg`;
                if (icon.tagName === 'IMG') {
                    icon.src = equippedIconPath;
                } else {
                    icon.style.backgroundImage = `url('${equippedIconPath}')`;
                }
                icon.className = 'gear-icon equipped';
                // Set border color based on item quality
                let borderColor = '';
                if (item.quality) {
                    switch (item.quality) {
                        case 2: borderColor = '#1eff00'; break; // Uncommon
                        case 3: borderColor = '#0070dd'; break; // Rare
                        case 4: borderColor = '#a335ee'; break; // Epic
                        case 5: borderColor = '#ff8000'; break; // Legendary
                        default: borderColor = '';
                    }
                }
                icon.style.border = borderColor ? `2px solid ${borderColor}` : '';
                if (item.quality) {
                    icon.setAttribute('data-quality', item.quality);
                } else {
                    icon.removeAttribute('data-quality');
                }
            }
            if (name) {
                name.textContent = item.name || '';
                // Set gear name color class based on quality
                let qualityClass = '';
                switch (item.quality) {
                    case 2: qualityClass = 'quality-uncommon'; break;
                    case 3: qualityClass = 'quality-rare'; break;
                    case 4: qualityClass = 'quality-epic'; break;
                    case 5: qualityClass = 'quality-legendary'; break;
                    default: qualityClass = 'quality-common';
                }
                name.className = `gear-name ${qualityClass}`;
            }
        }
    // window.gearData is initialized globally below
    if (!window.gearData) window.gearData = {};
    if (item && item.name && item.name !== '') {
        window.gearData[slotType] = { ...item, equipped: true };
    } else {
        window.gearData[slotType] = { name: '', equipped: false };
        // If unequipping race, just call stat update and UI refresh functions
        if (slotType === 'race') {
            if (typeof window.updateCharacterStats === 'function') window.updateCharacterStats();
            if (typeof window.renderStatBlock === 'function' && window.characterStats && window.characterStats.currentStats) window.renderStatBlock(window.characterStats.currentStats);
            if (typeof updateAllDropdownStats === 'function') updateAllDropdownStats();
        }
    }
    if (window.characterStats && typeof window.characterStats.updateAllStats === 'function') {
        window.characterStats.updateAllStats();
    }
    if (window.characterStats && window.characterStats.currentStats && typeof window.renderStatBlock === 'function') {
        window.renderStatBlock(window.characterStats.currentStats);
    }
}

// Use IPC for file operations instead of direct fs access
let ipcRenderer = null;
if (window.require) {
    try {
        ipcRenderer = window.require('electron').ipcRenderer;
    } catch (e) {
        ipcRenderer = null;
    }
}

function safeIpcInvoke(channel, ...args) {
    if (ipcRenderer && typeof ipcRenderer.invoke === 'function') {
        return ipcRenderer.invoke(channel, ...args);
    } else {
        alert('Error: IPC is not available. Please run this app via Electron.');
        return Promise.reject('IPC not available');
    }
}



// Initialize global variables
// window.gearData is initialized here as a global object for equipped items
window.gearData = window.gearData || {};


    // CRIT CALCULATION HELPERS
    function getCritFromAgi(agility, critFromGear = 0, critFromBuffs = 0, critFromTalents = 0) {
        const critFromAgility = (agility * 0.0614) / (1 + agility / 1406.1);
        return critFromAgility + critFromGear + critFromBuffs + critFromTalents;
    }

    function calculateCritFromGear() {
        const equippedItems = Object.values(window.gearData || {});
        let totalCrit = 0;
        equippedItems.forEach(item => {
            if (item.stats && item.stats.meleecrit) {
                totalCrit += Number(item.stats.meleecrit);
            }
        });
        return totalCrit;
    }