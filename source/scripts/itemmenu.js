// DEBUG: Confirm script loaded
console.log('[DEBUG] itemmenu.js script loaded');

// Wire up gear slot event listeners after DOM is updated
window.wireGearSlotEvents = function() {
    const gearSlots = document.querySelectorAll('.gear-slot');
    console.log('[DEBUG] wireGearSlotEvents: Number of gear slots found:', gearSlots.length, gearSlots);
    gearSlots.forEach(slot => {
        const gearIcon = slot.querySelector('.gear-icon');
        // Get slotType from data-slot attribute or class
        let slotType = slot.getAttribute('data-slot');
        if (!slotType) {
            // Try to extract from class name (e.g., gear-helmet)
            const match = slot.className.match(/gear-([a-z0-9]+)/);
            slotType = match ? match[1] : null;
        }
        if (gearIcon && slotType) {
            console.log('[DEBUG] wireGearSlotEvents: Attaching click event to gear icon for slot:', slotType);
            gearIcon.addEventListener('click', ((slotTypeCopy, slotCopy) => function(e) {
                console.log('[DEBUG] wireGearSlotEvents: Gear icon clicked for slot:', slotTypeCopy);
                e.preventDefault();
                e.stopPropagation();
                console.log('[DEBUG] Gear icon clicked:', slotType, slot, newGearIcon, 'Event:', e);
                if (typeof showItemMenu === 'function') {
                    console.log('[DEBUG] Calling showItemMenu for slot:', slotType);
                    // Get items for this slot
                    const items = getItemsForSlot(slotType);
                    showItemMenu(slot, slotType, items);
                } else {
                    console.error('[DEBUG] showItemMenu is not defined');
                }
            })(slotType, slot));
        } else {
            console.log('[DEBUG] wireGearSlotEvents: No gear icon or slotType found in slot:', slot.className);
        }
    });
}

// Returns the array of items for a given slot type from the item database
function getItemsForSlot(slotType) {
    // Special handling for race slot
    if (slotType === 'race') {
        return window.raceDatabase && Array.isArray(window.raceDatabase) ? window.raceDatabase : [];
    }
    // Map slotType to item class name
    let className = '';
    switch (slotType) {
        case 'shoulders':
            className = 'Shoulder';
            // Top-level implementation for showItemMenu
            break;
        case 'wrist':
            className = 'Bracer';
            break;
        case 'ring1':
        case 'ring2':
            className = 'Ring';
            break;
        case 'trinket1':
        case 'trinket2':
            className = 'Trinkets';
            break;
        case 'mainhand':
            className = 'Weapons';
            break;
        case 'offhand':
            className = 'Off-Hands';
            break;
        default:
            className = slotType.charAt(0).toUpperCase() + slotType.slice(1);
            break;
    }
    if (!window.itemDatabase || !Array.isArray(window.itemDatabase)) return [];
    const category = window.itemDatabase.find(cat => cat.Class === className);
    return category && Array.isArray(category.items) ? category.items : [];
}

let currentSlot = null;

const slotMapping = {
    helmet: 'Helmet',
    neck: 'Neck',
    shoulders: 'Shoulders',
    cloak: 'Cloak',
    chest: 'Chest',
    wrist: 'Wrist',
    gloves: 'Gloves',
    belt: 'Belt',
    pants: 'Pants',
    boots: 'Boots',
    ring1: 'Ring',
    ring2: 'Ring',
    trinket1: 'Trinket',
    trinket2: 'Trinket',
    mainhand: 'MainHand',
    offhand: 'OffHand',
    libram: 'Libram'
};

function getItemDatabase() {
    if (window.itemDatabase && Array.isArray(window.itemDatabase) && window.itemDatabase.length > 0) {
        return window.itemDatabase;
    }
    if (typeof itemDatabase !== 'undefined' && Array.isArray(itemDatabase) && itemDatabase.length > 0) {
        return itemDatabase;
    }
    return [];
}

async function ensureItemDatabaseLoaded() {
    if (!window.itemDatabase || !Array.isArray(window.itemDatabase) || window.itemDatabase.length === 0) {
        if (typeof loadItemDatabase === 'function') {
            await loadItemDatabase();
        }
    }
}

