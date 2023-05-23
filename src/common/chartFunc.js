import { decimalRound, getFromDateTypeToString, getMax, getMin, getSumArray, removeDuplicateArray } from "./commonFunc";

//데이터 재정비
export function getReArrangeData(dataArr){
    const returnArr = [];
    dataArr.forEach((item, idx) => {
        const date = item?.date?.replaceAll(' ','');
        const closePrice = item?.closePrice.replace(/,/g, "")*1;
        const openPrice = item?.openPrice.replace(/,/g, "")*1;
        const highPrice = item?.highPrice.replace(/,/g, "")*1;
        const lowPrice = item?.lowPrice.replace(/,/g, "")*1;
        const amountStr = item?.amount;
        const amountUnit = amountStr[amountStr.length-1];
        let unitNumber;

        if(amountUnit==='K'){unitNumber=1000}
        else if(amountUnit==='M'){unitNumber=1000000}
        else if(amountUnit==='B'){unitNumber=1000000000}
        const amount = decimalRound(amountStr.replace(amountUnit,'')*unitNumber, 0);
        returnArr.push({date,closePrice,openPrice,highPrice,lowPrice,amount})
    })
    return returnArr;
}


////// Daily 데이터를 Month 데이터로 가공
export function changeDateToMonth(dataArr){
    const yyyyMM01Arr = getYYYYMM01(dataArr)
    const returnArr =[];

    yyyyMM01Arr.forEach((item1, idx1)=>{
        //console.log(item1, idx1)
        let tempArr =[];
        dataArr.forEach((item2, idx2)=>{
            const date = item2?.date?.substring(0,4)+'-'+item2?.date?.substring(5,7)+'-01';
            if(item1===date){
                tempArr.push(item2);
            }
        });
        // 매월의 데이터 배열
        //console.log(tempArr);
        const highLowAmount = getMonthHighLowPriceAndAmount(tempArr);
        const openPrice = tempArr[0]?.openPrice;
        const closePrice = tempArr[tempArr.length-1].closePrice;
        const highPrice = highLowAmount.highPrice;
        const lowPrice = highLowAmount.lowPrice;
        const amount = highLowAmount.amount;
        returnArr.push({date:item1, openPrice,closePrice,highPrice,lowPrice,amount})
    });
    return returnArr;
}

export function getYYYYMM01(dataArr){
    let yyyyMM01 = dataArr.reduce((returnArr, item) =>{		
        const date = item?.date?.substring(0,4)+'-'+item?.date?.substring(5,7)+'-01';
        returnArr.push(date);
        return returnArr;																
      },[]);		
    return removeDuplicateArray(yyyyMM01)
}

export function getMonthHighLowPriceAndAmount(dataArr){
    //console.log(dataArr)
    const highPriceArr = dataArr.reduce((returnArr, item) =>{returnArr.push(item.highPrice); return returnArr;},[]);	
    const lowPriceArr = dataArr.reduce((returnArr, item) =>{returnArr.push(item.lowPrice); return returnArr;},[]);	
    const amountArr = dataArr.reduce((returnArr, item) =>{returnArr.push(item.amount); return returnArr;},[]);	
    const highPrice = getMax(highPriceArr);
    const lowPrice = getMin(lowPriceArr);
    const amount = getSumArray(amountArr)
    return {highPrice, lowPrice, amount}
}


//차트용 데이터 정리
export function getCandleChartData(dataArr, cutYear){
    const candleArr = dataArr.reduce((returnArr, item) =>{		
        const date = new Date(item.date).getTime();
        if(item.date.substring(0,4)*1 >=cutYear){
            returnArr.push([date, item.openPrice, item.highPrice, item.lowPrice, item.closePrice]);
        }
        return returnArr;																
      },[]);	
    return candleArr;
}



export function getMovingAverage(dataArr, period, cutYear) {
    const closePriceArr = dataArr.reduce((returnArr, item) =>{returnArr.push(item.closePrice); return returnArr;},[]);	
    let sum = 0;
    let returnArr = [];
  
    for (let i = 0; i < closePriceArr.length; i++) {
        const date = new Date(dataArr[i].date).getTime();
        let dateStr = dataArr[i].date.substring(0,4)*1;
        sum += closePriceArr[i];
        if (i >= period) {
            sum -= closePriceArr[i - period];
            const ma = decimalRound(sum / period, 2)
            if(dateStr>=cutYear){
                returnArr.push([date, ma]);
            }
        }
    }
    return returnArr;
}

