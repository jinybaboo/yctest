// import * as commonFunc from '../common/commonFunc';
// import colors from './colors';
// //컬러 옵션
// const chartColors = [
//     colors.ma3, colors.ma24, colors.ma60, colors.ma120, //3m ~ 120m
//     colors.candle, //캔들
//     colors.black, colors.black, colors.black, //1,2,3차 저항선
//     colors.black, colors.black, colors.black, //1,2,3차 지지선선
// ] 
// const chartLineWidth=[
//     1,1,1,1, //3m ~ 120m
//     1, //캔들
//     0, 0, 0, //1,2,3차 저항선
//     0, 0, 0, //1,2,3차 지지선
// ];

// //차트 옵션
// const chartX_AxisOption ={
//   tickPlacement: 'on',
//   type: 'datetime',
//   labels:{
//     datetimeFormatter: {
//       year: 'yyyy',
//       month: "yyyy.MM ",
//       day: '',
//       hour: '',
//     },
//   },
//   tooltip: {
//     enabled: false,
//     formatter: function(val, opts) {
//       const date = new Date(val);
//       const returnDate = commonFunc.getyyMMFromDate(date)
//       return returnDate;
//     }
//   },
  
// };

// const chartGrodOption = {
//   borderColor: 'rgb(238, 238, 238)',
//   strokeDashArray: 0,
//   xaxis: {
//       lines: {
//           show: true
//       }
//   },   
//   yaxis: {
//       lines: {
//           show: false
//       }
//   },  
// };

// const chartTooltipOption = { 
//   followCursor: false,
//   style: {
//     fontSize: '11px',
//   },
//   x:{
//     format: 'yyyy/MM',
//     show:true,
//   },
//   y: {
//     title:{
//       formatter: (seriesName) => {
//         return seriesName==='캔들'?'':seriesName;
//       },
//     },

//     formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
//       //console.log(series, seriesIndex, dataPointIndex, w)
//       const chartType = w.config.series[seriesIndex]?.name;
//       //console.log(chartType)
//       let candleTooltip;
//       if(chartType==='캔들'){
//         const yVal = w.config.series[seriesIndex].data[dataPointIndex].y;
//         candleTooltip = `시작 &nbsp; ${yVal[0]}<br>종가 &nbsp; ${yVal[3]}<br>고가 &nbsp; ${yVal[1]}<br>저가 &nbsp; ${yVal[2]}` ;
//         return candleTooltip;
//       }else if(chartType.includes('저항') || chartType.includes('지지')){
//         candleTooltip = value;
//         return candleTooltip;
//         //return null;   // 저항선 및 지지선을 툴팁에서 안보이게 할 경우
//       }else{
//         candleTooltip = value;
//         return candleTooltip;
//       }
      
//     }
//   },
//   fixed: {
//     enabled: false,
//     position: 'topRight',
//     offsetX: -100,
//     offsetY: 0,
//   },
// };

// //어노테이션 스타일 옵션
// const annotationX_Style_Res = {
//   fontSize: '10px',
//   color: "#222",
//   background: colors.resistanceOpa,
//   padding: {
//     left: 3,
//     right: 3,
//     top: -5,
//     bottom: 13,
//   }
// };
// const annotationX_Style_Sup = {
//   fontSize: '10px',
//   color: "#222",
//   background: colors.supportOpa,
//   padding: {
//     left: 3,
//     right: 3,
//     top: -5,
//     bottom: 13,
//   }
// };
// const annotationY_Style_Res = {
//   fontSize: '10px',
//   color: "#222",
//   background: colors.resistanceOpa,
//   padding: {
//     left: -6,
//     right: 13,
//   }
// };
// const annotationY_Style_Sup ={
//   fontSize: '10px',
//   color: "#222",
//   background: colors.supportOpa,
//   padding: {
//     left: -6,
//     right: 13,
//   }
// }





// /////////////////// 차트 옵션 ////////////////////////
// export const chartOptions = {
//   chart: {
//     id:'candles',
//     group:'sss',
//     toolbar: { // 우측상단 캡쳐 메뉴 
//       show: true
//     },
//     zoom: {
//       enabled: true, //줌 여부
//     },
//   },

//   title: {
//     text: '',
//     align: 'center'
//   },

//   xaxis: chartX_AxisOption,
//   yaxis: {
//     decimalsInFloat: 2, //소숫점 2째자리
//   },
//   legend:{ //x축 아래 차트이름 보여주기
//     show:true
//   },
//   grid: chartGrodOption,
//   tooltip : chartTooltipOption,  //차트 마우스 호버시 데이터 보여주는 박스
//   plotOptions: {
//     candlestick: {
//       colors: {
//         upward: 'rgba(255, 0, 0, 0.7)',
//         downward: 'rgba(71, 90, 255, 0.7)'
//       },
//       // wick: {
//       //   useFillColor: false,
//       // }
//     },
//   },

//   stroke:{
//     curve:'smooth',
//     width:chartLineWidth, //캔들, 라인1~4 (총 5개)
//   },
//   colors: chartColors, //캔들, 라인1~4 (총 5개)

