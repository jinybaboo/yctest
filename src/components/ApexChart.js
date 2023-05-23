import Chart from "react-apexcharts";
import * as chartFunc from '../common/chartFunc';
import * as api  from '../common/commonApi';
import { chartOptions, volumeOptions } from '../common/chartConfig';
import { useQuery} from 'react-query' 
import colors from "../common/colors";


export default function ApexChart (){
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



    const seriesData = chartFunc.getSeriesDataSet(ma3_Cut, ma24_Cut, ma60_Cut, ma120_Cut, kospiArr_Cut_Month_Candle, kospiArr_Cut_Month_Volume, resistanceDataSet, supportDataSet);
    //console.log(seriesData)

    const volumeData = chartFunc.getVolumeDataSet(kospiArr_Cut_Month_Volume);
    console.log(volumeData)

    

    return(
      <div>
        <div id='chart'>
          <Chart 
            options={chartOptions}
            series={seriesData}
            height={550}
          />
        </div>
        {/* <div id='volumeChart'>
          <Chart 
            options={volumeOptions}
            series={volumeData}
            height={300}
          />
        </div> */}
      </div>
    );
}