export function getVolumeData(dataArr, cutYear){
    const volumeArr = dataArr.reduce((returnArr, item) =>{		
        if(item.date.substring(0,4)*1 >=cutYear){
            const date = new Date(item.date).getTime();
            returnArr.push([date, item.amount]);
        }	
        return returnArr;															
      },[]);	
    return volumeArr;
}

export function fillShortDateForMa(gap, candleArr, maArr){
    let addDataArr = [];
    for(let i=0; i<gap; i++){
        addDataArr.push([candleArr[i][0],undefined]);
    }
    return [...addDataArr, ...maArr]
}


export function getSeparationArr(candleArr, ma60Arr, ma120Arr){
    const multiple = 2;
    let separationUpArr = [];
    let separationDownArr = [];

    ma60Arr.forEach(item=>{
        separationUpArr.push([item[0],decimalRound(item[1]*multiple, 2)])
        separationDownArr.push([item[0],decimalRound(item[1]*multiple*-1, 2)])
    })
return {separationUpArr, separationDownArr}
}


///////////// 저항선 함수 //////////////////
export function getResistanceLineData(ma3Arr, ma24Arr, candleArr){
    //1-1. 1차 상승돌파 날짜 찾기 : 3MA의 종가가 24MA 종가를 상승돌파한 시점(1차 저항선 찾기의 시작점)
    const resBreakPoint1 = getFirstResBreakPoint(ma3Arr, ma24Arr);
    let resBreakPointDate1 = getFromDateTypeToString(new Date(resBreakPoint1.date)).replace('-','').substring(0,6)*1;
    //console.log('1차 상승돌파 날짜', resBreakPointDate1);
    
    //1-2 : 1차 상승돌파 날짜(resBreakPointDate1) 이후 최초로 종가가 시가보다 낮은 시점을 찾아 그 기간중 최고가를 찾는다.
    // => 1차 저항선 가격  및 1차 저항선 가격일자의 날짜
    const {resHighPrice:resHighPrice1, resHighPriceDate:resHighPriceDate1} = getResHighPriceAndDate(resBreakPointDate1, candleArr)
    //console.log('1차저항선 최고가 날짜', resHighPriceDate1, '1차저항선(최고가) 가격', resHighPrice1);


    // //2-1.  2차 상승돌파 날짜 찾기 :  3MA가 1차 저항선 상승 돌파한 날짜(1차 저항선 찾기의 시작점)를 찾는다 
    let resBreakPointDate2 = getResBreakPointDate(resHighPriceDate1, resHighPrice1, ma3Arr);
    //console.log('2차 상승돌파 날짜', resBreakPointDate2);
    
    const {resHighPrice:resHighPrice2, resHighPriceDate:resHighPriceDate2} = getResHighPriceAndDate(resBreakPointDate2, candleArr)
    //console.log('2차저항선 최고가 날짜', resHighPriceDate2, '2차저항선(최고가) 가격', resHighPrice2);


    // //3-1. resBreakPoint3 찾기 : 2차 돌파한 날짜(브레이크 포인트)를 찾는다 
    let resBreakPointDate3 = getResBreakPointDate(resHighPriceDate2, resHighPrice2, ma3Arr);
    //console.log('3차 상승돌파 날짜', resBreakPointDate3);

    const {resHighPrice:resHighPrice3, resHighPriceDate:resHighPriceDate3} = getResHighPriceAndDate(resBreakPointDate3, candleArr)
    //console.log('3차저항선 최고가 날짜', resHighPriceDate3, '3차저항선(최고가) 가격', resHighPrice3);


     //1~3차 저항선 가격으로 라인 데이터를 만들어 리턴한다.
    const resLine1 = [];
    const resLine2= [];
    const resLine3 = [];
    let resInfo =[];
    ma3Arr.forEach((item)=>{
        resHighPrice1 !==0 && resLine1.push([item[0],resHighPrice1])
        resHighPrice2 !==0 && resLine2.push([item[0],resHighPrice2])
        resHighPrice3 !==0 && resLine3.push([item[0],resHighPrice3])
    });

    //info 정보 추가
    resHighPrice1 !==0 && resInfo.push({'breakDate':resBreakPointDate1, 'highPrice':resHighPrice1, 'highPriceDate':resHighPriceDate1})
    resHighPrice2 !==0 && resInfo.push({'breakDate':resBreakPointDate2, 'highPrice':resHighPrice2, 'highPriceDate':resHighPriceDate2})
    resHighPrice3 !==0 && resInfo.push({'breakDate':resBreakPointDate3, 'highPrice':resHighPrice3, 'highPriceDate':resHighPriceDate3})

    return {resLine1, resLine2, resLine3, resInfo};
}


