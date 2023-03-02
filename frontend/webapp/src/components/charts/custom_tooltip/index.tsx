import React from "react";

const CustomTooltip = ({ active, payload, label, headerLabel = "Date" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart__tooltip">
        <div className="chart__tooltip-header">{headerLabel}: {label}</div>
        {payload.map((property) => (
          <React.Fragment key={property.dataKey}>
            <h5 className="chart__tooltip-dataHeader" style={{ color: property.color }}>
              {property.dataKey}: {property.value}{property.unit}
            </h5>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
