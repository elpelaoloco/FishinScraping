import { Browser, BrowserContext, Locator, Page } from 'playwright';
import { text } from 'stream/consumers';
import { RodHandling } from '../exceptions/customs/RodHandlingException';

interface dataPath {
    name:string,
    details:string,
    price:string
} 
const locatorPath =  {
    name: ".product_title",
    details:".woocommerce-product-details__short-description > p:nth-child(1)",
    price:"p.price > span:nth-child(1) > bdi:nth-child(1)"
} 

const getRodsRef = async (page:Page,locator:string) =>{
    let products:Locator[] = await page.locator(locator).all();
    console.log(products,"Products locators")
    let productsUrls = await Promise.all(products.map((item:any)=>item.getAttribute("href")))
    console.log(productsUrls)
    if (productsUrls){
        return productsUrls
    }
    throw new RodHandling("GetRodsRef Error")
}
const getRodData = async (locatorPath:dataPath,page:Page) =>{
    let data:dataPath = {    
        name: "",
        details:"",
        price:""
    }
    Object.keys(locatorPath).forEach( async (key:string)=>{
        let textInfo = await page.$eval(locatorPath.name,(item:HTMLElement)=>item.textContent?.trim())
        if (textInfo){
            data[key as keyof dataPath] = textInfo;
        }
        throw new RodHandling("GetRodData Error")
    })
    return data;
}

const playwright = require("playwright");
(async () => {
    for (const browserType of ['chromium']) {
        console.log(`Lanzando navegador: ${browserType}`);
        const browser:Browser = await playwright[browserType].launch();
        const context:BrowserContext = await browser.newContext();
        const page:Page = await context.newPage();
        console.log(`Navegando a https://equipesca.cl/categoria-producto/canas-de-pesca/ en ${browserType}`);
        await page.goto("https://equipesca.cl/categoria-producto/canas-de-pesca/?per_page=300");
        let card = "div.wd-product>div"
        try {
            const rodsReferences:string[] = await getRodsRef(page,".product-image-link")
            await rodsReferences.map(async(rodRef:string) => {
                await page.goto(rodRef,{
                    timeout: 60000, 
                     waitUntil: "domcontentloaded",
                })
                return await getRodData(locatorPath,page)
            })
        } catch (BaseRodHandlingException) {
            throw Error
        }
        const text = await page.$eval(".woocommerce-product-details__short-description > p:nth-child(1)", (element: HTMLElement) => element.textContent?.trim());
        console.log("Texto del elemento:", text);
        console.log(`Tomando captura de pantalla: nodejs_${browserType}.png`);
        await page.screenshot({ path: `nodejs_${browserType}.png`, fullPage: true });
        await page.waitForTimeout(1000);
        console.log(`Cerrando navegador: ${browserType}`);
        await browser.close();
    }
})();