///////////// 지지선 함수 //////////////////
export function getSupportLineData(ma3Arr, ma24Arr, candleArr){
    //1-1. 1차 하락돌파 날짜 찾기 : 3MA의 종가가 24MA 종가를 하락돌파한 시점(1차 지지선 찾기의 시작점)
    const supBreakPoint1 = getFirstSupBreakPoint(ma3Arr, ma24Arr);
    let supBreakPointDate1 = getFromDateTypeToString(new Date(supBreakPoint1.date)).replace('-','').substring(0,6)*1;
    //console.log('1차 하락돌파 날짜', supBreakPointDate1);

    // //1-2 : 1차 하락 돌파 날짜 (supBreakPointDate1) 이후 최초로 종가가 시가보다 높은 시점을 찾아 그 기간중 최저가를 찾는다.
    // => 1차 지지선 가격  및 1차 지지선 가격일자의 날짜
    const {supLowPrice:supLowPrice1, supLowPriceDate:supLowPriceDate1} = getSupLowPriceAndDate(supBreakPointDate1, candleArr);
    //console.log('1차지지선 최저가 날짜', supLowPriceDate1, '1차지지선(최저가) 가격', supLowPrice1);



    // //2-1. 1차 지지선 날짜 이후 최초로 종가가 1차저항선 금액을 돌파한 날짜(브레이크 포인트)를 찾는다 
    let supBreakPointDate2 = getSupBreakPointDate(supLowPriceDate1, supLowPrice1, ma3Arr);
    //console.log('2차 하락돌파 날짜', supBreakPointDate2);

    const {supLowPrice:supLowPrice2, supLowPriceDate:supLowPriceDate2} = getSupLowPriceAndDate(supBreakPointDate2, candleArr);
    //console.log('2차지지선 최저가 날짜', supLowPriceDate2, '2차지지선(최저가) 가격', supLowPrice2);



    //3-1. 2차 저항선 날짜 이후 최초로 종가가 2차저항선 금액을 돌파한 날짜(브레이크 포인트)를 찾는다 
    let supBreakPointDate3 = getSupBreakPointDate(supLowPriceDate2, supLowPrice2, ma3Arr);
    //console.log('3차 하락돌파 날짜', supBreakPointDate3);

    const {supLowPrice:supLowPrice3, supLowPriceDate:supLowPriceDate3} = getSupLowPriceAndDate(supBreakPointDate3, candleArr);
    //console.log('3차지지선 최저가 날짜', supLowPriceDate3, '3차지지선(최저가) 가격', supLowPrice3);

     //1~3차 저항선 가격으로 라인 데이터를 만들어 리턴한다.
    const supInfo =[];
    const supLine1 = [];
    const supLine2= [];
    const supLine3 = [];
    ma3Arr.forEach((item)=>{
        supLowPriceDate1 !== undefined && supLine1.push([item[0],supLowPrice1])
        supLowPriceDate2 !== undefined && supLine2.push([item[0],supLowPrice2])
        supLowPriceDate3 !== undefined && supLine3.push([item[0],supLowPrice3])
    });

     //supInfo 정보 추가
     supLowPriceDate1 !== undefined && supInfo.push({'breakDate':supBreakPointDate1, 'lowPrice':supLowPrice1, 'lowPriceDate':supLowPriceDate1})
     supLowPriceDate2 !== undefined && supInfo.push({'breakDate':supBreakPointDate2, 'lowPrice':supLowPrice2, 'lowPriceDate':supLowPriceDate2})
     supLowPriceDate3 !== undefined && supInfo.push({'breakDate':supBreakPointDate3, 'lowPrice':supLowPrice3, 'lowPriceDate':supLowPriceDate3})

    return {supLine1, supLine2, supLine3, supInfo};
}


