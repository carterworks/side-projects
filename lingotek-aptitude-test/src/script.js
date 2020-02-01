/**
 * I wrap my code in an anonmyous function so as not to pollute the global namespace of the page.
 */
(function () {
	const languageList = document.getElementById("languages");
	const url = "http://gmc.lingotek.com/language";
	fetch(url)
		.then(response => {
			return response.json();
		})
		.then(languages => {
			const elements = Object.values(languages)
				.map(language => language.language)
				.map(language => {
					const li = document.createElement('li');
					li.innerHTML = language;
					return li;
				});
			elements.forEach(language => {
				console.log(language);
				languageList.appendChild(language);
			});
			return languages;
		})
})()