import fs from 'fs';
import { Mem } from './types/mem';

export const readMemsJSON = (log = false): Mem[] => {
	const data = fs.readFileSync('mems.json', 'utf8');
	const parsedJSON = JSON.parse(data);

	if (log) console.log(JSON.stringify(parsedJSON, null, 2));

	return parsedJSON;
};

export const writeMemsToMd = (mems: Mem[]): void => {
	if (!fs.existsSync(__dirname + '/../memMDOutput')) {
		fs.mkdirSync(__dirname + '/../memMDOutput');
	}

	fs.readdirSync(__dirname + '/../memMDOutput').forEach((file) => {
		fs.unlinkSync(__dirname + `/../memMDOutput/${file}`);
	});

	mems.forEach((mem) => {
		let { title, markdown } = mem;

		title = removeIllegalTitleChars(title.trim());
		markdown = markdown.trim();

		fs.writeFileSync(__dirname + `/../memMDOutput/${title}.md`, markdown);
	});
};

const removeIllegalTitleChars = (title: string): string => {
	return title
		.replace(/[/\\?%*:|"<>#]/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 50)
		.trim();
};
