const express = require('express')

const app = express()
const port = process.env.PORT || 4000

const puppeteer = require('puppeteer');

const symbols = ['DELTA', 'TU', 'BBL', 'BDMS', 'KBANK', 'KKP', 'KTB', 'LH', 'OR', 'PTT', 'PTTEP', 'PTTGC', 'SCB', 'TCAP', 'TISCO']

async function GetRSIBySymbol(symbol) {
    console.log(symbol)
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://th.tradingview.com/symbols/SET-' + symbol + '/technicals/');
        await page.waitForSelector('.row-hvDpy38G');

        // Replace 'your_selector' with the actual CSS selector for your table row
        const trSelector = '.row-hvDpy38G';

        // Evaluate the page to get all td elements within the specified tr
        const tdElements = await page.evaluate(trSelector => {
            const tr = document.querySelector(trSelector);
            if (tr) {
                // Use spread operator to convert NodeList to an array
                return [...tr.querySelectorAll('td')].map(td => td.innerText.trim());
            } else {
                return null; // Return null if the specified tr is not found
            }
        }, trSelector);
        await browser.close();

        console.log(tdElements[1])

        resolve(tdElements[1]);
    })
}

async function GetAllData() {
    lists = []
    for(let i = 0; i < symbols.length; i++) {
        let item = { symbol: symbols[i] }
        let rsi = await GetRSIBySymbol(symbols[i])
        // console.log(rsi)
        item.rsi = rsi
        lists.push(item)
    }
    
    // await Promise.all(symbols.map(async (ele) => {
    //     let item = { symbol: ele }
    //     let rsi = await GetRSIBySymbol(ele)
    //     // console.log(rsi)
    //     item.rsi = rsi
    //     lists.push(item)
    // }))

    // lists.map(ele => {
    //     console.log('symbol ' + ele.symbol + ' rsi ' + ele.rsi)
    // })
    return lists
}

const row = html => `<tr>\n${html}</tr>\n`,
    heading = object => row(Object.keys(object).reduce((html, heading) => (html + `<th>${heading}</th>`), '')),
    datarow = object => row(Object.values(object).reduce((html, value) => (html + `<td>${value}</td>`), ''));

function htmlTable(dataList) {
    return `<table>
            ${heading(dataList[0])}
            ${dataList.reduce((html, object) => (html + datarow(object)), '')}
          </table>`
}

app.get('/', async (req, res) => {
    console.log('get')
    try {
        let lists = await GetAllData();
        console.log(lists)
        res.send(htmlTable(lists))
    } catch (err) {
        res.send(err);
    }
})

app.listen(port, () => {
    console.log('server running port : ' + port)
})