export function getFirstResBreakPoint(ma3Arr, ma24Arr){
    //console.log(ma3Arr, ma24Arr)
    let returnData;
    ma3Arr.forEach((item, idx)=>{
        if(idx!==0){
            const ma3PriceLast = ma3Arr[idx-1][1];
            const ma24PriceLast = ma24Arr[idx-1][1];

            const ma3Price = ma3Arr[idx][1];
            const ma24Price = ma24Arr[idx][1];
            const date = item[0];

            if((ma3Price>ma24Price) && (ma3PriceLast<ma24PriceLast)){
                //console.log(ma3Price, ma24Price, date)
                returnData ={ma3Price, ma24Price, date}
            }
        }
    });
    return returnData;
}
export function getFirstSupBreakPoint(ma3Arr, ma24Arr){
    let returnData;
    ma3Arr.forEach((item, idx)=>{
        if(idx!==0){
            const ma3PriceLast = ma3Arr[idx-1][1];
            const ma24PriceLast = ma24Arr[idx-1][1];

            const ma3Price = ma3Arr[idx][1];
            const ma24Price = ma24Arr[idx][1];
            const date = item[0];

            if((ma3Price<ma24Price) && (ma3PriceLast>ma24PriceLast)){
                //console.log(ma3Price, ma24Price, date)
                returnData ={ma3Price, ma24Price, date}
            }
        }
    });
    return returnData;
}


function getResHighPriceAndDate(resBreakPointDate, candleArr){
    //console.log(resBreakPointDate, candleArr)
    let resHighPrice=0; //저항선 가격
    let resHighPriceDate=0; //저항선 가격일자의 날짜
    for(let i=0; i<candleArr.length; i++){
        const candleDate = getFromDateTypeToString(new Date(candleArr[i][0])).replace('-','').substring(0,6)*1;
        const openPrice = candleArr[i][1];
        const closePrice = candleArr[i][4];
        const highPrice = candleArr[i][2];
        //if(candleDate=='202108'){highPrice=470;}
        if(candleDate>=resBreakPointDate){
            //1차 저항선 가격 및 2차 저항선 기준일 (기간내 최고 가격 찾기)
            if(resHighPrice<highPrice){
                resHighPrice=highPrice;
                resHighPriceDate = candleDate;
            }
            //돌파일 당일을 제외하고 종가가 시가보다 낮은 첫번째 포인트에서 멈춘다.
            if(candleDate!==resBreakPointDate && closePrice<openPrice){ 
                //console.log(candleDate, openPrice, closePrice, resHighPrice);
                break;
            }
        }
    }
    return{resHighPrice, resHighPriceDate}
}
function getSupLowPriceAndDate(supBreakPointDate, candleArr){
    //console.log(supBreakPointDate, candleArr)
    let supLowPrice=10000000000000; //저항선 가격
    let supLowPriceDate; //저항선 가격일자의 날짜
    for(let i=0; i<candleArr.length; i++){
        const candleDate = getFromDateTypeToString(new Date(candleArr[i][0])).replace('-','').substring(0,6)*1;
        const openPrice = candleArr[i][1];
        const closePrice = candleArr[i][4];
        const lowPrice = candleArr[i][3];
        if(candleDate>=supBreakPointDate){
            //1차 지지선 가격 및 2차 지지선 기준일 (기간내 최저 가격 찾기)
            if(supLowPrice>lowPrice){
                supLowPrice=lowPrice;
                supLowPriceDate = candleDate;
            }
            //돌파일 당일을 제외하고 종가가 시가보다 높은 첫번째 포인트
            if(candleDate!==supBreakPointDate && closePrice>openPrice){
                //console.log(candleDate, openPrice, closePrice, supLowPrice);
                break;
            }
        }
    }
    return{supLowPrice, supLowPriceDate}
}


function getResBreakPointDate(resHighPriceDate, resHighPrice, ma3Arr){
    //console.log(resHighPriceDate, resHighPrice, ma3Arr)
    if(resHighPriceDate===0){return ;} //2차 저항선이 없으면, 3차저항선 구할때 resHighPriceDat==0으로 들어오므로, 3차 저항선은 undefined로 리턴 한다.
    
    let returnData;
    for(let i=0; i<ma3Arr.length; i++){
        const ma3Date = getFromDateTypeToString(new Date(ma3Arr[i][0])).replace('-','').substring(0,6)*1;
        const ma3Price = ma3Arr[i][1];
        
        //직전 저항선 날짜 이후중에! closePrice가 resHighPrice 보다 높은날! => 2차 돌파점    
        if(ma3Date>resHighPriceDate && ma3Price>resHighPrice){
            returnData = ma3Date;
            break;
        }
    }
    return returnData;
}
function getSupBreakPointDate(supLowPriceDate, supLowPrice, ma3Arr){
    //console.log(supLowPriceDate, supLowPrice, ma3Arr)
    // 1차 지지선 날짜 이후 중에 3MA 값이 1차 저항선을 하향 돌파한날 => 2차 돌파점
    let returnData;
    for(let i=0; i<ma3Arr.length; i++){
        const ma3Date = getFromDateTypeToString(new Date(ma3Arr[i][0])).replace('-','').substring(0,6)*1;
        const ma3Price = ma3Arr[i][1];
        
        //1차 지지선 날짜 이후 중에! ma3Price가 supLowPrice 보다 낮은날! => 2차 돌파점
        if(ma3Date>supLowPriceDate && ma3Price<supLowPrice){
            //console.log(ma3Price, supLowPrice)
            returnData = ma3Date;
            break;
        }
    }
    return returnData;
}