async function loadItemDatabase() {
    try {
        const response = await fetch('../Data/Database/Items.json');
        if (!response.ok) throw new Error('Failed to fetch Items.json');
        const data = await response.json();
        itemDatabase = data;
    } catch (e) {
        console.error('Error loading item database:', e);
    }
}

function showFilterMenu(slotType, slotElement, items) {
    console.log('[DEBUG] showItemMenu called for slot:', slotType, 'slotElement:', slotElement);
    removeItemMenu();
    currentSlot = slotElement;
    // Use the items parameter directly
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'item-popup';
    popup.className = 'item-popup';
    popup.style.position = 'fixed';
    popup.style.zIndex = '10000';
    popup.style.background = '#222';
    popup.style.border = '2px solid #ffd700';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 2px 16px #000';
    popup.style.padding = '24px';
    popup.style.minWidth = '600px';
    popup.style.maxWidth = '900px';
    popup.style.maxHeight = '750px';
    popup.style.overflowY = 'auto';
    // Title
    const popupTitle = document.createElement('div');
    popupTitle.className = 'popup-title';
    popupTitle.textContent = `Select Item for ${slotType.charAt(0).toUpperCase() + slotType.slice(1)}`;
    popupTitle.style.fontWeight = 'bold';
    popupTitle.style.fontSize = '22px';
    popupTitle.style.color = '#ffd700';
    popupTitle.style.marginBottom = '16px';
    popup.appendChild(popupTitle);
    // Debug border for popup
    popup.style.border = '4px solid red'; // Make border red for debugging
    console.log('[DEBUG] Popup created and styled:', popup);
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '12px';
    closeBtn.style.right = '18px';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#ffd700';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = removeItemMenu;
    popup.appendChild(closeBtn);
    // Item list
    const itemList = document.createElement('div');
    itemList.id = 'item-list';
    itemList.className = 'item-list';
    if (!items || items.length === 0) {
        const noItemsMsg = document.createElement('div');
        noItemsMsg.textContent = 'No items available for this slot.';
        noItemsMsg.style.color = '#ffd700';
        noItemsMsg.style.fontSize = '18px';
        noItemsMsg.style.textAlign = 'center';
        itemList.appendChild(noItemsMsg);
    } else {
        items.forEach(item => {
            const itemOption = createItemOption(item);
            itemList.appendChild(itemOption);
        });
    }
    popup.appendChild(itemList);
    // Position popup in center
    positionPopup(popup, slotElement);
    document.body.appendChild(popup);
    makeDraggable(popup, popupTitle);
    const existingSubMenu = document.getElementById('sub-filter-menu');
    if (existingSubMenu) {
        existingSubMenu.remove();
    }
    
    const subFilterMenu = document.createElement('div');
    subFilterMenu.id = 'sub-filter-menu';
    subFilterMenu.className = 'sub-filter-menu';
    
    const title = document.createElement('div');
    title.className = 'sub-filter-title';
    title.textContent = categoryName;
    subFilterMenu.appendChild(title);
    
    const categoryStats = getCategoryStats(categoryName);
    
    categoryStats.forEach(stat => {
        const statOption = document.createElement('div');
        statOption.className = 'sub-filter-stat-option';
        statOption.textContent = stat;
        statOption.onclick = () => {
            sortItemsByStat(stat, items);
            subFilterMenu.remove();
            const mainFilterMenu = document.getElementById('filter-menu');
            if (mainFilterMenu) {
                mainFilterMenu.remove();
            }
        };
        subFilterMenu.appendChild(statOption);
    });
    
    const rect = categoryBtn.getBoundingClientRect();
    subFilterMenu.style.position = 'absolute';
    subFilterMenu.style.top = rect.top + 'px';
    subFilterMenu.style.left = rect.right + 10 + 'px';
    subFilterMenu.style.zIndex = '10002';
    
    document.body.appendChild(subFilterMenu);
}

function getCategoryStats(categoryName) {
    const statCategories = {
        'Primary Stats': ['Stamina', 'Spirit', 'Strength', 'Agility', 'Intellect', 'Armor'],
        'Melee Stats': ['Attack Power', 'Melee Crit', 'Melee Hit', 'Armor Pen', 'Melee Haste'],
        'Spell Stats': ['Healing Power', 'Spell Power', 'Spell Pen', 'Spell Hit', 'Spell Crit', 'Spell Haste'],
        'Defensive Stats': ['Defense', 'Block Value', 'Block', 'Parry', 'Dodge'],
        'Resistances': ['Fire Res', 'Nature Res', 'Arcane Res', 'Frost Res', 'Shadow Res'],
        'Weapon Skills': ['Axes', 'Maces', 'Polearms', 'Swords', 'Two-Handed Swords', 'Two-Handed Maces'],
        'Misc Stats': ['Vampirism', 'MP5', 'Spellstrike', 'Thorns']
    };
    
    return statCategories[categoryName] || [];
}

