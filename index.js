/*
// NAME: Market Simulator
// CONTRIBUTORS: Steph Koopmanschap
// VERSION: 1.0
*/

//How fast trades happen in seconds
let simulationSpeed = 1.5;
//A list of all traders
const traders = [];
//A reference of available products on the market
const productsReference = ["potato", "steel", "wool", "wood"];
//A list of all products and their price information
const productsInfo = [];

//Just a different ways to create productsReference
//const productsReferenceEnum = {POTATO: "potato", STEEL: "steel", WOOL: "wool", WOOD: "wood"};
//const productsReferenceEnumTwo = {"1": "potato", "2": "steel", "3": "wool", "4": "wood"};

//HTML
const productInfoContainer = document.querySelector(".productInfoContainer");
for (let i = 0; i < productsReference.length; i++)
{
    const newProductContainer = document.createElement('div');
    newProductContainer.setAttribute('class', "productContainer");
    //Product name
    const newProduct = document.createElement('h4');
    //Product stats
    const productAvrgPrice = document.createElement('p');
    const productMinPrice = document.createElement('p');
    const productMaxPrice = document.createElement('p');
    const productAvrgDeviationFromAvrg = document.createElement('p');
    const productTradingVolume = document.createElement('p');
    const productAmountOffered = document.createElement('p');
    
    productAvrgPrice.innerHTML = `Average Price: <span class="value" id="productAvrgPrice${productsReference[i]}">$0</span>`;
    productMinPrice.innerHTML = `Lowest Price: <span class="value" id="productMinPrice${productsReference[i]}">$0</span>`;
    productMaxPrice.innerHTML = `Highest Price: <span class="value" id="productMaxPrice${productsReference[i]}">$0</span>`;
    productAvrgDeviationFromAvrg.innerHTML = `Deviation: <span class="value" id="productAvrgDeviationFromAvrg${productsReference[i]}">$0</span>`;
    productTradingVolume.innerHTML = `Trading volume: <span class="value" id="productTradingVolume${productsReference[i]}">$0</span>`;
    productAmountOffered.innerHTML = `Total amount offered: <span class="value" id="productAmountOffered${productsReference[i]}">0</span>`;

    newProduct.innerHTML = productsReference[i].toUpperCase();
    newProduct.setAttribute('class', "productTitle");
    
    newProductContainer.appendChild(newProduct);
    
    newProductContainer.appendChild(productAvrgPrice);
    newProductContainer.appendChild(productMinPrice);
    newProductContainer.appendChild(productMaxPrice);
    newProductContainer.appendChild(productAvrgDeviationFromAvrg);
    newProductContainer.appendChild(productTradingVolume);
    newProductContainer.appendChild(productAmountOffered);

    productInfoContainer.appendChild(newProductContainer);
}

//UTILITY FUNCTIONS

function randIntRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloatRange(min, max) {
    return (Math.random() * (max - min + 1) + min);
}

function getRandomString(strLength, numOfStrings=1) {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randStr = "";
    let strArray = [];

    for (let i = 0; i < numOfStrings; i++) {
        for (let i = 0; i < strLength; i++) {
            randStr += chars[Math.floor(Math.random() * chars.length)];
        }
        strArray.push(randStr);
    }
    if (numOfStrings === 1) {
        return strArray[0];
    }
    return strArray;
}

function clock() {

}

class Trader {
    constructor(name, currentMoney) {
        //To identify the owner
        this.name = name;
        //Owned products array of objects
        //object
        //{name: String, stock: Integer}
        this.Ownedproducts = []; 
        this.currentMoney = currentMoney;
        //Owned products array of objects
        //object
        //{name: String, askingPricePerItem: Float amount: Integer}
        this.currentOfferings = [];
    }

