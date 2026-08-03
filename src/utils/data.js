import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export { ICONS, getTagColor, getTextBlocks } from '../scripts/common.js';

export function getPortfolioData() {
    const filePath = path.resolve(process.cwd(), 'src/data/works.yaml');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
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