function sortItemsByStat(statName, items) {
    const itemList = document.getElementById('item-list');
    const filtersBtn = document.querySelector('.popup-filters');
    
    if (!itemList) return;
    
    // Update filter button text
    if (filtersBtn) {
        filtersBtn.textContent = `${statName} ▼`;
    }
    
    // Sort items
    const sortedItems = [...items].sort((a, b) => {
        const valueA = getItemStatValue(a, statName);
        const valueB = getItemStatValue(b, statName);
        return valueB - valueA;
    });
    
    // Clear and repopulate list
    itemList.innerHTML = '';
    sortedItems.forEach(item => {
        const itemOption = createItemOption(item);
        itemList.appendChild(itemOption);
    });
}

function getItemStatValue(item, statName) {
    const statMap = {
        'Armor': 'armor',
        'Stamina': 'stamina',
        'Spirit': 'spirit',
        'Strength': 'strength',
        'Agility': 'agility',
        'Intellect': 'intellect',
        'Attack Power': 'attackpower',
        'Melee Hit': 'meleehit',
        'Melee Crit': 'meleecrit',
        'Armor Pen': 'armorpen',
        'Melee Haste': 'meleehaste',
        'Healing Power': 'healingpower',
        'Spell Power': 'spellpower',
        'Spell Pen': 'spellpen',
        'Spell Hit': 'spellhit',
        'Spell Crit': 'spellcrit',
        'Spell Haste': 'spellhaste',
        'Defense': 'defense',
        'Block Value': 'blockvalue',
        'Block': 'block',
        'Parry': 'parry',
        'Dodge': 'dodge',
        'Fire Res': 'fireresist',
        'Nature Res': 'natureresist',
        'Arcane Res': 'arcaneresist',
        'Frost Res': 'frostresist',
        'Shadow Res': 'shadowresist',
        'Axes': 'axes',
        'Maces': 'maces',
        'Polearms': 'polearms',
        'Swords': 'swords',
        'Two-Handed Swords': 'twohandedswords',
        'Two-Handed Maces': 'twohandedmaces',
        'Vampirism': 'vampirism',
        'MP5': 'mp5',
        'Spellstrike': ['spellstrike', 'arcanespellstrike', 'firespellstrike', 'naturespellstrike', 'shadowspellstrike', 'frostspellstrike'],
        'Thorns': ['thorns', 'arcanethorns', 'firethorns', 'naturethorns', 'shadowthorns', 'frostthorns']
    };
    
    const statKey = statMap[statName];
    if (!statKey) return 0;
    
    // Handle array of stat keys (for aggregated stats like thorns and spellstrike)
    if (Array.isArray(statKey)) {
        let total = 0;
        statKey.forEach(key => {
            total += Number(item[key]) || 0;
        });
        return total;
    }
    
    return Number(item[statKey]) || 0;
}

function getWeaponDisplayType(item) {
    if (!item.type) return '';
    if (item.slot && typeof item.slot === 'string' && item.slot.toLowerCase().includes('two-hand')) {
        if (item.type === 'Axe') return '';
        return `${item.type} (2H)`;
    }
    return item.type;
}

