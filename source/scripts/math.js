// Stat Equation Functions for TWoW Paladin Simulator

function calculateHealthFromStamina(stamina) {
    // 1 stamina = 10 health
    return stamina * 10;
}

function calculateManaFromIntellect(intellect) {
    // 1 intellect = 15 mana
    return intellect * 15;
}

function calculateSpellCritFromIntellect(intellect) {
    // 1 intellect = 0.04% spell crit
    return intellect * 0.04;
}

function calculateBlockValueFromStrength(strength) {
    // 1 block value per 20 strength (rounded down)
    return Math.floor(strength / 20);
}

function calculateMP5FromSpirit(spirit) {
    // Formula: MP5 = floor((75.0 * spirit) / (spirit + 125.0))
    const mp5FromSpirit = (75.0 * spirit) / (spirit + 125.0);
    return Math.floor(mp5FromSpirit);
}


// Full dodge formula with diminishing returns, defense, gear, and talents
function calculateDodgeFromAgilityDirect(agility) {
    return (agility * 0.0607) / (1 + agility / 1406.1);
}

// Hit calculation with cap including weapon skill subtraction
function calculateHitWithCap(hitRating, baseHit = 0, talentBonus = 0, weaponSkill = 300) {    
    // Calculate total hit percentage
    const totalHit = baseHit + hitFromRating + talentBonus;
    
    // Base hit cap is 8%, but weapon skill reduces it
    const baseHitCap = 8.0;
    
    const weaponSkillAbove300 = Math.max(0, weaponSkill - 300);
    
    const cappedWeaponSkillBonus = Math.min(weaponSkillAbove300, 15);
    
    // Each point of weapon skill above 300 reduces hit cap by 0.04%
    const hitCapReduction = cappedWeaponSkillBonus * 0.04;
    
    // Calculate actual hit cap (minimum 0%)
    const actualHitCap = Math.max(baseHitCap - hitCapReduction, 0.0);
    
    const isOverCap = totalHit > actualHitCap;
    const wastedHit = isOverCap ? totalHit - actualHitCap : 0;
    
    return {
        hitPercentage: totalHit,
        isOverCap: isOverCap,
        wastedHit: wastedHit,
        hitCap: actualHitCap,
        weaponSkill: weaponSkill,
        hitCapReduction: hitCapReduction,
        warning: isOverCap ? `Warning: ${wastedHit.toFixed(2)}% hit over the ${actualHitCap.toFixed(2)}% cap is wasted!` : null
    };
}

function calculateAttackPowerFromStrength(strength) {
    // 1 strength = 2 attack power
    return strength * 2;
}

function calculateBlockValueFromStrength(strength) {
    // 1 strength = 0.05 block value
    return strength * 0.05;
}

function calculateMeleeCritFromAgility(agility) {
    // 1 agility = 0.04% melee crit
    return agility * 0.04;
}

function calculateEffectiveDodge(dodgeFromGear, verticalStretch = 1.0, horizontalShift = 0.0) {
    // Formula effectiveDodge = dodgeFromGear / (dodgeFromGear * verticalStretch + horizontalShift)
    const denominator = dodgeFromGear * verticalStretch + horizontalShift;
    
    // Prevent division by zero
    if (denominator === 0) {
        return 0;
    }
    
    return dodgeFromGear / denominator;
}

function calculateCriticalStrikeDamage(baseDamage, isCrit = false, critMultiplier = 2.0) {
    if (isCrit) {
        return baseDamage * critMultiplier;
    }
    return baseDamage;
}

function calculateDamageWithCrit(baseDamage, critChance, critMultiplier = 2.0) {
    // Generate random number to determine if attack crits
    const randomRoll = Math.random() * 100;
    const isCrit = randomRoll <= critChance;
    
    // Calculate final damage
    const finalDamage = calculateCriticalStrikeDamage(baseDamage, isCrit, critMultiplier);
    
    return {
        baseDamage: baseDamage,
        finalDamage: finalDamage,
        isCrit: isCrit,
        critChance: critChance,
        critMultiplier: critMultiplier,
        bonusDamage: isCrit ? finalDamage - baseDamage : 0
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateHealthFromStamina,
        calculateManaFromIntellect,
        calculateSpellCritFromIntellect,
        calculateMP5FromSpirit,
        calculateHitWithCap,
        calculateAttackPowerFromStrength,
        calculateBlockValueFromStrength,
        calculateDodgeFromAgilityDirect,
        calculateMeleeCritFromAgility,
        calculateEffectiveDodge,
        calculateCriticalStrikeDamage,
        calculateDamageWithCrit
    };
}

if (typeof window !== 'undefined') {
    window.calculateHealthFromStamina = calculateHealthFromStamina;
    window.calculateManaFromIntellect = calculateManaFromIntellect;
    window.calculateMP5FromSpirit = calculateMP5FromSpirit;
    window.calculateHitWithCap = calculateHitWithCap;
    window.calculateAttackPowerFromStrength = calculateAttackPowerFromStrength;
    window.calculateBlockValueFromStrength = calculateBlockValueFromStrength;
    window.calculateCriticalStrikeDamage = calculateCriticalStrikeDamage;
    window.calculateDamageWithCrit = calculateDamageWithCrit;
    window.calculateCriticalStrikeDamage = calculateCriticalStrikeDamage;
    window.calculateDamageWithCrit = calculateDamageWithCrit;
}