    offer(productName, price, amount) {
        marketLog(`${this.name} has started an offer...`);
        const productToBeSold = this.findProduct(productName);
        //Check if owner owns the product
        if (productToBeSold !== null)
        {
            //Check if owner has enough stock of product
            if (productToBeSold.stock > amount) 
            {
                //Offering success
                this.currentOfferings.push({name: productName, askingPricePerItem: price, amount: amount});
                productToBeSold.stock -= amount; //remove traded amount from owner stocks
                marketLog(`Offering listed by ${this.name}. OFFER: ${productName}, price: ${price.toFixed(2)}, amount: ${amount}`);
            }
            //Owner does not have enough stock / supply to sell that amount of products
            else 
            {
                marketLog("---OFFER FAILED---");
                marketLog(`Owner: ${this.name}, tried to offer ${amount} pieces of ${productName}, but ${this.name} does not have enough in stock.`);
                marketLog(`currently in stock: ${productToBeSold.stock}`);
                marketLog("--- END");
            }
        }
        //Owner does not have product being sold
        else 
        {
            marketLog("---OFFER FAILED---");
            marketLog(`Owner: ${this.name}, tried to offer product: ${productName}, but ${this.name} does not own that product`);
            marketLog("--- END");
        }
    }

    //Accept offer from another owner
    //Default margin is 3.5% where a buyer will buy an item for 3.5% higher the price he wants to buy 
    buy(productName, price, amount, margin = 0.035) {
        marketLog(`${this.name} has started a trade...`);
        let buyLimit = price + (price * margin);
        //Check if person has enough money to make this trade
        if (this.currentMoney < buyLimit * amount) 
        {
            return 1;
        }
        //Check every owner
        for (let i = 0; i < traders.length; i++)
        {
            const trader = traders[i];
            //Trade with one self is not allowed
            if (trader.name === this.name) 
            {
                continue;
            }
            const foundOffer = trader.currentOfferings.find((offer) => offer.name === productName);
            if (foundOffer !== undefined)
            {
                //Check price
                if (foundOffer.askingPricePerItem <= buyLimit)
                {
                    //if the buyer wants to buy more than the seller can offer
                    //Then buyer will buy everything
                    marketLog(`Person: ${this.name} wants to buy ${amount} pieces of ${productName} for $ ${buyLimit.toFixed(2)} each or less.`);
                    marketLog(`Person: ${trader.name} offers to sell ${foundOffer.amount} pieces of ${foundOffer.name} for $ ${foundOffer.askingPricePerItem.toFixed(2)} each.`);
                    if (amount >= foundOffer.amount) 
                    {
                        amount = foundOffer.amount;
                    }
                        //Trade success
                        //transfer money
                        let transActedMoney = (foundOffer.askingPricePerItem * amount);
                        this.currentMoney -= transActedMoney;
                        trader.currentMoney += transActedMoney;
                        //give product the the buyer
                        const myProduct = this.findProduct(productName);
                        myProduct.stock += amount;
                        //remove traded amount from offer
                        foundOffer.amount -= amount; 
                        totalTransactions += 1;
                        marketLog("+++TRANSACTION SUCCESS+++");
                        marketLog(`Person: ${this.name} bought ${amount} pieces of ${productName} for $ ${foundOffer.askingPricePerItem.toFixed(2)} each. Total: $ ${transActedMoney.toFixed(2)} from ${trader.name}`);
                        marketLog("+++ END");
                        //If the offer has 0 amount the offer is deleted
                        if (foundOffer.amount <= 0) 
                        {
                            let offeringIndex = trader.currentOfferings.findIndex((offering) => offering.name === foundOffer.name);
                            trader.currentOfferings.splice(offeringIndex, 1);
                            totalOfferingsFulfilled += 1;
                            marketLog(`Offer of ${trader.name} has been fulfilled.`);
                        }
                        //Stop finding new trades once the trade is succesfull.
                        break;
                }
                //Too expensive, no trade.
                else 
                {
                    marketLog("---BUY FAILED---");
                    marketLog(`Person: ${this.name} tried to buy ${productName}, for $ ${buyLimit.toFixed(2)} or less from ${trader.name}, but ${trader.name} offered product for a higher price.`);
                    marketLog("--- END");
                }
            }
            //Product not found
            else 
            {
                marketLog("---BUY FAILED---");
                marketLog(`Person: ${this.name} tried to buy ${productName}, from ${trader.name}, but ${trader.name} does not offer this product.`);
                marketLog("--- END");
            }
        }
    }

