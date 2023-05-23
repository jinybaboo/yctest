import Chart from "react-apexcharts";
import * as chartFunc from '../common/chartFunc';
import * as api  from '../common/commonApi';
import { chartOptions, volumeOptions } from '../common/chartConfig';
import { useQuery} from 'react-query' 
import colors from "../common/colors";


export default function ApexChartTest (){

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
  console.log(kospiArr_Cut_Month_Volume)




  //console.log(kospiArr_Cut_Month_Candle)





  const seriesData = [{
    x: new Date(1538778600000),
    y: [6629.81, 6650.5, 6623.04, 6633.33]
  },
  {
    x: new Date(1538780400000),
    y: [6632.01, 6643.59, 6620, 6630.11]
  },
  {
    x: new Date(1538782200000),
    y: [6630.71, 6648.95, 6623.34, 6635.65]
  },
  {
    x: new Date(1538784000000),
    y: [6635.65, 6651, 6629.67, 6638.24]
  },
  {
    x: new Date(1538785800000),
    y: [6638.24, 6640, 6620, 6624.47]
  },
  {
    x: new Date(1538787600000),
    y: [6624.53, 6636.03, 6621.68, 6624.31]
  },
  {
    x: new Date(1538789400000),
    y: [6624.61, 6632.2, 6617, 6626.02]
  },
  {
    x: new Date(1538791200000),
    y: [6627, 6627.62, 6584.22, 6603.02]
  },
  {
    x: new Date(1538793000000),
    y: [6605, 6608.03, 6598.95, 6604.01]
  },
  {
    x: new Date(1538794800000),
    y: [6604.5, 6614.4, 6602.26, 6608.02]
  },
  {
    x: new Date(1538796600000),
    y: [6608.02, 6610.68, 6601.99, 6608.91]
  },
  {
    x: new Date(1538798400000),
    y: [6608.91, 6618.99, 6608.01, 6612]
  },
  {
    x: new Date(1538800200000),
    y: [6612, 6615.13, 6605.09, 6612]
  },
  {
    x: new Date(1538802000000),
    y: [6612, 6624.12, 6608.43, 6622.95]
  },
  {
    x: new Date(1538803800000),
    y: [6623.91, 6623.91, 6615, 6615.67]
  },
  {
    x: new Date(1538805600000),
    y: [6618.69, 6618.74, 6610, 6610.4]
  },
  {
    x: new Date(1538807400000),
    y: [6611, 6622.78, 6610.4, 6614.9]
  },
  {
    x: new Date(1538809200000),
    y: [6614.9, 6626.2, 6613.33, 6623.45]
  },
  {
    x: new Date(1538811000000),
    y: [6623.48, 6627, 6618.38, 6620.35]
  },
  {
    x: new Date(1538812800000),
    y: [6619.43, 6620.35, 6610.05, 6615.53]
  },
  {
    x: new Date(1538814600000),
    y: [6615.53, 6617.93, 6610, 6615.19]
  },
  {
    x: new Date(1538816400000),
    y: [6615.19, 6621.6, 6608.2, 6620]
  },
  {
    x: new Date(1538818200000),
    y: [6619.54, 6625.17, 6614.15, 6620]
  },
  {
    x: new Date(1538820000000),
    y: [6620.33, 6634.15, 6617.24, 6624.61]
  },
  {
    x: new Date(1538821800000),
    y: [6625.95, 6626, 6611.66, 6617.58]
  },
  {
    x: new Date(1538823600000),
    y: [6619, 6625.97, 6595.27, 6598.86]
  },
  {
    x: new Date(1538825400000),
    y: [6598.86, 6598.88, 6570, 6587.16]
  },
  {
    x: new Date(1538827200000),
    y: [6588.86, 6600, 6580, 6593.4]
  },
  {
    x: new Date(1538829000000),
    y: [6593.99, 6598.89, 6585, 6587.81]
  },
  {
    x: new Date(1538830800000),
    y: [6587.81, 6592.73, 6567.14, 6578]
  },
  {
    x: new Date(1538832600000),
    y: [6578.35, 6581.72, 6567.39, 6579]
  },
  {
    x: new Date(1538834400000),
    y: [6579.38, 6580.92, 6566.77, 6575.96]
  },
  {
    x: new Date(1538836200000),
    y: [6575.96, 6589, 6571.77, 6588.92]
  },
  {
    x: new Date(1538838000000),
    y: [6588.92, 6594, 6577.55, 6589.22]
  },
  {
    x: new Date(1538839800000),
    y: [6589.3, 6598.89, 6589.1, 6596.08]
  },
  {
    x: new Date(1538841600000),
    y: [6597.5, 6600, 6588.39, 6596.25]
  },
  {
    x: new Date(1538843400000),
    y: [6598.03, 6600, 6588.73, 6595.97]
  },
  {
    x: new Date(1538845200000),
    y: [6595.97, 6602.01, 6588.17, 6602]
  },
  {
    x: new Date(1538847000000),
    y: [6602, 6607, 6596.51, 6599.95]
  },
  {
    x: new Date(1538848800000),
    y: [6600.63, 6601.21, 6590.39, 6591.02]
  },
  {
    x: new Date(1538850600000),
    y: [6591.02, 6603.08, 6591, 6591]
  },
  {
    x: new Date(1538852400000),
    y: [6591, 6601.32, 6585, 6592]
  },
  {
    x: new Date(1538854200000),
    y: [6593.13, 6596.01, 6590, 6593.34]
  },
  {
    x: new Date(1538856000000),
    y: [6593.34, 6604.76, 6582.63, 6593.86]
  },
  {
    x: new Date(1538857800000),
    y: [6593.86, 6604.28, 6586.57, 6600.01]
  },
  {
    x: new Date(1538859600000),
    y: [6601.81, 6603.21, 6592.78, 6596.25]
  },
  {
    x: new Date(1538861400000),
    y: [6596.25, 6604.2, 6590, 6602.99]
  },
  {
    x: new Date(1538863200000),
    y: [6602.99, 6606, 6584.99, 6587.81]
  },
  {
    x: new Date(1538865000000),
    y: [6587.81, 6595, 6583.27, 6591.96]
  },
  {
    x: new Date(1538866800000),
    y: [6591.97, 6596.07, 6585, 6588.39]
  },
  {
    x: new Date(1538868600000),
    y: [6587.6, 6598.21, 6587.6, 6594.27]
  },
  {
    x: new Date(1538870400000),
    y: [6596.44, 6601, 6590, 6596.55]
  },
  {
    x: new Date(1538872200000),
    y: [6598.91, 6605, 6596.61, 6600.02]
  },
  {
    x: new Date(1538874000000),
    y: [6600.55, 6605, 6589.14, 6593.01]
  },
  {
    x: new Date(1538875800000),
    y: [6593.15, 6605, 6592, 6603.06]
  },
  {
    x: new Date(1538877600000),
    y: [6603.07, 6604.5, 6599.09, 6603.89]
  },
  {
    x: new Date(1538879400000),
    y: [6604.44, 6604.44, 6600, 6603.5]
  },
  {
    x: new Date(1538881200000),
    y: [6603.5, 6603.99, 6597.5, 6603.86]
  },
  {
    x: new Date(1538883000000),
    y: [6603.85, 6605, 6600, 6604.07]
  },
  {
    x: new Date(1538884800000),
    y: [6604.98, 6606, 6604.07, 6606]
  },
]

  const aaa = {          
    series: [{
      data: kospiArr_Cut_Month_Candle,
    }],
    options: {
      chart: {
        type: 'candlestick',
        height: 290,
        id: 'candles',
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#3C90EB',
            downward: '#DF7D46'
          }
        }
      },
      xaxis: {
        type: 'datetime'
      }
    },
  
    seriesBar: [{
      name: 'volume',
      data: kospiArr_Cut_Month_Volume,
    }],
    optionsBar: {
      chart: {
        height: 160,
        type: 'bar',
        brush: {
          enabled: true,
          target: 'candles'
        },
        // selection: {
        //   enabled: true,
        //   xaxis: {
        //     min: new Date('20 Jan 2017').getTime(),
        //     max: new Date('10 Dec 2017').getTime()
        //   },
        //   fill: {
        //     color: '#ccc',
        //     opacity: 0.4
        //   },
        //   stroke: {
        //     color: '#0D47A1',
        //   }
        // },
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          columnWidth: '80%',
          colors: {
            ranges: [{
              from: -1000,
              to: 0,
              color: '#F15B46'
            }, {
              from: 1,
              to: 10000,
              color: '#FEB019'
            }],
      
          },
        }
      },
      stroke: {
        width: 0
      },
      xaxis: {
        type: 'datetime',
        axisBorder: {
          offsetX: 13
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      }
    },
  
  
  };

    

    return(
      <div>
        <Chart 
            options={aaa.options}
            series={aaa.series}
            type="candlestick"
            height={550}
        />
         <Chart 
            options={aaa.optionsBar}
            series={aaa.seriesBar}
            type="bar"
            height={200}
        />
      </div>
    );
}