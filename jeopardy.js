// Jeopardy Game Board exercise
let categories = [];
let $board = $('#board');

// ↓↓↓ Returns an array of 75 category IDs under the variable name 'categories'
// Shuffle callback, return array with 6 IDs

async function getCategoryIds() {
	let res = await axios.get('https://jservice.io/api/categories', { params: { count: 75 } });

	for (let category of res.data) {
		categories.push(category.id);
	}
	shuffleIds(categories);
	let shuffCat = categories.slice(0, 6);
	categories = shuffCat;
	return categories;
}

//  ↓↓↓ Shuffle callback to rearrange 75 returned categories each time
// Used code from Fisher-Yates Shuffle, https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

function shuffleIds(arr) {
	let currentIdx = arr.length,
		randomIdx;
	while (currentIdx != 0) {
		randomIdx = Math.floor(Math.random() * currentIdx);
		currentIdx--;
		[
			arr[currentIdx],
			arr[randomIdx]
		] = [
			arr[randomIdx],
			arr[currentIdx]
		];
	}
	return arr;
}

// ↓↓↓Return object with data about a category↓↓↓:
// {title: category title, clues: [clue 1 - clue 5]}

async function getCategory(catId) {
	let res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
	let catTitle = res.data.title;
	let clueList = res.data.clues;
	let randomClues = _.sampleSize(clueList, 5);
	let clues = randomClues.map((clue) => ({
		question: clue.question,
		answer: clue.answer,
		showing: null
	}));
	return { title: catTitle, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
	$('#board thead').remove();
	$board.append($('<thead>'));
	let $tr = $('<tr>');

	for (let catI = 0; catI < 6; catI++) {
		$tr.append($('<th>').text(categories[catI].title));
	}
	$('#board thead').append($tr);

	$('#board tbody').remove();
	$board.append($('<tbody>'));
	for (let clueI = 0; clueI < 5; clueI++) {
		let $tr = $('<tr>');
		// $('#board tbody').append($('<tr>'));
		for (let catI = 0; catI < 6; catI++) {
			$tr.append($('<td>').attr('id', `${catI}-${clueI}`).text('?'));
		}
		$('#board tbody').append($tr);
	}
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
	let id = evt.target.id;
	let [
		catI,
		clueI
	] = id.split('-');
	let clue = categories[catI].clues[clueI];

	let display;
	if (clue.showing === null) {
		display = clue.question;
		clue.showing = 'question';
	}
	else if (clue.showing === 'question') {
		display = clue.answer;
		clue.showing = 'answer';
	}
	else {
		return;
	}
	$(`#${catI}-${clueI}`).html(display);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
	$('body').append(
		'<div id=loading> <img src="http://www.clker.com/cliparts/5/a/e/d/15162091201946727476jeopardy-game-clipart.hi.png" alt="Loading"></div>'
	);
	$('#board').on('load', hideLoadingView());
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
	$('#loading').fadeOut(1500, function() {
		$('#loading').remove();
	});
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
	showLoadingView();
	let catIds = await getCategoryIds();
	categories = [];
	for (let catId of catIds) {
		categories.push(await getCategory(catId));
	}
	fillTable();
}

/** On click of start / restart button, set up game. */

$('#restart').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */
$(async function() {
	setupAndStart();
	$('#board').on('click', 'td', handleClick);
});