function createItemTypeFilters(slotType, items) {
    const container = document.createElement('div');
    container.className = 'item-type-filter-container';
    
    let filterOptions = [];
    let title = '';
    
    const armorSlots = ['helmet', 'shoulders', 'chest', 'wrist', 'gloves', 'belt', 'pants', 'boots'];
    
    if (armorSlots.includes(slotType)) {
        title = 'Armor Type:';
        const availableTypes = [...new Set(items.map(item => item.type).filter(type => type))];
        const armorTypes = ['Plate', 'Mail', 'Leather', 'Cloth'];
        filterOptions = armorTypes.filter(type => availableTypes.includes(type));
    } else if (slotType === 'mainhand') {
        title = 'Weapon Type:';
        let availableTypes = [...new Set(items.map(getWeaponDisplayType).filter(type => type))];
        availableTypes = availableTypes.filter(type => type !== 'Axe (2H)');
        filterOptions = availableTypes;
    } else if (slotType === 'offhand') {
        title = 'Off-Hand Type:';
        const availableTypes = [...new Set(items.map(item => item.type).filter(type => type))];
        const offhandTypes = ['Shield', 'Off-Hand'];
        filterOptions = offhandTypes.filter(type => availableTypes.includes(type));
    }
    
    if (filterOptions.length === 0) {
        return null;
    }
    
    const titleElement = document.createElement('div');
    titleElement.className = 'item-type-filter-title';
    titleElement.textContent = title;
    container.appendChild(titleElement);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'item-type-filter-buttons';
    
    const allBtn = document.createElement('button');
    allBtn.className = 'item-type-filter-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => {
        setActiveItemTypeFilter(allBtn);
        applyItemTypeFilter(null);
    };
    buttonsContainer.appendChild(allBtn);
    
    // Create buttons for each item type
    filterOptions.forEach(itemType => {
        const btn = document.createElement('button');
        btn.className = 'item-type-filter-btn';
        btn.textContent = itemType;
        btn.onclick = () => {
            setActiveItemTypeFilter(btn);
            applyItemTypeFilter(itemType);
        };
        buttonsContainer.appendChild(btn);
    });
    
    container.appendChild(buttonsContainer);
    return container;
}

