import colors from "./colors";
import * as commonFunc from "./commonFunc";


export function getCandleSeries(candleArr){
  //캔들 시리즈
  const result = {
    type: 'candlestick',
    name: 'candle',
    id: 'mainCandle',
    data: candleArr,
    yAxis: 0,
    upColor: '#FFFFFF', // 양봉 색상
    upLineColor:'red', // 양봉선 색상
    color:"#FFFFFF", // 음봉 색상
    lineColor:"blue", //음봉선 색상


    tooltip: {
      pointFormatter: function() {
        const date = commonFunc.getFromDateTypeToString(new Date(this.x)).substring(0,7);

        //다른 시리즈의 값 및 태그
        const { x } = this; // 현재 시리즈의 x값 가져오기
        const seriesAll = this.series.chart.series;
        //console.log(seriesAll)
        let tag =`<div style="color:blue; line-height:20px;"><b>&nbsp;${date}</b></div><br>`;
        seriesAll.forEach((item, idx)=>{
          const name = item.name;
          //console.log(name)
          if(name==='3M'||name==='24M'||name==='60M'||name==='120M'
          ||name==='1차저항'||name==='2차저항'||name==='3차저항'
          ||name==='1차지지'||name==='2차지지'||name==='3차지지'
          ){
            const xIdx = item.xData.indexOf(x);
            const yVal = item.yData[xIdx]===undefined?'N/A':item.yData[xIdx];
            
            const color = item.color;
            tag+=`<span style="color:${color}">\u25CF</span> ${name} :  <b>${yVal}</b><br>`
            if(name==='120M'){tag+='<br>'}
          }
        })

        //캔들 시리즈의 값 및 태그
        let finalTag = 
          tag +
          ` <br>
            시 : <b>${this.open}</b><br>
            고 : <b>${this.high}</b><br>
            저 : <b>${this.low}</b><br>
            종 : <b>${this.close}</b><br><br>
          `; 
        return finalTag;
      },
    },
  };
  return result;
}


export function getMovingAverageSeries(ma3Arr, ma24Arr, ma60Arr, ma120Arr, separationUpArr, separationDownArr){
  //console.log(separationUpArr, separationDownArr)

  const result = [
    {
      type: 'line', name: '3M', data: ma3Arr, color:colors.ma3,
      marker :{enabled:false},//라인상의 동그란점(마커)제거
      tooltip: {  pointFormatter: function () { return ''; }}, //개별 툴팁 없애기 (캔들에 커스텀 통합)

    },{
      type: 'line', name: '24M', data: ma24Arr, color:colors.ma24,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},

    },{
      type: 'line', name: '60M', data: ma60Arr, color:colors.ma60,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},

    },{
      type: 'line', name: '120M', data: ma120Arr, color:colors.ma120,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    },
    // {
    //   type: 'line', name: '이격도상단', data: separationUpArr, color:colors.separation,
    //   lineWidth:1.5,
    //   marker :{enabled:false},
    //   tooltip: {  pointFormatter: function () { return ''; }},
    // },{
    //   type: 'line', name: '이격도하단', data: separationDownArr, color:colors.separation,
    //   lineWidth:1.5,
    //   marker :{enabled:false},
    //   tooltip: {  pointFormatter: function () { return ''; }},
    // },
  ];
  return result;
}


export function getVolumeSeries(volumeArr){
  return {
    type: 'column',
    name: '거래량',
    data: volumeArr,
    yAxis: 1,  //y축 위치
    color: colors.volume, // 거래량 색상
    tooltip: {
      pointFormatter: function () {
        let val =  commonFunc.thousandComma( commonFunc.decimalRound(this.y*1, 0))
        return val;
      },
    },
    showInLegend : false, // 차트 아래 선택 레전드 없앰
  }
}

