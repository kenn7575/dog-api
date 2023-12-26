import type { PageLoad } from './$types';

export const load = (async () => {
	const breedsRef = await fetch('https://dog.ceo/api/breeds/list/all');

	const breeds = await breedsRef.json();

	//get the keys of the breeds object and return them as an array
	const breedArray = Object.keys(breeds.message);

	/* format
		[
			{breed: 'affenpinscher', subBreeds: []},
		]
	*/

	//map the breed array into an array of objects
	const breedObjects = breedArray.map((breed) => {
		return { breed: breed, subBreeds: breeds.message[breed] ?? [] };
	});

	return { breeds: breedObjects };
}) satisfies PageLoad;
