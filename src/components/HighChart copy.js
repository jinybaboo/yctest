import React, { useState } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'


import * as chartFunc from '../common/chartFunc';
import * as api  from '../common/commonApi';
import { chartOptions, volumeOptions } from '../common/chartConfig';
import { useQuery} from 'react-query' 
import colors from "../common/colors";
import { getFromDateTypeToString } from '../common/commonFunc';

const regex = new RegExp(/\s+/g);



export default function HighChart (){

  const {isLoading, data:kospiData} = useQuery(['kospi'], ()=> api.getKospi200());

  if(isLoading){return <span>....</span>}
  //console.log(isLoading, kospiData);

  let kospiArr_All = chartFunc.getReArrangeData(kospiData) // 데이터 숫자 및 단위 정리
  //console.log(kospiArr_All)
  let kospiArr_All_Month = chartFunc.changeDateToMonth(kospiArr_All); //코스피 월간 전체 데이터 (2001 ~ 현재)
  let kospiArr_Cut_Month = chartFunc.cutDataFrom2011(kospiArr_All_Month, 2011) //코스피 월간 캔들차트 데이터 (2011 ~ 현재)
  //console.log(kospiArr_Cut_Month)

  const kospiArr_Cut_Month_Candle = chartFunc.getCandleChartData(kospiArr_Cut_Month);
  const kospiArr_Cut_Month_Volume = chartFunc.getVolumeData(kospiArr_Cut_Month);
  //console.log(kospiArr_Cut_Month_Volume)

  let ma3_All = chartFunc.getMovingAverage(kospiArr_All_Month, '3');
  let ma3_Cut = chartFunc.cutDataFrom2011ForMa(ma3_All, 2011);

  let ma24_All = chartFunc.getMovingAverage(kospiArr_All_Month, '24');
  let ma24_Cut = chartFunc.cutDataFrom2011ForMa(ma24_All, 2011);

  let ma60_All = chartFunc.getMovingAverage(kospiArr_All_Month, '60');
  let ma60_Cut = chartFunc.cutDataFrom2011ForMa(ma60_All, 2011);

  let ma120_All = chartFunc.getMovingAverage(kospiArr_All_Month, '120');
  let ma120_Cut = chartFunc.cutDataFrom2011ForMa(ma120_All, 2011);


  const ma3Gap = kospiArr_Cut_Month_Candle.length - ma3_Cut.length;
  const ma24Gap = kospiArr_Cut_Month_Candle.length - ma24_Cut.length;
  const ma60Gap = kospiArr_Cut_Month_Candle.length - ma60_Cut.length;
  const ma120Gap = kospiArr_Cut_Month_Candle.length - ma120_Cut.length;

  //기간이 모자라서 캔들 대비 ma 기간 데이터가 모자랄 경우, 빈공간으로 채워줘야함
  ma3_Cut = chartFunc.fillShortDateForMa(ma3Gap, kospiArr_Cut_Month_Candle, ma3_Cut);
  ma24_Cut = chartFunc.fillShortDateForMa(ma24Gap, kospiArr_Cut_Month_Candle, ma24_Cut);
  ma60_Cut = chartFunc.fillShortDateForMa(ma60Gap, kospiArr_Cut_Month_Candle, ma60_Cut);
  ma120_Cut = chartFunc.fillShortDateForMa(ma120Gap, kospiArr_Cut_Month_Candle, ma120_Cut);
  //console.log(kospiArr_Cut_Month_Candle, ma3_Cut, ma24_Cut, ma60_Cut, ma120_Cut)
  //if(kospiArr_Cut_Month_Candle.length !== ma120_Cut.length){alert('120MA 데이터 갯수 모자람!')}

  
  //저항선 및 지지선 데이터 얻기
  const resistanceDataSet = chartFunc.getResistanceLineData(ma3_Cut, ma24_Cut, kospiArr_Cut_Month_Candle);
  const supportDataSet = chartFunc.getSupportLineData(ma3_Cut, ma24_Cut, kospiArr_Cut_Month_Candle);
  const resInfo = resistanceDataSet.info;
  const supInfo = supportDataSet.info;
  //console.log(resistanceDataSet)
  //console.log(chartOptions.stroke.width)

  //저항선 어노테이션 상황에 맞게 재 설정
  resInfo.forEach((item, idx)=>{
    //데이터 셋팅
    let {breakDate, highPrice, highPriceDate} = item;
    highPriceDate = highPriceDate.toString();
    let highPriceDateStr = highPriceDate.substring(2,4)+'.'+highPriceDate.substring(4,6);
    highPriceDate = highPriceDate.substring(4,6)+' 01 '+highPriceDate.substring(0,4)
    highPriceDate = new Date(highPriceDate).getTime();

    breakDate = breakDate.toString();
    let breakDateStr = breakDate.substring(2,4)+'.'+breakDate.substring(4,6);
    breakDate = breakDate.substring(4,6)+' 01 '+breakDate.substring(0,4);
    breakDate = new Date(breakDate).getTime();


    //xAxis 어노테이션 설정 (상승돌파점)
    chartOptions.annotations.xaxis[idx].x = breakDate;
    chartOptions.annotations.xaxis[idx].label.text = `${idx+1}上돌파 : ${breakDateStr}`

    //yAxis 어노테이션 설정 (y 저항선 보조축)
    chartOptions.annotations.yaxis[idx].y = highPrice;
    chartOptions.annotations.yaxis[idx].label.text = `${idx+1}차 저항(${highPriceDateStr}): ${highPrice}`

     //포인트 어노테이션 설정
     chartOptions.annotations.points[idx].x = highPriceDate;
     chartOptions.annotations.points[idx].y = highPrice;
     //chartOptions.annotations.points[idx].label.text = `${idx+1}차 저항선 : ${highPrice}`

     //저항선 색상 및 두게 설정
     chartOptions.colors[idx+5] = colors.resistance;
     chartOptions.stroke.width[idx+5] = 1;
  })

  //지지선 어노테이션 상황에 맞게 재 설정
  supInfo.forEach((item, idx)=>{
    //데이터 셋팅
    let {breakDate, lowPrice, lowPriceDate} = item;
    lowPriceDate = lowPriceDate.toString();
    let lowPriceDateStr = lowPriceDate.substring(2,4)+'.'+lowPriceDate.substring(4,6);
    lowPriceDate = lowPriceDate.substring(4,6)+' 01 '+lowPriceDate.substring(0,4)
    lowPriceDate = new Date(lowPriceDate).getTime();
    breakDate = breakDate.toString();
    let breakDateStr = breakDate.substring(2,4)+'.'+breakDate.substring(4,6);
    breakDate = breakDate.substring(4,6)+' 01 '+breakDate.substring(0,4);
    breakDate = new Date(breakDate).getTime();

     //xAxis 어노테이션 설정 (하락 돌파점)
    chartOptions.annotations.xaxis[idx+3].x = breakDate;
    chartOptions.annotations.xaxis[idx+3].label.text = `${idx+1}下돌파 : ${breakDateStr}`

    //yAxis 어노테이션 설정 (y 지지선 보조축)
    chartOptions.annotations.yaxis[idx+3].y = lowPrice;
    chartOptions.annotations.yaxis[idx+3].label.text = `${idx+1}차 지지(${lowPriceDateStr}) : ${lowPrice}`

     //포인트 어노테이션 설정
    chartOptions.annotations.points[idx+3].x = lowPriceDate;
    chartOptions.annotations.points[idx+3].y = lowPrice;
    //chartOptions.annotations.points[idx+3].label.text = `${idx+1}차 지지선 : ${lowPrice}`

    //지지선 색상 및 두께 설정
    const resCount = resInfo.length;
    chartOptions.colors[idx+5+resCount] = colors.support;
    chartOptions.stroke.width[idx+5+resCount] = 1;
  })



  const seriesData2 = chartFunc.getSeriesDataSet(ma3_Cut, ma24_Cut, ma60_Cut, ma120_Cut, kospiArr_Cut_Month_Candle, kospiArr_Cut_Month_Volume, resistanceDataSet, supportDataSet);
  //console.log(seriesData2)

  const volumeData = chartFunc.getVolumeDataSet(kospiArr_Cut_Month_Volume);
  //console.log(kospiArr_Cut_Month_Volume)


  const candle =  chartFunc.getCandleChartData2(kospiArr_Cut_Month);
  const vol = chartFunc.getVolumeData2(kospiArr_Cut_Month);

  const ma3 = chartFunc.getMovingAverage2(kospiArr_All_Month, '3', 2011);
  const ma24 = chartFunc.getMovingAverage2(kospiArr_All_Month, '24', 2011);
  const ma60 = chartFunc.getMovingAverage2(kospiArr_All_Month, '60', 2011);
  const ma120 = chartFunc.getMovingAverage2(kospiArr_All_Month, '120', 2011);
  //console.log(ma3, ma24);




  const options = {
    chart:{
      height:600,
      backgroundColor:"#ffffff",
      zoomType: 'x', // x축 방향으로 줌 활성화
    },

    legend: { //하단 차트이름으로 온오프 버튼
      enabled: true
    },

    rangeSelector: {
      selected: 1
    },
    
    title: {
      text: ''
    },

    xAxis: {
      type: 'datetime', // x축의 단위를 날짜로 설정
      dateTimeLabelFormats: { // x축 날짜 포맷 변경
        day: '%Y-%m-%d', // 일 단위 포맷: 년-월-일 (예: 2023-01-01)
        week: '%Y-%m-%d', // 주 단위 포맷
        month: '%Y-%m', // 월 단위 포맷
        year: '%Y', // 년 단위 포맷
      },
    },

    yAxis: [{
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: '',
      },
      height: '75%',
      lineWidth: 2,
      resize: {
          enabled: true
      }
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: ''
        },
        top: '80%',
        height: '20%',
        offset: 0,
        lineWidth: 2
    }],

    tooltip: {
        split: true, //툴팁이 각각의 데이터대로 2개로 나뉨
        xDateFormat: '%Y-%m', //x축 툴팁 포맷
    },

    series: [
      //캔들 시리즈
      {
        type: 'candlestick',
        name: 'KOSPI 200',
        id: 'mainCandle',
        data: candle,
        yAxis: 0,
        upColor: '#FFFFFF', // 양봉 색상
        upLineColor:'red', // 양봉선 색상
        color:"#FFFFFF", // 음봉 색상
        lineColor:"blue", //음봉선 색상


        tooltip: {
          pointFormatter: function() {
            const date = getFromDateTypeToString(new Date(this.x)).substring(0,7);

            //다른 시리즈의 값 및 태그
            const { x, y } = this; // 현재 시리즈의 x값 가져오기
            const seriesAll = this.series.chart.series;
            //console.log(seriesAll)
            let tag =`<div style="color:blue; line-height:20px;"><b>&nbsp;${date}</b></div><br>`;
            seriesAll.forEach((item, idx)=>{
              const name = item.name;
              if(name==='3M'||name==='24M'||name==='60M'||name==='120M'){
                const xIdx = item.xData.indexOf(x);
                const yVal = item.yData[xIdx];
                const color = item.color;
                tag+=`<span style="color:${color}">\u25CF</span> ${name} :  <b>${yVal}</b><br>`
              }
            })

            //캔들 시리즈의 값 및 태그
            let finalTag = 
              tag +
              ` <br>
                고 : <b>${this.high}</b><br>
                저 : <b>${this.low}</b><br>
                시 : <b>${this.open}</b><br>
                종 : <b>${this.close}</b><br><br>
              `; 
            return finalTag;
          },
        },
      }, 

      //이평선 3개월
      {
        type: 'spline', name: '3M', id: 'ma3', data: ma3, color:colors.ma3,
        marker :{enabled:false},//라인상의 동그란점(마커)제거
        enabled:false,
        tooltip: {  pointFormatter: function () { return ''; }}, //개별 툴팁 없애기 (캔들에 커스텀 통합)

      },{
        type: 'line', name: '24M', id: 'ma24', data: ma24, color:colors.ma24,
        marker :{enabled:false},
        tooltip: {  pointFormatter: function () { return ''; }},

      },{
        type: 'line', name: '60M', id: ',ma60', data: ma60, color:colors.ma60,
        marker :{enabled:false},
        tooltip: {  pointFormatter: function () { return ''; }},

      },{
        type: 'line', name: '120M', id: 'ma120', data: ma120, color:colors.ma120,
        marker :{enabled:false},
        tooltip: {  pointFormatter: function () { return ''; }},
      },

      // 거래량 시리즈
      {
        type: 'column',
        name: '거래량',
        data: vol,
        yAxis: 1,  //y축 위치
        color:"#1B9C85", // 거래량 색상
        tooltip: {
          pointFormatter: function () {
            const val = Highcharts.numberFormat(this.y, 0).replace(regex,",");  //거래량 컴마 찍기
            return val;
          },
        },
    }
    ]
  

  }
    

  return(
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

