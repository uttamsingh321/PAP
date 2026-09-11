"""
NG%/NDF% comparison service for PAP (Production Analytics Platform).

Builds a station x project matrix of defect (NG) and false-detection (NDF)
percentages reusing the EXISTING T-MOM FPY pipeline:

    T-MOM -> tmom_client.py -> fpy_service.py (this module calls get_fpy_data)
        -> ng_ndf_service.py (roll-up) -> /api/assembly/ng-ndf/ -> React

Formulas:
    NG%  = sum(defects)         / sum(productionStarts) * 100
    NDF% = sum(falseDetections) / sum(productionStarts) * 100

Matrix shape returned to the frontend (percentages, rounded to 2 decimals):
    matrix[station][project] = {"NG": <float>, "NDF": <float>}
"""

import logging
from typing import Dict, Any, Optional, Tuple

from .fpy_service import get_fpy_data

logger = logging.getLogger(__name__)


def _num(value: Any, default: float = 0.0) -> float:
    """Safely convert to a float, guarding against None / NaN / bad types."""
    try:
        n = float(value)
        return n if n == n else default  # NaN != NaN
    except (TypeError, ValueError):
        return default


def _record_value(record: Dict[str, Any], *keys: str, default: float = 0.0) -> float:
    """Return the first present numeric value among the given key aliases."""
    for key in keys:
        value = record.get(key)
        if value is not None:
            return _num(value, default)
    return default


def build_ng_ndf_matrix(records: list) -> Dict[str, Any]:
    """
    Roll mapped FPY records up into a station x project NG%/NDF% matrix.

    station = processName, project = projectName (from the existing mapper).
    Records without a process/project name or without production starts are
    skipped so the comparison only shows measurable data.
    """
    buckets: Dict[Tuple[str, str], Dict[str, float]] = {}

    for record in records or []:
        station = str(record.get("processName") or "").strip()
        project = str(record.get("projectName") or "").strip()
        if not station or not project:
            continue

        starts = _record_value(record, "productionStarts", "numberOfProductionStarts")
        defects = _record_value(record, "defects", "numberOfDefects")
        falses = _record_value(record, "falseDetections", "numberOfFalseDetections")
        if starts <= 0:
            continue

        bucket = buckets.setdefault((station, project), {"starts": 0.0, "defects": 0.0, "falses": 0.0})
        bucket["starts"] += starts
        bucket["defects"] += defects
        bucket["falses"] += falses

    matrix: Dict[str, Dict[str, Dict[str, float]]] = {}
    stations: set = set()
    projects: set = set()

    for (station, project), bucket in buckets.items():
        starts = bucket["starts"]
        ng_pct = round(bucket["defects"] / starts * 100.0, 2) if starts > 0 else 0.0
        ndf_pct = round(bucket["falses"] / starts * 100.0, 2) if starts > 0 else 0.0
        matrix.setdefault(station, {})[project] = {"NG": ng_pct, "NDF": ndf_pct}
        stations.add(station)
        projects.add(project)

    return {
        "matrix": matrix,
        "stations": sorted(stations),
        "projects": sorted(projects),
    }


def get_ng_ndf_matrix(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    filters: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Fetch FPY data through the existing service and roll up NG%/NDF%.

    Accepts the same startTime / endTime / filters contract as get_fpy_data so
    the API layer can forward the exact same query parameters.
    """
    result = get_fpy_data(start_time=start_time, end_time=end_time, filters=filters)

    if not result.get("success"):
        # Preserve the error/message/source shape for the API layer, with empty
        # matrix/stations/projects so consumers never hit a missing key.
        result["matrix"] = {}
        result["stations"] = []
        result["projects"] = []
        return result

    rollup = build_ng_ndf_matrix(result.get("data") or [])
    logger.info(
        "NG%/NDF% matrix: %d stations, %d projects, %d records",
        len(rollup["stations"]),
        len(rollup["projects"]),
        result.get("count", 0),
    )
    result.update(rollup)
    return result