import React from 'react'
import { utcHour, utcDay, utcWeek, utcMonth, utcYear } from 'd3-time'
import { timeIntervalBarWidth } from 'react-stockcharts/lib/utils'
import {
  CandlestickSeries,
  KagiSeries,
  PointAndFigureSeries,
  RenkoSeries,
} from 'react-stockcharts/lib/series'

function getCandleStickWidth(period) {
  const d3Interval = {
    'hour': utcHour,
    'day': utcDay,
    'week': utcWeek,
    'month': utcMonth,
    'year': utcYear,
    'all': utcYear,
  }[period] || utcDay

  return timeIntervalBarWidth(d3Interval)
}

function getMainSeries(options) {
  const {
    type,
    period,
  } = options

  return (
    <React.Fragment>
      {['candlestick', 'heikin-ashi'].includes(type) &&
        <CandlestickSeries
          stroke={d => d.close > d.open ? "#00d492" : "#e20063"}
          wickStroke={d => d.close > d.open ? "#00d492" : "#e20063"}
          fill={d => d.close > d.open ? "#00d492" : "#e20063"}
          width={getCandleStickWidth(period)}
        />
      }

      {type === 'kagi' &&
        <KagiSeries
          stroke={{ yang: '#e20063', yin: '#00d492' }}
          currentValueStroke="rgb(238, 238, 241)"
        />
      }

      {type === 'point-figure' &&
        <PointAndFigureSeries
          stroke={{ up: '#e20063', down: '#00d492' }}
        />
      }

      {type === 'renko' &&
        <RenkoSeries
          fill={{
            up: '#e20063',
            down: '#00d492',
            partial: '#009ed8',
          }}
        />
      }
    </React.Fragment>
  )
}

export default getMainSeries
