const fs = require('fs');
const path = require('path');

console.log('Setting up build environment...');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('Created dist directory');
}

const savedPresetsDir = path.join(__dirname, 'Data', 'saved_presets');
if (!fs.existsSync(savedPresetsDir)) {
    fs.mkdirSync(savedPresetsDir, { recursive: true });
    console.log('Created Data/saved_presets directory');
    
    fs.writeFileSync(path.join(savedPresetsDir, '.gitkeep'), '# Keep this directory\n# User-saved preset files will be stored here\n');
    console.log('Created .gitkeep file in saved_presets directory');
}

const samplePresetPath = path.join(savedPresetsDir, 'sample-preset.json');
if (!fs.existsSync(samplePresetPath)) {
    const samplePreset = {
        helmet: { name: '', equipped: false },
        neck: { name: '', equipped: false },
        shoulders: { name: '', equipped: false },
        cloak: { name: '', equipped: false },
        chest: { name: '', equipped: false },
        wrist: { name: '', equipped: false },
        gloves: { name: '', equipped: false },
        belt: { name: '', equipped: false },
        pants: { name: '', equipped: false },
        boots: { name: '', equipped: false },
        ring1: { name: '', equipped: false },
        ring2: { name: '', equipped: false },
        trinket1: { name: '', equipped: false },
        trinket2: { name: '', equipped: false },
        mainhand: { name: '', equipped: false },
        offhand: { name: '', equipped: false },
        libram: { name: '', equipped: false },
        race: null
    };
    
    fs.writeFileSync(samplePresetPath, JSON.stringify(samplePreset, null, 2));
    console.log('Created sample preset file');
}

console.log('Build environment ready!');