//   annotations: {
//     xaxis: [
//       // 상승 돌파 날짜 설정 x축 어노테이션 (세로라인)
//       {
//       x: '', //new Date('07 01 2020').getTime()
//       strokeDashArray: 3,
//       borderColor: colors.resistance,
//       label: {
//         position:'bottom',
//         text: '', //'1차 상승 돌파'
//         style : annotationX_Style_Res,
//         orientation: 'vertical',
//       }
//     },{
//       x: '',
//       strokeDashArray: 3,
//       borderColor: colors.resistance,
//       label: {
//         position:'bottom',
//         show: true,
//         text: '',
//         style : annotationX_Style_Res,
//         orientation: 'vertical',
//       }
//     },{
//       x: '',
//       strokeDashArray: 3,
//       borderColor: colors.resistance,
//       label: {
//         position:'bottom',
//         show: true,
//         text: '',
//         style : annotationX_Style_Res,
//         orientation: 'vertical',
//       }
//     },

//     // 하락 돌파 날짜 설정 x축 어노테이션  (세로라인)
//     {
//       x: '',
//       strokeDashArray: 3,
//       borderColor: colors.support,
//       label: {
//         position:'bottom',
//         show: true,
//         text: '', //1차 하락 돌파 : 
//         style: annotationX_Style_Sup,
//         orientation: 'vertical',
//       }
//     },{
//       x: '',
//       strokeDashArray: 3,
//       borderColor: colors.support,
//       label: {
//         position:'bottom',
//         show: true,
//         text: '',
//         style: annotationX_Style_Sup,
//         orientation: 'vertical',
//       }
//     },{
//       x: '',
//       strokeDashArray: 3,
//       borderColor: colors.support,
//       label: {
//         position:'bottom',
//         show: true,
//         text: '',
//         style: annotationX_Style_Sup,
//         orientation: 'vertical',
//       }
//     }
//     ],

//     yaxis: [
//       // y 저항선 보조축 ()
//       {
//         y:'',
//         borderColor: colors.opa0, //투명 
//         label: {
//           position:'left',
//           offsetX : 120,
//           text: '', //1차 저항선 : 
//           style :annotationY_Style_Res,
//         },
//       },{
//         y: '',
//         borderColor: colors.opa0, //투명
//         label: {
//           position:'left',
//           offsetX : 120,
//           text: '', //1차 저항선 : 
//           style :annotationY_Style_Res,
//         },
//       },{
//         y: '',
//         borderColor: colors.opa0, //투명
//         label: {
//           position:'left',
//           offsetX : 120,
//           text: '', //1차 저항선 : 
//           style :annotationY_Style_Res,
//         },
//       },

//       // y 지지선 보조축 ()
//       {
//         y: '',
//         borderColor: colors.opa0, //투명
//         label: {
//           position:'left',
//           offsetX : 225,
//           text: '', // '1차 지지선 :'
//           style: annotationY_Style_Sup,
//         },
//       },{
//         y: '',
//         borderColor: colors.opa0, //투명
//         label: {
//           position:'left',
//           offsetX : 225,
//           text: '', // '1차 지지선 :'
//           style: annotationY_Style_Sup,
//         },
//       },{
//         y: '',
//         borderColor: colors.opa0, //투명
//         label: {
//           position:'left',
//           offsetX : 225,
//           text: '', // '1차 지지선 :'
//           style: annotationY_Style_Sup,
//         },
//       },
//     ],


//     points:[
//       // 저항선 xy포인트 어노테이션
//       {
//           // x: new Date('08 01 2020').getTime(),
//           x: '',
//           y: '',
//           marker: {
//             size: 3,
//           },
//           // label: {
//           //   text: '',
//           //   style: {
//           //     color: "#222",
//           //     background: colors.resistanceOpa,
//           //     padding: {
//           //       left: -6,
//           //       right: 13,
//           //     }
//           //   },
//           // }
//       },{
//         x: '',
//         y: '',
//         marker: {
//           size: 3,
//         },
//       },{
//         x: '',
//         y: '',
//         marker: {
//           size: 3,
//         },
//       },

//       // 지지선 xy포인트 어노테이션 ()
//       {
//         x: '',
//         y: '',
//         marker: {
//           size: 3,
//         },
//     },{
//       x: '',
//       y: 449.04,
//       marker: {
//         size: 3,
//       },
//     }, {
//       x: '',
//       y: '',
//       marker: {
//         size: 3,
//       },
//     }
//     ], //points 종료
//   }, //annotations 종료

    

// };



// export const volumeOptions = {
//   optionsBar: {
//     chart: {
//       height: 160,
//       type: 'bar',
//       group:'sss',
//       brush: {
//         enabled: true,
//         target: 'candles'
//       },
//       selection: {
//         enabled: true,
//         fill: {
//           color: '#ccc',
//           opacity: 0.4
//         },
//         stroke: {
//           color: '#0D47A1',
//         }
//       },
//     },
//     dataLabels: {
//       enabled: false
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: '100%',
//         colors: {
//           ranges: [{
//             from: -1000,
//             to: 0,
//             color: 'green'
//           }, {
//             from: 1,
//             to: 1000000000000000,
//             color: 'red'
//           }],
    
//         },
//       }
//     },
//     stroke: {
//       width: 0
//     },
//     xaxis: {
//       type: 'datetime',
//       axisBorder: {
//         offsetX: 13
//       }
//     },
//     yaxis: {
//       labels: {
//         show: false
//       }
//     }
//   },

// };