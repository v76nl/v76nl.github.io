import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export { ICONS, getTagColor, getTextBlocks } from '../scripts/common.js';

function loadYamlData(filename) {
    const filePath = path.resolve(process.cwd(), `src/data/${filename}`);
    if (!fs.existsSync(filePath)) return {};
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents) || {};
}

export function getPortfolioData() {
    const profileData = loadYamlData('profile.yaml');
    const orgsData = loadYamlData('organizations.yaml');
    const worksData = loadYamlData('works.yaml');
    const skillsData = loadYamlData('skills.yaml');

    return {
        profile: profileData.profile || profileData,
        organizations: orgsData.organizations || [],
        works: worksData.works || [],
        skills: skillsData.skills || [],
    };
}

export function getUnivExtensionsData() {
    const filePath = path.resolve(
        process.cwd(),
        'src/data/univ-extensions.yaml'
    );
    if (!fs.existsSync(filePath)) return { extensions: [] };
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
}