/////////////////////// 볼린저 밴드 함수 ///////////////////
export function calculateBollingerBands(allDataArr) {
    const bollArr = [];
    const cutYear = 2011; //2011년 부터 컷!
    const period = 24; //24MA
    const deviations = 3.5; //3.5배수

    //전체기간의 데이터로 필요한 숫자들의 배열을 도출
    const closePriceArr_All = allDataArr.reduce((returnArr, item) =>{returnArr.push(item.closePrice); return returnArr;},[]);	
    const dateArr_All = allDataArr.reduce((returnArr, item) =>{returnArr.push(item.date); return returnArr;},[]);	
    const movingAverageDataSet_All = getMovingAveragesForBolliengerBand(closePriceArr_All,dateArr_All,period);
    
    // 전체 데이터로 MA(moving average) 만들면 앞에 ma 기간만큼 데이터가 불완전 해서 잘림!
    const movingAverageArr_MaCut = movingAverageDataSet_All.reduce((returnArr, item) =>{returnArr.push(item.movingAverage); return returnArr;},[]);	
    const standardDeviationArr_MaCut = getStandardDeviationArr(closePriceArr_All, period);
    const dateArr_maCut = movingAverageDataSet_All.reduce((returnArr, item) =>{returnArr.push(item.date); return returnArr;},[]);	
    //console.log(movingAverageArr_MaCut, standardDeviationArr_MaCut)

    const lowerBandArr_MaCut = movingAverageArr_MaCut.map((average, i) => decimalRound(average - (deviations * standardDeviationArr_MaCut[i]),2));
    const upperBandArr_MaCut = movingAverageArr_MaCut.map((average, i) => decimalRound(average + (deviations * standardDeviationArr_MaCut[i]),2));
    
    //console.log(dateArr_maCut, upperBandArr_MaCut,  lowerBandArr_MaCut);

    // 2011년 이후 데이터만 남길것!
    dateArr_maCut.forEach((item, idx)=>{
        const dateStr = item.substring(0,4)*1;
        const date = new Date(item).getTime();
        const lowerBand = lowerBandArr_MaCut[idx];
        const upperBand = upperBandArr_MaCut[idx];
        if(dateStr>=cutYear){
            bollArr.push([date, lowerBand, upperBand]);
        }
    });
    return bollArr;
}
  
function getMovingAveragesForBolliengerBand(closePriceArr, dateArr, period) {
    const movingAverageArr = [];
    for (let i = period - 1; i < closePriceArr.length; i++) {
        const sum = closePriceArr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        const movingAverage = decimalRound(sum / period,2);
        const date = dateArr[i];
        const closePrice = closePriceArr[i];
        movingAverageArr.push({movingAverage,closePrice, date});
    }
    return movingAverageArr;
}

function getStandardDeviationArr(data, period) {
    const standardDeviations = [];
    for (let i = period - 1; i < data.length; i++) {
        const subset = data.slice(i - period + 1, i + 1);
        const deviation = decimalRound(calculateStandardDeviation(subset),2);
        standardDeviations.push(deviation);
    }
    return standardDeviations;
}
  
function calculateStandardDeviation(array) {
    const n = array.length;
    const mean = array.reduce((sum, value) => sum + value, 0) / n;
    const deviations = array.map(value => value - mean);
    const squaredDeviations = deviations.map(deviation => deviation * deviation);
    const sumSquaredDeviations = squaredDeviations.reduce((sum, value) => sum + value, 0);
    const variance = sumSquaredDeviations / n;
    const standardDeviation = Math.sqrt(variance);
    return standardDeviation;
}
















// export function getBollingerBands(ma24Arr){
//     console.log(ma24Arr)
//     const ma24PriceArr = ma24Arr.reduce((returnArr, item) =>{											
//         returnArr.push(item[1]);	
//         return returnArr;									
//     },[]);			
    
//     const deviation = 24; //24일 기준 표준편차 구함 (24ma이기 때문)
//     const multiple = 3.5; //표준편차기준
    
