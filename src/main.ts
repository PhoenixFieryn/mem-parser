import { readMemsJSON, writeMemsToMd } from './utils';
import { parseMem, removeInvalidMems } from './mem';

const convertMemsToCraftMd = () => {
	const mems = readMemsJSON();
	const parsedMems = mems.map(parseMem);
	const validMems = removeInvalidMems(parsedMems);
	writeMemsToMd(validMems);

	// console.log(JSON.stringify(validMems, null, 2));
};

convertMemsToCraftMd();