    findProduct(name) {
        const foundProduct = this.Ownedproducts.find((product) => product.name === name);
        if (foundProduct !== undefined) {
            return foundProduct;    
        }
        return null;
    }
}

//Market functions
let totalTransactions = 0; //Total succesfull transactions since market started
let totalOfferingsFulfilled = 0; //Total offerings that has been cleared
//Output statistics of the market
function generateStatistics() {
    let totalTraders = traders.length;
    let totalMoney = 0;
    let avrgMoneyPerTrader = 0;
    let totalCurrentOfferings = 0;
    let totalTradingMoney = 0; //The total amount of money in offerings
    let avrgAskingPrice = 0;
    //Used for calculating the minimal and maximum prices of each product
    const allPrices_tmp = [];
    for (let tmp = 0; tmp < productsReference.length; tmp++)
    {
        allPrices_tmp.push(
                        {
                            productRef: productsReference[0].name,
                            allPrices: [],
                        });
    }

    //Statistics per trader
    for (let i = 0; i < traders.length; i++)
    {
        totalMoney += traders[i].currentMoney;
        totalCurrentOfferings += traders[i].currentOfferings.length;
        //Statistics per offering
        for (let j = 0; j < traders[i].currentOfferings.length; j++) 
        {
            totalTradingMoney += traders[i].currentOfferings[j].askingPricePerItem * traders[i].currentOfferings[j].amount;

            //Statistics per product
            for (let k = 0; k < productsInfo.length; k++)
            {
                //Without this if statement all products will have the exact same values/statistics even if they have different names
                if (traders[i].currentOfferings[j].name === productsInfo[k].name) 
                {
                    productsInfo[k].tradingVolume += traders[i].currentOfferings[j].askingPricePerItem;
                    productsInfo[k].amountOffered += traders[i].currentOfferings[j].amount;
                    allPrices_tmp[k].allPrices.push(traders[i].currentOfferings[j].askingPricePerItem);
                } 
            }
        }
    }

    for (let z = 0; z < productsInfo.length; z++)
    {

        //Calculate product statistics
        productsInfo[z].avrgPrice = productsInfo[z].tradingVolume / productsInfo[z].amountOffered;
        productsInfo[z].minPrice = Math.min(...allPrices_tmp[z].allPrices);
        productsInfo[z].maxPrice = Math.max(...allPrices_tmp[z].allPrices);
        productsInfo[z].avrgDeviationFromAvrg = (Math.abs(productsInfo[z].minPrice - productsInfo[z].avrgPrice) +  Math.abs(productsInfo[z].maxPrice - productsInfo[z].avrgPrice)) * 0.5;

        //Render product statistics
        document.getElementById(`productAvrgPrice${productsReference[z]}`).innerHTML = "$" + productsInfo[z].avrgPrice.toFixed(2);
        document.getElementById(`productMinPrice${productsReference[z]}`).innerHTML = "$" + productsInfo[z].minPrice.toFixed(2);
        document.getElementById(`productMaxPrice${productsReference[z]}`).innerHTML = "$" + productsInfo[z].maxPrice.toFixed(2);
        document.getElementById(`productAvrgDeviationFromAvrg${productsReference[z]}`).innerHTML = "$" + productsInfo[z].avrgDeviationFromAvrg.toFixed(2);
        document.getElementById(`productTradingVolume${productsReference[z]}`).innerHTML = "$" + productsInfo[z].tradingVolume.toFixed(2);
        document.getElementById(`productAmountOffered${productsReference[z]}`).innerHTML = productsInfo[z].amountOffered;
    }

    //Overall statistics
    avrgMoneyPerTrader = totalMoney / totalTraders;
    avrgAskingPrice = totalTradingMoney / totalCurrentOfferings;

    document.getElementById("totalTransactions").innerHTML = totalTransactions;
    document.getElementById("totalOfferingsFulfilled").innerHTML = totalOfferingsFulfilled;
    document.getElementById("totalTraders").innerHTML = totalTraders;
    document.getElementById("totalMoney").innerHTML = "$" + totalMoney.toFixed(2);
    document.getElementById("avrgMoneyPerTrader").innerHTML = "$" + avrgMoneyPerTrader.toFixed(2);
    document.getElementById("totalCurrentOfferings").innerHTML = totalCurrentOfferings;
    document.getElementById("totalTradingMoney").innerHTML = "$" + totalTradingMoney.toFixed(2);
    document.getElementById("avrgAskingPrice").innerHTML = "$" + avrgAskingPrice.toFixed(2);

    //STATISTICS TO CONSOLE

    // console.log("=== CURRENT MARKET STATISTICS ===");
    // console.log(`Total succesful transactions since market started: ${totalTransactions}`);
    // console.log(`Total offerings cleared since market started: ${totalOfferingsFulfilled}`)
    // console.log(`Total traders: ${totalTraders}`);
    // console.log(`Total money of all traders combined: $ ${totalMoney.toFixed(2)}`);
    // console.log(`Average money per trader: $ ${avrgMoneyPerTrader.toFixed(2)}`);
    // console.log(`Total offerings: ${totalCurrentOfferings}`);
    // console.log(`Total money being asked in offerings: $ ${totalTradingMoney.toFixed(2)}`);
    // console.log(`Average asking price: $ ${avrgAskingPrice.toFixed(2)}`);
    // console.log("=== END CURRENT STATISTICS ===");
}