//     // const upperBandsArr = [];
//     // const middleBandsArr = [];
//     // const lowerBandsArr = [];

//     const bollArr = [];

//     for (let i = 0; i < ma24PriceArr.length; i++) {
//         const average = ma24PriceArr[i];
//         const date = ma24Arr[i][0];
//         const startIndex = Math.floor(i - deviation + 1);
//         const endIndex = Math.ceil(i + deviation);
    
//         if (startIndex < 0 || endIndex >= ma24PriceArr.length) {
//             // 범위가 데이터 배열을 벗어나는 경우
//             // upperBandsArr.push(null);
//             // middleBandsArr.push(null);
//             // lowerBandsArr.push(null);
//             bollArr.push([date, null, null]);
//         } else {
//             const prices = ma24PriceArr.slice(startIndex, endIndex + 1);
//             const standardDeviation = calculateStandardDeviation(prices);
//             const upperBand = average + (multiple * standardDeviation);
//             //const middleBand = average;
//             const lowerBand = average - (multiple * standardDeviation);

//             bollArr.push([date, lowerBand, upperBand]);
//             // upperBandsArr.push([date, upperBand]);
//             // middleBandsArr.push([date, middleBand]);
//             // lowerBandsArr.push([date, lowerBand]);
//         }
//       }
    
//     return bollArr;
// }

// // function calculateStandardDeviation(data) {
// //     const mean = data.reduce((a, b) => a + b) / data.length;
// //     const deviations = data.map(x => Math.pow(x - mean, 2));
// //     const variance = deviations.reduce((a, b) => a + b) / deviations.length;
// //     const standardDeviation = Math.sqrt(variance);
// //     return standardDeviation;
// // }



//   function calculateStandardDeviation(array) {
//     const n = array.length;
//     const mean = array.reduce((sum, value) => sum + value, 0) / n;
//     const deviations = array.map(value => value - mean);
//     const squaredDeviations = deviations.map(deviation => deviation * deviation);
//     const sumSquaredDeviations = squaredDeviations.reduce((sum, value) => sum + value, 0);
//     const variance = sumSquaredDeviations / n;
//     const standardDeviation = Math.sqrt(variance);
//     return standardDeviation;
//   }

// export function getMovingAverage(dataArr, period, cutYear) {
//     const closePriceArr = dataArr.reduce((returnArr, item) =>{returnArr.push(item.closePrice); return returnArr;},[]);	
//     let sum = 0;
//     let returnArr = [];
  
//     for (let i = 0; i < closePriceArr.length; i++) {
//         const date = new Date(dataArr[i].date).getTime();
//         let dateStr = dataArr[i].date.substring(0,4)*1;
//         sum += closePriceArr[i];
//         if (i >= period) {
//             sum -= closePriceArr[i - period];
//             const ma = decimalRound(sum / period, 2)
//             if(dateStr>=cutYear){
//                 returnArr.push([date, ma]);
//             }
//         }
//     }
//     return returnArr;
// }
  

// 상단 밴드(upper band) = 이동평균선 + (2 * 표준편차)
// 중간 밴드(middle band) = 이동평균선
// 하단 밴드(lower band) = 이동평균선 - (2 * 표준편차)


// export function getBollingerBands(ma24Arr){
//     const ma24PriceArr = ma24Arr.reduce((returnArr, item) =>{											
//         returnArr.push(item[1]);	
//         return returnArr;									
//     },[]);			
    
//     const standardDeviation = getStandardDeviation(ma24PriceArr);
//     const multiple = 3.5; //표준편차배수

//     console.log(standardDeviation);

//     const bollArr = [];

//     ma24PriceArr.forEach((item, idx)=>{
//         const date = ma24Arr[idx][0];
//         const lowerBand = decimalRound(item - (multiple*standardDeviation),2);
//         const upperBand = decimalRound(item + (multiple*standardDeviation),2);
//         bollArr.push([date, lowerBand, upperBand])
//     })
    
//     return bollArr;
// }


// function getStandardDeviation(array) {
//     const n = array.length;
//     const mean = array.reduce((sum, value) => sum + value, 0) / n;
//     const deviations = array.map(value => value - mean);
//     const squaredDeviations = deviations.map(deviation => deviation * deviation);
//     const sumSquaredDeviations = squaredDeviations.reduce((sum, value) => sum + value, 0);
//     const variance = sumSquaredDeviations / n;
//     const standardDeviation = Math.sqrt(variance);
//     return standardDeviation;
//   }
