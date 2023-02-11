import { Mem } from './types/mem';
import { TAGS, EXCLUSIVE_TAGS, PRIORITIZED_TAGS } from './data/tags';

export const parseMem = (memJSON: Mem): Mem => {
	const { title, markdown, tags, ...rest } = memJSON;

	const aliasedTags = aliasTags(tags);
	const formattedTags = formatTags(aliasedTags);

	// replace "**Status: **" with "**Status**: "
	let parsedMarkdown = markdown.trim();
	parsedMarkdown = markdown.replace(/\*\*Status: \*\*/g, '**Status**: ');

	// remove all text between "**Tags**: " and "**Related**:"
	const startIndex = parsedMarkdown.indexOf('**Tags**:');
	const endIndex = parsedMarkdown.indexOf('**Related**:');

	parsedMarkdown =
		parsedMarkdown.slice(0, startIndex + 9) +
		` ${formattedTags}\n` +
		parsedMarkdown.slice(endIndex);

	// remove all text before "**Tags**: "
	parsedMarkdown = parsedMarkdown.slice(startIndex);

	// add '___' at the first line after "**Status**: ..."
	parsedMarkdown = parsedMarkdown.replace(/\*\*Status\*\*:.*\n/g, (match) => match + '___\n');
	parsedMarkdown = parsedMarkdown.replace(/\*\*Status:\*\*.*\n/g, (match) => match + '___\n');

	// remove any leading "\n" with regex
	parsedMarkdown = parsedMarkdown.replace(/^\n/g, '');

	let parsedTitle = title;

	if (!parsedMarkdown) {
		parsedMarkdown = title;
		parsedTitle = parsedTitle.substring(0, 50).trim();
	}

	return {
		...rest,
		markdown: parsedMarkdown,
		tags,
		title: parsedTitle,
	};
};

export const removeInvalidMems = (mems: Mem[]): Mem[] => {
	return mems.filter((mem) => {
		const { title, markdown } = mem;

		if (title === '' || title.length === 1) {
			return false;
		}
		if (markdown === '') {
			return false;
		}

		return true;
	});
};

const formatTags = (tags: string[]): string => {
	// sort by alphabetical order
	let sortedTags = tags.sort((tagA, tagB) => {
		if (tagA < tagB) {
			return -1;
		} else if (tagA > tagB) {
			return 1;
		}

		return 0;
	});

	// reorder by PRIORITIZED_TAGS
	sortedTags = sortedTags.sort((tagA, tagB) => {
		const tagAPriority = PRIORITIZED_TAGS.indexOf(tagA);
		const tagBPriority = PRIORITIZED_TAGS.indexOf(tagB);

		if (tagAPriority > tagBPriority) {
			return -1;
		} else if (tagAPriority < tagBPriority) {
			return 1;
		}

		return 0;
	});

	return sortedTags.join(', ');
};

const aliasTags = (tags: string[]): string[] => {
	tags = tags.reduce((acc, tag) => {
		tag = tag.toLowerCase();
		if (tag in TAGS) {
			acc.push(TAGS[tag]);
		}

		return acc;
	}, []);

	tags = [...new Set(tags)];

	// remove exclusive tags
	// If a tag is exclusive, it will be removed if another tag within the same exclusive group is present
	tags = tags.filter((tag) => {
		if (tag in EXCLUSIVE_TAGS) {
			const exclusiveGroup = EXCLUSIVE_TAGS[tag];

			for (let i = 0; i < exclusiveGroup.length; i++) {
				const exclusiveTag = exclusiveGroup[i];

				if (tags.includes(exclusiveTag)) {
					return false;
				}
			}
		}

		return true;
	});

	return tags;
};