//Clear the log cause a big log can cause performance issues
function clearLog() {
    document.querySelector(".log").innerHTML = "";
}

function marketLog(msg) {
    const newLine = document.createElement('li');
    newLine.innerHTML = msg;
    const emptyLine = document.createElement('li');
    emptyLine.innerHTML = "<br />";
    document.querySelector(".log").appendChild(newLine);
    document.querySelector(".log").appendChild(emptyLine);

    // console.log(msg);
}

function initProducts() {
    for (let i = 0; i < productsReference.length; i++)
    {
        productsInfo.push(
            {
                name: productsReference[i], 
                avrgPrice: 0, //tradingVolume / amountOffered
                minPrice: 0,
                maxPrice: 0,
                avrgDeviationFromAvrg: 0, //(Abs(minPrice - avrgPrice) + Abs(maxPrice - avrgPrice)) / 2
                tradingVolume: 0,
                amountOffered: 0,
            }
        );
    }
}

//Create random traders (seed the market)
function initTraders(numberOfTraders) {
    for (let i = 0; i < numberOfTraders; i++)
    {
        //Give the trader a random name and some random money
        traders.push(new Trader(getRandomString(10), randFloatRange(10, 110)));
        //Give the trader some random products to own
        traders[i].Ownedproducts.push({name: "potato", stock: randIntRange(5, 125)});
        traders[i].Ownedproducts.push({name: "steel", stock: randIntRange(5, 125)});
        traders[i].Ownedproducts.push({name: "wool", stock: randIntRange(5, 125)});
        traders[i].Ownedproducts.push({name: "wood", stock: randIntRange(5, 125)});
    }
}

function marketLoop() {
    setTimeout(() => {
        //Start the trades
        for(let i = 0; i < traders.length; i++)
        {
            //marketLog("yo");
            const trader = traders[i];
            //Create offers
            trader.offer(productsReference[randIntRange(0, productsReference.length-1)], randFloatRange(1, 300), randIntRange(1, 100));
            //Create trades
            trader.buy(productsReference[randIntRange(0, productsReference.length-1)], randFloatRange(1, 300),  randIntRange(1, 100));
        }

        marketLoop();
    }, 1000 * simulationSpeed);
}

//Start the market
function initMarket() {
    console.log("Seeding market...");
    //Create products
    initProducts();
    //Create traders
    initTraders(100);
    console.log("Market has been seeded");

    //Generate market statistics every 5 seconds
    let statisticsSchedulerID = setInterval(generateStatistics, 5000);
    //Clear the market log every 25 seconds to increase performance
    let clearLogSchedulerID = setInterval(clearLog, 25000);
    //Start the market trades
    console.log("Starting market...");
    marketLoop();
}

initMarket();
