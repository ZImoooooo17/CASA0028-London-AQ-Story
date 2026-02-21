export default function YearRangeSelect(props) {
  function handleChange(e) {
    const id = e.target.id
    const value = Number(e.target.value)
    if (!Number.isFinite(value)) return

    if (id === 'start-year') {
      const currentMax = Number(props.yearRange.max)
      const newMin = value
      const newMax = Math.max(currentMax, newMin)
      props.setYearRange({ min: newMin, max: newMax })
    }

    if (id === 'end-year') {
      const currentMin = Number(props.yearRange.min)
      const newMax = value
      const newMin = Math.min(currentMin, newMax)
      props.setYearRange({ min: newMin, max: newMax })
    }
  }

  return (
    <div className="w-full flex items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">Start Year:</span>
        <input
          type="number"
          id="start-year"
          min={1870}
          max={2020}
          value={props.yearRange.min}
          onChange={handleChange}
          className="h-10 w-28 rounded-md border border-gray-300 bg-white px-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">End Year:</span>
        <input
          type="number"
          id="end-year"
          min={1870}
          max={2020}
          value={props.yearRange.max}
          onChange={handleChange}
          className="h-10 w-28 rounded-md border border-gray-300 bg-white px-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </div>
  )
}


  