import React from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more';  // 추가 모듈 가져옴

import * as chartFunc from '../common/chartFunc';
import * as api  from '../common/commonApi';
import * as chartSeries from '../common/chartSeries';
import { useQuery} from 'react-query' 

HighchartsMore(Highcharts); // // 모듈을 추가로 로드

//const regex = new RegExp(/\s+/g);


export default function HighChart (){


  const {isLoading, data:kospiData} = useQuery(['kospi'], ()=> api.getKospi200());
  if(isLoading){return <span>....</span>}

  let kospiArr_All = chartFunc.getReArrangeData(kospiData) // 데이터 숫자 및 단위 정리
  let kospiArr_All_Month = chartFunc.changeDateToMonth(kospiArr_All); //코스피 월간 전체 데이터 (2001 ~ 현재)
  //console.log(kospiArr_All_Month)

  const cutYear = 2011;
  const candleArr =  chartFunc.getCandleChartData(kospiArr_All_Month, cutYear);

  // 이동평균선
  let ma3Arr = chartFunc.getMovingAverage(kospiArr_All_Month, '3', cutYear);
  let ma24Arr = chartFunc.getMovingAverage(kospiArr_All_Month, '24', cutYear);
  let ma60Arr = chartFunc.getMovingAverage(kospiArr_All_Month, '60', cutYear);
  let ma120Arr = chartFunc.getMovingAverage(kospiArr_All_Month, '120', cutYear);

  //기간이 모자라서 캔들 대비 ma 기간 데이터가 모자랄 경우, 빈공간으로 채워줘야함
  const ma3Gap = candleArr.length - ma3Arr.length;
  const ma24Gap = candleArr.length - ma24Arr.length;
  const ma60Gap = candleArr.length - ma60Arr.length;
  const ma120Gap = candleArr.length - ma120Arr.length;
  

  ma3Arr = chartFunc.fillShortDateForMa(ma3Gap, candleArr, ma3Arr);
  ma24Arr = chartFunc.fillShortDateForMa(ma24Gap, candleArr, ma24Arr);
  ma60Arr = chartFunc.fillShortDateForMa(ma60Gap, candleArr, ma60Arr);
  ma120Arr = chartFunc.fillShortDateForMa(ma120Gap, candleArr, ma120Arr);

  //이격도 
  let {separationUpArr, separationDownArr} = chartFunc.getSeparationArr(candleArr, ma60Arr, ma120Arr);

  //볼린져밴드
  //console.log(kospiArr_All_Month)
  const bollArr = chartFunc.calculateBollingerBands(kospiArr_All_Month);
  //let bollArr = chartFunc.getBollingerBands(ma24Arr);


  //저항선, 지지선
  const {resLine1, resLine2, resLine3, resInfo} = chartFunc.getResistanceLineData(ma3Arr, ma24Arr, candleArr);
  const {supLine1, supLine2, supLine3, supInfo} = chartFunc.getSupportLineData(ma3Arr, ma24Arr, candleArr);
  ///console.log(supLine1, supLine2, supLine3, supInfo);
  //console.log(resInfo, supInfo)


  const options = {
    chart:{
      height:800,
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
      gridLineWidth:0.8,
    },

    yAxis: [{
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: '',
      },
      height: '80%',
      lineWidth: 2,
      resize: {
          enabled: true
      },
      gridLineWidth:0,
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: ''
        },
        top: '85%',
        height: '15%',
        offset: 0,
        lineWidth: 2,
        gridLineWidth:0,
    }], //yAxis 끝

    tooltip: {
        split: true, //툴팁이 각각의 데이터대로 2개로 나뉨
        xDateFormat: '%Y-%m', //x축 툴팁 포맷
        crosshairs: true,
    },

    series: [], //series 끝

  } //options 끝



  //캔들 시리즈 및 데이터 데이터 추가
  const candleSeries = chartSeries.getCandleSeries(candleArr);
  options.series.push(candleSeries);

  //이동평균선, 이격도 시리즈 및 데이터 추가
  const maSeriesArr = chartSeries.getMovingAverageSeries(ma3Arr, ma24Arr, ma60Arr, ma120Arr, separationUpArr, separationDownArr);
  maSeriesArr.forEach(item=>options.series.push(item))

  //거래량 시리즈 및 데이터 추가
  const volumeSeries = chartSeries.getVolumeSeries(candleArr);
  options.series.push(volumeSeries);

  //저항선 및 지지선 시리즈 및 데이터 추가
  let resAndSupSeriesArr = chartSeries.getResAndSupSeriesArr(resLine1,resLine2,resLine3,supLine1,supLine2,supLine3);
  resAndSupSeriesArr.forEach(item=>options.series.push(item))
  
  // 저항선 flag, 상승돌파점 및 scatter (저항선과 최고가 만나는점 포인트) 시리즈 및 데이터 추가
  const {resFlagOption, resBreakFlagOption, resScatterOption} = chartSeries.getResFlagAndScatterSeires(resInfo, candleArr);
  options.series.push(resFlagOption);
  options.series.push(resBreakFlagOption);
  options.series.push(resScatterOption);

  // 지지선 flag 하락돌파점 및 scatter (지지선과 최저가 만나는점 포인트) 시리즈 및 데이터 추가
  const {supFlagOption, supBreakFlagOption, supScatterOption} = chartSeries.getSupFlagAndScatterSeires(supInfo, candleArr);
  options.series.push(supFlagOption);
  options.series.push(supBreakFlagOption);
  options.series.push(supScatterOption);

  // 볼린저밴드 시리즈 및 데이터 추가
  let bollSeriesArr = chartSeries.getBollSeries(bollArr);
  options.series.push(bollSeriesArr);



    

  return(
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

