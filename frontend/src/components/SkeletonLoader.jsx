import React from "react";

export default function SkeletonLoader({ type = "candidate", count = 3 }) {
  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === "candidate") {
        skeletons.push(
          <div key={i} className="candidate-card skeleton-card">
            <div className="skeleton-avatar"></div>
            <div className="candidate-info">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-subtitle"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>
        );
      } else if (type === "stat") {
        skeletons.push(
          <div key={i} className="stat-card skeleton-stat">
            <div className="skeleton-icon"></div>
            <div className="stat-data" style={{ width: "100%" }}>
              <div className="skeleton-text skeleton-value"></div>
              <div className="skeleton-text skeleton-label"></div>
            </div>
          </div>
        );
      }
    }
    return skeletons;
  };

  return <>{renderSkeletons()}</>;
}
