import React from "react";
import { Link } from "react-router-dom";
import NgNdfDashboard from "../components/NgNdfDashboard";

/*
 * NG% / NDF% Comparison — standalone page (route /ng-ndf).
 *
 * Renders NgNdfDashboard.jsx on its own full page. The page header provides
 * the "← Back to FPY Dashboard" control; the component below keeps its own
 * internal "← Back to Dashboard" button that only returns to the two card
 * grids (not to the FPY page). The existing FPY dashboard is untouched and
 * just links to this page.
 */
function NgNdfPage() {
    return (
        <div className="ngndf-page">
            <div className="ngndf-page-header">
                <div className="ngndf-page-title">
                    <h1>NG% / NDF% Comparison</h1>
                    <p className="ngndf-page-subtitle">Defect (NG) and false-detection (NDF) rates by station and project</p>
                </div>
                <div className="ngndf-page-actions">
                    <Link to="/assembly/fpy" className="ngndf-page-back">← Back to FPY Dashboard</Link>
                </div>
            </div>
            <NgNdfDashboard />
        </div>
    );
}

export default NgNdfPage;