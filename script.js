const currencySelect = document.getElementById('currency-select')
const chartContainer = document.querySelector('.chart-container')
const chart = document.getElementById('chart').getContext('2d')
let chartData, myChart

// funkcja pobierająca dane z API NBP i tworząca wykres
async function getChartData(currency) {
	const endDate = new Date().toISOString().split('T')[0]
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
	const apiUrl = `https://api.nbp.pl/api/exchangerates/rates/a/${currency}/${startDate}/${endDate}/?format=json`

	try {
		const response = await fetch(apiUrl)
		const data = await response.json()

		chartData = {
			labels: data.rates.map(rate => rate.effectiveDate),
			datasets: [
				{
					label: `Kurs ${currency} w ostatnim miesiącu`,
					backgroundColor: 'rgba(103, 216, 197, 0.2)',
					borderColor: 'rgba(103, 216, 197, 1)',
					borderWidth: 1,
					data: data.rates.map(rate => rate.mid),
				},
			],
		}

		return chartData
	} catch (error) {
		console.log(error)
	}
}

function displayChart() {
	if (chartData) {
		chartContainer.style.display = 'block'
		if (myChart) {
			myChart.destroy()
		}
		myChart = new Chart(chart, {
			type: 'line',
			data: chartData,
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: false,
							},
						},
					],
				},
			},
		})
	}
}

// funkcja pobierająca aktualne kursy walut i wyświetlająca je w tabeli
async function getCurrentRates() {
	const currencies = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'BRL', 'CNY', 'SEK', 'NZD']
	const apiUrl = `https://api.nbp.pl/api/exchangerates/tables/a/?format=json`

	try {
		const response = await fetch(apiUrl)
		const data = await response.json()

		const currencyTable = document.getElementById('currency-table')
		currencies.forEach(currency => {
			const rate = data[0].rates.find(item => item.code === currency)
			const rateCell = document.getElementById(`${currency}-rate`)
			rateCell.textContent = rate.mid.toFixed(4)
		})
	} catch (error) {
		console.log(error)
	}
}

// obsługa zdarzenia zmiany wyboru waluty
currencySelect.addEventListener('change', async () => {
	const currency = currencySelect.value
	chartContainer.style.display = 'none'
	event.preventDefault()
	await getChartData(currency)
	displayChart()
})

// pobranie aktualnych kursów walut i wyświetlenie ich w tabeli
getCurrentRates()

function exchange() {
	const currency = document.getElementById('currency').value
	const pln = document.getElementById('pln').value

	fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currency}/?format=json`)
		.then(response => response.json())
		.then(data => {
			const rate = data.rates[0].mid
			const result = pln / rate
			alert(`Wymieniłeś ${pln} PLN na ${result.toFixed(2)} ${currency}\n`)
		})
		.catch(error => {
			console.log(error)
			alert('Wystąpił błąd podczas pobierania kursu waluty. Spróbuj ponownie później.')
		})
}