export function getResAndSupSeriesArr(resLine1,resLine2,resLine3,supLine1,supLine2,supLine3){
  const returnArr = [];
  if(resLine1.length!==0){
    returnArr.push({
      type: 'line', name: '1차저항', data: resLine1, color:colors.resistance,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  if(resLine2.length!==0){
    returnArr.push({
      type: 'line', name: '2차저항', data: resLine2, color:colors.resistance,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  if(resLine3.length!==0){
    returnArr.push({
      type: 'line', name: '3차저항', data: resLine3, color:colors.resistance,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  if(supLine1.length!==0){
    returnArr.push({
      type: 'line', name: '1차지지', data: supLine1, color:colors.support,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  if(supLine2.length!==0){
    returnArr.push({
      type: 'line', name: '2차지지', data: supLine2, color:colors.support,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  if(supLine3.length!==0){
    returnArr.push({
      type: 'line', name: '3차지지', data: supLine3, color:colors.support,
      marker :{enabled:false},
      tooltip: {  pointFormatter: function () { return ''; }},
    })
  }
  return returnArr;
}


export function getResFlagAndScatterSeires(resInfo, candleArr){
  const resFlagData = [];
  const resBreakFlagData = [];
  const resScatterData = [];

  resInfo.forEach((item, idx)=>{
    // console.log(item)
    let {highPrice, highPriceDate, breakDate} = item;
    const highPriceDateStr = highPriceDate.toString().substring(0,4)+'-'+highPriceDate.toString().substring(4,6)+'-01';
    const dateShort = highPriceDate.toString().substring(2,4)+'-'+highPriceDate.toString().substring(4,6);
    const highPriceDateTime = new Date(highPriceDateStr).getTime();

    const breakDateStr =  breakDate.toString().substring(0,4)+'-'+breakDate.toString().substring(4,6)+'-01';
    const breakDateTime = new Date(breakDateStr).getTime();

    const breakHigh3Price = candleArr.reduce((ma3Price, item) =>{											
      if( item[0] === breakDateTime){ma3Price = item[2];}										
      return ma3Price;										
    },0);		

    //저항선 데이터
    resFlagData.push({
      //x : highPriceDateTime,
      x:candleArr[idx*12][0],
      y:highPrice,
      title: `${idx+1}차 저항 (${dateShort})`,
      fillColor:colors.resistanceOpa
    });

    //돌파점 데이터
    resBreakFlagData.push({
      //x : highPriceDateTime,
      x:breakDateTime,
      y:breakHigh3Price,
      title: `${idx+1}上`,
      fillColor:colors.resistanceOpa,
      shape: 'circlepin',
    });
    //scatter 차트로 점도 찍어주기
    resScatterData.push({x:highPriceDateTime, y:highPrice});
  });

  const resFlagOption = { //저항선 플래그
    type: 'flags',
    name: '저항Pin',
    data: resFlagData,
    shape: 'flag',
    lineColor:colors.resistance,
    showInLegend : false,
  };

  const resBreakFlagOption = { //돌파점 플래그
    type: 'flags',
    name: '상승돌파',
    data: resBreakFlagData,
    shape: 'flag',
    lineColor:colors.resistance,
    showInLegend : false,
  };

  const resScatterOption = { // 포인트 찍어줌
    type: 'scatter',
    name: '',
    marker: {
        symbol: 'circle',
        radius:3.5,
    },
    data : resScatterData,  //{x:1293840000000, y:200}
    showInLegend : false,
    color:colors.resistance,
  };

  return {resFlagOption, resBreakFlagOption, resScatterOption}
}

export function getSupFlagAndScatterSeires(supInfo, candleArr){
  const supFlagData = [];
  const supBreakFlagData = [];
  const supScatterData = [];

  supInfo.forEach((item, idx)=>{
    const {lowPrice, lowPriceDate, breakDate} = item
    const lowPriceDateStr = lowPriceDate.toString().substring(0,4)+'-'+lowPriceDate.toString().substring(4,6)+'-01';
    const lowPriceDateTime = new Date(lowPriceDateStr).getTime();
    const dateShort = lowPriceDate.toString().substring(2,4)+'-'+lowPriceDate.toString().substring(4,6);

    const breakDateStr =  breakDate.toString().substring(0,4)+'-'+breakDate.toString().substring(4,6)+'-01';
    const breakDateTime = new Date(breakDateStr).getTime();

    const breakHigh3Price = candleArr.reduce((ma3Price, item) =>{											
      if( item[0] === breakDateTime){ma3Price = item[2];}										
      return ma3Price;										
    },0);		

    //지지선 데이터
    supFlagData.push({
      //x : lowPriceDateTime,
      x:candleArr[idx*12][0],
      y:lowPrice,
      title: `${idx+1}차 지지 (${dateShort})`,
      fillColor:colors.supportOpa,
    });

    //돌파점 데이터
    supBreakFlagData.push({
      x:breakDateTime,
      y:breakHigh3Price,
      title: `${idx+1}下`,
      fillColor:colors.supportOpa,
      shape: 'circlepin',
    });

    //scatter 차트로 점도 찍어주기
    supScatterData.push({x:lowPriceDateTime, y:lowPrice});
  })
  const supFlagOption = {
    type: 'flags',
    name: '지지Pin',
    data: supFlagData,
    shape: 'flag',
    lineColor:colors.support,
    showInLegend : false,
  };

  const supBreakFlagOption = {
    type: 'flags',
    name: '하락돌파',
    data: supBreakFlagData,
    shape: 'flag',
    lineColor:colors.support,
    showInLegend : false,
  };


  const supScatterOption = {
    type: 'scatter',
    name: '',
    marker: {
        symbol: 'circle',
        radius:3.5,
    },
    data : supScatterData,
    showInLegend : false,
    color:colors.support,
  }
  return{supFlagOption, supBreakFlagOption, supScatterOption}
}

export function getBollSeries(bollArr){
  return {
    type: 'arearange',
    name: '볼린저',
    data: bollArr,
    lineWidth:1.5,
    color:colors.bollinger,
    lineColor:colors.bollinger,
    fillOpacity:0,
    marker :{enabled:false},
    tooltip: {  pointFormatter: function () { return ''; }},
  }
}