// Set active item type filter button
function setActiveItemTypeFilter(activeBtn) {
    const container = activeBtn.parentElement;
    const allButtons = container.querySelectorAll('.item-type-filter-btn');
    
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Apply item type filter
function applyItemTypeFilter(itemType) {
    const itemList = document.getElementById('item-list');
    if (!itemList) return;
    
    const itemOptions = itemList.querySelectorAll('.item-option');
    
    itemOptions.forEach(option => {
        const itemTypeDisplay = option.querySelector('.item-type-display');
        if (!itemTypeDisplay) return;
        
        const optionItemType = itemTypeDisplay.textContent.trim();
        
        if (itemType === null || optionItemType === itemType) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Apply search filter
function applySearchFilter(searchTerm) {
    const itemList = document.getElementById('item-list');
    if (!itemList) return;
    
    const itemOptions = itemList.querySelectorAll('.item-option');
    
    itemOptions.forEach(option => {
        const itemName = option.querySelector('.item-name');
        if (itemName) {
            const text = itemName.textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            
            // Only show if matches search AND passes item type filter
            const isVisibleByType = option.style.display !== 'none';
            option.style.display = (matchesSearch && (searchTerm === '' || isVisibleByType)) ? 'flex' : 'none';
        }
    });
}

function createItemOption(item) {
    const itemOption = document.createElement('div');
    itemOption.className = 'item-option';
    
    // Create item details
    const itemDetails = document.createElement('div');
    itemDetails.className = 'item-details';
    
    // Create item name row with type on the right
    const itemNameRow = document.createElement('div');
    itemNameRow.className = 'item-name-row';
    
    // Item name with quality color
    const itemName = document.createElement('div');
    itemName.className = `item-name ${getQualityClass(item.quality)}`;
    itemName.textContent = item.name || 'Unknown Item';
    
    // Item type display (show (2H) if slot is Two-Hand)
    const itemType = document.createElement('div');
    itemType.className = 'item-type-display';
    // Use getWeaponDisplayType for mainhand slot, otherwise just item.type
    let displayType = item.type || '';
    if (currentSlot && currentSlot.dataset && currentSlot.dataset.slot === 'mainhand') {
        displayType = getWeaponDisplayType(item);
    }
    itemType.textContent = displayType;

    itemNameRow.appendChild(itemName);
    if (item.type) {
        itemNameRow.appendChild(itemType);
    }
    
    itemDetails.appendChild(itemNameRow);
    
    // Item stats
    const itemStats = document.createElement('div');
    itemStats.className = 'item-stats';
    
    const stats = [];
    if (item.armor) stats.push(`${item.armor} Armor`);
    if (item.stamina) stats.push(`${item.stamina} Stamina`);
    if (item.strength) stats.push(`${item.strength} Strength`);
    if (item.agility) stats.push(`${item.agility} Agility`);
    if (item.intellect) stats.push(`${item.intellect} Intellect`);
    if (item.spirit) stats.push(`${item.spirit} Spirit`);
    if (item.attackpower) stats.push(`${item.attackpower} Attack Power`);
    if (item.meleehit) stats.push(`${item.meleehit}% Melee Hit`);
    if (item.meleecrit) stats.push(`${item.meleecrit}% Melee Crit`);
    if (item.spellpower) stats.push(`${item.spellpower} Spell Power`);
    if (item.spellpen) stats.push(`${item.spellpen} Spell Pen`);
    if (item.healingpower) stats.push(`${item.healingpower} Healing Power`);
    if (item.defense) stats.push(`${item.defense} Defense`);
    if (item.vampirism) stats.push(`${item.vampirism} Vampirism`);
    
    // Aggregate and display thorns variants
    let totalThorns = 0;
    const thornsVariants = [];
    if (item.thorns) { totalThorns += Number(item.thorns); thornsVariants.push('Thorns'); }
    if (item.arcanethorns) { totalThorns += Number(item.arcanethorns); thornsVariants.push('Arcane Thorns'); }
    if (item.firethorns) { totalThorns += Number(item.firethorns); thornsVariants.push('Fire Thorns'); }
    if (item.naturethorns) { totalThorns += Number(item.naturethorns); thornsVariants.push('Nature Thorns'); }
    if (item.shadowthorns) { totalThorns += Number(item.shadowthorns); thornsVariants.push('Shadow Thorns'); }
    if (item.frostthorns) { totalThorns += Number(item.frostthorns); thornsVariants.push('Frost Thorns'); }
    if (totalThorns > 0) stats.push(`${totalThorns} ${thornsVariants.join('/')}`);
    
    // Aggregate and display spellstrike variants
    let totalSpellstrike = 0;
    const spellstrikeVariants = [];
    if (item.spellstrike) { totalSpellstrike += Number(item.spellstrike); spellstrikeVariants.push('Spellstrike'); }
    if (item.arcanespellstrike) { totalSpellstrike += Number(item.arcanespellstrike); spellstrikeVariants.push('Arcane Spellstrike'); }
    if (item.firespellstrike) { totalSpellstrike += Number(item.firespellstrike); spellstrikeVariants.push('Fire Spellstrike'); }
    if (item.naturespellstrike) { totalSpellstrike += Number(item.naturespellstrike); spellstrikeVariants.push('Nature Spellstrike'); }
    if (item.shadowspellstrike) { totalSpellstrike += Number(item.shadowspellstrike); spellstrikeVariants.push('Shadow Spellstrike'); }
    if (item.frostspellstrike) { totalSpellstrike += Number(item.frostspellstrike); spellstrikeVariants.push('Frost Spellstrike'); }
    if (totalSpellstrike > 0) stats.push(`${totalSpellstrike} ${spellstrikeVariants.join('/')}`);
    
    itemStats.textContent = stats.length > 0 ? stats.join(', ') : 'No stats';
    
    itemDetails.appendChild(itemStats);
    itemOption.appendChild(itemDetails);
    
    // Add click handler
    itemOption.onclick = () => {
        selectItem(item, false);
        removeItemMenu();
    };
    
    return itemOption;
}

// Position popup in center of screen with new size
function positionPopup(popup, targetElement) {
    const popupWidth = 900;
    const popupHeight = 750;
    
    const centerX = (window.innerWidth - popupWidth) / 2;
    const centerY = (window.innerHeight - popupHeight) / 2;
    
    popup.style.position = 'fixed';
    popup.style.left = centerX + 'px';
    popup.style.top = centerY + 'px';
    popup.style.width = popupWidth + 'px';
    popup.style.height = popupHeight + 'px';
    popup.style.zIndex = '10000';
}

function makeDraggable(element, handle) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.classList.contains('popup-close')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === handle || handle.contains(e.target)) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
}

function getQualityClass(quality) {
    const qualityMap = {
        1: 'quality-common',
        2: 'quality-uncommon', 
        3: 'quality-rare',
        4: 'quality-epic',
        5: 'quality-legendary'
    };
    return qualityMap[quality] || 'quality-common';
}

function removeItemMenu() {
    const popup = document.getElementById('item-popup');
    if (popup) {
        popup.remove();
    }
    currentSlot = null;
}

function selectItem(item, isEmpty) {
    console.log(`[DEBUG] selectItem called for slot '${currentSlot ? currentSlot.dataset.slot : 'unknown'}', item:`, item, 'isEmpty:', isEmpty);
    if (!currentSlot) return;
    
    const slotType = currentSlot.dataset.slot;

    
    // Check for two-handed weapon conflicts before equipping
    if (!isEmpty && !validateItemEquip(item, slotType)) {
        return; // Validation failed, don't equip
    }
    
    // Use the equipItem function from main.js
    if (typeof equipItem === 'function') {
        equipItem(slotType, item);
    } else {
        console.error('equipItem function not found!');
    }
    
    // Update character stats
    if (typeof updateCharacterStats === 'function') {
        updateCharacterStats();
    } else {
        console.error('updateCharacterStats function not found!');
    }
}

function validateItemEquip(item, slotType) {
    // Check if trying to equip off-hand item when two-handed weapon is equipped
    if (slotType === 'offhand') {
        const mainhandSlot = document.querySelector('.gear-slot[data-slot="mainhand"]');
        if (mainhandSlot) {
            const mainhandIcon = mainhandSlot.querySelector('.gear-icon');
            const mainhandName = mainhandSlot.querySelector('.gear-name');
            
            // Check if mainhand has an equipped item
            if (mainhandIcon && !mainhandIcon.classList.contains('empty') && mainhandName) {
                const mainhandItemName = mainhandName.textContent.trim();
                const mainhandItem = findItemByName(mainhandItemName);
                
                if (mainhandItem && isTwoHandedWeapon(mainhandItem)) {
                    alert(`Cannot equip off-hand item: ${mainhandItem.name} is a two-handed weapon.`);
                    return false;
                }
            }
        }
    }
    
    // Check if trying to equip two-handed weapon when off-hand item is equipped
    if (slotType === 'mainhand' && isTwoHandedWeapon(item)) {
        const offhandSlot = document.querySelector('.gear-slot[data-slot="offhand"]');
        if (offhandSlot) {
            const offhandIcon = offhandSlot.querySelector('.gear-icon');
            const offhandName = offhandSlot.querySelector('.gear-name');
            
            // Check if offhand has an equipped item
            if (offhandIcon && !offhandIcon.classList.contains('empty') && offhandName) {
                const offhandItemName = offhandName.textContent.trim();
                if (offhandItemName && offhandItemName !== 'Off Hand') {
                    alert(`Cannot equip two-handed weapon: Remove ${offhandItemName} from off-hand first.`);
                    return false;
                }
            }
        }
    }
    
    return true;
}

function isTwoHandedWeapon(item) {
    if (!item || !item.type) return false;
    
    const twoHandedTypes = [
        'Two-Hand Sword',
        'Two-Handed Mace',
        'Polearm'
    ];
    
    return twoHandedTypes.includes(item.type);
}

function findItemByName(itemName) {
    const db = getItemDatabase();
    if (!db || db.length === 0) return null;
    for (const category of db) {
        const item = category.items.find(item => item.name === itemName);
        if (item) {
            return item;
        }
    }
    return null;
}

// Ensure mainhand gear icon opens the item menu
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] DOMContentLoaded fired in itemmenu.js');
    const gearSlots = document.querySelectorAll('.gear-slot');
    console.log('[DEBUG] Number of gear slots found:', gearSlots.length, gearSlots);
    gearSlots.forEach(slot => {
        const gearIcon = slot.querySelector('.gear-icon');
        if (gearIcon) {
            console.log('[DEBUG] Attaching click event to gear icon for slot:', slot.className);
            gearIcon.addEventListener('click', function(e) {
                console.log('[DEBUG] Gear icon clicked for slot:', slot.className);
                e.preventDefault();
                e.stopPropagation();
                console.log('[DEBUG] Gear icon clicked:', slotType, slot, newGearIcon, 'Event:', e);
                if (typeof showItemMenu === 'function') {
                    console.log('[DEBUG] Calling showItemMenu for slot:', slotType);
                    showItemMenu(slot, slotType);
                } else {
                    console.error('[DEBUG] showItemMenu is not defined');
                }
            });
        } else {
            console.log('[DEBUG] No gear icon found in slot:', slot.className);
        }
    });
});